# Sensor Infrastructure & Edge ML Pivot

## 1. Hardware IoT Constraints
After auditing the Raspberry Pi Python scripts (`pi_hardware_reader.py` and `simulation.py`), the physical data collected by the IoT edge device is strictly limited to:
- **HX711 (Weight Sensor)**: Measures `current_weight_g`. (Also used in a clever hack to measure diaper weight to calculate `urine_output_ml_kg_hr`).
- **HC-SR04 (Ultrasonic)**: Measures `current_length_cm`.
  - **CRITICAL RISK:** Feeding a 5V ECHO signal from the HC-SR04 directly into a 3.3V Pi GPIO pin risks permanent hardware damage. A voltage divider (1k/2k) must be used. (See [[IEEE Reviewer Audit]]).
- **MLX90614 (Infrared)**: Measures `lowest_temperature_celsius` non-invasively.
- **GY-MAX30102 (Pulse Ox)**: Measures `avg_heart_rate_bpm` and `lowest_spo2_percent`.

> [!WARNING] Linux Jitter Risk
> Non-real-time OS jitter on Raspberry Pi (Linux) can severely disrupt strict timing requirements for sensor protocols like the HC-SR04 ultrasonic timing, degrading measurement reliability.

## 2. The Flaw in Previous Feature Engineering
Our previous model evaluation showed **PO2/FiO2 Ratio** and **Mean Blood Pressure** as the most important features. However, these are **external clinical lab results**, not data gathered by our non-invasive scale. 
If the system requires a nurse to manually input these lab results before getting a prediction, it defeats the purpose of an instantaneous, non-invasive IoT scale. 

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
The model will use these 6 non-invasive surface metrics to **predict the hidden SNAPPE-II score**.

**Confidence**: EXTRACTED
**Why**: Ensures the edge device operates entirely autonomously without depending on external lab data, leveraging the hardware we actually built.
