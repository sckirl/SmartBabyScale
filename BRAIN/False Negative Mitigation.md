# False Negative Mitigation Strategy

## 1. The Core Problem: The "0" Cluster (Deadly False Negatives)
When we introduced data dropout (missing data), we forced the XGBoost model to guess the severity when sensors fail. However, because the dataset is heavily skewed towards healthy babies (the majority of babies have a SNAPPE-II score of 0), XGBoost's mathematical default behavior when it encounters missing data is to predict the statistical majority: `0`.

In a NICU setting, this is **catastrophic**. 
If a baby is crashing (Actual = 80) but a sensor disconnects, the model defaulting to `0` (Predicted = 0) is a severe **False Negative**. The system is telling the nurse the baby is perfectly healthy simply because the machine lacks data.

## 2. The Solution: Asymmetric Loss Function
Standard Machine Learning uses symmetric loss functions (like MSE). In MSE, guessing 20 points too high is punished exactly the same as guessing 20 points too low.

To fix this, we must build a custom **Asymmetric Objective Function** for XGBoost:
- **False Positives (Overestimating Severity):** If the model predicts a score of 40 but the baby is actually 0, this is annoying (false alarm), but safe. We apply a standard penalty (`x1`).
- **False Negatives (Underestimating Severity):** If the model predicts a score of 0 but the baby is actually 80, a life is in danger. We apply a massive multiplier penalty (`x5` or `x10`) to the gradient.

By implementing this, when the model is uncertain (due to missing sensor data), it will be mathematically terrified of guessing `0`. It will automatically bias its predictions higher to ensure it doesn't miss a critical patient.

## 3. Alternative: Worst-Case Imputation
Instead of letting XGBoost route missing `NaN` values to the average healthy majority, we can explicitly impute missing sensor data with "Worst-Case" physiological values. If the SpO2 sensor drops, we feed the model an SpO2 of 85% (Hypoxia). This forces the AI to assume the worst until the sensor is reattached, inherently eliminating false negatives caused by hardware failure.

## 4. Architectural Defense: Sample Weighting vs. SMOGN
When addressing extreme class imbalance to prevent false negatives, it is common to ask why we used **Sample Weighting** instead of **SMOGN** (Synthetic Minority Over-sampling Technique for Regression). 

We explicitly rejected SMOGN in favor of Asymmetric Sample Weighting for three critical engineering reasons:
1. **Preserving Biological Integrity:** SMOGN interpolates between minority data points to generate *synthetic, fake* rows of data. In a highly sensitive medical telemetry dataset, generating "synthetic" patient vitals can accidentally create biological profiles that cannot physically exist in the real world. Sample Weighting preserves 100% of the true biological data.
2. **Computational Efficiency for Edge AI:** SMOGN requires a heavy preprocessing pipeline to calculate distances and generate synthetic points, which adds complexity and slows down the training/inference pipeline. Sample Weighting is computed natively inside XGBoost’s gradient calculations—requiring zero extra memory overhead.
3. **Native XGBoost Synergy:** By setting the sample weight dynamically to `True Score + 1`, a baby with a score of 80 organically exerts 81x more gravitational pull on the decision tree splits than a healthy baby (score 0). This manipulates the gradient penalty directly, achieving exact fail-safe protection without injecting hallucinated patient data.
