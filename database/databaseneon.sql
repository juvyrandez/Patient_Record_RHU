
CREATE DATABASE rhu_patient_record;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  usertype ENUM('admin', 'staff') NOT NULL
);


-----------------------------------------------
CREATE TABLE doctors (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  specialization VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctors_timestamp
BEFORE UPDATE ON doctors
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();



-------------------------------------------------------------
CREATE TABLE bhws (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  barangay VARCHAR(100) NOT NULL,
  contact_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bhws_timestamp
BEFORE UPDATE ON bhws
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();


-------------------------------------------------------------
OLDDDDDDDDDDDDDD
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  maiden_name VARCHAR(100),
  suffix VARCHAR(10),
  gender VARCHAR(10) NOT NULL,
  birth_date DATE NOT NULL,
  birth_place VARCHAR(255),
  blood_type VARCHAR(5),
  civil_status VARCHAR(20),
  spouse_name VARCHAR(100),
  educational_attainment VARCHAR(100),
  employment_status VARCHAR(50),
  family_member_role VARCHAR(50),
  residential_address TEXT NOT NULL,
  contact_number VARCHAR(20),
  mothers_name VARCHAR(100),
  dswd_nhts BOOLEAN DEFAULT FALSE,
  facility_household_no VARCHAR(50),
  pps_member BOOLEAN DEFAULT FALSE,
  pps_household_no VARCHAR(50),
  philhealth_member BOOLEAN DEFAULT FALSE,
  philhealth_status VARCHAR(50),
  philhealth_number VARCHAR(20),
  philhealth_category VARCHAR(50),
  pcb_member BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_patient_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_patient_timestamp();


-----------------------------------------------------------------
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  maiden_name VARCHAR(100),
  suffix VARCHAR(10),
  gender VARCHAR(10) NOT NULL,
  birth_date DATE NOT NULL,
  birth_place VARCHAR(255),
  blood_type VARCHAR(5),
  civil_status VARCHAR(20),
  spouse_name VARCHAR(100),
  educational_attainment VARCHAR(100),
  employment_status VARCHAR(50),
  family_member_role VARCHAR(50),
  residential_address TEXT NOT NULL,
  contact_number VARCHAR(20),
  mothers_name VARCHAR(100),
  dswd_nhts BOOLEAN DEFAULT FALSE,
  facility_household_no VARCHAR(50),
  pps_member BOOLEAN DEFAULT FALSE,
  pps_household_no VARCHAR(50),
  philhealth_member BOOLEAN DEFAULT FALSE,
  philhealth_status VARCHAR(50),
  philhealth_number VARCHAR(20),
  philhealth_category VARCHAR(50),
  pcb_member BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  type VARCHAR(20) NOT NULL CHECK (type IN ('staff_data', 'bhw_data')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_patient_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_timestamp
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_patient_timestamp();


---------------------------------------------------------------------------------

CREATE TABLE login_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'staff', 'doctor', 'bhw')),
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_login_history_user ON login_history(user_id, user_type);


------------------------------------------------------------------------------------
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  referral_type VARCHAR(50) NOT NULL,
  referral_date DATE NOT NULL,
  referral_time TIME NOT NULL,
  referred_to VARCHAR(255) NOT NULL,
  referred_to_address TEXT NOT NULL,
  patient_last_name VARCHAR(100) NOT NULL,
  patient_first_name VARCHAR(100) NOT NULL,
  patient_middle_name VARCHAR(100),
  patient_address TEXT NOT NULL,
  chief_complaints TEXT NOT NULL,
  medical_history TEXT,
  surgical_operations VARCHAR(10),
  surgical_procedure TEXT,
  drug_allergy VARCHAR(10),
  allergy_type TEXT,
  last_meal_time VARCHAR(10),
  blood_pressure VARCHAR(20),
  heart_rate VARCHAR(20),
  respiratory_rate VARCHAR(20),
  weight VARCHAR(20),
  impression TEXT,
  action_taken TEXT,
  health_insurance VARCHAR(10),
  insurance_type TEXT,
  referral_reasons TEXT[],
  other_reason TEXT,
  referred_by_name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending',
  seen BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES bhws(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_referral_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_referrals_timestamp
BEFORE UPDATE ON referrals
FOR EACH ROW
EXECUTE FUNCTION update_referral_timestamp();





------------------------------------------------------------------------------------------
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  referral_id INTEGER REFERENCES referrals(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE OR REPLACE FUNCTION update_notification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_timestamp
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notification_timestamp();



------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS individual_treatment_records (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL,
  patient_last_name VARCHAR(100) NOT NULL,
  patient_first_name VARCHAR(100) NOT NULL,
  patient_middle_name VARCHAR(100),
  patient_suffix VARCHAR(10),
  patient_birth_date DATE,

  visit_type VARCHAR(30),
  consultation_date DATE,
  consultation_period VARCHAR(2), -- AM/PM
  consultation_time TIME,

  blood_pressure VARCHAR(20),
  temperature VARCHAR(20),
  height_cm VARCHAR(20),
  weight_kg VARCHAR(20),
  heart_rate VARCHAR(20),
  respiratory_rate VARCHAR(20),
  attending_provider VARCHAR(150),

  referred_from VARCHAR(255),
  referred_to VARCHAR(255),
  referral_reasons TEXT[],
  referred_by VARCHAR(150),
  purpose_of_visit VARCHAR(100),

  chief_complaints TEXT,
  diagnosis TEXT,
  diagnosis_1 TEXT,
  diagnosis_2 TEXT,
  diagnosis_3 TEXT,
  medication TEXT,
  lab_findings TEXT,
  lab_tests TEXT,

  referral_id INTEGER REFERENCES referrals(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending',
  data_type VARCHAR(50),
  bhw_id INTEGER REFERENCES bhws(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_itr_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_itr_timestamp
BEFORE UPDATE ON individual_treatment_records
FOR EACH ROW
EXECUTE FUNCTION update_itr_timestamp();

-- Add missing columns for BHW treatment records (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'individual_treatment_records' AND column_name = 'status') THEN
        ALTER TABLE individual_treatment_records ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'individual_treatment_records' AND column_name = 'data_type') THEN
        ALTER TABLE individual_treatment_records ADD COLUMN data_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'individual_treatment_records' AND column_name = 'bhw_id') THEN
        ALTER TABLE individual_treatment_records ADD COLUMN bhw_id INTEGER REFERENCES bhws(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add created_by column to referrals table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'created_by') THEN
        ALTER TABLE referrals ADD COLUMN created_by INTEGER REFERENCES bhws(id) ON DELETE SET NULL;
    END IF;
END $$;






------------------------------------------------------------------------------------------
-- Table for approved diagnoses (only checked/approved by doctor)
CREATE TABLE IF NOT EXISTS approved_diagnoses (
  id SERIAL PRIMARY KEY,
  treatment_record_id INTEGER REFERENCES individual_treatment_records(id) ON DELETE CASCADE,
  diagnosis_text TEXT NOT NULL,
  diagnosis_type VARCHAR(20) DEFAULT 'final', -- 'ai_approved', 'final', 'custom'
  is_primary BOOLEAN DEFAULT false,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_approved_diagnoses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_approved_diagnoses_timestamp
BEFORE UPDATE ON approved_diagnoses
FOR EACH ROW
EXECUTE FUNCTION update_approved_diagnoses_timestamp();







------------------------------------------------------------------------------------------
-- Table for consultation decisions and status tracking
CREATE TABLE IF NOT EXISTS consultation_decisions (
  id SERIAL PRIMARY KEY,
  treatment_record_id INTEGER REFERENCES individual_treatment_records(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending', -- 'Pending', 'In Laboratory', 'Complete'
  medication_treatment TEXT,
  lab_findings_impression TEXT,
  lab_tests TEXT,
  notes TEXT,
  is_draft BOOLEAN DEFAULT true,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_consultation_decisions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultation_decisions_timestamp
BEFORE UPDATE ON consultation_decisions
FOR EACH ROW
EXECUTE FUNCTION update_consultation_decisions_timestamp();








CREATE TABLE IF NOT EXISTS rabies_registry (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  age_sex VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  exposure_category VARCHAR(50), -- Cat I, Cat II, Cat III
  animal VARCHAR(100), -- Dog, Cat, etc.
  cat_ii_date DATE,
  cat_ii_vac BOOLEAN DEFAULT FALSE, -- Category II Vaccine completed
  cat_iii_date DATE,
  cat_iii_vac BOOLEAN DEFAULT FALSE, -- Category III Vaccine completed
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(patient_id) -- Prevent duplicate entries for same patient
);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_rabies_registry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rabies_registry_timestamp
BEFORE UPDATE ON rabies_registry
FOR EACH ROW
EXECUTE FUNCTION update_rabies_registry_timestamp();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_rabies_registry_patient_id ON rabies_registry(patient_id);
CREATE INDEX IF NOT EXISTS idx_rabies_registry_created_at ON rabies_registry(created_at);







-- ==========================================================
-- PHILPEN Risk Assessment Records Table

CREATE TABLE IF NOT EXISTS philpen_records (
    id SERIAL PRIMARY KEY,
    
    -- Basic Information
    patient_id INTEGER REFERENCES patients(id),
    health_facility VARCHAR(255) DEFAULT 'RHU BALINGASAG',
    assessment_date DATE NOT NULL,
    
    -- I. PATIENT'S INFORMATION (auto-filled from patients table)
    patient_name VARCHAR(255),
    age INTEGER,
    sex VARCHAR(10),
    birthdate DATE,
    civil_status VARCHAR(50),
    contact_no VARCHAR(20),
    patient_address TEXT,
    employment_status VARCHAR(100),
    ethnicity VARCHAR(100),
    
    -- II. ASSESS FOR RED FLAGS (JSON for Yes/No checkboxes)
    red_flags JSONB DEFAULT '{}',
    -- Structure: {
    --   "chest_pain": true/false,
    --   "difficulty_breathing": true/false,
    --   "loss_consciousness": true/false,
    --   "slurred_speech": true/false,
    --   "facial_asymmetry": true/false,
    --   "weakness_numbness": true/false,
    --   "persistent_headache": true/false,
    --   "chest_retractions": true/false,
    --   "seizure_convulsion": true/false,
    --   "self_harm": true/false,
    --   "agitated_behavior": true/false,
    --   "eye_injury": true/false,
    --   "severe_injuries": true/false
    -- }
    
    -- III. PAST MEDICAL HISTORY (JSON for Yes/No checkboxes)
    past_medical_history JSONB DEFAULT '{}',
    -- Structure: {
    --   "hypertension": true/false,
    --   "heart_diseases": true/false,
    --   "diabetes": true/false,
    --   "cancer": true/false,
    --   "stroke": true/false,
    --   "asthma": true/false,
    --   "allergies": true/false,
    --   "mental_neurological": true/false,
    --   "substance_abuse": true/false,
    --   "previous_surgical": true/false,
    --   "thyroid_disorders": true/false,
    --   "kidney_disorders": true/false
    -- }
    
    -- IV. FAMILY HISTORY (JSON for Yes/No checkboxes)
    family_history JSONB DEFAULT '{}',
    -- Structure: {
    --   "hypertension": true/false,
    --   "stroke": true/false,
    --   "heart_disease": true/false,
    --   "diabetes_mellitus": true/false,
    --   "asthma": true/false,
    --   "cancer": true/false,
    --   "kidney_disease": true/false,
    --   "mental_neurological": true/false,
    --   "tb_5years": true/false,
    --   "substance_abuse": true/false,
    --   "copd": true/false
    -- }
    
    -- V. NCD RISK FACTORS
    -- 5.1 Tobacco Use (JSON for multiple choice)
    tobacco_use JSONB DEFAULT '{}',
    -- Structure: {
    --   "q1_never_used": true/false,
    --   "q2_exposure_secondhand": true/false,
    --   "q3_former_user": true/false,
    --   "q4_current_user": true/false
    -- }
    tobacco_cessation_advice TEXT,
    
    -- 5.2 Alcohol Intake (JSON for multiple choice)
    alcohol_intake JSONB DEFAULT '{}',
    -- Structure: {
    --   "q1_never_consumed": true/false,
    --   "q2_drinks_alcohol": true/false
    -- }
    alcohol_screening_advice TEXT,
    
    -- 5.3 Physical Activity
    physical_activity_hours TEXT, -- stores "yes" or "no" answers
    physical_activity_advice TEXT,
    
    -- 5.4 Nutrition and Dietary Assessment (JSON for multiple choice)
    nutrition_assessment JSONB DEFAULT '{}',
    -- Structure: {
    --   "salt_intake_high": true/false,
    --   "processed_foods": true/false,
    --   "fruits_vegetables": true/false,
    --   "sugary_drinks": true/false
    -- }
    nutrition_advice TEXT,
    
    -- 5.5-5.9 Measurements
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(4,2),
    waist_circumference_cm DECIMAL(5,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    
    -- VI. RISK SCREENING
    fbs_result VARCHAR(50),
    fbs_date DATE,
    rbs_result VARCHAR(50),
    rbs_date DATE,
    lipid_profile JSONB DEFAULT '{}',
    -- Structure: {
    --   "cholesterol": "value",
    --   "hdl": "value",
    --   "ldl": "value",
    --   "triglycerides": "value"
    -- }
    lipid_profile_date DATE,
    urinalysis_protein VARCHAR(50),
    urinalysis_ketones VARCHAR(50),
    urinalysis_date DATE,
    
    -- 6.2 Chronic Respiratory Diseases (JSON for symptoms)
    respiratory_symptoms JSONB DEFAULT '{}',
    -- Structure: {
    --   "chronic_cough": true/false,
    --   "sputum_production": true/false,
    --   "chest_tightness": true/false,
    --   "wheezing": true/false
    -- }
    respiratory_screening_advice TEXT,
    
    -- VII. MANAGEMENT
    lifestyle_modification BOOLEAN DEFAULT FALSE,
    medications JSONB DEFAULT '{}',
    -- Structure: {
    --   "anti_hypertensives": true/false,
    --   "oral_hypoglycemic": true/false
    -- }
    
    date_of_followup DATE,
    remarks TEXT,
    
    -- Assessment Results and Recommendations
    risk_level VARCHAR(50), -- Low, Moderate, High
    recommendations TEXT,
    referral_needed BOOLEAN DEFAULT FALSE,
    referral_facility VARCHAR(255),
    
    -- System fields
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- Indexes
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_philpen_patient_id ON philpen_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_philpen_assessment_date ON philpen_records(assessment_date);
CREATE INDEX IF NOT EXISTS idx_philpen_created_at ON philpen_records(created_at);
CREATE INDEX IF NOT EXISTS idx_philpen_risk_level ON philpen_records(risk_level);

-- ==========================================================
-- Trigger to auto-update updated_at on record modificationnn
-- ==========================================================
CREATE OR REPLACE FUNCTION update_philpen_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_philpen_updated_at 
    BEFORE UPDATE ON philpen_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_philpen_updated_at_column();

