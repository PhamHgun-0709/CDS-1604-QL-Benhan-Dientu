const db = require('./db');

async function createPatientsForUsers() {
  console.log('🔧 Tạo bệnh nhân trong bảng patients...');
  
  try {
    // Lấy user patients
    const [users] = await db.query(
      "SELECT id, username, full_name, email, phone FROM users WHERE role = 'user'"
    );
    
    console.log(`✅ Tìm thấy ${users.length} user bệnh nhân`);
    
    for (const user of users) {
      // Kiểm tra xem đã có chưa
      const [existing] = await db.query(
        'SELECT id FROM patients WHERE email = ? OR phone = ?',
        [user.email, user.phone]
      );
      
      if (existing.length > 0) {
        console.log(`⚠️ Bỏ qua ${user.username} - đã tồn tại`);
        continue;
      }
      
      // Tạo mới
      await db.query(
        `INSERT INTO patients 
        (name, email, phone, dob, gender, address, blood_type, allergies, medical_history) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.full_name,
          user.email,
          user.phone || '0918179736',
          '2001-09-10',
          'Nam',
          'Địa chỉ mẫu',
          'N/A',
          'Không',
          'Khỏe mạnh'
        ]
      );
      
      console.log(`✅ Đã tạo bệnh nhân: ${user.full_name}`);
    }
    
    // Kiểm tra lại
    const [patients] = await db.query(`
      SELECT p.id, p.name, p.email, p.phone, p.dob
      FROM patients p
      WHERE p.email IN (SELECT email FROM users WHERE role = 'user')
    `);
    
    console.log('\n📊 Danh sách bệnh nhân đã tạo:');
    console.table(patients);
    
    // Tạo vài hồ sơ mẫu
    console.log('\n🔧 Tạo hồ sơ bệnh án mẫu...');
    
    for (const patient of patients) {
      await db.query(
        `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, notes)
         VALUES (?, 3, 'Khám sức khỏe định kỳ', 'Bình thường', 'Tình trạng sức khỏe tốt')`,
        [patient.id]
      );
      console.log(`✅ Đã tạo hồ sơ cho bệnh nhân ID ${patient.id}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

createPatientsForUsers();
