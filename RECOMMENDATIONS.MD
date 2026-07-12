# 🛠️ SMARTBABYSCALE: EDGE COMPUTING & MACHINE LEARNING ENGINEERING ROADMAP

## 🎯 CLINICAL VISION & TARGET WORKFLOW
The engineering team must align all sensor integration, UI displays, and software logic with this target clinical workflow:
1.  **Intake Sequence:** A nurse clips a lightweight, separate vital sensor probe attachment (housing the MAX30102) to the infant's foot or toe, then places the infant onto the scale tray. Over a brief 10-second intake session, the system records weight and length from the scale tray while simultaneously reading heart rate and SpO₂ from the separate attachment.
2.  **Triage Screening Objective:** The scale acts as a fast, cheap checkpoint at community clinics (Puskesmas). Its primary objective is to output a rapid health assessment to determine:
    *   *Action A (Immunization Triage):* Is the baby healthy and stable enough to receive routine immunizations?
    *   *Action B (Nutritional/Local Care):* Does the baby have nutritional deficits or mild growth tracking abnormalities requiring local care?
    *   *Action C (Emergency Referral):* Is the baby critically unstable (SNAPPE-II $\ge$ 30, indicated by a high triage classifier probability) requiring immediate referral and emergency transport to a regional hospital?

---

## 📂 1. SYSTEM ARCHITECTURE & CODEBASE STRUCTURE

The edge pipeline runs on a Raspberry Pi 5 gateway connected to local sensors via I²C and GPIO pins. Raw sensor samples are filtered locally, aggregated over an intake session, and used to run inference before broadcasting predictions via Socket.io.

```
SmartBabyScale/
├── Sensors/
│   ├── pi_hardware_reader.py    # Main GPIO polling event loop & sensor integration
│   ├── simulation.py            # Keyboard-driven simulation loop for testing
│   └── calibration_coeffs.json   # Calibration offsets and polynomial coefficients
├── MachineLearning/
│   ├── session_calculator.py    # SessionTracker class for edge accumulation & inference
│   ├── models/
│   │   ├── xgboost_regression_model.joblib  # 0-162 continuous SNAPPE-II regressor
│   │   └── xgboost_classifier_model.joblib  # Binary triage classifier (ROC-AUC 0.9027)
│   └── SmartBabyScale_Training.ipynb        # Model training and serialization notebook
└── Interface/
    └── src/components/Dashboard.tsx        # Next.js frontend UI listening to Socket.io events
```

---

## 🔌 2. SENSOR SIGNAL PROCESSING & CALIBRATION SPECS

To mitigate physical noise and environmental drifts, the following signal processing algorithms must be implemented on the edge reader:

### 2.1 Weight Filtering & Calibration (HX711 + 10kg Load Cell)
*   **Problem:** Infant movements create high-frequency impulse noise on the load cell.
*   **Linearization:** Apply a second-order polynomial calibration using local coefficients to linearize the load cell response and achieve $\pm 1\text{g}$ static precision:
    $$W_{\text{calibrated}} = a \cdot W_{\text{raw}}^2 + b \cdot W_{\text{raw}} + c$$
*   **Filtering:** Maintain a sliding window buffer of 20 samples (at 10 SPS). Strip the outer 25% of outliers (5 lowest and 5 highest values) to perform median filtering, then compute the arithmetic mean of the remaining 10 samples to cancel motion artifacts.

### 2.2 Temperature Core Imputation (MLX90614ESF-DCI)
*   **Problem:** Non-contact skin temperature measurements are systematically $0.5^\circ\text{C}$ to $1.5^\circ\text{C}$ lower than core body temperature due to evaporative cooling.
*   **Imputation:** Compute core body temperature ($T_{\text{core}}$) from skin surface readings ($T_{\text{skin}}$) and ambient temperature ($T_{\text{ambient}}$) using the Melexis physiological thermal transfer model:
    $$T_{\text{core}} = T_{\text{skin}} + (T_{\text{skin}} - T_{\text{ambient}}) \cdot \alpha$$
    *Where the thermal tissue conductivity coefficient $\alpha \approx 0.12$.*

### 2.3 Distance speed-of-Sound Calibration (HC-SR04 length Sensor)
*   **Problem:** Standard distance equations ($\text{Distance} = \text{Time} / 58.2$) assume speed of sound at 20°C in dry air ($343\text{ m/s}$). In warm incubator environments (32°C to 36°C), the speed of sound shifts to $350.8 - 353.2\text{ m/s}$, introducing a systematic $1.8\text{ cm}$ to $2.4\text{ cm}$ length underestimation error.
*   **Compensation:** Update the speed of sound ($c$) in real-time using ambient temperature ($T$) and humidity ($H$) before computing distance:
    $$c = 331.4 + 0.606 \cdot T_{\text{ambient}} + 0.0124 \cdot H_{\text{humidity}} \text{ (m/s)}$$
    $$\text{Distance (cm)} = \frac{\text{Echo Pulse Duration }(\mu\text{s}) \times c \times 10^{-4}}{2}$$

