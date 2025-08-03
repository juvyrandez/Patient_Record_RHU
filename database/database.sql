CREATE DATABASE patient_record;

USE patient_record;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  usertype ENUM('admin', 'staff') NOT NULL
);



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




CREATE TABLE login_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'staff', 'doctor', 'bhw')),
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_login_history_user ON login_history(user_id, user_type);





//NEWWWWWW

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










//OLDDDDDDDDDDD

CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    maiden_name VARCHAR(50),
    suffix VARCHAR(10),
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    birth_date DATE,
    birth_place VARCHAR(100),
    blood_type VARCHAR(5),
    civil_status ENUM('Single', 'Married', 'Widowed', 'Separated', 'Annulled', 'Co-Habiting'),
    spouse_name VARCHAR(100),
    educational_attainment ENUM('No Formal Education', 'Elementary', 'Highschool', 'Vocational', 'College', 'Post Graduate'),
    employment_status ENUM('Student', 'Employed', 'Unemployed', 'Self-Employed', 'Retired', 'Unknown'),
    family_member_role ENUM('Father', 'Mother', 'Son', 'Daughter', 'Other'),
    residential_address TEXT,
    contact_number VARCHAR(20),
    mothers_name VARCHAR(100),
    dswd_nhts ENUM('Yes', 'No'),
    facility_household_no VARCHAR(50),
    pps_member ENUM('Yes', 'No'),
    pps_household_no VARCHAR(50),
    philhealth_member ENUM('Yes', 'No'),
    philhealth_status ENUM('Member', 'Dependent'),
    philhealth_number VARCHAR(50),
    philhealth_category ENUM('FE-Private', 'FE-Government', 'Others'),
    pcb_member ENUM('Yes', 'No'),
    status ENUM('New', 'Old') DEFAULT 'New',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE medical_staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullname VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  specialization VARCHAR(100),
  type ENUM('Doctor', 'Nurse') NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE bhws (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    barangay VARCHAR(100) NOT NULL,
    contactNumber VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



































//NEWWWW
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  referral_type VARCHAR(20) NOT NULL,
  referral_date DATE NOT NULL,
  referral_time TIME NOT NULL,
  referred_to VARCHAR(255) NOT NULL,
  referred_to_address VARCHAR(255) NOT NULL,
  patient_last_name VARCHAR(100) NOT NULL,
  patient_first_name VARCHAR(100) NOT NULL,
  patient_middle_name VARCHAR(100),
  patient_address TEXT NOT NULL,
  chief_complaints TEXT NOT NULL,
  medical_history TEXT,
  surgical_operations VARCHAR(3) NOT NULL,
  surgical_procedure VARCHAR(255),
  drug_allergy VARCHAR(3) NOT NULL,
  allergy_type VARCHAR(255),
  last_meal_time VARCHAR(10) NOT NULL,
  blood_pressure VARCHAR(20),
  heart_rate VARCHAR(20),
  respiratory_rate VARCHAR(20),
  weight VARCHAR(20),
  impression TEXT,
  action_taken TEXT,
  health_insurance VARCHAR(3) NOT NULL,
  insurance_type VARCHAR(100),
  referral_reasons TEXT[],
  other_reason TEXT,
  referred_by_name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) NOT NULL,
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
















CREATE TABLE bhw_patients (
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






