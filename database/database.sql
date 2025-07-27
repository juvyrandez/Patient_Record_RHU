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