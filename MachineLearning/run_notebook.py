import os
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Model Preprocessing and Data Splitting
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Classification Models
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier

# Diagnostic and Performance Evaluation Metrics
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    classification_report, confusion_matrix, roc_curve, auc
)

# Set random seed for reproducibility across dataset generation and model splits
np.random.seed(42)
print("System packages successfully imported and random seed established.")

import os
import pandas as pd

# ponytail: Use a simple robust path check to load the data regardless of where the notebook is run.
file_path = 'MachineLearning/neonatal_dataset.csv' if os.path.exists('MachineLearning/neonatal_dataset.csv') else 'neonatal_dataset.csv'
df = pd.read_csv(file_path)

# ponytail: Extensive but minimal prints to confirm dataset health, avoiding heavy profiling libraries.
print(f"Loaded {len(df)} patient records from MIMIC-III.")
print("Class Distribution (0 = Stable, 1 = Unstable):")
print(df.groupby('is_unstable').size())

# Display first few records to verify features

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

# ── Feature columns ────────────────────────────────────────────────
feature_cols = [
    'birth_weight_g', 'gestational_age_weeks', 'sga', 'apgar_score_5min',
    'current_weight_g', 'current_length_cm', 'lowest_temperature_celsius',
    'avg_heart_rate_bpm', 'lowest_spo2_percent',
    'mean_blood_pressure', 'po2_fio2_ratio', 'lowest_serum_ph', 'seizures', 'urine_output_ml_kg_hr'
]

y = df['is_unstable']
X = df[feature_cols]

# ── Data quality audit ─────────────────────────────────────────────
print('=== Null counts per feature column ===')
null_counts = X.isnull().sum()
print(null_counts[null_counts > 0] if null_counts.any() else 'No nulls detected.')
print(f'\nRows with ≥1 null: {X.isnull().any(axis=1).sum()} / {len(X)}')
print('\n=== Descriptive statistics ===')

# ── Train / test split ─────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

# ── Path A: XGBoost (raw, NaN intact) ──────────────────────────────
# XGBoost learns optimal NaN routing from data — imputing here would
# destroy the clinical signal of 'measurement not yet available'.
# X_train / X_test used as-is.

# ── Path B: Median imputation for sklearn models (RF, SVM) ─────────
# ponytail: fit imputer on train only — no data leakage from test set.
imputer = SimpleImputer(strategy='median')
X_train_imp = imputer.fit_transform(X_train)
X_test_imp  = imputer.transform(X_test)

# ── Path C: Scale imputed data for SVM ────────────────────────────
# StandardScaler fitted after imputation so no NaN propagates into mean/std.
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_imp)
X_test_scaled  = scaler.transform(X_test_imp)

print(f'\nTrain shape: {X_train.shape} | Test shape: {X_test.shape}')

import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report, confusion_matrix

# 1. Train XGBoost
print("Training XGBoost...")
xgb_model = xgb.XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, eval_metric='logloss', random_state=42)
xgb_model.fit(X_train, y_train) # Tree models don't strictly need scaled data
xgb_preds = xgb_model.predict(X_test)
xgb_probs = xgb_model.predict_proba(X_test)[:, 1]

# 2. Train Random Forest (Ground Truth Baseline)
print("Training Random Forest...")
# ponytail: Out-of-the-box RF to establish a robust variance-resistant baseline. No grid search needed to prove ground truth.
rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
rf_model.fit(X_train_imp, y_train)
rf_preds = rf_model.predict(X_test_imp)
rf_probs = rf_model.predict_proba(X_test_imp)[:, 1]

# 3. Train SVM
print("Training SVM...")
svm_model = SVC(kernel='rbf', probability=True, random_state=42)
svm_model.fit(X_train_scaled, y_train)
svm_preds = svm_model.predict(X_test_scaled)
svm_probs = svm_model.predict_proba(X_test_scaled)[:, 1]

