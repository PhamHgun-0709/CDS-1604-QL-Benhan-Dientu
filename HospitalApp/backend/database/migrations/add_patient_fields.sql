-- Migration: Add extended patient fields
-- Date: 2025-10-17

USE hospital_db;

-- Thêm các cột mới vào bảng patients (nếu chưa tồn tại)
SET @query1 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='email') = 0,
  'ALTER TABLE patients ADD COLUMN email VARCHAR(100) AFTER phone',
  'SELECT "email already exists" AS msg'
);
PREPARE stmt1 FROM @query1; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

SET @query2 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='id_card') = 0,
  'ALTER TABLE patients ADD COLUMN id_card VARCHAR(20) AFTER email',
  'SELECT "id_card already exists" AS msg'
);
PREPARE stmt2 FROM @query2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

SET @query3 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='blood_type') = 0,
  'ALTER TABLE patients ADD COLUMN blood_type VARCHAR(10) AFTER id_card',
  'SELECT "blood_type already exists" AS msg'
);
PREPARE stmt3 FROM @query3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

SET @query4 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='allergies') = 0,
  'ALTER TABLE patients ADD COLUMN allergies TEXT AFTER blood_type',
  'SELECT "allergies already exists" AS msg'
);
PREPARE stmt4 FROM @query4; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;

SET @query5 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='medical_history') = 0,
  'ALTER TABLE patients ADD COLUMN medical_history TEXT AFTER allergies',
  'SELECT "medical_history already exists" AS msg'
);
PREPARE stmt5 FROM @query5; EXECUTE stmt5; DEALLOCATE PREPARE stmt5;

SET @query6 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='current_medications') = 0,
  'ALTER TABLE patients ADD COLUMN current_medications TEXT AFTER medical_history',
  'SELECT "current_medications already exists" AS msg'
);
PREPARE stmt6 FROM @query6; EXECUTE stmt6; DEALLOCATE PREPARE stmt6;

SET @query7 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='emergency_contact_name') = 0,
  'ALTER TABLE patients ADD COLUMN emergency_contact_name VARCHAR(100) AFTER current_medications',
  'SELECT "emergency_contact_name already exists" AS msg'
);
PREPARE stmt7 FROM @query7; EXECUTE stmt7; DEALLOCATE PREPARE stmt7;

SET @query8 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='emergency_contact_phone') = 0,
  'ALTER TABLE patients ADD COLUMN emergency_contact_phone VARCHAR(20) AFTER emergency_contact_name',
  'SELECT "emergency_contact_phone already exists" AS msg'
);
PREPARE stmt8 FROM @query8; EXECUTE stmt8; DEALLOCATE PREPARE stmt8;

SET @query9 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='emergency_contact_relation') = 0,
  'ALTER TABLE patients ADD COLUMN emergency_contact_relation VARCHAR(50) AFTER emergency_contact_phone',
  'SELECT "emergency_contact_relation already exists" AS msg'
);
PREPARE stmt9 FROM @query9; EXECUTE stmt9; DEALLOCATE PREPARE stmt9;

SET @query10 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='insurance_provider') = 0,
  'ALTER TABLE patients ADD COLUMN insurance_provider VARCHAR(100) AFTER emergency_contact_relation',
  'SELECT "insurance_provider already exists" AS msg'
);
PREPARE stmt10 FROM @query10; EXECUTE stmt10; DEALLOCATE PREPARE stmt10;

SET @query11 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='insurance_policy_number') = 0,
  'ALTER TABLE patients ADD COLUMN insurance_policy_number VARCHAR(50) AFTER insurance_provider',
  'SELECT "insurance_policy_number already exists" AS msg'
);
PREPARE stmt11 FROM @query11; EXECUTE stmt11; DEALLOCATE PREPARE stmt11;

SET @query12 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='insurance_expiry_date') = 0,
  'ALTER TABLE patients ADD COLUMN insurance_expiry_date DATE AFTER insurance_policy_number',
  'SELECT "insurance_expiry_date already exists" AS msg'
);
PREPARE stmt12 FROM @query12; EXECUTE stmt12; DEALLOCATE PREPARE stmt12;

SET @query13 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='occupation') = 0,
  'ALTER TABLE patients ADD COLUMN occupation VARCHAR(100) AFTER insurance_expiry_date',
  'SELECT "occupation already exists" AS msg'
);
PREPARE stmt13 FROM @query13; EXECUTE stmt13; DEALLOCATE PREPARE stmt13;

SET @query14 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='marital_status') = 0,
  'ALTER TABLE patients ADD COLUMN marital_status ENUM("Độc thân", "Đã kết hôn", "Ly hôn", "Góa") DEFAULT "Độc thân" AFTER occupation',
  'SELECT "marital_status already exists" AS msg'
);
PREPARE stmt14 FROM @query14; EXECUTE stmt14; DEALLOCATE PREPARE stmt14;

SET @query15 = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA='hospital_db' AND TABLE_NAME='patients' AND COLUMN_NAME='notes') = 0,
  'ALTER TABLE patients ADD COLUMN notes TEXT AFTER marital_status',
  'SELECT "notes already exists" AS msg'
);
PREPARE stmt15 FROM @query15; EXECUTE stmt15; DEALLOCATE PREPARE stmt15;

SELECT '✅ Migration completed successfully!' AS status;
