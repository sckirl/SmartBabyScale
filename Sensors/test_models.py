import os
import sys

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(project_root)

from MachineLearning.session_calculator import SessionTracker
import joblib

models_dir = os.path.join(project_root, 'MachineLearning', 'models')
scaler_path = os.path.join(models_dir, 'input_scaler.joblib')
svm_path = os.path.join(models_dir, 'svm_risk_model.joblib')
xgb_path = os.path.join(models_dir, 'xgboost_risk_model.joblib')
rf_path = os.path.join(models_dir, 'rf_risk_model.joblib')
cols_path = os.path.join(models_dir, 'feature_columns.joblib')

print("Loading models...")
scaler = joblib.load(scaler_path)
svm_model = joblib.load(svm_path)
xgb_model = joblib.load(xgb_path)
rf_model = joblib.load(rf_path)
feature_cols = joblib.load(cols_path)
print("Models loaded successfully.")

session = SessionTracker(patient_id=8888, birth_weight_g=3100.0, gestational_age_weeks=38, apgar_score_5min=9)
print("\n=== Initial Prediction ===")
pred = session.predict_risk(scaler, svm_model, xgb_model, rf_model, feature_cols)
print(f"SNAPPE-II Score: {pred['snappe_score']} ({pred['risk_level']})")
print(f"XGBoost Instability Prob: {pred['xgboost']['instability_probability'] * 100:.2f}%")
print(f"RF Instability Prob: {pred['rf']['instability_probability'] * 100:.2f}%")
print(f"SVM Instability Prob: {pred['svm']['instability_probability'] * 100:.2f}%")

print("\n=== Updating Diaper (Wet: 100g, Dry: 20g, 2 hours) ===")
# diaper mode simulation: urine_ml_kg_hr = (100 - 20) / 3.1 / 2 = 12.9
session.update_demographics(urine_output_ml_kg_hr=12.9)
pred = session.predict_risk(scaler, svm_model, xgb_model, rf_model, feature_cols)
print(f"SNAPPE-II Score: {pred['snappe_score']} ({pred['risk_level']})")
print(f"XGBoost Instability Prob: {pred['xgboost']['instability_probability'] * 100:.2f}%")
print(f"RF Instability Prob: {pred['rf']['instability_probability'] * 100:.2f}%")
print(f"SVM Instability Prob: {pred['svm']['instability_probability'] * 100:.2f}%")

print("\n=== Updating Vitals to Critical Levels ===")
session.update_sensors(temperature_celsius=34.0, heart_rate_bpm=80, spo2_percent=85)
session.update_demographics(lowest_serum_ph=7.0, apgar_score_5min=3)
pred = session.predict_risk(scaler, svm_model, xgb_model, rf_model, feature_cols)
print(f"SNAPPE-II Score: {pred['snappe_score']} ({pred['risk_level']})")
print(f"XGBoost Instability Prob: {pred['xgboost']['instability_probability'] * 100:.2f}%")
print(f"RF Instability Prob: {pred['rf']['instability_probability'] * 100:.2f}%")
print(f"SVM Instability Prob: {pred['svm']['instability_probability'] * 100:.2f}%")
