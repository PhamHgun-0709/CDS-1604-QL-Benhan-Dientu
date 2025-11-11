const db = require('./db');

async function addMoreDoctors() {
  console.log('🔧 Thêm 2 bác sĩ mới...');
  
  try {
    // Password đã hash cho '123456'
    const password = '$2b$10$8vZ7YqK0Z8pX0J0K0J0K0uJ0J0K0J0K0J0K0J0K0J0K0J0K0J0K0K';
    
    // Thêm doctor3
    await db.query(
      `INSERT INTO users (username, password, role, full_name, email, phone) 
       VALUES (?, ?, 'doctor', ?, ?, ?)`,
      ['doctor3', password, 'BS. Phạm Thị Mai', 'mai.doctor@hospital.vn', '0912345678']
    );
    console.log('✅ Đã thêm doctor3: BS. Phạm Thị Mai');
    
    // Thêm doctor4
    await db.query(
      `INSERT INTO users (username, password, role, full_name, email, phone) 
       VALUES (?, ?, 'doctor', ?, ?, ?)`,
      ['doctor4', password, 'BS. Hoàng Văn Nam', 'nam.doctor@hospital.vn', '0912345677']
    );
    console.log('✅ Đã thêm doctor4: BS. Hoàng Văn Nam');
    
    // Kiểm tra lại
    const [doctors] = await db.query(
      "SELECT id, username, full_name, email, phone FROM users WHERE role = 'doctor' ORDER BY id"
    );
    
    console.log('\n📊 Danh sách bác sĩ sau khi thêm:');
    console.table(doctors);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ Bác sĩ đã tồn tại, bỏ qua...');
      process.exit(0);
    }
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

addMoreDoctors();
