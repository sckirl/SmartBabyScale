import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit
import joblib

def retrain_and_test_sparsity():
    df = pd.read_csv('neonatal_dataset.csv')
    feature_cols = joblib.load('models/feature_columns.joblib')
    
    # Target
    y = df['snappe_ii_score']
    X = df[feature_cols]
    
    # 1. Strict Patient-Wise Split
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(X, y, groups=df['SUBJECT_ID']))
    
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    
    # 2. Train XGBoost
    # Apply sample weighting to penalize severe cases
    sample_weights = y_train + 1.0
    
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
        objective='reg:squarederror'
    )
    model.fit(X_train, y_train, sample_weight=sample_weights)
    
    # 3. Evaluate Baseline (Dense)
    preds_dense = model.predict(X_test)
    rmse_dense = np.sqrt(mean_squared_error(y_test, preds_dense))
    r2_dense = r2_score(y_test, preds_dense)
    
    print("=== NEW TRAINING (Patient-Isolated via GroupShuffleSplit) ===")
    print("[Baseline - Full Dense Data]")
    print(f"RMSE: {rmse_dense:.4f}")
    print(f"R²:   {r2_dense:.4f}\n")
    
    # 4. Evaluate Masked (Clinical Labs Missing)
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
    
    print("[Masked - Missing Lab Data (Physical Sensors Only)]")
    print(f"RMSE: {rmse_masked:.4f}")
    print(f"R²:   {r2_masked:.4f}")
    print(f"Degradation in RMSE: +{rmse_masked - rmse_dense:.4f}")
    print(f"Degradation in R²:   {r2_masked - r2_dense:.4f}")

if __name__ == '__main__':
    retrain_and_test_sparsity()
