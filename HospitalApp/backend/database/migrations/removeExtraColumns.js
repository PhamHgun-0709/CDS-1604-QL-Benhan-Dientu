const mysql = require('mysql2/promise');

async function removeExtraColumns() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luck2004!',
    database: 'hospital_db'
  });

  console.log('🗑️  Xóa 27 cột thông tin vừa thêm...\n');

  try {
    const columnsToRemove = [
      // Thông tin khẩn cấp
      'emergency_contact_name',
      'emergency_contact_phone',
      'emergency_contact_relation',
      // Bảo hiểm
      'insurance_number',
      'insurance_provider',
      'insurance_expiry_date',
      // Nhận dạng
      'id_card_number',
      'nationality',
      'ethnicity',
      // Chuyên môn
      'specialization',
      'license_number',
      'department',
      'position',
      'education_level',
      'years_of_experience',
      // Tài khoản
      'is_active',
      'is_verified',
      'email_verified_at',
      'last_login_at',
      'last_login_ip',
      // Khác
      'bio',
      'language_preference',
      'timezone',
      'notification_preferences',
      // Metadata
      'deleted_at',
      'deleted_by',
      'notes'
    ];

    console.log(`📋 Sẽ xóa ${columnsToRemove.length} cột:\n`);
    
    for (const column of columnsToRemove) {
      try {
        await connection.query(`ALTER TABLE users DROP COLUMN ${column}`);
        console.log(`  ✅ Đã xóa: ${column}`);
      } catch (err) {
        if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log(`  ⏭️  Cột ${column} không tồn tại, bỏ qua`);
        } else {
          console.log(`  ❌ Lỗi khi xóa ${column}:`, err.message);
        }
      }
    }

    console.log('\n✅ Đã xóa xong!');
    
    // Show remaining columns
    console.log('\n📋 Các cột còn lại trong bảng users:');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'hospital_db' AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('='.repeat(60));
    columns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME.padEnd(30)} ${col.DATA_TYPE}`);
    });
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

removeExtraColumns().catch(console.error);
