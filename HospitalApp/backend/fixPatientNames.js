const db = require('./db');

async function fixPatientNames() {
  console.log('🔧 Sửa tên bệnh nhân...');
  
  try {
    // Cập nhật patient1
    await db.query(
      "UPDATE users SET full_name = ? WHERE username = 'patient1'",
      ['Nguyễn Văn Minh']
    );
    console.log('✅ Đã sửa tên patient1');
    
    // Cập nhật patient2
    await db.query(
      "UPDATE users SET full_name = ? WHERE username = 'patient2'",
      ['Trần Thị Lan']
    );
    console.log('✅ Đã sửa tên patient2');
    
    // Kiểm tra lại
    const [patients] = await db.query(
      "SELECT id, username, full_name, email FROM users WHERE role = 'user'"
    );
    
    console.log('\n📊 Danh sách bệnh nhân sau khi cập nhật:');
    console.table(patients);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

fixPatientNames();
