# Sensor Infrastructure & Edge ML Pivot

CONFIDENCE: EXTRACTED
RELATIONS:
- implements::[[calibration_coeffs.json]]
- implements::[[session_calculator.py]]
- validates::[[test_sensors.py]]
GOD_NODES: [[[SNAPPE-II Scoring Variables and Thresholds]], [[Sensor Fusion and Missing Data (MNAR)]]]
SURPRISING_CONNECTIONS: Fitzpatrick SpO₂ skin tone corrections sync bi-directionally between Next.js React state and edge Python Socket.io server.

---

## 1. Hardware IoT Constraints
After auditing the Raspberry Pi Python scripts (`pi_hardware_reader.py` and `simulation.py`), the physical data collected by the IoT edge device is strictly limited to:
- **HX711 (Weight Sensor)**: Measures `current_weight_g`. (Also used in a diaper weighing hack to calculate `urine_output_ml_kg_hr`).
- **HC-SR04 (Ultrasonic)**: Measures `current_length_cm`.
  - **CRITICAL RISK:** Feeding a 5V ECHO signal from the HC-SR04 directly into a 3.3V Pi GPIO pin risks permanent hardware damage. A voltage divider (1k/2k) must be used. (See [[IEEE Reviewer Audit]]).
- **MLX90614 (Infrared)**: Measures `lowest_temperature_celsius` non-invasively.
- **GY-MAX30102 (Pulse Ox)**: Measures `avg_heart_rate_bpm` and `lowest_spo2_percent`.

> [!WARNING] Linux Jitter Risk
> Non-real-time OS jitter on Raspberry Pi (Linux) can disrupt strict timing requirements for sensor protocols like the HC-SR04 ultrasonic timing, degrading measurement reliability.

---

## 2. The Flaw in Previous Feature Engineering
Our previous model evaluation showed **PO2/FiO2 Ratio** and **Mean Blood Pressure** as the most important features. However, these are **external clinical lab results**, not data gathered by our non-invasive scale. If the system requires a nurse to manually input these lab results before getting a prediction, it defeats the purpose of an instantaneous, non-invasive IoT scale.

---

## 3. The Adjustment (Sensor-Only Prediction)
To make the scale truly autonomous and non-invasive, the ML model must be restricted to learn *only* from the hardware sensors.
**Input Features (`X`)**:
1. `current_weight_g`
2. `current_length_cm`
3. `lowest_temperature_celsius`
4. `avg_heart_rate_bpm`
5. `lowest_spo2_percent`
6. `urine_output_ml_kg_hr` (Calculated via the diaper weighing hack)

**Target (`y`)**: 
The model will use these 6 non-invasive surface vitals to **predict the clinical instability triage probability** (`is_unstable` proxy ROC-AUC 0.9027).

---

## 4. Edge Calibrations & Signal Processing Implementation

### 4.1 Weight Outliers-Stripping & Linearization
* **Noise Mitigation:** Maintain a sliding window buffer of 20 samples (at 10 SPS). Strip the 5 lowest and 5 highest values (outer 25%), then compute the arithmetic mean of the center 10 samples to filter motion artifacts.
* **Quadratic Calibration:** Linearize raw load cell readings:
  $$W_{\text{calibrated}} = a \cdot W_{\text{raw}}^2 + b \cdot W_{\text{raw}} + c$$
  *Coefficients $a, b, c$ loaded from `calibration_coeffs.json`.*

### 4.2 Non-Contact skin-to-Core Temperature Imputation
* **Evaporative Cooling Compensation:** Estimate core temperature ($T_{\text{core}}$) from non-contact skin temperature ($T_{\text{skin}}$) and ambient temperature ($T_{\text{ambient}}$) using the Melexis physiological thermal transfer model:
  $$T_{\text{core}} = T_{\text{skin}} + (T_{\text{skin}} - T_{\text{ambient}}) \cdot \alpha$$
  *Tissue conductivity coefficient $\alpha \approx 0.12$ loaded from config.*

### 4.3 HC-SR04 Temperature-Compensated Speed of Sound
* **incubation Thermal Drift:** speed of sound shifts to $350.8 - 353.2\text{ m/s}$ in warm incubators (32°C to 36°C). Calculate real-time compensated speed of sound ($c$) and distance:
  $$c = 331.4 + 0.606 \cdot T_{\text{ambient}} + 0.0124 \cdot H_{\text{humidity}} \text{ (m/s)}$$
  $$\text{Distance (cm)} = \frac{\text{Echo Pulse Duration }(\mu\text{s}) \times c \times 10^{-4}}{2}$$

### 4.4 Pulse Oximetry Fitzpatrick Skin-Tone Correction
* **Melanin Optical Bias:** MAX30102 pulse oximeters overestimate SpO₂ in darker skin tones (Fitzpatrick V–VI) due to melanin light absorption. Software corrects SpO₂ using verified offset deltas based on Fitzpatrick scale:
  * *Fitzpatrick I–III:* $0.0\%$ SpO₂ offset
  * *Fitzpatrick IV:* $-1.5\%$ SpO₂ offset
  * *Fitzpatrick V:* $-3.0\%$ SpO₂ offset
  * *Fitzpatrick VI:* $-4.5\%$ SpO₂ offset
  * *Clamping:* Corrected values clamped strictly to $[0.0\%, 100.0\%]$.
* **PPG Bandpass Filtering:** Apply a 4th-order digital Butterworth bandpass filter ($0.8\text{ Hz}$ to $4.0\text{ Hz}$) to reject low-frequency respiratory drift and high-frequency motion artifacts.

---

## 5. Primary Sources
* **MIMIC-III Clinical Database Descriptor:** Johnson et al. (2016). [DOI: 10.1038/sdata.2016.35](https://doi.org/10.1038/sdata.2016.35)
* **Fitzpatrick Skin Phototypes Review:** [Fitzpatrick Skin Tone Scale Guidelines](https://www.sciencedirect.com/topics/medicine-and-dentistry/fitzpatrick-scale)
* **Melexis MLX90614 Application Note:** non-contact thermal model. [MLX90614 Technical Specifications](https://www.melexis.com/en/product/mlx90614)
* **HC-SR04 Speed of Sound Calculator:** [Thermodynamics of Sound in Air](https://www.engineeringtoolbox.com/speed-sound-d_519.html)
* **PPG Motion Artifact Rejection:** TROIKA framework. [IEEE Transactions on Biomedical Engineering (2015)](https://doi.org/10.1109/TBME.2014.2359756)
