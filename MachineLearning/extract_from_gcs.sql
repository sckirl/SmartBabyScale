-- MIMIC-III Clinical Database (physionet-data.mimiciii_clinical) Extraction Query
-- Generates a neonatal training dataset for SmartBabyScale models (SVM / MLP)
-- Inputs: Vitals & demographics aggregated over the FIRST 2 HOURS of ICU stay (simulates scale session)
-- Target Label: is_unstable (1 = Future vital anomalies, sepsis, ventilation, or mortality; 0 = Stable / Immunizable)
-- Configured for all 14 demographic, scale-sensor, and optional clinical lab inputs

WITH newborn_cohort AS (
  SELECT 
    ie.SUBJECT_ID,
    ie.HADM_ID,
    ie.ICUSTAY_ID,
    ie.INTIME,
    ie.OUTTIME,
    adm.ADMITTIME,
    -- Target Outcome (0 = Survived, 1 = Deceased during hospital stay)
    CASE WHEN adm.DEATHTIME IS NOT NULL OR pat.EXPIRE_FLAG = 1 THEN 1 ELSE 0 END AS mortality_outcome
  FROM `physionet-data.mimiciii_clinical.icustays` ie
  INNER JOIN `physionet-data.mimiciii_clinical.admissions` adm ON ie.HADM_ID = adm.HADM_ID
  INNER JOIN `physionet-data.mimiciii_clinical.patients` pat ON ie.SUBJECT_ID = pat.SUBJECT_ID
  WHERE adm.ADMISSION_TYPE = 'NEWBORN'
),

-- 1. Birth Weight in Grams (Static Baseline)
birth_weight AS (
  SELECT 
    HADM_ID, 
    MAX(CASE 
      WHEN ITEMID IN (3723, 225674) THEN VALUENUM 
      WHEN ITEMID = 4183 THEN VALUENUM * 28.3495 
      ELSE NULL 
    END) AS birth_weight_g
  FROM `physionet-data.mimiciii_clinical.chartevents`
  WHERE ITEMID IN (3723, 4183, 225674)
    AND VALUENUM IS NOT NULL AND VALUENUM > 0
  GROUP BY HADM_ID
),

-- 2. Gestational Age in Weeks (Static Baseline)
gestational_age AS (
  SELECT 
    HADM_ID,
    MAX(VALUENUM) AS gestational_age_weeks
  FROM `physionet-data.mimiciii_clinical.chartevents`
  WHERE ITEMID IN (837, 228299)
    AND VALUENUM IS NOT NULL AND VALUENUM > 0
  GROUP BY HADM_ID
),

-- 3. Apgar Score at 5 Minutes (Static Baseline)
apgar AS (
  SELECT 
    HADM_ID,
    MAX(VALUENUM) AS apgar_score_5min
  FROM `physionet-data.mimiciii_clinical.chartevents`
  WHERE ITEMID IN (37, 220015)
    AND VALUENUM IS NOT NULL AND VALUENUM >= 0
  GROUP BY HADM_ID
),

-- 4. Session Weight (First 2 hours on the scale)
session_weight AS (
  SELECT 
    ie.ICUSTAY_ID,
    MAX(CASE 
      WHEN ce.ITEMID IN (762, 763, 3723, 3580, 225674) THEN ce.VALUENUM
      WHEN ce.ITEMID = 3581 THEN ce.VALUENUM * 453.59237 -- lbs to grams
      WHEN ce.ITEMID IN (4183, 3582) THEN ce.VALUENUM * 28.3495 -- oz to grams
      ELSE NULL 
    END) AS session_weight_g
  FROM newborn_cohort ie
  INNER JOIN `physionet-data.mimiciii_clinical.chartevents` ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE ce.ITEMID IN (762, 763, 3723, 3580, 225674, 3581, 4183, 3582)
    AND ce.VALUENUM IS NOT NULL AND ce.VALUENUM > 0
    AND CAST(ce.CHARTTIME AS DATETIME) BETWEEN CAST(ie.INTIME AS DATETIME) AND DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
  GROUP BY ie.ICUSTAY_ID
),

