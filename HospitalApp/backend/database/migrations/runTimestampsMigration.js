const mysql = require('mysql2/promise');

async function addTimestamps() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luck2004!',
    database: 'hospital_db'
  });

  console.log('🔧 Migration: Thêm timestamps vào các bảng...');

  try {
    // Helper function để check column tồn tại
    async function columnExists(table, column) {
      const [rows] = await connection.query(
        `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = 'hospital_db' 
         AND TABLE_NAME = ? 
         AND COLUMN_NAME = ?`,
        [table, column]
      );
      return rows[0].count > 0;
    }

    // Helper function để thêm column nếu chưa tồn tại
    async function addColumnIfNotExists(table, column, definition) {
      const exists = await columnExists(table, column);
      if (!exists) {
        await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        console.log(`  ✅ Added ${column} to ${table}`);
      } else {
        console.log(`  ⏭️  ${column} already exists in ${table}`);
      }
    }

    // Thêm timestamps vào users
    console.log('\n📋 Table: users');
    await addColumnIfNotExists('users', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfNotExists('users', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Thêm timestamps vào prescriptions
    console.log('\n📋 Table: prescriptions');
    await addColumnIfNotExists('prescriptions', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfNotExists('prescriptions', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Thêm test_date và timestamps vào lab_results
    console.log('\n📋 Table: lab_results');
    await addColumnIfNotExists('lab_results', 'test_date', 'DATE');
    await addColumnIfNotExists('lab_results', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfNotExists('lab_results', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Thêm timestamps vào medical_records
    console.log('\n📋 Table: medical_records');
    await addColumnIfNotExists('medical_records', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfNotExists('medical_records', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Thêm timestamps vào patients
    console.log('\n📋 Table: patients');
    await addColumnIfNotExists('patients', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfNotExists('patients', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Thêm timestamps vào doctors
    console.log('\n📋 Table: doctors');
    await addColumnIfNotExists('doctors', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    await addColumnIfNotExists('doctors', 'updated_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    console.log('\n✅ Migration hoàn thành!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await connection.end();
  }
}

// Chạy migration
addTimestamps().catch(console.error);
