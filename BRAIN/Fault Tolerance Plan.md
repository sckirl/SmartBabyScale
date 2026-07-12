# ML Fault Tolerance & Data Imputation Plan

CONFIDENCE: EXTRACTED
RELATIONS:
- implements::[[session_calculator.py]]
- validates::[[evaluate_sparsity.py]]
GOD_NODES: [[[SNAPPE-II Scoring Variables and Thresholds]], [[Sensor Fusion and Missing Data (MNAR)]]]

---

## 1. The True Purpose of ML in SmartBabyScale
The primary objective of using Machine Learning in this project is not just to replace a simple calculator, but to act as a **Fault-Tolerant Clinical Inference Engine**. 

In a high-stress NICU/Puskesmas environment:
- IoT sensors can detach, short-circuit, or return noisy data.
- Nurses/midwives will not have the time to immediately input external lab data (like PO2/FiO2 or Serum pH).

A deterministic `if-else` calculator would either crash or return an inaccurate SNAPPE-II score when missing a variable. However, an ML model like XGBoost can learn the *latent correlations* between variables and intelligently **impute** (fill in) the missing data based on the status of the remaining active sensors.

---

## 2. The Strategy: Artificial Noise Injection (Data Dropout)
Currently, our dataset is "too perfect." To force the ML model to patch mistakes and handle unstable variables, we must train it on a *corrupted* dataset that mimics real-world hardware failure.

**Action Plan for the Pipeline:**
1. **Sensor Death Simulation**: Randomly convert 10-20% of IoT sensor readings (SpO2, Heart Rate) to `NaN` or `0` in the training dataset.
2. **External Data Delay Simulation**: Randomly convert 30-40% of external lab variables (SGA, PO2, pH) to `NaN`. 
3. **Train on the Corrupted Data**: When XGBoost trains on this corrupted dataset, it can no longer rely 97% on `SGA` (because `SGA` will often be missing). It is forced to learn how *Heart Rate* and *Temperature* correlate with the final score when the lab data isn't available.

---

## 3. XGBoost's Native Sparsity Awareness
We selected **XGBoost** precisely for this scenario. XGBoost has a native feature called "Sparsity-Aware Split Finding." 
- When a sensor dies and sends `NaN`, XGBoost does not crash. 
- During training, it learns a "default direction" for missing data. If a baby has a missing SpO2 reading but a stable heart rate and temperature, XGBoost will automatically route the decision tree down the "safe" path based on historical correlations.

---

## 4. RandomForest & SVR Median Imputation
Because standard scikit-learn models (RandomForest and SVR) do not natively support `NaN` values, they cannot execute on sparse datasets. To mitigate this:
* **bedside Imputation:** We implement a local median imputation fallback inside `session_calculator.py` using statistical medians extracted from our dataset:
  - `mean_blood_pressure`: `42.0`
  - `po2_fio2_ratio`: `1.8`
  - `lowest_serum_ph`: `7.35`
  - `urine_output_ml_kg_hr`: `2.5`
* **Workflow:** If features are missing, the Session Calculator fills them with these median vectors *only* before calling RandomForest and SVR pipelines, maintaining model compliance while preserving XGBoost's native NaN routing.

---

## 5. Primary Sources
* **XGBoost: A Scalable Tree Boosting System:** Chen & Guestrin (2016). [DOI: 10.1145/2939672.2939785](https://doi.org/10.1145/2939672.2939785)
* **Sparsity-Aware Split Finding:** [XGBoost Design Documentation](https://xgboost.readthedocs.io/en/stable/tutorials/feature_interaction_constraint.html)
* **Scikit-Learn SimpleImputer API:** [Scikit-Learn Documentation](https://scikit-learn.org/stable/modules/generated/sklearn.impute.SimpleImputer.html)