-- 5. Session Length/Height (First 2 hours on the scale)
session_length AS (
  SELECT 
    ie.ICUSTAY_ID,
    MAX(CASE 
      WHEN ce.ITEMID IN (920, 3485, 3486, 4187, 4188, 226707, 226730) THEN ce.VALUENUM
      WHEN ce.ITEMID IN (1394, 226707) AND ce.VALUEUOM = 'inch' THEN ce.VALUENUM * 2.54 -- inches to cm
      ELSE ce.VALUENUM
    END) AS session_length_cm
  FROM newborn_cohort ie
  INNER JOIN `physionet-data.mimiciii_clinical.chartevents` ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE ce.ITEMID IN (920, 1394, 3485, 3486, 4187, 4188, 226707, 226730)
    AND ce.VALUENUM IS NOT NULL AND ce.VALUENUM > 0
    AND CAST(ce.CHARTTIME AS DATETIME) BETWEEN CAST(ie.INTIME AS DATETIME) AND DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
  GROUP BY ie.ICUSTAY_ID
),

-- 6. Session Temperature (First 2 hours, converts F to C)
session_temp AS (
  SELECT 
    ie.ICUSTAY_ID,
    MIN(CASE 
      WHEN ce.ITEMID IN (676, 223762) THEN ce.VALUENUM
      WHEN ce.ITEMID IN (678, 223761) THEN (ce.VALUENUM - 32) * 5/9
      ELSE NULL 
    END) AS lowest_temperature_celsius
  FROM newborn_cohort ie
  INNER JOIN `physionet-data.mimiciii_clinical.chartevents` ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE ce.ITEMID IN (676, 223762, 678, 223761)
    AND ce.VALUENUM IS NOT NULL AND ce.VALUENUM > 0
    AND CAST(ce.CHARTTIME AS DATETIME) BETWEEN CAST(ie.INTIME AS DATETIME) AND DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
  GROUP BY ie.ICUSTAY_ID
),

-- 7. Session Heart Rate (First 2 hours)
session_hr AS (
  SELECT 
    ie.ICUSTAY_ID,
    AVG(ce.VALUENUM) AS avg_heart_rate_bpm
  FROM newborn_cohort ie
  INNER JOIN `physionet-data.mimiciii_clinical.chartevents` ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE ce.ITEMID IN (211, 220045)
    AND ce.VALUENUM IS NOT NULL AND ce.VALUENUM > 0
    AND CAST(ce.CHARTTIME AS DATETIME) BETWEEN CAST(ie.INTIME AS DATETIME) AND DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
  GROUP BY ie.ICUSTAY_ID
),

-- 8. Session SpO2 (First 2 hours)
session_spo2 AS (
  SELECT 
    ie.ICUSTAY_ID,
    MIN(ce.VALUENUM) AS lowest_spo2_percent
  FROM newborn_cohort ie
  INNER JOIN `physionet-data.mimiciii_clinical.chartevents` ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE ce.ITEMID IN (646, 220277)
    AND ce.VALUENUM IS NOT NULL AND ce.VALUENUM > 0
    AND CAST(ce.CHARTTIME AS DATETIME) BETWEEN CAST(ie.INTIME AS DATETIME) AND DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
  GROUP BY ie.ICUSTAY_ID
),

-- 9. Mean Blood Pressure: Lowest value in the first 2 hours
session_mbp AS (
  SELECT 
    ie.ICUSTAY_ID,
    MIN(ce.VALUENUM) AS mean_blood_pressure
  FROM newborn_cohort ie
  INNER JOIN `physionet-data.mimiciii_clinical.chartevents` ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE ce.ITEMID IN (456, 52, 6702, 443, 220052, 220181, 225312)
    AND ce.VALUENUM IS NOT NULL AND ce.VALUENUM > 0
    AND CAST(ce.CHARTTIME AS DATETIME) BETWEEN CAST(ie.INTIME AS DATETIME) AND DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
  GROUP BY ie.ICUSTAY_ID
),

-- 10. Lowest Serum pH: Lowest value in the first 2 hours
session_ph AS (
  SELECT 
    ie.ICUSTAY_ID,
    MIN(val) AS lowest_serum_ph
  FROM newborn_cohort ie
  INNER JOIN (
    SELECT ICUSTAY_ID, CHARTTIME, VALUENUM AS val FROM `physionet-data.mimiciii_clinical.chartevents` WHERE ITEMID IN (780, 223830) AND VALUENUM IS NOT NULL AND VALUENUM > 0
    UNION ALL
    SELECT ie.ICUSTAY_ID, le.CHARTTIME, le.VALUENUM AS val FROM `physionet-data.mimiciii_clinical.labevents` le
    INNER JOIN newborn_cohort ie ON le.HADM_ID = ie.HADM_ID
    WHERE le.ITEMID IN (50820, 50831) AND le.VALUENUM IS NOT NULL AND le.VALUENUM > 0
  ) ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE CAST(ce.CHARTTIME AS DATETIME) BETWEEN CAST(ie.INTIME AS DATETIME) AND DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
  GROUP BY ie.ICUSTAY_ID
),

