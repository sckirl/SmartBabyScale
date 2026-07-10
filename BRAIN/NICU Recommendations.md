# NICU Clinical Recommendations
Mapped to standard NICU procedures. Displayed by the [[Architecture]] Frontend node when specific physical states are triggered based on the [[SNAPPE-II Scoring]] inputs.

- **Hypotension (MBP < 30 mmHg)**: Evaluate for hypotensive shock; consider volume resuscitation or inotropes (e.g., dopamine).
- **Hypothermia (Temp ≤ 35.6 °C)**: High risk for cold stress/sepsis; initiate immediate rewarming protocols via radiant warmer or isolette.
- **Respiratory Distress (PO2/FiO2 ≤ 2.49)**: Assess for RDS or pneumonia; adjust FiO2, consider CPAP, mechanical ventilation, or surfactant administration.
- **Acidemia (pH < 7.20)**: Evaluate ventilation and perfusion; consider bicarbonate for severe metabolic acidosis.
- **Oliguria (Urine Output < 1.0 mL/kg/h)**: Evaluate for AKI or dehydration; strict fluid balance monitoring, consider fluid bolus.
- **Seizures**: Urgent neurological workup (cranial ultrasound, EEG); prepare anticonvulsants (e.g., phenobarbital).
- **Low Birth Weight (< 1000g) & SGA**: Strict thermoregulation, early TPN/enteral feeding, monitor closely for hypoglycemia.
- **Depressed Apgar (< 7)**: Continuous cardio-respiratory monitoring; assess need for ongoing respiratory support and neurologic monitoring.

**Confidence**: EXTRACTED
**Why**: Gives actionable, non-black-box diagnostic recommendations based directly on edge physical data.
