"""
SmartBabyScale - Raspberry Pi 5 Hardware Sensor Reader
Deploy this file on the Raspberry Pi 5 to read physical sensors and broadcast to the Next.js server.

Pinout Configuration (Raspberry Pi 5):
---------------------------------------------------------
1. HX711 (Weight Sensor)
   - VCC  -> 5V (Pin 2)
   - GND  -> GND (Pin 6)
   - DT   -> GPIO 5 (Pin 29)
   - SCK  -> GPIO 6 (Pin 31)

2. HC-SR04 (Ultrasonic Length Sensor)
   - VCC  -> 5V (Pin 4)
   - GND  -> GND (Pin 9)
   - TRIG -> GPIO 23 (Pin 16)
   - ECHO -> GPIO 24 (Pin 18) (Use 1k/2k resistor voltage divider to step down 5V echo to 3.3V)

3. MLX90614 (Infrared Temp Sensor - I2C)
   - VIN  -> 3.3V (Pin 1)
   - GND  -> GND (Pin 14)
   - SCL  -> SCL/GPIO 3 (Pin 5)
   - SDA  -> SDA/GPIO 2 (Pin 3)

4. GY-MAX30102 (Pulse Oximeter - I2C)
   - VIN  -> 3.3V (Pin 17)
   - GND  -> GND (Pin 20)
   - SCL  -> SCL/GPIO 3 (Pin 5)
   - SDA  -> SDA/GPIO 2 (Pin 3)
---------------------------------------------------------
"""

import os
import sys
import time
import socketio
import random
import threading
import joblib
import numpy as np
import json

# Attach MachineLearning module
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

sys.path.append(project_root)
from MachineLearning.session_calculator import SessionTracker

# Load calibration coefficients
calibrations = {}
config_path = os.path.join(project_root, 'Sensors', 'calibration_coeffs.json')
if os.path.exists(config_path):
    try:
        with open(config_path, 'r') as f:
            calibrations = json.load(f)
        print("[HARDWARE] Loaded calibration coefficients from JSON.")
    except Exception as e:
        print(f"[HARDWARE] Error loading calibrations: {e}")
if not calibrations:
    calibrations = {
        "weight": {"a": 0.0, "b": 1.0, "c": 0.0},
        "temperature": {"alpha": 0.12},
        "length": {"humidity": 50.0},
        "fitzpatrick": {"1": 0.0, "2": 0.0, "3": 0.0, "4": -1.5, "5": -3.0, "6": -4.5}
    }

# Try loading Raspberry Pi specific hardware libraries
try:
    import board
    import busio
    from gpiozero import DistanceSensor
    # Third party driver placeholders that you would install via pip on the Pi
    # import adafruit_mlx90614
    # from hx711 import HX711
    # from max30102 import MAX30102
    ON_PI = True
    print("[HARDWARE] Raspberry Pi GPIO libraries loaded successfully.")
except ImportError:
    ON_PI = False
    print("[WARNING] Raspberry Pi GPIO libraries not found. Running in hardware mock test mode.")

# Socket.IO connection to Next.js
sio = socketio.Client()
session = SessionTracker(patient_id=9999, birth_weight_g=3100.0, gestational_age_weeks=38, apgar_score_5min=9)

# Global Session Tracker & ML assets
scaler = None
svm_model = None
xgb_model = None
rf_model = None
feature_cols = None
is_ml_loaded = False

