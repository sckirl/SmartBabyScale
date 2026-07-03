"""
ponytail: Hyperparameter tuning script for SmartBabyScale ML models.
Explores XGBoost, RF, SVM parameter spaces using cross-validated grid search.
Outputs best params and metrics, then updates the notebook.
"""
import os, sys, json, warnings
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score, confusion_matrix, make_scorer)
import xgboost as xgb
warnings.filterwarnings('ignore')

# ── Load data ──
file_path = 'MachineLearning/neonatal_dataset.csv' if os.path.exists('MachineLearning/neonatal_dataset.csv') else 'neonatal_dataset.csv'
df = pd.read_csv(file_path)

feature_cols = [
    'birth_weight_g', 'gestational_age_weeks', 'sga', 'apgar_score_5min',
    'current_weight_g', 'current_length_cm', 'lowest_temperature_celsius',
    'avg_heart_rate_bpm', 'lowest_spo2_percent',
    'mean_blood_pressure', 'po2_fio2_ratio', 'lowest_serum_ph', 'seizures', 'urine_output_ml_kg_hr'
]

y = df['is_unstable']
X = df[feature_cols]

print(f"Dataset: {len(df)} records, {len(feature_cols)} features")
print(f"Class balance: {y.value_counts().to_dict()}")
print(f"Unstable ratio: {y.mean():.3f}")

# ── Split ──
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

# ── Impute for RF/SVM ──
imputer = SimpleImputer(strategy='median')
X_train_imp = imputer.fit_transform(X_train)
X_test_imp = imputer.transform(X_test)

# ── Scale for SVM ──
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_imp)
X_test_scaled = scaler.transform(X_test_imp)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

def eval_model(name, y_true, y_pred, y_probs):
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred)
    rec = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    auc_val = roc_auc_score(y_true, y_probs)
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    tpr = tp / (tp + fn)
    fpr = fp / (fp + tn)
    print(f"\n--- {name} ---")
    print(f"Accuracy: {acc*100:.2f}% | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f} | AUC: {auc_val:.4f}")
    print(f"TPR: {tpr:.4f} | FPR: {fpr:.4f}")
    return {'accuracy': acc, 'f1': f1, 'auc': auc_val, 'precision': prec, 'recall': rec}

# ═══════════════════════════════════════════
# PHASE 1: BASELINE (current settings)
# ═══════════════════════════════════════════
print("\n" + "="*60)
print("PHASE 1: BASELINE (current hyperparameters)")
print("="*60)

xgb_base = xgb.XGBClassifier(n_estimators=100, max_depth=4, learning_rate=0.1, eval_metric='logloss', random_state=42)
xgb_base.fit(X_train, y_train)
eval_model("XGBoost (baseline)", y_test, xgb_base.predict(X_test), xgb_base.predict_proba(X_test)[:,1])

rf_base = RandomForestClassifier(n_estimators=100, random_state=42)
rf_base.fit(X_train_imp, y_train)
eval_model("RF (baseline)", y_test, rf_base.predict(X_test_imp), rf_base.predict_proba(X_test_imp)[:,1])

svm_base = SVC(kernel='rbf', probability=True, random_state=42)
svm_base.fit(X_train_scaled, y_train)
eval_model("SVM (baseline)", y_test, svm_base.predict(X_test_scaled), svm_base.predict_proba(X_test_scaled)[:,1])

# ═══════════════════════════════════════════
# PHASE 2: XGBOOST TUNING
# ═══════════════════════════════════════════
print("\n" + "="*60)
print("PHASE 2: XGBoost Hyperparameter Search")
print("="*60)

xgb_param_grid = {
    'n_estimators': [200, 300, 500],
    'max_depth': [3, 4, 5, 6],
    'learning_rate': [0.01, 0.05, 0.1],
    'subsample': [0.8, 1.0],
    'colsample_bytree': [0.8, 1.0],
    'min_child_weight': [1, 3, 5],
    'reg_alpha': [0, 0.1],
    'reg_lambda': [1, 2],
}

# ponytail: Use RandomizedSearchCV instead of full grid to keep runtime sane
from sklearn.model_selection import RandomizedSearchCV

xgb_search = RandomizedSearchCV(
    xgb.XGBClassifier(eval_metric='logloss', random_state=42),
    xgb_param_grid,
    n_iter=80,
    scoring='roc_auc',
    cv=cv,
    random_state=42,
    n_jobs=-1,
    verbose=1
)
xgb_search.fit(X_train, y_train)

print(f"\nBest XGBoost params: {xgb_search.best_params_}")
print(f"Best CV AUC: {xgb_search.best_score_:.4f}")
xgb_best = xgb_search.best_estimator_
xgb_results = eval_model("XGBoost (tuned)", y_test, xgb_best.predict(X_test), xgb_best.predict_proba(X_test)[:,1])

