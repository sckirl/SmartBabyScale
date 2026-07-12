# Todo: Machine Learning Training Optimization and Validation Rigor Audit

- [x] Task 1: Audit SQL Target Generation Query
  - Acceptance: Confirm that `extract_from_gcs.sql` isolates outcome labels temporally to target events occurring *after* the initial 2-hour intake period, preventing temporal leakage.
  - Verify: Look for `CAST(charttime AS DATETIME) > DATETIME_ADD(intime, INTERVAL 2 HOUR)` checks.
  - Files: `MachineLearning/extract_from_gcs.sql`

- [x] Task 2: Audit and Enforce GroupShuffleSplit on SUBJECT_ID Across All Regressors & Classifiers
  - Acceptance: Verify that regressors (XGBoost, Random Forest, SVR) and the binary classifier strictly use `GroupShuffleSplit` on `SUBJECT_ID` for patient-wise split.
  - Verify: Inspect splits in `SmartBabyScale_Training.ipynb` and `classifier_validation.py`.
  - Files: `MachineLearning/SmartBabyScale_Training.ipynb`, `MachineLearning/classifier_validation.py`

- [x] Task 3: Execute Retraining and Validation Scripts
  - Acceptance: Run `retrain_and_test.py` and `classifier_validation.py` to ensure training and metrics output are complete and correct.
  - Verify: Check printed logs and `rebuttal_roc_curve.png` generation.
  - Files: `MachineLearning/retrain_and_test.py`, `MachineLearning/classifier_validation.py`

- [x] Task 4: Run Training Notebook and Update Binaries
  - Acceptance: Run the Jupyter notebook end-to-end to refresh and update baseline joblib model files.
  - Verify: Confirm that `jupyter nbconvert` completes execution successfully.
  - Files: `MachineLearning/SmartBabyScale_Training.ipynb`

- [x] Task 5: Document Filename Mapping inside Jupyter Notebook
  - Acceptance: Add clear markdown explaining the differences between `xgboost_risk_model.joblib`/`rf_risk_model.joblib`/`svm_risk_model.joblib` and `xgboost_model.joblib`/`randomforest_model.joblib`/`svr_model.joblib`/`xgboost_classifier_model.joblib`.
  - Verify: Check that the notebook is saved and has the explanation cell.
  - Files: `MachineLearning/SmartBabyScale_Training.ipynb`
