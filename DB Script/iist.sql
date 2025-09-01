-- DATABASE SELECTION (MySQL doesn't use `USE []` for DB creation)
CREATE DATABASE IF NOT EXISTS iist;
USE iist;

-- Table: access_log
CREATE TABLE access_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  login_time DATETIME NOT NULL,
  logout_time DATETIME DEFAULT NULL,
  status VARCHAR(20) NOT NULL
);

-- Table: admin_complaints
CREATE TABLE admin_complaints (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT DEFAULT NULL,
  category VARCHAR(255) DEFAULT NULL,
  created_at DATETIME(6) DEFAULT NULL,
  description VARCHAR(255) DEFAULT NULL,
  file_url VARCHAR(255) DEFAULT NULL,
  status VARCHAR(255) DEFAULT NULL
);

-- Table: admin_user
CREATE TABLE admin_user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255) DEFAULT NULL,
  admin_type VARCHAR(255) DEFAULT NULL,
  admin_name VARCHAR(255) DEFAULT NULL,
  admin_mobile_no VARCHAR(255) DEFAULT NULL,
  admin_emailId VARCHAR(100) DEFAULT NULL,
  admin_email_id VARCHAR(255) DEFAULT NULL
);

-- Table: complaints
CREATE TABLE complaints (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id INT DEFAULT NULL,
  issue_date DATETIME(6) DEFAULT NULL,
  topic VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  status VARCHAR(255) DEFAULT NULL,
  feedback VARCHAR(255) DEFAULT NULL,
  photo_url VARCHAR(255) DEFAULT NULL,
  student_closed BOOLEAN DEFAULT NULL
);

-- Table: emergency_reports
CREATE TABLE emergency_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT DEFAULT NULL,
  created_at DATETIME(6) DEFAULT NULL,
  status VARCHAR(255) DEFAULT NULL,
  student_id INT DEFAULT NULL,
  transcript LONGTEXT DEFAULT NULL
);

-- Table: gate_pass_request
CREATE TABLE gate_pass_request (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  pass_type VARCHAR(255) DEFAULT NULL,
  from_time DATETIME DEFAULT NULL,
  to_time DATETIME DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  status VARCHAR(255) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME DEFAULT NULL,
  place_to_visit VARCHAR(255) DEFAULT NULL
);

-- Table: hostel_allocation
CREATE TABLE hostel_allocation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  allocated_on DATETIME(6) DEFAULT NULL,
  bed_id INT DEFAULT NULL,
  room_id INT DEFAULT NULL,
  student_id INT DEFAULT NULL
);

-- Table: hostel_attendance
CREATE TABLE hostel_attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  attendance_date DATE NOT NULL,
  status VARCHAR(255) DEFAULT NULL,
  student_year VARCHAR(255) DEFAULT NULL,
  student_branch VARCHAR(255) DEFAULT NULL,
  edit_timestamp DATETIME(6) DEFAULT NULL,
  edited BOOLEAN DEFAULT NULL,
  CONSTRAINT chk_status CHECK (status IN ('absent', 'present'))
);

-- Table: hostel_bed
CREATE TABLE hostel_bed (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bed_id VARCHAR(255) DEFAULT NULL,
  room_id INT NOT NULL,
  status VARCHAR(255) DEFAULT 'empty',
  student_id INT DEFAULT NULL,
  CONSTRAINT chk_bed_status CHECK (status IN ('empty', 'occupied'))
);

-- Table: hostel_room
CREATE TABLE hostel_room (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_no VARCHAR(255) DEFAULT NULL,
  floor INT NOT NULL,
  type VARCHAR(255) DEFAULT NULL,
  hostel_name VARCHAR(255) DEFAULT NULL
);

