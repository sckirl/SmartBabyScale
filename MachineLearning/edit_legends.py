import json

notebook_path = 'MachineLearning/SmartBabyScale_Training.ipynb'
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] == 'code' and any('ROC Curve Comparison' in line for line in cell['source']):
        new_source = []
        for line in cell['source']:
            if 'XGBoost (AUC' in line:
                new_source.append("axes[3].plot(fpr_xgb, tpr_xgb, label=f'XGBoost       - Class 0 (AUC = {auc(fpr_xgb, tpr_xgb):.2f})', color='blue', lw=2)\n")
            elif 'Random Forest (AUC' in line:
                new_source.append("axes[3].plot(fpr_rf, tpr_rf, label=f'Random Forest - Class 1 (AUC = {auc(fpr_rf, tpr_rf):.2f})', color='green', lw=2)\n")
            elif 'SVM (AUC' in line:
                new_source.append("axes[3].plot(fpr_svm, tpr_svm, label=f'SVM           - Class 2 (AUC = {auc(fpr_svm, tpr_svm):.2f})', color='darkorange', lw=2)\n")
            elif 'linestyle=\'--\'' in line:
                new_source.append("axes[3].plot([0, 1], [0, 1], color='gray', linestyle='--', label='Random Guess')\n")
            elif 'axes[3].legend' in line:
                new_source.append("axes[3].legend(loc=\"lower right\", prop={'family': 'monospace'})\n")
            else:
                new_source.append(line)
        cell['source'] = new_source

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print('Done!')