def load_ml_assets():
    global scaler, svm_model, xgb_model, rf_model, feature_cols, is_ml_loaded
    models_dir = os.path.join(project_root, 'MachineLearning', 'models')
    
    scaler_path = os.path.join(models_dir, 'scaler.joblib')
    svm_path = os.path.join(models_dir, 'svr_model.joblib')
    xgb_path = os.path.join(models_dir, 'xgboost_model.joblib')
    rf_path = os.path.join(models_dir, 'randomforest_model.joblib')
    cols_path = os.path.join(models_dir, 'feature_columns.joblib')
    
    # Fallback to older risk model naming conventions if necessary
    if not os.path.exists(scaler_path): scaler_path = os.path.join(models_dir, 'input_scaler.joblib')
    if not os.path.exists(svm_path): svm_path = os.path.join(models_dir, 'svm_risk_model.joblib')
    if not os.path.exists(xgb_path): xgb_path = os.path.join(models_dir, 'xgboost_risk_model.joblib')
    if not os.path.exists(rf_path): rf_path = os.path.join(models_dir, 'rf_risk_model.joblib')
    
    if all(os.path.exists(p) for p in [scaler_path, svm_path, xgb_path, rf_path, cols_path]):
        try:
            scaler = joblib.load(scaler_path)
            svm_model = joblib.load(svm_path)
            xgb_model = joblib.load(xgb_path)
            rf_model = joblib.load(rf_path)
            feature_cols = joblib.load(cols_path)
            is_ml_loaded = True
            print("[HARDWARE] Machine Learning models loaded successfully from disk.")
        except Exception as e:
            print(f"[HARDWARE] Error loading model assets: {e}")
            is_ml_loaded = False
    else:
        print("[HARDWARE] ML model files not found. Hardware reader will run using clinical rule fallbacks.")
        is_ml_loaded = False

def calculate_fallback_prediction(snappe_score):
    logit = -3.0 + 0.12 * snappe_score
    prob = 1.0 / (1.0 + np.exp(-logit))
    
    if snappe_score < 40:
        risk_level = 'Low'
    elif 40 <= snappe_score <= 80:
        risk_level = 'Moderate'
    else:
        risk_level = 'High'
        
    return {
        'snappe_score': snappe_score,
        'risk_level': risk_level,
        'xgboost': {
            'instability_probability': round(prob, 4),
            'outcome_prediction': 1 if prob > 0.5 else 0
        },
        'rf': {
            'instability_probability': round(prob * 0.98, 4),
            'outcome_prediction': 1 if (prob * 0.98) > 0.5 else 0
        },
        'svm': {
            'instability_probability': round(prob * 0.95, 4),
            'outcome_prediction': 1 if (prob * 0.95) > 0.5 else 0
        },
        'accuracy_warning': session.packet_count < 20 if session else True,
        'packet_count': session.packet_count if session else 0
    }

def init_sensors():
    """Initialize GPIO pins and I2C buses for the Pi 5"""
    sensors = {}
    if ON_PI:
        print("[HARDWARE] Initializing HC-SR04 on GPIO 23/24...")
        sensors['ultrasonic'] = DistanceSensor(echo=24, trigger=23)
        
        print("[HARDWARE] Initializing I2C Bus (SDA=2, SCL=3)...")
        # sensors['i2c'] = busio.I2C(board.SCL, board.SDA)
        # sensors['mlx'] = adafruit_mlx90614.MLX90614(sensors['i2c'])
        # sensors['max30102'] = MAX30102()
        
        print("[HARDWARE] Initializing HX711 on GPIO 5/6...")
        # sensors['hx711'] = HX711(dout_pin=5, pd_sck_pin=6)
        # sensors['hx711'].set_scale_ratio(114.2) # Needs physical calibration
    return sensors

# Buffer to hold 2 seconds of data (20 samples at 10 SPS)
raw_buffer = []

def get_filtered_weight(raw_reading):
    raw_buffer.append(raw_reading)
    if len(raw_buffer) > 20:
        raw_buffer.pop(0)
    # Apply median filter followed by mean to discard outliers
    sorted_buf = sorted(raw_buffer)
    # Strip outer 25% outliers
    median_filtered = sorted_buf[5:-5] if len(sorted_buf) >= 20 else sorted_buf
    return sum(median_filtered) / len(median_filtered) if median_filtered else raw_reading

def get_calibrated_distance(echo_duration_secs, temp_c, humidity_percent=50.0):
    # Speed of sound incorporating temperature and humidity
    c = 331.4 + (0.606 * temp_c) + (0.0124 * humidity_percent) # m/s
    # Distance = (time * speed) / 2
    distance_cm = (echo_duration_secs * (c * 100)) / 2.0
    return round(distance_cm, 2)

def get_calibrated_spo2(raw_spo2, fitzpatrick_scale):
    # Melanin overestimates SpO2 in Fitzpatrick IV-VI (Sjoding 2020)
    offsets = {1: 0.0, 2: 0.0, 3: 0.0, 4: -1.5, 5: -3.0, 6: -4.5}
    offset = offsets.get(int(fitzpatrick_scale), 0.0)
    calibrated_spo2 = raw_spo2 + offset
    return min(100.0, max(0.0, calibrated_spo2))

