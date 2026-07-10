# The Pivot (Classification -> Regression)

We are pivoting the machine learning architecture.

- **Previous State**: Binary classification (`is_unstable` boolean).
- **New State**: Regression predicting exact [[SNAPPE-II Scoring]] (0-162 points).

## Required Changes
1. **Data**: Calculate exact SNAPPE-II score for `neonatal_dataset.csv`. DROP the `is_unstable` column completely. (Confidence: EXTRACTED)
2. **ML Models**: Evaluate `XGBRegressor` (Primary), `SVR` (Comparison), `RandomForestRegressor` (Ground Truth) in a new script. Evaluate using RMSE, MAE, R². Do not auto-select, just report metrics. (Confidence: EXTRACTED)
3. **UI Display**: Show points `0-162`. 
   - < 40 = Green
   - 40 - 80 = Neutral (Default)
   - \> 80 = Red
   - Show mapped [[NICU Recommendations]]. (Confidence: EXTRACTED)

**Why**: To align the AI prediction perfectly with traditional heuristic NICU scoring rather than a black-box percentage. (Confidence: INFERRED)