### 2.4 PPG Skin Tone & Motion Calibration (MAX30102)
*   **Fitzpatrick Offset Correction:** The MAX30102 sensor overestimates $\text{SpO}_2$ by $3\%\text{--}5\%$ in infants with darker skin tones (Fitzpatrick scale V–VI) due to melanin absorbing red light (660nm) more than IR light (940nm). The software must deduct the following calibration deltas based on the Fitzpatrick scale configuration:
    *   *Fitzpatrick I, II, III:* $0.0\%$ offset.
    *   *Fitzpatrick IV:* $-1.5\%$ SpO₂ offset.
    *   *Fitzpatrick V:* $-3.0\%$ SpO₂ offset.
    *   *Fitzpatrick VI:* $-4.5\%$ SpO₂ offset.
*   **TROIKA-Lite Bandpass Filtering:** neonatal heart rates range between 80 to 200 BPM. Apply a 4th-order digital Butterworth bandpass filter with cutoff frequencies of $0.8\text{ Hz}$ ($48\text{ BPM}$) and $4.0\text{ Hz}$ ($240\text{ BPM}$) to strip away low-frequency respiratory drift and high-frequency motion artifacts.

---

## 🧠 3. ML MODEL DEPLOYMENT & PAYLOAD ROUTING

The edge system executes two models locally using serialized `.joblib` binaries:

### 3.1 Model Descriptions
1.  **Continuous Regressor (`xgboost_regression_model.joblib`):**
    *   *Input:* 14 features (5 physical sensors + 9 clinical/demographic variables).
    *   *Target:* Predicted continuous SNAPPE-II score (0-162).
2.  **Binary Triage Classifier (`xgboost_classifier_model.joblib`):**
    *   *Input:* Strictly 6 physical features (`heart_rate`, `spo2`, `temperature`, `weight`, `length`, `urine_output`).
    *   *Target:* Probability of clinical instability (`is_unstable` $\ge$ 30, ROC-AUC 0.9027).

### 3.2 Payload Routing (Socket.io)
When broadcasting prediction payloads to the Next.js server, the `SessionTracker` output must map the binary classifier's probability (`clf_prob`) to the `xgboost` payload key:
```json
{
  "sensor_data": {
    "weight": 3120.0,
    "length": 49.5,
    "temperature": 36.8,
    "heart_rate": 134,
    "spo2": 96.0
  },
  "xgboost": {
    "predicted_score": 12.4,
    "instability_probability": 0.045
  }
}
```
This enables the Next.js frontend dashboard to automatically display the 0.9027 AUC classifier probability in the "ML Probability" widget out-of-the-box.

---

## 💻 4. IMPLEMENTATION CODE TEMPLATES

### 4.1 Speed of Sound Length Calibration
```python
def calculate_compensated_length(echo_duration_secs, temp_ambient, humidity=50.0):
    # Calculate speed of sound in m/s
    c = 331.4 + (0.606 * temp_ambient) + (0.0124 * humidity)
    # Calculate round-trip distance in cm
    distance_cm = (echo_duration_secs * (c * 100)) / 2.0
    return round(distance_cm, 2)
```

### 4.2 Fitzpatrick SpO₂ Correction
```python
def apply_fitzpatrick_correction(raw_spo2, scale_type):
    # Define clinical offsets based on Fitzpatrick Skin Tone scale
    offsets = {1: 0.0, 2: 0.0, 3: 0.0, 4: -1.5, 5: -3.0, 6: -4.5}
    offset = offsets.get(int(scale_type), 0.0)
    corrected_spo2 = raw_spo2 + offset
    return min(100.0, max(0.0, corrected_spo2))
```

### 4.3 Non-Contact skin-to-Core Temperature Correction
```python
def skin_to_core_temp(temp_skin, temp_ambient, alpha=0.12):
    # Impute core temperature using biological thermal transfer coefficient
    temp_core = temp_skin + (temp_skin - temp_ambient) * alpha
    return round(temp_core, 2)
```

### 4.4 Load Cell Poly-Calibration Linearization
```python
def linearize_load_cell(raw_reading, a, b, c):
    # Quadratic linearization formula
    calibrated_weight = a * (raw_reading ** 2) + b * raw_reading + c
    return round(calibrated_weight, 1)
```

### 4.5 Neonatal PPG Bandpass Filter
```python
from scipy.signal import butter, filtfilt

def filter_ppg_signal(raw_ppg, fs=50.0):
    nyq = 0.5 * fs
    low_cutoff = 0.8 / nyq   # 48 BPM
    high_cutoff = 4.0 / nyq  # 240 BPM
    b, a = butter(4, [low_cutoff, high_cutoff], btype='band')
    return filtfilt(b, a, raw_ppg)
```

---

## 🚀 5. LOCAL TESTING & VERIFICATION INSTRUCTIONS

To verify the integration on the Raspberry Pi 5 or a local macOS simulator:

1.  **Activate the Python Virtual Environment:**
    ```bash
    cd /Users/alvin/CodeProjects/SmartBabyScale/SmartBabyScale
    source .venv/bin/activate
    ```
2.  **Start the Next.js Frontend Dashboard:**
    ```bash
    cd Interface
    npm run dev
    ```
3.  **Run the Hardware Reader or Simulator:**
    *   *To run the hardware reader (Raspberry Pi 5):*
        ```bash
        cd Sensors
        python3 pi_hardware_reader.py
        ```
    *   *To run the simulator (macOS testing):*
        ```bash
        cd Sensors
        python3 simulation.py
        ```
4.  **Confirm UI Display:** Verify that the "ML Probability" on the frontend matches the printed `clf_prob` from the console and responds dynamically to keystroke inputs (Simulation mode) or physical sensor placement (Hardware mode).
