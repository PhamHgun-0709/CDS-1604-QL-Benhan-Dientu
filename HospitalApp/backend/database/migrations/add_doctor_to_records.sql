-- Migration: Add doctor_id to medical_records table
-- Created: 2025-11-11
-- Description: Add doctor_id column to track which doctor examined the patient

ALTER TABLE medical_records 
ADD COLUMN doctor_id INT NULL AFTER patient_id,
ADD CONSTRAINT fk_record_doctor 
  FOREIGN KEY (doctor_id) REFERENCES users(id) 
  ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);

-- Update existing records with a default doctor (doctor1 = id 2)
UPDATE medical_records 
SET doctor_id = 2 
WHERE doctor_id IS NULL;

SELECT 'Migration completed: doctor_id added to medical_records' as status;
