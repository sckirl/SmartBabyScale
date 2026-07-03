"""
ponytail: Patch the notebook with tuned hyperparameters from tune_models.py results.
Reads best_params.json and rewrites the training cell.
"""
import json

notebook_path = "MachineLearning/SmartBabyScale_Training.ipynb"
params_path = "MachineLearning/best_params.json"

with open(params_path, 'r') as f:
    best = json.load(f)

with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Find the training cell (Step 4) and replace it
for cell in nb['cells']:
    if cell['cell_type'] == 'code' and any('# 1. Train XGBoost' in line for line in cell['source']):
        xp = best['xgboost']
        rp = best['random_forest']
        sp = best['svm']
        
        cell['source'] = [
            "import xgboost as xgb\n",
            "from sklearn.ensemble import RandomForestClassifier\n",
            "from sklearn.svm import SVC\n",
            "from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report, confusion_matrix\n",
            "\n",
            "# 1. Train XGBoost (tuned via RandomizedSearchCV, 80 candidates x 5-fold CV)\n",
            "print(\"Training XGBoost...\")\n",
            f"xgb_model = xgb.XGBClassifier(\n",
            f"    n_estimators={xp['n_estimators']}, max_depth={xp['max_depth']}, learning_rate={xp['learning_rate']},\n",
            f"    subsample={xp['subsample']}, colsample_bytree={xp['colsample_bytree']},\n",
            f"    min_child_weight={xp['min_child_weight']}, reg_alpha={xp['reg_alpha']}, reg_lambda={xp['reg_lambda']},\n",
            f"    eval_metric='logloss', random_state=42\n",
            ")\n",
            "xgb_model.fit(X_train, y_train)\n",
            "xgb_preds = xgb_model.predict(X_test)\n",
            "xgb_probs = xgb_model.predict_proba(X_test)[:, 1]\n",
            "\n",
            "# 2. Train Random Forest (tuned via RandomizedSearchCV, 60 candidates x 5-fold CV)\n",
            "print(\"Training Random Forest...\")\n",
            f"rf_model = RandomForestClassifier(\n",
            f"    n_estimators={rp['n_estimators']}, max_depth={rp['max_depth']},\n",
            f"    min_samples_split={rp['min_samples_split']}, min_samples_leaf={rp['min_samples_leaf']},\n",
            f"    max_features='{rp['max_features']}', random_state=42\n",
            ")\n",
            "rf_model.fit(X_train_imp, y_train)\n",
            "rf_preds = rf_model.predict(X_test_imp)\n",
            "rf_probs = rf_model.predict_proba(X_test_imp)[:, 1]\n",
            "\n",
            "# 3. Train SVM (tuned via GridSearchCV, 20 candidates x 5-fold CV)\n",
            "print(\"Training SVM...\")\n",
            f"svm_model = SVC(kernel='{sp['kernel']}', C={sp['C']}, gamma={sp['gamma']}, probability=True, random_state=42)\n",
            "svm_model.fit(X_train_scaled, y_train)\n",
            "svm_preds = svm_model.predict(X_test_scaled)\n",
            "svm_probs = svm_model.predict_proba(X_test_scaled)[:, 1]\n",
            "\n",
            "def print_metrics(y_true, y_pred, y_probs, name):\n",
            "    acc = accuracy_score(y_true, y_pred)\n",
            "    prec = precision_score(y_true, y_pred)\n",
            "    rec = recall_score(y_true, y_pred)\n",
            "    f1 = f1_score(y_true, y_pred)\n",
            "    auc = roc_auc_score(y_true, y_probs)\n",
            "    tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()\n",
            "    tpr = tp / (tp + fn)\n",
            "    fpr = fp / (fp + tn)\n",
            "    print(f\"\\n--- {name} Evaluation ---\")\n",
            "    print(f\"Accuracy: {acc*100:.2f}% | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f} | AUC: {auc:.4f}\")\n",
            "    print(f\"TPR (True Positive Rate): {tpr:.4f} | FPR (False Positive Rate): {fpr:.4f}\")\n",
            "\n",
            "print_metrics(y_test, xgb_preds, xgb_probs, 'XGBoost')\n",
            "print_metrics(y_test, rf_preds, rf_probs, 'Random Forest')\n",
            "print_metrics(y_test, svm_preds, svm_probs, 'SVM')\n"
        ]
        break

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("Notebook patched with tuned hyperparameters.")
