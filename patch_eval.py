import json

notebook_path = r"C:\CodeProjects\SmartBabyScale\MachineLearning\SmartBabyScale_Training.ipynb"

with open(notebook_path, "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code' and any('print("\\n--- XGBoost Evaluation ---")\n' in line for line in cell['source']):
        new_source = []
        for line in cell['source']:
            if "from sklearn.metrics import accuracy_score" in line:
                new_source.append("from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report, confusion_matrix\n")
            elif 'print("\\n--- XGBoost Evaluation ---")\n' in line:
                # Add the function and calls
                new_source.extend([
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
                ])
                break # We skip the rest of the old prints
            else:
                new_source.append(line)
        cell['source'] = new_source
        break

with open(notebook_path, "w", encoding="utf-8") as f:
    json.dump(nb, f, indent=1)

print("Notebook patched successfully.")
