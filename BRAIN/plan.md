# ML Refactor Plan (Regression)

## 1. Approach Overview
- **Data Preparation**: A Python script using `pandas` will read `neonatal_dataset.csv`, calculate the exact `snappe_ii_score` based on the [[SNAPPE-II Scoring]] table, and drop the `is_unstable` column. This turns our target into a clean, continuous 0-162 variable.
- **Feature Engineering**: Features remain the original 14. We will apply `StandardScaler` *only* to the SVR model, as tree-based models (XGBoost/RF) are scale-invariant.
- **Evaluation Metrics**: 
  - **RMSE (Root Mean Squared Error)**: Penalizes large deviations heavily, crucial for medical diagnostics where a large miss is fatal.
  - **MAE (Mean Absolute Error)**: Shows the average point deviation in an interpretable way (e.g., "The model is off by +/- 4 points on average").
  - **R²**: Variance explained.

## 2. Model Defense
We are avoiding Deep Learning (Neural Networks) and using the following models instead:
1. **XGBRegressor (Primary)**: Tree-based gradient boosting is mathematically superior for heterogeneous tabular data. It natively handles missing data (e.g., missing Apgar scores) without crashing, and most critically, it provides instantaneous **Feature Importance** (explainable AI), allowing nurses to see *why* a baby has a high score.
2. **RandomForestRegressor (Baseline Ground Truth)**: An ensemble method using bagging rather than boosting. Boosting can sometimes over-optimize and chase noise. RF provides a stable, generalized baseline. If XGBoost diverges heavily from RF, we know we are overfitting.
3. **SVR (Comparison)**: Support Vector Regression uses a Radial Basis Function (RBF) kernel to map complex non-linear boundaries via distance. It serves as our non-tree mathematical baseline.

## 3. Academic Source / Rationale
The decision to use Tree-based models (XGBoost/RF) over Deep Learning for our 7,880-row medical tabular dataset is strongly supported by recent AI literature. 

**Source:**
> Grinsztajn, L., Oyallon, E., & Varoquaux, G. (2022). *Why do tree-based models still outperform deep learning on typical tabular data?* Advances in Neural Information Processing Systems (NeurIPS 2022).

**Key Findings:**
Tree models remain state-of-the-art for medium-sized tabular datasets because neural networks are highly sensitive to uninformative features/noise and struggle to learn the non-smooth, irregular target functions common in clinical tabular data. XGBoost is natively robust to these issues.