# Cross-validate to check for overfitting
xgb_cv_scores = cross_val_score(xgb_best, X_train, y_train, cv=cv, scoring='roc_auc')
print(f"XGBoost 5-fold CV AUC: {xgb_cv_scores.mean():.4f} +/- {xgb_cv_scores.std():.4f}")

# ═══════════════════════════════════════════
# PHASE 3: RANDOM FOREST TUNING
# ═══════════════════════════════════════════
print("\n" + "="*60)
print("PHASE 3: Random Forest Hyperparameter Search")
print("="*60)

rf_param_grid = {
    'n_estimators': [200, 300, 500],
    'max_depth': [None, 10, 15, 20],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'max_features': ['sqrt', 'log2', None],
}

rf_search = RandomizedSearchCV(
    RandomForestClassifier(random_state=42),
    rf_param_grid,
    n_iter=60,
    scoring='roc_auc',
    cv=cv,
    random_state=42,
    n_jobs=-1,
    verbose=1
)
rf_search.fit(X_train_imp, y_train)

print(f"\nBest RF params: {rf_search.best_params_}")
print(f"Best CV AUC: {rf_search.best_score_:.4f}")
rf_best = rf_search.best_estimator_
rf_results = eval_model("RF (tuned)", y_test, rf_best.predict(X_test_imp), rf_best.predict_proba(X_test_imp)[:,1])

rf_cv_scores = cross_val_score(rf_best, X_train_imp, y_train, cv=cv, scoring='roc_auc')
print(f"RF 5-fold CV AUC: {rf_cv_scores.mean():.4f} +/- {rf_cv_scores.std():.4f}")

# ═══════════════════════════════════════════
# PHASE 4: SVM TUNING
# ═══════════════════════════════════════════
print("\n" + "="*60)
print("PHASE 4: SVM Hyperparameter Search")
print("="*60)

svm_param_grid = {
    'C': [0.1, 1, 5, 10, 50],
    'gamma': ['scale', 'auto', 0.01, 0.001],
    'kernel': ['rbf'],
}

svm_search = GridSearchCV(
    SVC(probability=True, random_state=42),
    svm_param_grid,
    scoring='roc_auc',
    cv=cv,
    n_jobs=-1,
    verbose=1
)
svm_search.fit(X_train_scaled, y_train)

print(f"\nBest SVM params: {svm_search.best_params_}")
print(f"Best CV AUC: {svm_search.best_score_:.4f}")
svm_best = svm_search.best_estimator_
svm_results = eval_model("SVM (tuned)", y_test, svm_best.predict(X_test_scaled), svm_best.predict_proba(X_test_scaled)[:,1])

svm_cv_scores = cross_val_score(svm_best, X_train_scaled, y_train, cv=cv, scoring='roc_auc')
print(f"SVM 5-fold CV AUC: {svm_cv_scores.mean():.4f} +/- {svm_cv_scores.std():.4f}")

# ═══════════════════════════════════════════
# PHASE 5: OVERFIT CHECK
# ═══════════════════════════════════════════
print("\n" + "="*60)
print("PHASE 5: OVERFITTING CHECK (train vs test AUC)")
print("="*60)

for name, model, X_tr, X_te in [
    ('XGBoost', xgb_best, X_train, X_test),
    ('RF', rf_best, X_train_imp, X_test_imp),
    ('SVM', svm_best, X_train_scaled, X_test_scaled)
]:
    train_auc = roc_auc_score(y_train, model.predict_proba(X_tr)[:,1])
    test_auc = roc_auc_score(y_test, model.predict_proba(X_te)[:,1])
    gap = train_auc - test_auc
    status = "OK" if gap < 0.05 else "WARNING: possible overfit" if gap < 0.10 else "OVERFIT"
    print(f"{name:12s} | Train AUC: {train_auc:.4f} | Test AUC: {test_auc:.4f} | Gap: {gap:.4f} | {status}")

# ═══════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════
print("\n" + "="*60)
print("FINAL SUMMARY")
print("="*60)
print(f"\nBest XGBoost params: {xgb_search.best_params_}")
print(f"Best RF params:      {rf_search.best_params_}")
print(f"Best SVM params:     {svm_search.best_params_}")

# Save best params to JSON for notebook patching
best_config = {
    'xgboost': xgb_search.best_params_,
    'random_forest': rf_search.best_params_,
    'svm': svm_search.best_params_,
}
with open('MachineLearning/best_params.json', 'w') as f:
    json.dump(best_config, f, indent=2, default=str)
print("\nSaved best_params.json")
