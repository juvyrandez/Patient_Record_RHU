
CREATE DATABASE rhu_patient_record;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  usertype VARCHAR(20) CHECK (usertype IN ('admin', 'staff')) NOT NULL
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
-- Individual Treatment Records (for CHU/RHU Individual Treatment Record modal)
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

CREATE TRIGGER update_itr_timestamp_trg
BEFORE UPDATE ON individual_treatment_records
FOR EACH ROW
EXECUTE FUNCTION update_itr_timestamp();