-- 11. PaO2 Values in the first 2 hours
pao2_values AS (
  SELECT ie.ICUSTAY_ID, ce.CHARTTIME, ce.VALUENUM AS pao2
  FROM newborn_cohort ie
  INNER JOIN (
    SELECT ICUSTAY_ID, CHARTTIME, VALUENUM FROM `physionet-data.mimiciii_clinical.chartevents` WHERE ITEMID IN (490, 220224) AND VALUENUM IS NOT NULL
    UNION ALL
    SELECT ie.ICUSTAY_ID, le.CHARTTIME, le.VALUENUM FROM `physionet-data.mimiciii_clinical.labevents` le
    INNER JOIN newborn_cohort ie ON le.HADM_ID = ie.HADM_ID
    WHERE le.ITEMID = 50821 AND le.VALUENUM IS NOT NULL
  ) ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE CAST(ce.CHARTTIME AS DATETIME) BETWEEN CAST(ie.INTIME AS DATETIME) AND DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
),

-- 12. FiO2 Values in the first 2 hours
fio2_values AS (
  SELECT ie.ICUSTAY_ID, ce.CHARTTIME, ce.VALUENUM AS fio2
  FROM newborn_cohort ie
  INNER JOIN (
    SELECT ICUSTAY_ID, CHARTTIME, VALUENUM FROM `physionet-data.mimiciii_clinical.chartevents` WHERE ITEMID IN (190, 3420, 223835) AND VALUENUM IS NOT NULL
    UNION ALL
    SELECT ie.ICUSTAY_ID, le.CHARTTIME, le.VALUENUM FROM `physionet-data.mimiciii_clinical.labevents` le
    INNER JOIN newborn_cohort ie ON le.HADM_ID = ie.HADM_ID
    WHERE le.ITEMID = 50816 AND le.VALUENUM IS NOT NULL
  ) ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE CAST(ce.CHARTTIME AS DATETIME) BETWEEN CAST(ie.INTIME AS DATETIME) AND DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
),

-- 13. PaO2 / FiO2 Ratio: Minimum ratio matching nearby PaO2 and FiO2 within 2 hours
session_pao2_fio2 AS (
  SELECT 
    p.ICUSTAY_ID,
    MIN(p.pao2 / COALESCE(
      CASE 
        WHEN f.fio2 > 1.0 THEN f.fio2 / 100.0
        ELSE f.fio2
      END, 0.21
    )) AS po2_fio2_ratio
  FROM pao2_values p
  LEFT JOIN fio2_values f 
    ON p.ICUSTAY_ID = f.ICUSTAY_ID 
    AND ABS(DATETIME_DIFF(CAST(p.CHARTTIME AS DATETIME), CAST(f.CHARTTIME AS DATETIME), MINUTE)) <= 120
  GROUP BY p.ICUSTAY_ID
),

-- 14. Seizures: Static diagnostic baseline
seizures_cohort AS (
  SELECT 
    HADM_ID,
    MAX(CASE WHEN ICD9_CODE LIKE '7803%' OR ICD9_CODE = '7790' THEN 1 ELSE 0 END) AS seizures
  FROM `physionet-data.mimiciii_clinical.diagnoses_icd`
  GROUP BY HADM_ID
),

-- 15. Urine Output: Sum in first 2 hours
session_urine_output AS (
  SELECT 
    ie.ICUSTAY_ID,
    SUM(oe.VALUE) AS total_urine_output_ml
  FROM newborn_cohort ie
  INNER JOIN `physionet-data.mimiciii_clinical.outputevents` oe ON ie.ICUSTAY_ID = oe.ICUSTAY_ID
  WHERE oe.ITEMID IN (
    40055, 43175, 44706, 43981, 40061, 40051, 40065, 40069, 40094, 40096, 
    226559, 226560, 226561, 226563, 226564, 226565, 226567, 226584, 226627, 226631, 227519
  )
    AND oe.VALUE IS NOT NULL
    AND CAST(oe.CHARTTIME AS DATETIME) BETWEEN CAST(ie.INTIME AS DATETIME) AND DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
  GROUP BY ie.ICUSTAY_ID
),

