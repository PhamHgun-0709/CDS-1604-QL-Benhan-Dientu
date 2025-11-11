-- Migration: Add user_id to patients table
-- Purpose: Link patients with users for authentication and data filtering
-- Date: 2025-11-11

-- Add user_id column
ALTER TABLE patients 
ADD COLUMN user_id INT AFTER id,
ADD INDEX idx_user_id (user_id);

-- Add foreign key constraint (optional - comment out if you want loose coupling)
-- ALTER TABLE patients 
-- ADD CONSTRAINT fk_patient_user 
-- FOREIGN KEY (user_id) REFERENCES users(id) 
-- ON DELETE SET NULL;

-- Verify the change
DESCRIBE patients;

-- Check existing data
SELECT id, name, user_id FROM patients LIMIT 5;
