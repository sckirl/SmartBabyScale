import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit
import os

def run_sparsity_stress_test():
    print("--- Lab-Sparsity Stress Test ---")
    # Load dataset
    data_path = 'neonatal_dataset.csv'
    df = pd.read_csv(data_path)
    
    # Isolate features
    feature_cols = joblib.load('models/feature_columns.joblib')
    
    # We will use GroupShuffleSplit to enforce patient-wise splitting as promised
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(df, groups=df['SUBJECT_ID']))
    
    test_df = df.iloc[test_idx].copy()
    X_test = test_df[feature_cols]
    y_test = test_df['snappe_ii_score']
    
    # Load model
    try:
        model = joblib.load('models/xgboost_risk_model.joblib')
    except Exception:
        model = joblib.load('models/xgboost_model.joblib')
    
    # 1. Baseline Performance (Dense Data)
    preds_dense = model.predict(X_test)
    rmse_dense = np.sqrt(mean_squared_error(y_test, preds_dense))
    r2_dense = r2_score(y_test, preds_dense)
    print(f"[Baseline - Full Data]")
    print(f"RMSE: {rmse_dense:.4f}")
    print(f"R²:   {r2_dense:.4f}\n")
    
    # 2. Masking Clinical Lab Data
    # Simulating asynchronousNICU where only physical sensors and demographic data are immediately available.
    # Masking: Apgar, Mean BP, PO2/FiO2, lowest pH, seizures, urine output
    lab_features = [
        'apgar_score_5min', 
        'mean_blood_pressure', 
        'po2_fio2_ratio', 
        'lowest_serum_ph', 
        'seizures', 
        'urine_output_ml_kg_hr'
    ]
    
    X_test_masked = X_test.copy()
    for col in lab_features:
        if col in X_test_masked.columns:
            X_test_masked[col] = np.nan
            
    preds_masked = model.predict(X_test_masked)
    rmse_masked = np.sqrt(mean_squared_error(y_test, preds_masked))
    r2_masked = r2_score(y_test, preds_masked)
    
    print(f"[Masked - Missing Lab Data (Physical Sensors Only)]")
    print(f"RMSE: {rmse_masked:.4f}")
    print(f"R²:   {r2_masked:.4f}")
    print(f"Degradation in RMSE: +{rmse_masked - rmse_dense:.4f}")
    print(f"Degradation in R²:   {r2_masked - r2_dense:.4f}")

if __name__ == '__main__':
    run_sparsity_stress_test()