-- 16. Future Instability: Vitals anomalies recorded AFTER hour 2 of ICU stay
future_vital_anomalies AS (
  SELECT 
    ie.ICUSTAY_ID,
    MAX(CASE 
      -- Heart rate anomalies (HR < 100 or HR > 180)
      WHEN ce.ITEMID IN (211, 220045) AND (ce.VALUENUM < 100 OR ce.VALUENUM > 180) THEN 1
      -- SpO2 anomalies (SpO2 < 90%)
      WHEN ce.ITEMID IN (646, 220277) AND ce.VALUENUM < 90 THEN 1
      -- Temperature anomalies (Temp < 35.5 C)
      WHEN ce.ITEMID IN (676, 223762) AND ce.VALUENUM < 35.5 THEN 1
      WHEN ce.ITEMID IN (678, 223761) AND ((ce.VALUENUM - 32) * 5/9) < 35.5 THEN 1
      ELSE 0
    END) AS had_instability
  FROM newborn_cohort ie
  INNER JOIN `physionet-data.mimiciii_clinical.chartevents` ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE ce.VALUENUM IS NOT NULL AND ce.VALUENUM > 0
    AND CAST(ce.CHARTTIME AS DATETIME) > DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
  GROUP BY ie.ICUSTAY_ID
),

-- 17. Future Ventilation (after hour 2)
future_ventilation AS (
  SELECT 
    ie.ICUSTAY_ID,
    MAX(1) AS was_ventilated
  FROM newborn_cohort ie
  INNER JOIN `physionet-data.mimiciii_clinical.chartevents` ce ON ie.ICUSTAY_ID = ce.ICUSTAY_ID
  WHERE ce.ITEMID IN (190, 3420, 223835, 720, 722, 730, 223848, 223849)
    AND ce.VALUENUM IS NOT NULL
    AND CAST(ce.CHARTTIME AS DATETIME) > DATETIME_ADD(CAST(ie.INTIME AS DATETIME), INTERVAL 2 HOUR)
  GROUP BY ie.ICUSTAY_ID
),

-- 18. Sepsis: ICD-9 neonatal or general sepsis diagnosis
sepsis_diagnoses AS (
  SELECT 
    HADM_ID,
    MAX(CASE WHEN ICD9_CODE IN ('77181', '99591', '99592') OR ICD9_CODE LIKE '038%' THEN 1 ELSE 0 END) AS has_sepsis
  FROM `physionet-data.mimiciii_clinical.diagnoses_icd`
  GROUP BY HADM_ID
)

