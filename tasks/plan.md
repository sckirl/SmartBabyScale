# Plan: Machine Learning Training Optimization and Validation Rigor Audit

This plan outlines the steps to audit, optimize, and document the machine learning training pipeline, ensuring strict patient-wise isolation and resolving data leakage.

## 1. Components and Dependencies

The ML pipeline consists of:
1. **SQL Extraction (`MachineLearning/extract_from_gcs.sql`):** Aggregates vitals/demographics over the first 2 hours of ICU stay, and derives instability target labels strictly from hours > 2.
2. **Training Notebook (`MachineLearning/SmartBabyScale_Training.ipynb`):** Preprocesses dataset, runs patient-isolated splits, fits regressors and classifiers, and serializes baseline joblib files.
3. **Validation Scripts (`retrain_and_test.py` & `classifier_validation.py`):** Standalone scripts to verify regression sparsity stress tests and classifier ROC-AUC metrics.

## 2. Implementation & Auditing Order

1. **Audit SQL Target Generation:**
   - Verify that the target outcome (`is_unstable`) does not use features from the first 2 hours of stay (preventing temporal data leakage).
   - Done: verified that features use `BETWEEN INTIME AND INTIME + 2 HOURS`, while outcomes use `CHARTTIME > INTIME + 2 HOURS`.
2. **Audit Validation Splitting Strategy:**
   - Verify that both continuous regression and binary classification pipelines use `GroupShuffleSplit` on `SUBJECT_ID` to prevent patient-wise leakage.
   - Verify that RandomForest and SVR models fit on data indexed by `GroupShuffleSplit` train/test splits.
3. **Execute Retraining and Verification:**
   - Execute the retraining script (`retrain_and_test.py`) to verify RMSE and R² baseline performance.
   - Execute the validation script (`classifier_validation.py`) to verify classifier ROC-AUC (expected ~0.90) and save the ROC curve.
   - Execute the Jupyter training notebook (`SmartBabyScale_Training.ipynb`) using `nbconvert` to refresh metrics and update serialized baseline model binaries.
4. **Document Model Filenames:**
   - Add a markdown cell and code comments in `SmartBabyScale_Training.ipynb` explaining the model filename mapping:
     - `xgboost_risk_model.joblib`, `rf_risk_model.joblib`, `svm_risk_model.joblib`: Production models loaded by edge session calculator.
     - `xgboost_model.joblib`, `randomforest_model.joblib`, `svr_model.joblib`: Research baseline models generated during notebook comparison.
     - `xgboost_classifier_model.joblib`: Physical sensor-only binary triage classifier.

## 3. Risks & Mitigations

* **Risk:** Execution of the Jupyter notebook fails due to missing GCS connections or missing Python libraries.
  * *Mitigation:* The dataset `neonatal_dataset.csv` is already present locally in `MachineLearning/`. We will run the notebook using local data and ensure all libraries are installed in `.venv`.

## 4. Verification Checkpoints

1. **Checkpoint 1 (Script Executions):** `retrain_and_test.py` and `classifier_validation.py` execute successfully and print expected metrics.
2. **Checkpoint 2 (Notebook Compile):** The training notebook executes end-to-end without errors.
3. **Checkpoint 3 (Documentation):** Model filename mapping is clearly explained in the notebook.
