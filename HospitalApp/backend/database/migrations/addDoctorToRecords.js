const db = require('../../db');

async function addDoctorToRecords() {
  console.log('🚀 Bắt đầu migration: Thêm doctor_id vào medical_records...');

  try {
    // 1. Add doctor_id column
    console.log('📝 Thêm cột doctor_id...');
    await db.query(`
      ALTER TABLE medical_records 
      ADD COLUMN doctor_id INT NULL AFTER patient_id
    `);
    console.log('✅ Đã thêm cột doctor_id');

    // 2. Add foreign key constraint
    console.log('📝 Thêm ràng buộc foreign key...');
    await db.query(`
      ALTER TABLE medical_records
      ADD CONSTRAINT fk_record_doctor 
        FOREIGN KEY (doctor_id) REFERENCES users(id) 
        ON DELETE SET NULL
    `);
    console.log('✅ Đã thêm foreign key constraint');

    // 3. Add index for better performance
    console.log('📝 Thêm index...');
    await db.query(`
      CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id)
    `);
    console.log('✅ Đã thêm index');

    // 4. Update existing records with default doctor (doctor1 = id 2)
    console.log('📝 Cập nhật dữ liệu hiện có...');
    await db.query(`
      UPDATE medical_records 
      SET doctor_id = 2 
      WHERE doctor_id IS NULL
    `);
    console.log('✅ Đã cập nhật dữ liệu hiện có');

    console.log('✅ Migration hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi migration:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addDoctorToRecords()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

module.exports = { addDoctorToRecords };
