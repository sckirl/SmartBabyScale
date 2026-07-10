# ML Fault Tolerance & Data Imputation Plan

## 1. The True Purpose of ML in SmartBabyScale
The primary objective of using Machine Learning in this project is not just to replace a simple calculator, but to act as a **Fault-Tolerant Clinical Inference Engine**. 

In a high-stress NICU environment:
- IoT sensors can detach, short-circuit, or return noisy data.
- Nurses may not have the time to immediately input external lab data (like PO2/FiO2 or Serum pH).

A deterministic `if-else` calculator would either crash or return a lethally inaccurate SNAPPE-II score when missing a variable. However, an ML model like XGBoost can learn the *latent correlations* between variables and intelligently **impute** (fill in) the missing data based on the status of the remaining active sensors.

## 2. The Strategy: Artificial Noise Injection (Data Dropout)
Currently, our dataset is "too perfect." To force the ML model to patch mistakes and handle unstable variables, we must train it on a *corrupted* dataset that mimics real-world hardware failure.

**Action Plan for the Pipeline:**
1. **Sensor Death Simulation**: Randomly convert 10-20% of IoT sensor readings (SpO2, Heart Rate) to `NaN` or `0` in the training dataset.
2. **External Data Delay Simulation**: Randomly convert 30-40% of external lab variables (SGA, PO2, pH) to `NaN`. 
3. **Train on the Corrupted Data**: When XGBoost trains on this corrupted dataset, it can no longer rely 97% on `SGA` (because `SGA` will often be missing). It is forced to learn how *Heart Rate* and *Temperature* correlate with the final score when the lab data isn't available.

## 3. XGBoost's Native Sparsity Awareness
We selected **XGBoost** precisely for this scenario. XGBoost has a native feature called "Sparsity-Aware Split Finding." 
- When a sensor dies and sends `NaN`, XGBoost doesn't crash. 
- During training, it learns a "default direction" for missing data. If a baby has a missing SpO2 reading but a stable heart rate and temperature, XGBoost will automatically route the decision tree down the "safe" path based on historical correlations.

## 4. Implementation Steps (Next Phase)
1. **Modify `SmartBabyScale_Training.ipynb`**: Introduce a Data Augmentation block that deliberately corrupts the `X_train` dataset with `NaN` values before training.
2. **Adjust `simulation.py`**: Add a "Sensor Failure" mode (e.g., dropping the SpO2 feed) to prove that the ML model can maintain an accurate risk prediction even when the hardware breaks mid-session. 
3. **Dashboard UI Alert**: Update `Dashboard.tsx` to display a "Sensor Degraded - AI Imputing Data" warning badge when it detects missing values, giving the nurses confidence that the system hasn't failed.
