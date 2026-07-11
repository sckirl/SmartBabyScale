import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import GroupShuffleSplit
from sklearn.metrics import roc_auc_score, classification_report, roc_curve
import matplotlib.pyplot as plt

def run_classifier_validation():
    print("--- 🔴 Reviewer Rebuttal: IoT Sensor-Only Classifier ---")
    df = pd.read_csv('neonatal_dataset.csv')
    
    # Derive clinical instability threshold (Moderate/High Risk => Score >= 30)
    df['is_unstable'] = (df['snappe_ii_score'] >= 30).astype(int)
    print(f"Instability prevalence: {df['is_unstable'].mean()*100:.2f}%")

    # 1. Restrict strictly to physical IoT sensors (NO LABS)
    sensor_cols = [
        'current_weight_g', 
        'current_length_cm', 
        'lowest_temperature_celsius', 
        'avg_heart_rate_bpm', 
        'lowest_spo2_percent', 
        'urine_output_ml_kg_hr' # Derivable via diaper weight
    ]
    
    X = df[sensor_cols]
    y = df['is_unstable']
    
    # 2. Strict Patient-Wise Isolation
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
    train_idx, test_idx = next(gss.split(X, y, groups=df['SUBJECT_ID']))
    
    X_train, y_train = X.iloc[train_idx], y.iloc[train_idx]
    X_test, y_test = X.iloc[test_idx], y.iloc[test_idx]
    
    # 3. Train Classifier
    # Since we are predicting instability, we can use scale_pos_weight for class imbalance
    # scale_pos_weight = count(negative examples)/count(Positive examples)
    pos_count = y_train.sum()
    neg_count = len(y_train) - pos_count
    spw = neg_count / pos_count if pos_count > 0 else 1.0

    clf = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.05,
        random_state=42,
        scale_pos_weight=spw,
        eval_metric='auc'
    )
    
    clf.fit(X_train, y_train)
    
    # 4. Evaluate AUC
    y_pred_proba = clf.predict_proba(X_test)[:, 1]
    y_pred = clf.predict(X_test)
    
    auc = roc_auc_score(y_test, y_pred_proba)
    
    print("\n[Results: Physical Sensors ONLY]")
    print(f"ROC-AUC Score: {auc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # 5. Generate ROC Curve for Reviewer
    fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, color='crimson', lw=2, label=f'XGBoost (AUC = {auc:.3f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve: Predicting Stability via Physical IoT Sensors (No Labs)')
    plt.legend(loc="lower right")
    plt.grid(alpha=0.3)
    plt.savefig('rebuttal_roc_curve.png', dpi=300)
    print("Saved 'rebuttal_roc_curve.png'")

if __name__ == '__main__':
    run_classifier_validation()
