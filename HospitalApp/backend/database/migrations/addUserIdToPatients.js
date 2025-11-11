const db = require('../../db');

async function addUserIdToPatients() {
  try {
    console.log('🔄 Bắt đầu migration: Add user_id to patients...');
    
    // Check if user_id column exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'hospital_management' 
      AND TABLE_NAME = 'patients' 
      AND COLUMN_NAME = 'user_id'
    `);
    
    if (columns.length > 0) {
      console.log('ℹ️  Column user_id đã tồn tại, bỏ qua...');
      return;
    }
    
    // Add user_id column
    await db.query(`
      ALTER TABLE patients 
      ADD COLUMN user_id INT AFTER id,
      ADD INDEX idx_user_id (user_id)
    `);
    
    console.log('✅ Đã thêm column user_id vào bảng patients');
    
    // Optional: Add foreign key constraint
    // Uncomment if you want strict referential integrity
    /*
    await db.query(`
      ALTER TABLE patients 
      ADD CONSTRAINT fk_patient_user 
      FOREIGN KEY (user_id) REFERENCES users(id) 
      ON DELETE SET NULL
    `);
    console.log('✅ Đã thêm foreign key constraint');
    */
    
    // Show structure
    const [structure] = await db.query('DESCRIBE patients');
    console.log('\n📋 Cấu trúc bảng patients sau migration:');
    console.table(structure);
    
    console.log('\n✅ Migration hoàn tất!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    process.exit();
  }
}

// Run migration
addUserIdToPatients();
