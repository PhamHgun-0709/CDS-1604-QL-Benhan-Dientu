-- Migration: Add patient_id to prescriptions and lab_results
-- Date: 2025-10-17

USE hospital_db;

-- Thêm patient_id vào prescriptions
SET @query1 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='prescriptions' AND COLUMN_NAME='patient_id') = 0,
  'ALTER TABLE prescriptions ADD COLUMN patient_id INT AFTER id',
  'SELECT "patient_id already exists in prescriptions" AS msg'
);
PREPARE stmt1 FROM @query1; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

-- Thêm frequency nếu chưa có
SET @query2 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='prescriptions' AND COLUMN_NAME='frequency') = 0,
  'ALTER TABLE prescriptions ADD COLUMN frequency VARCHAR(100) AFTER dosage',
  'SELECT "frequency already exists" AS msg'
);
PREPARE stmt2 FROM @query2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- Thêm duration nếu chưa có
SET @query2b = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='prescriptions' AND COLUMN_NAME='duration') = 0,
  'ALTER TABLE prescriptions ADD COLUMN duration VARCHAR(50) AFTER frequency',
  'SELECT "duration already exists" AS msg'
);
PREPARE stmt2b FROM @query2b; EXECUTE stmt2b; DEALLOCATE PREPARE stmt2b;

-- Thêm instructions
SET @query3 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='prescriptions' AND COLUMN_NAME='instructions') = 0,
  'ALTER TABLE prescriptions ADD COLUMN instructions TEXT AFTER duration',
  'SELECT "instructions already exists" AS msg'
);
PREPARE stmt3 FROM @query3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- Thêm patient_id vào lab_results
SET @query4 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='lab_results' AND COLUMN_NAME='patient_id') = 0,
  'ALTER TABLE lab_results ADD COLUMN patient_id INT AFTER id',
  'SELECT "patient_id already exists in lab_results" AS msg'
);
PREPARE stmt4 FROM @query4; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;

-- Thêm indexes
SET @query5 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='prescriptions' AND INDEX_NAME='idx_patient_id') = 0,
  'ALTER TABLE prescriptions ADD INDEX idx_patient_id (patient_id)',
  'SELECT "idx_patient_id already exists" AS msg'
);
PREPARE stmt5 FROM @query5; EXECUTE stmt5; DEALLOCATE PREPARE stmt5;

SET @query6 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='lab_results' AND INDEX_NAME='idx_patient_id_lab') = 0,
  'ALTER TABLE lab_results ADD INDEX idx_patient_id_lab (patient_id)',
  'SELECT "idx_patient_id_lab already exists" AS msg'
);
PREPARE stmt6 FROM @query6; EXECUTE stmt6; DEALLOCATE PREPARE stmt6;

SELECT '✅ Migration completed - added patient_id columns!' AS status;