def print_metrics(y_true, y_pred, y_probs, name):
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred)
    rec = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    auc = roc_auc_score(y_true, y_probs)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    tpr = tp / (tp + fn)
    fpr = fp / (fp + tn)
    print(f"\n--- {name} Evaluation ---")
    print(f"Accuracy: {acc*100:.2f}% | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f} | AUC: {auc:.4f}")
    print(f"TPR (True Positive Rate): {tpr:.4f} | FPR (False Positive Rate): {fpr:.4f}")

print_metrics(y_test, xgb_preds, xgb_probs, 'XGBoost')
print_metrics(y_test, rf_preds, rf_probs, 'Random Forest')
print_metrics(y_test, svm_preds, svm_probs, 'SVM')


import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, roc_curve, auc

fig, axes = plt.subplots(1, 4, figsize=(24, 5), dpi=100)

# Plot 1: XGBoost Confusion Matrix
cm_xgb = confusion_matrix(y_test, xgb_preds)
sns.heatmap(cm_xgb, annot=True, fmt='d', cmap='Blues', ax=axes[0], cbar=False, 
            xticklabels=['Stable', 'Unstable'], yticklabels=['Stable', 'Unstable'])
axes[0].set_title('XGBoost Confusion Matrix', fontweight='bold')
axes[0].set_ylabel('True Label')
axes[0].set_xlabel('Predicted Label')

# Plot 2: Random Forest Confusion Matrix
cm_rf = confusion_matrix(y_test, rf_preds)
sns.heatmap(cm_rf, annot=True, fmt='d', cmap='Greens', ax=axes[1], cbar=False, 
            xticklabels=['Stable', 'Unstable'], yticklabels=['Stable', 'Unstable'])
axes[1].set_title('Random Forest Confusion Matrix', fontweight='bold')
axes[1].set_ylabel('True Label')
axes[1].set_xlabel('Predicted Label')

# Plot 3: SVM Confusion Matrix
cm_svm = confusion_matrix(y_test, svm_preds)
sns.heatmap(cm_svm, annot=True, fmt='d', cmap='Oranges', ax=axes[2], cbar=False,
            xticklabels=['Stable', 'Unstable'], yticklabels=['Stable', 'Unstable'])
axes[2].set_title('SVM Confusion Matrix', fontweight='bold')
axes[2].set_ylabel('True Label')
axes[2].set_xlabel('Predicted Label')

# Plot 4: ROC Curve Comparison
fpr_xgb, tpr_xgb, _ = roc_curve(y_test, xgb_probs)
fpr_rf, tpr_rf, _ = roc_curve(y_test, rf_probs)
fpr_svm, tpr_svm, _ = roc_curve(y_test, svm_probs)
axes[3].plot(fpr_xgb, tpr_xgb, label=f'XGBoost (AUC = {auc(fpr_xgb, tpr_xgb):.4f})', color='blue', lw=2)
axes[3].plot(fpr_rf, tpr_rf, label=f'Random Forest (AUC = {auc(fpr_rf, tpr_rf):.4f})', color='green', lw=2)
axes[3].plot(fpr_svm, tpr_svm, label=f'SVM (AUC = {auc(fpr_svm, tpr_svm):.4f})', color='darkorange', lw=2)
axes[3].plot([0, 1], [0, 1], color='gray', linestyle='--')
axes[3].set_title('ROC Curve Comparison', fontweight='bold')
axes[3].legend(loc="lower right")

plt.tight_layout()
plt.show()

import joblib
import os

os.makedirs('MachineLearning/models', exist_ok=True)
joblib.dump(scaler, 'MachineLearning/models/input_scaler.joblib')
joblib.dump(xgb_model, 'MachineLearning/models/xgboost_risk_model.joblib')
joblib.dump(rf_model, 'MachineLearning/models/rf_risk_model.joblib')
joblib.dump(svm_model, 'MachineLearning/models/svm_risk_model.joblib')
joblib.dump(feature_cols, 'MachineLearning/models/feature_columns.joblib')
print("Exported input_scaler, xgboost, random_forest, svm, and feature_columns to /models/")