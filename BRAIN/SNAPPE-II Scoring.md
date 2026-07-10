# SNAPPE-II Scoring Table (Primary Source)
Reference: Richardson DK, Corcoran JD, Escobar GJ, Tracy SK. SNAP-II and SNAPPE-II: Simplified newborn illness severity and mortality risk scores. J Pediatr. 2001;138(1):92-100.

This logic is used by the [[Architecture]] ML pipeline to calculate the target variable (0-162) and is part of [[The Pivot]].

| Parameter | Range | Points |
| :--- | :--- | :--- |
| **Mean Blood Pressure** | ≥ 30 mmHg | 0 |
| | 20–29 mmHg | 9 |
| | < 20 mmHg | 19 |
| **Lowest Temperature** | > 35.6 °C | 0 |
| | 35 – 35.6 °C | 8 |
| | < 35 °C | 15 |
| **PO2/FiO2 Ratio** | > 2.49 | 0 |
| | 1.0 – 2.49 | 5 |
| | 0.3 – 0.99 | 16 |
| | < 0.3 | 28 |
| **Lowest Serum pH** | ≥ 7.20 | 0 |
| | 7.10 – 7.19 | 7 |
| | < 7.10 | 16 |
| **Urine Output** | ≥ 1.0 mL/kg/h | 0 |
| | 0.1 – 0.9 mL/kg/h| 5 |
| | < 0.1 mL/kg/h | 18 |
| **Multiple Seizures** | No | 0 |
| | Yes | 19 |
| **Birth Weight** | ≥ 1000g | 0 |
| | 750 – 999g | 10 |
| | < 750g | 17 |
| **Small for Gestational Age (SGA)** | No (>3rd percentile) | 0 |
| | Yes (<3rd percentile) | 12 |
| **Apgar Score (5 min)** | ≥ 7 | 0 |
| | < 7 | 18 |

**Total Maximum Score**: 162
**Confidence**: EXTRACTED
**Why**: Ensures perfectly accurate, domain-standard ML training data, dropping black-box targets.
