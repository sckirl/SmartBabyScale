"""
SmartBabyScale - Dynamic Session Tracker & SNAPPE-II Calculator
This module contains the SessionTracker class, which dynamically calculates 
running session averages, minima, and maxima from real-time streaming sensor inputs,
computes the SNAPPE-II clinical score, and runs inference on the SVM/MLP models.
"""

import numpy as np

class SessionTracker:
    """
    Tracks and aggregates real-time sensor streams and clinical parameters for a monitoring session.
    Calculates dynamic running metrics (averages, minimums, maximums) and evaluates 
    real-time clinical risks (SNAPPE-II score, SVM/MLP model predictions).
    """
    
    def __init__(self, patient_id, birth_weight_g, gestational_age_weeks, sga=0, apgar_score_5min=9):
        """
        Initializes a new monitoring session for a neonate.
        
        Parameters:
        - patient_id: Unique medical record ID or patient number.
        - birth_weight_g: The recorded weight of the baby at birth (grams).
        - gestational_age_weeks: The gestational age at birth (weeks).
        - sga: Small for Gestational Age status (1 = True, 0 = False). Default is 0.
        - apgar_score_5min: 5-minute Apgar score. Default is 9 (normal).
        """
        self.patient_id = patient_id
        
        # Demographic & Baseline Clinical Variables (Constants for this patient session)
        self.birth_weight_g = float(birth_weight_g)
        self.gestational_age_weeks = int(gestational_age_weeks)
        self.sga = int(sga)
        self.apgar_score_5min = int(apgar_score_5min)
        
        # Physiological Clinical Variables (can be inputted or updated periodically)
        self.mean_blood_pressure = 35.0         # Default normal (mmHg)
        self.lowest_serum_ph = 7.35             # Default normal
        self.po2_fio2_ratio = 3.20              # Default normal (not ventilated / healthy)
        self.seizures = 0                       # Default absent (0)
        self.urine_output_ml_kg_hr = 2.0        # Default normal (mL/kg/hour)
        
        # Real-time Sensor Streams & Aggregates
        # Weight Sensor (HX711)
        self.current_weight_g = float(birth_weight_g)
        
        # Temperature Sensor (MLX90614)
        self.current_temp_c = 36.5
        self.lowest_temp_c = 36.5               # Tracks minimum temperature during the session
        
        # Pulse Oximeter (GY-MAX30102)
        self.current_hr_bpm = 140.0
        self.hr_values = []                     # Stores historical HR readings to calculate average
        
        self.current_spo2_percent = 97
        self.spo2_values = []                   # Stores SpO2 readings to calculate lowest SpO2
        
        # Count of received sensor packets
        self.packet_count = 0
        
    def update_sensors(self, weight_grams=None, temperature_celsius=None, heart_rate_bpm=None, spo2_percent=None):
        """
        Updates session statistics with incoming real-time sensor measurements.
        
        Parameters:
        - weight_grams: Measured weight from HX711 scale.
        - temperature_celsius: Measured temperature from MLX90614.
        - heart_rate_bpm: Measured heart rate from GY-MAX30102.
        - spo2_percent: Measured SpO2 from GY-MAX30102.
        """
        self.packet_count += 1
        
        # Update Weight
        if weight_grams is not None:
            self.current_weight_g = float(weight_grams)
            
        # Update Temperature and track the lowest recorded temperature (required for SNAPPE-II)
        if temperature_celsius is not None:
            self.current_temp_c = float(temperature_celsius)
            if self.current_temp_c < self.lowest_temp_c:
                self.lowest_temp_c = self.current_temp_c
                
        # Update Heart Rate and append to history for session average
        if heart_rate_bpm is not None:
            self.current_hr_bpm = float(heart_rate_bpm)
            self.hr_values.append(self.current_hr_bpm)
            # Limit history to last 1000 readings to prevent memory growth
            if len(self.hr_values) > 1000:
                self.hr_values.pop(0)
                
        # Update SpO2 and append to history for tracking minimum SpO2
        if spo2_percent is not None:
            self.current_spo2_percent = int(spo2_percent)
            self.spo2_values.append(self.current_spo2_percent)
            if len(self.spo2_values) > 1000:
                self.spo2_values.pop(0)

    def set_clinical_inputs(self, mean_blood_pressure=None, lowest_serum_ph=None, po2_fio2_ratio=None, urine_output_ml_kg_hr=None, seizures=None):
        """
        Updates clinical inputs which are not directly readable from scale/oximeter sensors.
        
        Parameters:
        - mean_blood_pressure: Mean blood pressure in mmHg.
        - lowest_serum_ph: Lowest blood gas pH.
        - po2_fio2_ratio: PaO2/FiO2 ratio.
        - urine_output_ml_kg_hr: Urine output rate.
        - seizures: Presence of multiple seizures (1 or 0).
        """
        if mean_blood_pressure is not None:
            self.mean_blood_pressure = float(mean_blood_pressure)
        if lowest_serum_ph is not None:
            self.lowest_serum_ph = float(lowest_serum_ph)
        if po2_fio2_ratio is not None:
            self.po2_fio2_ratio = float(po2_fio2_ratio)
        if urine_output_ml_kg_hr is not None:
            self.urine_output_ml_kg_hr = float(urine_output_ml_kg_hr)
        if seizures is not None:
            self.seizures = int(seizures)

    def calculate_snappe_ii(self):
        """
        Computes the SNAPPE-II score dynamically using current cumulative session state.
        
        Returns:
        - score: Calculated SNAPPE-II score (0 to 162).
        """
        score = 0
        
        # 1. Birth Weight (g)
        if self.birth_weight_g < 750:
            score += 17
        elif 750 <= self.birth_weight_g < 1000:
            score += 10
            
        # 2. Small for Gestational Age (SGA)
        if self.sga == 1:
            score += 5
            
        # 3. Apgar Score at 5 minutes
        if self.apgar_score_5min < 7:
            score += 18
            
        # 4. Mean Blood Pressure (mmHg)
        if self.mean_blood_pressure < 20:
            score += 19
        elif 20 <= self.mean_blood_pressure < 30:
            score += 9
            
        # 5. Lowest Temperature (Celsius)
        if self.lowest_temp_c < 35.0:
            score += 15
        elif 35.0 <= self.lowest_temp_c <= 35.6:
            score += 8
            
        # 6. PO2 / FiO2 Ratio
        if self.po2_fio2_ratio < 0.3:
            score += 28
        elif 0.3 <= self.po2_fio2_ratio < 1.0:
            score += 16
        elif 1.0 <= self.po2_fio2_ratio < 2.5:
            score += 5
            
        # 7. Lowest Serum pH
        if self.lowest_serum_ph < 7.10:
            score += 16
        elif 7.10 <= self.lowest_serum_ph < 7.20:
            score += 7
            
        # 8. Multiple Seizures
        if self.seizures == 1:
            score += 19
            
        # 9. Urine Output (mL/kg/hour)
        if self.urine_output_ml_kg_hr < 0.1:
            score += 18
        elif 0.1 <= self.urine_output_ml_kg_hr < 1.0:
            score += 5
            
        return score

    def get_avg_heart_rate(self):
        """Returns the average heart rate recorded in this session."""
        if not self.hr_values:
            return self.current_hr_bpm
        return float(np.mean(self.hr_values))

    def get_lowest_spo2(self):
        """Returns the minimum SpO2 level recorded in this session."""
        if not self.spo2_values:
            return self.current_spo2_percent
        return int(np.min(self.spo2_values))

    def get_feature_vector(self):
        """
        Assembles the physiological and demographic variables into a dictionary matching
        the trained machine learning model feature columns.
        """
        return {
            'birth_weight_g': self.birth_weight_g,
            'gestational_age_weeks': self.gestational_age_weeks,
            'sga': self.sga,
            'apgar_score_5min': self.apgar_score_5min,
            'mean_blood_pressure': self.mean_blood_pressure,
            'lowest_temperature_celsius': self.lowest_temp_c,
            'po2_fio2_ratio': self.po2_fio2_ratio,
            'lowest_serum_ph': self.lowest_serum_ph,
            'seizures': self.seizures,
            'urine_output_ml_kg_hr': self.urine_output_ml_kg_hr,
            'avg_heart_rate_bpm': self.get_avg_heart_rate(),
            'lowest_spo2_percent': self.get_lowest_spo2()
        }

    def predict_risk(self, scaler, svm_model, mlp_model, feature_cols):
        """
        Uses pre-trained SVM and MLP models to estimate mortality risk and classification.
        
        Parameters:
        - scaler: The trained StandardScaler object.
        - svm_model: The trained SVM model file/object.
        - mlp_model: The trained MLP model file/object.
        - feature_cols: List of column names in the exact training order.
        
        Returns:
        - dict containing risk scores and probabilities from both models.
        """
        features_dict = self.get_feature_vector()
        
        # Assemble feature vector in the exact column order required by the models
        vector = [features_dict[col] for col in feature_cols]
        vector_reshaped = np.array(vector).reshape(1, -1)
        
        # Scale features
        vector_scaled = scaler.transform(vector_reshaped)
        
        # SVM prediction
        svm_prob = float(svm_model.predict_proba(vector_scaled)[0][1])
        svm_class = int(svm_model.predict(vector_scaled)[0])
        
        # MLP prediction
        mlp_prob = float(mlp_model.predict_proba(vector_scaled)[0][1])
        mlp_class = int(mlp_model.predict(vector_scaled)[0])
        
        # Dynamic check for prediction confidence warning
        # If the monitoring session has fewer than 20 readings, trigger an accuracy warning
        accuracy_warning = self.packet_count < 20
        
        snappe_score = self.calculate_snappe_ii()
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
                'mortality_probability': round(svm_prob, 4),
                'outcome_prediction': svm_class
            },
            'mlp': {
                'mortality_probability': round(mlp_prob, 4),
                'outcome_prediction': mlp_class
            },
            'accuracy_warning': accuracy_warning,
            'packet_count': self.packet_count
        }
