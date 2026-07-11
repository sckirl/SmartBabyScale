# IEEE Reviewer Audit & Critical Flaws

This document tracks the critical findings from the 15-18 file BRAIN knowledge graph synthesis performed to anticipate hostile IEEE senior reviewer feedback.

## Section A — Top 5 Methodology Gaps
1. **No nested CV**: $R^2$ estimates are optimistically biased without nested cross-validation (Varma & Simon 2006).
2. **No calibration analysis**: $R^2 = 0.835$ is clinically uninterpretable without Bland-Altman + predicted-vs-observed plots (Van Calster 2019, TRIPOD+AI 2024 non-compliance).
3. **MNAR uncharacterized**: XGBoost's native missing-value handling assumes MAR (Missing at Random). Gestational age in NICU data is likely MNAR (Little & Rubin 2002).
4. **No statistical model comparison**: Claiming "XGBoost wins" is unsupported without corrected statistical tests (Dietterich 1998, Wilcoxon signed-rank).
5. **Distribution shift unquantified**: The MIMIC-III trained model does not directly equal the IoT-deployed model because the feature space shrinks from 100+ variables down to ~5-10 surface variables at deployment.

## Section B — IEEE Hostile Reviewer Questions
Identified 8 to 9 hostile questions addressing current project state and documented weaknesses. These require robust defense strategies and explicit documentation on exactly what is missing from our current evaluation pipeline.

## Section C — Unresolved Engineering Constraints
There are 7 must-resolve engineering constraints, with 3 rated **Critical**:
- **Linux Jitter Risk**: Non-real-time OS jitter on Raspberry Pi can disrupt strict timing requirements for sensor protocols (e.g., ultrasonic timing).
- **HC-SR04 GPIO Damage Risk**: Feeding a 5V ECHO signal from the HC-SR04 directly into a 3.3V Pi GPIO pin risks permanent hardware damage. (See [[Sensor Infrastructure]]).
- **Manual FiO2 Staleness**: Lab values like FiO2 entered manually become rapidly stale, leading to outdated predictions.

### Mandatory Analyses to Implement
- Leakage ablation experiment
- Nested GroupKFold implementation
- Full calibration suite execution
- Missingness mechanism analysis (Little's MCAR test)
- Fenton growth curve as baseline comparator
- Feature-intersection IoT model evaluation
- Interventional vs. observational SHAP comparison

## Critical Flag: Sample Weight Inversion
Our current severity weighting (`sample_weight = Y + 1.0`) is potentially **inverted** relative to clinical need! By mathematically setting the weight this way, we might be upweighting heavy (term) healthy infants rather than high-risk VLBW (Very Low Birth Weight) infants, which directly contradicts the clinical cost asymmetry defined in [[False Negative Mitigation]]. An immediate ablation study is required to verify the directional impact of the weights.
