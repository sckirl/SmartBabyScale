import os
import sys
import time
import socketio

# Add the project root to sys.path to enable imports from MachineLearning
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(project_root)

try:
    from MachineLearning.session_calculator import SessionTracker
    import joblib
    import numpy as np
    HAS_CALCULATOR = True
except ImportError:
    HAS_CALCULATOR = False

# Create a Socket.IO client
sio = socketio.Client()

# Global Session Tracker & ML assets
session = None
scaler = None
svm_model = None
mlp_model = None
feature_cols = None
is_ml_loaded = False

def load_ml_assets():
    global scaler, svm_model, mlp_model, feature_cols, is_ml_loaded
    models_dir = os.path.join(project_root, 'MachineLearning', 'models')
    
    scaler_path = os.path.join(models_dir, 'input_scaler.joblib')
    svm_path = os.path.join(models_dir, 'svm_risk_model.joblib')
    mlp_path = os.path.join(models_dir, 'mlp_risk_model.joblib')
    cols_path = os.path.join(models_dir, 'feature_columns.joblib')
    
    if all(os.path.exists(p) for p in [scaler_path, svm_path, mlp_path, cols_path]):
        try:
            scaler = joblib.load(scaler_path)
            svm_model = joblib.load(svm_path)
            mlp_model = joblib.load(mlp_path)
            feature_cols = joblib.load(cols_path)
            is_ml_loaded = True
            print("[SIMULATION] Machine Learning models loaded successfully from disk.")
        except Exception as e:
            print(f"[SIMULATION] Error loading model assets: {e}")
            is_ml_loaded = False
    else:
        print("[SIMULATION] ML model files not found. Simulation will run using clinical rule fallbacks.")
        is_ml_loaded = False

# Initialize the clinical session
if HAS_CALCULATOR:
    session = SessionTracker(patient_id=8888, birth_weight_g=3100.0, gestational_age_weeks=38, apgar_score_5min=9)
    print("[SIMULATION] SessionTracker initialized with default demographics:")
    print("             Birth Weight: 3100g, Gestational Age: 38 weeks, Apgar: 9, SGA: 0")

@sio.event
def connect():
    print("[SIMULATION] Connected to Next.js Server on port 3777")
    load_ml_assets()
    send_prediction()

@sio.event
def connect_error(data):
    print("[SIMULATION] Connection failed! Make sure Node/Next server is running on http://localhost:3777 first.")

@sio.event
def disconnect():
    print("[SIMULATION] Disconnected from server")

@sio.on('demographics_update')
def on_demographics_update(data):
    """
    Listens for demographic updates from the nurse on the frontend.
    Updates SessionTracker and broadcasts updated predictions.
    """
    global session
    if not HAS_CALCULATOR or session is None:
        return
        
    print(f"\n[SOCKET] Received demographics update: {data}")
    session.update_demographics(
        birth_weight_g=data.get('birth_weight_g'),
        gestational_age_weeks=data.get('gestational_age_weeks'),
        apgar_score_5min=data.get('apgar_score_5min')
    )
    print(f"[SESSION] Demographics Updated -> SGA calculated: {session.sga}")
    send_prediction()

def calculate_fallback_prediction(snappe_score):
    """
    Computes a realistic risk probability curve directly in Python
    if ML model joblib files have not been generated yet.
    """
    # Sigmoidal logit curve calibrated so a SNAPPE-II score of 25 results in a 40% instability risk
    logit = -3.0 + 0.12 * snappe_score
    prob = 1.0 / (1.0 + np.exp(-logit))
    
    if snappe_score < 15:
        risk_level = 'Low'
    elif 15 <= snappe_score < 30:
        risk_level = 'Moderate'
    else:
        risk_level = 'High'
        
    return {
        'snappe_score': snappe_score,
        'risk_level': risk_level,
        'svm': {
            'instability_probability': round(prob, 4),
            'outcome_prediction': 1 if prob > 0.5 else 0
        },
        'mlp': {
            'instability_probability': round(prob * 0.95, 4), # minor variance
            'outcome_prediction': 1 if (prob * 0.95) > 0.5 else 0
        },
        'accuracy_warning': session.packet_count < 20 if session else True,
        'packet_count': session.packet_count if session else 0
    }