-- Table: register_student
CREATE TABLE register_student (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) DEFAULT NULL,
  dob DATE DEFAULT NULL,
  age INT DEFAULT NULL,
  gender VARCHAR(255) DEFAULT NULL,
  religion VARCHAR(255) DEFAULT NULL,
  category VARCHAR(255) DEFAULT NULL,
  nationality VARCHAR(255) DEFAULT 'Unknown',
  mobile_no VARCHAR(255) DEFAULT NULL,
  email_id VARCHAR(255) DEFAULT NULL,
  aadhar_no VARCHAR(255) DEFAULT NULL,
  course VARCHAR(255) DEFAULT NULL,
  semester_year VARCHAR(255) DEFAULT NULL,
  institute_name VARCHAR(255) DEFAULT NULL,
  course_name VARCHAR(255) DEFAULT NULL,
  branch VARCHAR(255) DEFAULT NULL,
  year_of_study VARCHAR(255) DEFAULT NULL,
  date_of_admission DATE DEFAULT NULL,
  hostel_join_date DATE DEFAULT NULL,
  father_name VARCHAR(255) DEFAULT NULL,
  father_occupation VARCHAR(255) DEFAULT NULL,
  father_education VARCHAR(255) DEFAULT NULL,
  father_email VARCHAR(255) DEFAULT NULL,
  father_mobile VARCHAR(255) DEFAULT NULL,
  mother_name VARCHAR(255) DEFAULT NULL,
  mother_occupation VARCHAR(255) DEFAULT NULL,
  mother_education VARCHAR(255) DEFAULT NULL,
  mother_email VARCHAR(255) DEFAULT NULL,
  mother_mobile VARCHAR(255) DEFAULT NULL,
  permanent_address LONGTEXT DEFAULT NULL,
  city_district VARCHAR(255) DEFAULT NULL,
  state VARCHAR(255) DEFAULT NULL,
  pin_code VARCHAR(255) DEFAULT NULL,
  phone_residence VARCHAR(255) DEFAULT NULL,
  phone_office VARCHAR(255) DEFAULT NULL,
  office_address LONGTEXT DEFAULT NULL,
  local_guardian_name VARCHAR(255) DEFAULT NULL,
  local_guardian_address LONGTEXT DEFAULT NULL,
  local_guardian_phone VARCHAR(255) DEFAULT NULL,
  local_guardian_mobile VARCHAR(255) DEFAULT NULL,
  emergency_contact_name VARCHAR(255) DEFAULT NULL,
  emergency_contact_no VARCHAR(255) DEFAULT NULL,
  blood_group VARCHAR(255) DEFAULT NULL,
  serious_disease LONGTEXT DEFAULT NULL,
  regular_medication LONGTEXT DEFAULT NULL,
  hospital_record LONGTEXT DEFAULT NULL,
  emergency_medicine LONGTEXT DEFAULT NULL,
  allergic_to LONGTEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  student_password VARCHAR(20) DEFAULT NULL,
  photo_path VARCHAR(255) DEFAULT NULL,
  CONSTRAINT chk_blood_group CHECK (blood_group IN ('O-', 'O+', 'AB-', 'AB+', 'B-', 'B+', 'A-', 'A+')),
  CONSTRAINT chk_gender CHECK (gender IN ('O', 'F', 'M')),
  CONSTRAINT chk_year CHECK (year_of_study IN ('1', '2', '3', '4'))
);

-- Table: security_active_pass
CREATE TABLE security_active_pass (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gate_pass_id INT UNIQUE NOT NULL,
  student_id INT NOT NULL,
  student_name VARCHAR(255) DEFAULT NULL,
  pass_type VARCHAR(50) DEFAULT NULL,
  from_time DATETIME(6) DEFAULT NULL,
  to_time DATETIME(6) DEFAULT NULL,
  reason LONGTEXT DEFAULT NULL,
  destination VARCHAR(255) DEFAULT NULL,
  status VARCHAR(20) DEFAULT NULL,
  check_out_time DATETIME(6) DEFAULT NULL,
  check_in_time DATETIME(6) DEFAULT NULL,
  created_at DATETIME(6) DEFAULT NULL,
  approved_at DATETIME(6) DEFAULT NULL
);

-- Table: security_pass_activity_log
CREATE TABLE security_pass_activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gate_pass_id INT NOT NULL,
  student_id INT NOT NULL,
  student_name VARCHAR(255) DEFAULT NULL,
  action VARCHAR(255) DEFAULT NULL,
  timestamp DATETIME(6) DEFAULT NULL,
  reason VARCHAR(255) DEFAULT NULL,
  destination VARCHAR(255) DEFAULT NULL
);

-- Table: security_user
CREATE TABLE security_user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  password VARCHAR(255) DEFAULT NULL,
  security_name VARCHAR(255) DEFAULT NULL,
  security_mobileNo VARCHAR(100) DEFAULT NULL,
  security_emailId VARCHAR(100) DEFAULT NULL,
  security_email_id VARCHAR(255) DEFAULT NULL,
  security_mobile_no VARCHAR(255) DEFAULT NULL
);

-- ======= FOREIGN KEYS =======

ALTER TABLE complaints
  ADD CONSTRAINT fk_complaints_student_id FOREIGN KEY (student_id) REFERENCES register_student(id);

ALTER TABLE gate_pass_request
  ADD CONSTRAINT fk_gate_pass_request_student_id FOREIGN KEY (student_id) REFERENCES register_student(id);

ALTER TABLE hostel_allocation
  ADD CONSTRAINT fk_allocation_room_id FOREIGN KEY (room_id) REFERENCES hostel_room(id);

ALTER TABLE hostel_allocation
  ADD CONSTRAINT fk_allocation_bed_id FOREIGN KEY (bed_id) REFERENCES hostel_bed(id);

ALTER TABLE hostel_allocation
  ADD CONSTRAINT fk_allocation_student_id FOREIGN KEY (student_id) REFERENCES register_student(id);

ALTER TABLE hostel_attendance
  ADD CONSTRAINT fk_hostel_attendance_student_id FOREIGN KEY (student_id) REFERENCES register_student(id) ON DELETE CASCADE;

ALTER TABLE hostel_bed
  ADD CONSTRAINT fk_bed_room_id FOREIGN KEY (room_id) REFERENCES hostel_room(id) ON DELETE CASCADE;

ALTER TABLE hostel_bed
  ADD CONSTRAINT fk_bed_student_id FOREIGN KEY (student_id) REFERENCES register_student(id) ON DELETE SET NULL;

-- ========= CHECKS ALREADY INCLUDED IN TABLES WHERE RELEVANT =======