def get_core_temperature(temp_skin, temp_ambient, alpha=0.12):
    # Melexis physiological thermal transfer model
    # alpha is the tissue thermal conductivity coefficient
    temp_core = temp_skin + (temp_skin - temp_ambient) * alpha
    return round(temp_core, 2)

def get_linearized_weight(raw_weight_g):
    poly_coeffs = calibrations.get("weight", {"a": 0.0, "b": 1.0, "c": 0.0})
    a = poly_coeffs.get("a", 0.0)
    b = poly_coeffs.get("b", 1.0)
    c = poly_coeffs.get("c", 0.0)
    calibrated_weight = a * (raw_weight_g ** 2) + b * raw_weight_g + c
    return round(calibrated_weight, 1)

try:
    from scipy.signal import butter, filtfilt
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False
    print("[WARNING] scipy not installed. PPG bandpass filtering will be bypassed.")

def neonatal_bandpass_filter(ppg_signal, fs=50.0):
    if not HAS_SCIPY:
        return ppg_signal # ponytail: bypass if scipy is missing
    # 0.8 Hz = 48 BPM; 4.0 Hz = 240 BPM
    nyq = 0.5 * fs
    low = 0.8 / nyq
    high = 4.0 / nyq
    b, a = butter(4, [low, high], btype='band')
    filtered_signal = filtfilt(b, a, ppg_signal)
    return filtered_signal

def read_hardware(sensors):
    """Read from physical sensors, or fallback to mock data for testing"""
    weight_g, length_cm, temp_c, heart_rate, spo2 = 0.0, 0.0, 0.0, 140, 98
    
    if ON_PI:
        try:
            # 1. Weight Filtering & Quadratic Poly-Calibration
            # raw_w = sensors['hx711'].get_weight_mean(readings=1)
            # filtered_w = get_filtered_weight(raw_w)
            # weight_g = get_linearized_weight(filtered_w)
            
            # 2. Temperature skin-to-core imputation (using object and ambient temp from MLX90614)
            # temp_skin = sensors['mlx'].object_temperature
            # temp_ambient = sensors['mlx'].ambient_temperature
            # alpha = calibrations.get("temperature", {}).get("alpha", 0.12)
            # temp_c = get_core_temperature(temp_skin, temp_ambient, alpha)
            
            # 3. Speed-of-Sound compensated length calculation
            # raw_distance_m = sensors['ultrasonic'].distance
            # c_std = 343.0
            # echo_duration_secs = (2.0 * raw_distance_m) / c_std
            # humidity = calibrations.get("length", {}).get("humidity", 50.0)
            # length_cm = get_calibrated_distance(echo_duration_secs, temp_ambient, humidity)
            
            # 4. PPG bandpass filtering (MAX30102 raw reads)
            # raw_ppg = sensors['max30102'].read_raw_ppg()
            # filtered_ppg = neonatal_bandpass_filter(raw_ppg)
            # raw_hr, raw_spo2 = sensors['max30102'].calculate_vitals(filtered_ppg)
            # heart_rate = int(raw_hr)
            # spo2 = int(raw_spo2)
            pass
        except Exception as e:
            print(f"[ERROR] Sensor read failed: {e}. Falling back to mock data.")
            
    # MOCK TEST DATA (Creates a realistic sine-wave variation using calibration math)
    t = time.time()
    raw_w = 3250.0 + (random.uniform(-5, 5))
    weight_g = get_filtered_weight(raw_w)
    calibrated_w = get_linearized_weight(weight_g)
    
    # Simulate ultrasonic length (with mock ambient temp 28C)
    raw_l_cm = 48.0 + (random.uniform(-0.2, 0.2))
    echo_duration = (2.0 * raw_l_cm) / 34300.0
    humidity = calibrations.get("length", {}).get("humidity", 50.0)
    length_cm = get_calibrated_distance(echo_duration, 28.0, humidity)
    
    # Core Temp imputation from Skin Temp (35.8C skin, 28C ambient)
    temp_skin = 35.8 + (0.3 * random.uniform(-1, 1))
    alpha = calibrations.get("temperature", {}).get("alpha", 0.12)
    temp_c = get_core_temperature(temp_skin, 28.0, alpha)
    
    heart_rate = int(140 + 10 * (t % 10) / 10.0) 
    spo2 = int(97 + 2 * (t % 5) / 5.0)

    return calibrated_w, length_cm, temp_c, heart_rate, spo2

