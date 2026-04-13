-- EPOSREM Database Schema (Raw SQL)
-- Optimized for Indonesian Health Administration (MySQL)

CREATE DATABASE IF NOT EXISTS eposrem_db;
USE eposrem_db;

-- 1. User Management (Basic Auth)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'doctor', 'nurse') DEFAULT 'nurse',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patient Records
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mrn VARCHAR(20) UNIQUE NOT NULL, -- Medical Record Number
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATETIME NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    birth_weight_g FLOAT, -- Required for SNAPPE-II
    gestational_age_weeks INT, -- Required for SNAPPE-II
    admission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'discharged', 'critical') DEFAULT 'active'
);

-- 3. Vital Records (Averaged Sensor Data)
-- We store averaged data every X minutes to prevent storage bloat
CREATE TABLE IF NOT EXISTS vital_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    heart_rate_bpm INT,
    spo2_percent INT,
    temperature_celsius FLOAT,
    weight_grams FLOAT,
    length_cm FLOAT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 4. SNAPPE-II Assessments
CREATE TABLE IF NOT EXISTS snappe_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mean_blood_pressure FLOAT,
    lowest_temperature FLOAT,
    lowest_ph FLOAT,
    po2_fio2_ratio FLOAT,
    seizures BOOLEAN DEFAULT FALSE,
    urine_output_ml_kg_hr FLOAT,
    apgar_score_5min INT,
    calculated_score FLOAT, -- 0-162
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 5. AI Predictions (Edge AI Output)
CREATE TABLE IF NOT EXISTS ai_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mortality_risk_prob FLOAT, -- 0.0 - 1.0
    risk_level ENUM('Low', 'Moderate', 'High'),
    accuracy_warning BOOLEAN DEFAULT FALSE, -- True if data points < threshold
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
