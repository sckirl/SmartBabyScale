-- SmartBabyScale Database Schema (Minimalist Ponytail Edition)
-- Merged YAGNI tables for max efficiency.

CREATE DATABASE IF NOT EXISTS smartbabyscale_db;
USE smartbabyscale_db;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'doctor', 'nurse') DEFAULT 'nurse'
);
-- ponytail: removed full_name, created_at. YAGNI. Username is enough.

-- 2. Patients
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mrn VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    dob DATE,
    gender ENUM('L', 'P'),
    birth_weight_g FLOAT, 
    gestational_age_weeks INT,
    parent_name VARCHAR(100),
    contact_number VARCHAR(20),
    admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'discharged', 'transferred') DEFAULT 'active'
);
-- Note: Expanded from Ponytail mode based on explicit user request for full patient intake data.

-- 3. Vital Records (Merged Sensors + Anthropometry)
CREATE TABLE IF NOT EXISTS vital_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    weight_grams FLOAT,
    length_cm FLOAT,
    temperature_celsius FLOAT,
    heart_rate_bpm INT,
    spo2_percent INT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
-- ponytail: One table for all scale measurements. They happen at the same time.

-- 4. Predictions (Merged SNAPPE-II Inputs + AI Outputs)
CREATE TABLE IF NOT EXISTS predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- SNAPPE-II Manual/Lab Inputs used for this run
    mean_blood_pressure FLOAT,
    lowest_ph FLOAT,
    po2_fio2_ratio FLOAT,
    seizures BOOLEAN,
    urine_output_ml_kg_hr FLOAT,
    apgar_score_5min INT,
    -- Outputs
    snappe_score FLOAT, 
    mortality_risk_prob FLOAT, 
    risk_level ENUM('Low', 'Moderate', 'High'),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
-- ponytail: Merged AI predictions and SNAPPE inputs. It's a 1:1 relationship per inference.