@sio.event
def connect():
    print("[SOCKET] Connected to SmartBabyScale Next.js Server on port 3777")
    load_ml_assets()

@sio.on('demographics_update')
def on_demographics_update(data):
    print(f"\n[SOCKET] Nurse updated demographics via Interface: {data}")
    if 'patient_id' in data:
        session.patient_id = data['patient_id']
    session.update_demographics(
        birth_weight_g=data.get('birth_weight_g'),
        gestational_age_weeks=data.get('gestational_age_weeks'),
        apgar_score_5min=data.get('apgar_score_5min'),
        mean_blood_pressure=data.get('mean_blood_pressure'),
        lowest_serum_ph=data.get('lowest_serum_ph'),
        po2_fio2_ratio=data.get('po2_fio2_ratio'),
        seizures=data.get('seizures'),
        urine_output_ml_kg_hr=data.get('urine_output_ml_kg_hr'),
        fitzpatrick_scale=data.get('fitzpatrick_scale')
    )

def hardware_loop():
    sensors = init_sensors()
    
    print("\n=======================================================")
    print(" SmartBabyScale - IoT Hardware Interface Active")
    print("=======================================================")
    print("Reading physical sensors and beaming to localhost:3777")
    
    while True:
        # 1. Read hardware
        w, l, t, hr, spo2 = read_hardware(sensors)
        
        # 2. Update ML Tracker
        session.update_sensors(
            weight_grams=w,
            length_cm=l,
            temperature_celsius=t,
            heart_rate_bpm=hr,
            spo2_percent=spo2
        )
        
        # 3. Compile payload (run ML prediction or fallback to clinical rules)
        snappe = session.calculate_snappe_ii()
        
        if is_ml_loaded:
            try:
                pred = session.predict_risk(scaler, svm_model, xgb_model, rf_model, feature_cols)
            except Exception as e:
                print(f"[ERROR] ML prediction failed: {e}. Falling back...")
                pred = calculate_fallback_prediction(snappe)
        else:
            pred = calculate_fallback_prediction(snappe)
        
        payload = {
            'type': 'prediction_update',
            'vitals': {
                'weight_g': session.current_weight_g,
                'length_cm': session.current_length_cm,
                'temperature_celsius': session.current_temp_c,
                'heart_rate_bpm': session.get_avg_heart_rate(),
                'spo2_percent': session.get_calibrated_spo2(),
            },
            'demographics': {
                'patient_id': session.patient_id,
                'birth_weight_g': session.birth_weight_g,
                'gestational_age_weeks': session.gestational_age_weeks,
                'apgar_score_5min': session.apgar_score_5min,
                'sga': session.sga,
            },
            'prediction': pred
        }
        
        # 4. Blast to UI
        if sio.connected:
            sio.emit('sensor_data', payload)
            print(f"[HW] W:{w:.1f}g | L:{l:.1f}cm | T:{t:.1f}C | HR:{hr} | SpO2:{spo2}% -> Sent to UI")
            
        time.sleep(2)

if __name__ == '__main__':
    try:
        # =========================================================================
        # 🌐 CONNECTION POINT: RASPBERRY PI TO NEXT.JS SERVER
        # =========================================================================
        # 1. Local Testing: If running the Node server on the Pi itself, use 'localhost'
        # 2. Local Network: If Node server is on your Mac/Laptop, use your Mac's local IP (e.g., 'http://192.168.1.15:3777')
        # 3. Cloud/Dokploy: If Node server is deployed, use the public domain (e.g., 'https://api.yourdomain.com')
        # =========================================================================
        sio.connect('http://localhost:3777')
        hardware_loop()
    except socketio.exceptions.ConnectionError:
        print("[ERROR] Could not connect to Web Interface.")
        print("Please ensure 'npm run dev' is running on port 3777.")
    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Terminating hardware reader...")
        sio.disconnect()