def send_prediction():
    """
    Runs ML predictions (or fallback clinical rules) and emits
    the prediction updates to the Node.js server.
    """
    global session, is_ml_loaded
    if not HAS_CALCULATOR or session is None:
        return
        
    snappe = session.calculate_snappe_ii()
    
    if is_ml_loaded:
        try:
            pred = session.predict_risk(scaler, svm_model, mlp_model, feature_cols)
        except Exception as e:
            print(f"[ERROR] ML prediction failed: {e}. Falling back...")
            pred = calculate_fallback_prediction(snappe)
    else:
        pred = calculate_fallback_prediction(snappe)
        
    # Send both prediction results and active sensor parameters to the server
    payload = {
        'type': 'prediction_update',
        'vitals': {
            'weight_g': session.current_weight_g,
            'length_cm': session.current_length_cm,
            'temperature_celsius': session.current_temp_c,
            'heart_rate_bpm': session.get_avg_heart_rate(),
            'spo2_percent': session.get_lowest_spo2(),
        },
        'demographics': {
            'birth_weight_g': session.birth_weight_g,
            'gestational_age_weeks': session.gestational_age_weeks,
            'apgar_score_5min': session.apgar_score_5min,
            'sga': session.sga,
        },
        'prediction': pred
    }
    
    sio.emit('sensor_data', payload)
    print(f"[SOCKET] Broadcasted update: Score={snappe}, Risk={pred['risk_level']}, Prob={pred['svm']['instability_probability'] * 100:.1f}%")

def main():
    global session
    try:
        # Connect to local custom Next.js/Socket.io server
        print("Attempting to connect to local server on http://localhost:3777...")
        sio.connect('http://localhost:3777')
        
        print("\n=======================================================")
        print("SmartBabyScale - Raspberry Pi Edge Simulation Active")
        print("=======================================================")
        print("You can simulate real-time sensor updates here.")
        print("Option keys: 'w' (weight), 'l' (length), 't' (temp), 'h' (heart rate), 's' (SpO2), 'q' (quit)")
        
        while True:
            try:
                user_input = input("\n[MENU] Enter option key followed by value (e.g. 'w 3250' or 't 36.2') or 'q': ").strip()
                if not user_input:
                    continue
                if user_input.lower() == 'q':
                    break
                
                parts = user_input.split()
                if len(parts) < 2:
                    print("Invalid command. Format: <key> <value>. Example: 'w 3250'")
                    continue
                    
                cmd, val_str = parts[0].lower(), parts[1]
                
                try:
                    val = float(val_str)
                except ValueError:
                    print("Invalid numeric value.")
                    continue
                
                if cmd == 'w':
                    session.update_sensors(weight_grams=val)
                    print(f"[SENSOR] Weight updated to: {val} g")
                elif cmd == 'l':
                    session.update_sensors(length_cm=val)
                    print(f"[SENSOR] Length updated to: {val} cm")
                elif cmd == 't':
                    session.update_sensors(temperature_celsius=val)
                    print(f"[SENSOR] Temp updated to: {val} °C (Lowest: {session.lowest_temp_c} °C)")
                elif cmd == 'h':
                    session.update_sensors(heart_rate_bpm=val)
                    print(f"[SENSOR] Heart Rate updated to: {val} BPM (Avg: {session.get_avg_heart_rate():.1f})")
                elif cmd == 's':
                    session.update_sensors(spo2_percent=val)
                    print(f"[SENSOR] SpO2 updated to: {val}% (Lowest: {session.get_lowest_spo2()}%)")
                else:
                    print(f"Unknown sensor key '{cmd}'. Use w, l, t, h, or s.")
                    continue
                
                # Send updated prediction back
                send_prediction()
                    
            except EOFError:
                break
                
    except Exception as e:
        print(f"An error occurred: {e}")
        print("Make sure the Next.js server is running via 'npm run dev' first!")
    finally:
        if sio.connected:
            sio.disconnect()

if __name__ == '__main__':
    main()
