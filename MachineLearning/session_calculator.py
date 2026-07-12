import numpy as np
import pandas as pd
import joblib
import os

class SessionTracker:
    def __init__(self, patient_id=8888, birth_weight_g=3100.0, gestational_age_weeks=38, apgar_score_5min=9):
        self.patient_id = patient_id
        
        # Demographics / Clinical Baseline
        self.birth_weight_g = birth_weight_g
        self.gestational_age_weeks = gestational_age_weeks
        self.apgar_score_5min = apgar_score_5min
        self.sga = 0
        self.calculate_sga()
        
        # Fitzpatrick Skin Tone Scale (1-6)
        self.fitzpatrick_scale = 1
        
        # Load calibration coefficients
        import json
        import os
        self.calibrations = {}
        config_path = os.path.join(os.path.dirname(__file__), '..', 'Sensors', 'calibration_coeffs.json')
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    self.calibrations = json.load(f)
            except Exception as e:
                print(f"[SessionTracker] Error loading calibrations: {e}")
        
        # Delayed Lab/Clinical Inputs
        self.mean_blood_pressure = np.nan
        self.lowest_serum_ph = np.nan
        self.po2_fio2_ratio = np.nan
        self.seizures = 0
        self.urine_output_ml_kg_hr = np.nan
        
        # Real-time Sensor Channels
        self.current_weight_g = birth_weight_g
        self.current_length_cm = 48.0
        self.current_temp_c = 36.5
        
        # Keep sliding window buffers for vitals (to filter noise and compute stats)
        self.heart_rates = []
        self.spo2_values = []
        self.temp_values = [36.5]
        
        # Stats tracked
        self.lowest_temp_c = 36.5
        self.packet_count = 0
        
    def calculate_sga(self):
        # Helper function to calculate Small for Gestational Age (SGA) dynamically
        # Standard threshold limits matching the frontend implementation
        limits = {
            24: 550, 25: 650, 26: 750, 27: 850, 28: 950, 29: 1050, 30: 1200, 31: 1350,
            32: 1500, 33: 1700, 34: 1900, 35: 2100, 36: 2300, 37: 2500, 38: 2700, 39: 2850, 40: 3000, 41: 3100
        }
        week = max(24, min(41, int(self.gestational_age_weeks)))
        limit = limits.get(week, 3100)
        self.sga = 1 if self.birth_weight_g < limit else 0
        
    def update_demographics(self, birth_weight_g=None, gestational_age_weeks=None, apgar_score_5min=None,
                           mean_blood_pressure=None, lowest_serum_ph=None, po2_fio2_ratio=None,
                           seizures=None, urine_output_ml_kg_hr=None, fitzpatrick_scale=None):
        if birth_weight_g is not None:
            self.birth_weight_g = float(birth_weight_g)
        if gestational_age_weeks is not None:
            self.gestational_age_weeks = float(gestational_age_weeks)
        if apgar_score_5min is not None:
            self.apgar_score_5min = float(apgar_score_5min)
            
        self.calculate_sga()
        
        if mean_blood_pressure is not None:
            self.mean_blood_pressure = float(mean_blood_pressure)
        if lowest_serum_ph is not None:
            self.lowest_serum_ph = float(lowest_serum_ph)
        if po2_fio2_ratio is not None:
            self.po2_fio2_ratio = float(po2_fio2_ratio)
        if seizures is not None:
            self.seizures = int(seizures)
        if urine_output_ml_kg_hr is not None:
            self.urine_output_ml_kg_hr = float(urine_output_ml_kg_hr)
        if fitzpatrick_scale is not None:
            self.fitzpatrick_scale = max(1, min(6, int(fitzpatrick_scale)))
            
    def update_sensors(self, weight_grams=None, length_cm=None, temperature_celsius=None,
                       heart_rate_bpm=None, spo2_percent=None):
        self.packet_count += 1
        
        if weight_grams is not None:
            self.current_weight_g = float(weight_grams)
        if length_cm is not None:
            self.current_length_cm = float(length_cm)
            
        if temperature_celsius is not None:
            self.current_temp_c = float(temperature_celsius)
            self.temp_values.append(self.current_temp_c)
            self.lowest_temp_c = min(self.temp_values)
            
        if heart_rate_bpm is not None:
            self.heart_rates.append(float(heart_rate_bpm))
            if len(self.heart_rates) > 50:
                self.heart_rates.pop(0)
                
        if spo2_percent is not None:
            self.spo2_values.append(float(spo2_percent))
            if len(self.spo2_values) > 50:
                self.spo2_values.pop(0)

    def get_avg_heart_rate(self):
        return int(np.mean(self.heart_rates)) if self.heart_rates else 140
        
    def get_lowest_spo2(self):
        return int(np.min(self.spo2_values)) if self.spo2_values else 98

    def get_calibrated_spo2(self):
        raw_spo2 = self.get_lowest_spo2()
        offsets = self.calibrations.get('fitzpatrick', {
            "1": 0.0, "2": 0.0, "3": 0.0, "4": -1.5, "5": -3.0, "6": -4.5
        })
        offset = offsets.get(str(self.fitzpatrick_scale), 0.0)
        corrected_spo2 = raw_spo2 + offset
        return min(100.0, max(0.0, corrected_spo2))

    def calculate_snappe_ii(self):
        # SNAPPE-II Clinical scoring rules implementation
        score = 0
        
        # 1. Mean Blood Pressure
        if not np.isnan(self.mean_blood_pressure):
            if self.mean_blood_pressure < 20: score += 19
            elif self.mean_blood_pressure <= 29: score += 9
            
        # 2. Lowest Temperature
        if self.lowest_temp_c < 35.0: score += 15
        elif self.lowest_temp_c <= 35.6: score += 8
        
        # 3. PO2 / FiO2 Ratio
        if not np.isnan(self.po2_fio2_ratio):
            if self.po2_fio2_ratio < 0.3: score += 28
            elif self.po2_fio2_ratio <= 0.99: score += 16
            elif self.po2_fio2_ratio <= 2.49: score += 5
            
        # 4. Serum pH
        if not np.isnan(self.lowest_serum_ph):
            if self.lowest_serum_ph < 7.10: score += 16
            elif self.lowest_serum_ph <= 7.19: score += 7
            
        # 5. Urine Output
        if not np.isnan(self.urine_output_ml_kg_hr):
            if self.urine_output_ml_kg_hr < 0.1: score += 18
            elif self.urine_output_ml_kg_hr <= 0.9: score += 5
            
        # 6. Birth Weight
        if self.birth_weight_g < 750: score += 17
        elif self.birth_weight_g <= 999: score += 10
        
        # Perinatal extensions
        if self.seizures == 1: score += 19
        if self.sga == 1: score += 12
        if self.apgar_score_5min < 7: score += 18
        
        return score

    def predict_risk(self, scaler, svm_model, xgb_model, rf_model, feature_cols):
        # Prepare inputs matching regression feature layout
        # ['current_weight_g', 'current_length_cm', 'lowest_temperature_celsius', 'avg_heart_rate_bpm', 'lowest_spo2_percent', 'urine_output_ml_kg_hr']
        # ['mean_blood_pressure', 'po2_fio2_ratio', 'lowest_serum_ph', 'seizures', 'sga', 'apgar_score_5min']
        
        data = {
            'current_weight_g': self.current_weight_g,
            'current_length_cm': self.current_length_cm,
            'lowest_temperature_celsius': self.lowest_temp_c,
            'avg_heart_rate_bpm': self.get_avg_heart_rate(),
            'lowest_spo2_percent': self.get_calibrated_spo2(),
            'urine_output_ml_kg_hr': self.urine_output_ml_kg_hr,
            'mean_blood_pressure': self.mean_blood_pressure,
            'po2_fio2_ratio': self.po2_fio2_ratio,
            'lowest_serum_ph': self.lowest_serum_ph,
            'seizures': self.seizures,
            'sga': self.sga,
            'apgar_score_5min': self.apgar_score_5min,
            'birth_weight_g': self.birth_weight_g,
            'gestational_age_weeks': self.gestational_age_weeks
        }
        
        df_input = pd.DataFrame([data])[feature_cols]
        
        # XGBoost handles NaNs natively
        xgb_pred = float(xgb_model.predict(df_input)[0])
        
        # RF & SVR require imputation
        # Use median imputation values (simple fallback placeholder values matching dataset)
        fallback_medians = {
            'mean_blood_pressure': 42.0,
            'po2_fio2_ratio': 1.8,
            'lowest_serum_ph': 7.35,
            'urine_output_ml_kg_hr': 2.5
        }
        df_imputed = df_input.copy()
        for col in df_imputed.columns:
            if df_imputed[col].isna().any():
                df_imputed[col] = df_imputed[col].fillna(fallback_medians.get(col, 0.0))
                
        rf_pred = float(rf_model.predict(df_imputed)[0])
        
        # SVR requires scaling
        df_scaled = scaler.transform(df_imputed)
        svr_pred = float(svm_model.predict(df_scaled)[0])  # note: svm_model represents SVR pipeline/model
        
        snappe = self.calculate_snappe_ii()
        
        # Compute instability classification probability (using our newly trained IoT-Only classifier)
        # Load the classifier dynamically
        try:
            clf_model = joblib.load(os.path.join(os.path.dirname(__file__), 'models/xgboost_classifier_model.joblib'))
            iot_data = {
                'current_weight_g': self.current_weight_g,
                'current_length_cm': self.current_length_cm,
                'lowest_temperature_celsius': self.lowest_temp_c,
                'avg_heart_rate_bpm': self.get_avg_heart_rate(),
                'lowest_spo2_percent': self.get_calibrated_spo2(),
                'urine_output_ml_kg_hr': self.urine_output_ml_kg_hr if not np.isnan(self.urine_output_ml_kg_hr) else 2.5
            }
            df_clf = pd.DataFrame([iot_data])[['current_weight_g', 'current_length_cm', 'lowest_temperature_celsius', 'avg_heart_rate_bpm', 'lowest_spo2_percent', 'urine_output_ml_kg_hr']]
            clf_prob = float(clf_model.predict_proba(df_clf)[0][1])
            outcome_prediction = int(clf_model.predict(df_clf)[0])
        except Exception as e:
            print(f"[session_calculator] Error loading/predicting with classifier: {e}")
            clf_prob = 0.05
            outcome_prediction = 0
            
        # Reframed risk levels based on clinical score
        if snappe < 15:
            risk_level = 'Low'
        elif snappe < 30:
            risk_level = 'Moderate'
        else:
            risk_level = 'High'
            
        return {
            'snappe_score': snappe,
            'risk_level': risk_level,
            'xgboost': {
                'instability_probability': round(clf_prob, 4),  # XGBoost Classifier (0.9027 AUC)
                'outcome_prediction': outcome_prediction
            },
            'xgboost_regressor': {
                'score': xgb_pred,
                'instability_probability': round(xgb_pred / 162.0, 4),
                'outcome_prediction': 1 if xgb_pred >= 30 else 0
            },
            'rf': {
                'instability_probability': round(rf_pred / 162.0, 4),
                'outcome_prediction': 1 if rf_pred >= 30 else 0
            },
            'svm': {
                'instability_probability': round(svr_pred / 162.0, 4),
                'outcome_prediction': 1 if svr_pred >= 30 else 0
            },
            'accuracy_warning': self.packet_count < 20,
            'packet_count': self.packet_count
        }