-- Final SELECT: Vitals measured during the 2-hour scale session + static baselines
SELECT 
  n.SUBJECT_ID,
  n.HADM_ID,
  n.ICUSTAY_ID,
  
  -- 1. Static demographic inputs (entered manually or from record)
  COALESCE(bw.birth_weight_g, 3100.0) AS birth_weight_g,
  COALESCE(ga.gestational_age_weeks, 38) AS gestational_age_weeks,
  
  -- Dynamic calculation for Small for Gestational Age (SGA)
  CASE 
    WHEN COALESCE(ga.gestational_age_weeks, 38) <= 24 AND COALESCE(bw.birth_weight_g, 3100.0) < 550 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 25 AND COALESCE(bw.birth_weight_g, 3100.0) < 650 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 26 AND COALESCE(bw.birth_weight_g, 3100.0) < 750 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 27 AND COALESCE(bw.birth_weight_g, 3100.0) < 850 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 28 AND COALESCE(bw.birth_weight_g, 3100.0) < 950 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 29 AND COALESCE(bw.birth_weight_g, 3100.0) < 1050 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 30 AND COALESCE(bw.birth_weight_g, 3100.0) < 1200 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 31 AND COALESCE(bw.birth_weight_g, 3100.0) < 1350 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 32 AND COALESCE(bw.birth_weight_g, 3100.0) < 1500 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 33 AND COALESCE(bw.birth_weight_g, 3100.0) < 1700 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 34 AND COALESCE(bw.birth_weight_g, 3100.0) < 1900 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 35 AND COALESCE(bw.birth_weight_g, 3100.0) < 2100 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 36 AND COALESCE(bw.birth_weight_g, 3100.0) < 2300 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 37 AND COALESCE(bw.birth_weight_g, 3100.0) < 2500 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 38 AND COALESCE(bw.birth_weight_g, 3100.0) < 2700 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 39 AND COALESCE(bw.birth_weight_g, 3100.0) < 2850 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) = 40 AND COALESCE(bw.birth_weight_g, 3100.0) < 3000 THEN 1
    WHEN COALESCE(ga.gestational_age_weeks, 38) >= 41 AND COALESCE(bw.birth_weight_g, 3100.0) < 3100 THEN 1
    ELSE 0
  END AS sga,
  
  COALESCE(apg.apgar_score_5min, 9) AS apgar_score_5min,
  
  -- 2. Scale Sensor Inputs (simulated via first 2 hours of ICU stay)
  COALESCE(sw.session_weight_g, COALESCE(bw.birth_weight_g, 3100.0)) AS current_weight_g,
  COALESCE(sl.session_length_cm, 48.0) AS current_length_cm,
  COALESCE(temp.lowest_temperature_celsius, 36.5) AS lowest_temperature_celsius,
  COALESCE(hr.avg_heart_rate_bpm, 140.0) AS avg_heart_rate_bpm,
  COALESCE(spo2.lowest_spo2_percent, 97) AS lowest_spo2_percent,
  
  -- 3. Optional Clinical inputs (default-resolved, will update inference dynamically if nurse inputs them)
  COALESCE(mbp.mean_blood_pressure, 35.0) AS mean_blood_pressure,
  COALESCE(pf.po2_fio2_ratio, 3.2) AS po2_fio2_ratio,
  COALESCE(ph.lowest_serum_ph, 7.35) AS lowest_serum_ph,
  COALESCE(sz.seizures, 0) AS seizures,
  COALESCE(uo.total_urine_output_ml / (COALESCE(bw.birth_weight_g, 3100.0) / 1000.0) / 2.0, 2.0) AS urine_output_ml_kg_hr,
  
  -- Predict Target label (1 = Unstable/Sick, 0 = Stable/Healthy/Immunizable)
  CASE 
    WHEN n.mortality_outcome = 1 THEN 1
    WHEN COALESCE(fva.had_instability, 0) = 1 THEN 1
    WHEN COALESCE(fv.was_ventilated, 0) = 1 THEN 1
    WHEN COALESCE(sep.has_sepsis, 0) = 1 THEN 1
    ELSE 0 
  END AS is_unstable

FROM newborn_cohort n
LEFT JOIN birth_weight bw ON n.HADM_ID = bw.HADM_ID
LEFT JOIN gestational_age ga ON n.HADM_ID = ga.HADM_ID
LEFT JOIN apgar apg ON n.HADM_ID = apg.HADM_ID
LEFT JOIN session_weight sw ON n.ICUSTAY_ID = sw.ICUSTAY_ID
LEFT JOIN session_length sl ON n.ICUSTAY_ID = sl.ICUSTAY_ID
LEFT JOIN session_temp temp ON n.ICUSTAY_ID = temp.ICUSTAY_ID
LEFT JOIN session_hr hr ON n.ICUSTAY_ID = hr.ICUSTAY_ID
LEFT JOIN session_spo2 spo2 ON n.ICUSTAY_ID = spo2.ICUSTAY_ID
LEFT JOIN session_mbp mbp ON n.ICUSTAY_ID = mbp.ICUSTAY_ID
LEFT JOIN session_ph ph ON n.ICUSTAY_ID = ph.ICUSTAY_ID
LEFT JOIN session_pao2_fio2 pf ON n.ICUSTAY_ID = pf.ICUSTAY_ID
LEFT JOIN seizures_cohort sz ON n.HADM_ID = sz.HADM_ID
LEFT JOIN session_urine_output uo ON n.ICUSTAY_ID = uo.ICUSTAY_ID
LEFT JOIN future_vital_anomalies fva ON n.ICUSTAY_ID = fva.ICUSTAY_ID
LEFT JOIN future_ventilation fv ON n.ICUSTAY_ID = fv.ICUSTAY_ID
LEFT JOIN sepsis_diagnoses sep ON n.HADM_ID = sep.HADM_ID;
