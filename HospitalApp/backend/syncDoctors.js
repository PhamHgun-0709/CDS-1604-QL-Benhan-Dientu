const db = require('./db');

async function syncDoctorsTable() {
  console.log('🔧 Đồng bộ bảng doctors...');
  
  try {
    // 1. Kiểm tra bảng doctors có tồn tại không
    const [tables] = await db.query("SHOW TABLES LIKE 'doctors'");
    
    if (tables.length === 0) {
      console.log('📝 Tạo bảng doctors...');
      await db.query(`
        CREATE TABLE doctors (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          full_name VARCHAR(100) NOT NULL,
          specialization VARCHAR(100),
          phone VARCHAR(20),
          email VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_specialization (specialization)
        )
      `);
      console.log('✅ Đã tạo bảng doctors');
    }
    
    // 2. Lấy tất cả users có role = 'doctor'
    const [doctorUsers] = await db.query(`
      SELECT id, username, full_name, email, phone 
      FROM users 
      WHERE role = 'doctor'
      ORDER BY id
    `);
    
    console.log(`✅ Tìm thấy ${doctorUsers.length} bác sĩ trong bảng users`);
    
    // 3. Sync vào bảng doctors
    for (const user of doctorUsers) {
      // Check xem đã tồn tại chưa
      const [existing] = await db.query(
        'SELECT id FROM doctors WHERE user_id = ?',
        [user.id]
      );
      
      if (existing.length > 0) {
        console.log(`⚠️ Bỏ qua ${user.username} - đã tồn tại`);
        continue;
      }
      
      // Insert vào doctors
      await db.query(
        `INSERT INTO doctors (user_id, full_name, specialization, phone, email)
         VALUES (?, ?, ?, ?, ?)`,
        [user.id, user.full_name, 'Đa khoa', user.phone, user.email]
      );
      
      console.log(`✅ Đã thêm ${user.full_name} vào bảng doctors`);
    }
    
    // 4. Kiểm tra lại
    const [doctors] = await db.query(`
      SELECT d.id, d.user_id, d.full_name, d.specialization, u.username
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      ORDER BY d.id
    `);
    
    console.log('\n📊 Danh sách bác sĩ trong bảng doctors:');
    console.table(doctors);
    
    // 5. Fix foreign key trong medical_records
    console.log('\n🔧 Kiểm tra foreign key của medical_records...');
    
    const [fks] = await db.query(`
      SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'medical_records' 
        AND COLUMN_NAME = 'doctor_id'
        AND CONSTRAINT_SCHEMA = DATABASE()
    `);
    
    if (fks.length > 0) {
      const fk = fks[0];
      if (fk.REFERENCED_TABLE_NAME === 'users') {
        console.log('⚠️ Foreign key đang reference users, cần sửa lại...');
        
        // Drop old FK
        await db.query(`ALTER TABLE medical_records DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
        console.log('✅ Đã xóa FK cũ');
        
        // Cập nhật doctor_id từ user_id sang doctor.id
        console.log('📝 Cập nhật doctor_id...');
        const [records] = await db.query('SELECT id, doctor_id FROM medical_records WHERE doctor_id IS NOT NULL');
        
        for (const record of records) {
          const [doctor] = await db.query('SELECT id FROM doctors WHERE user_id = ?', [record.doctor_id]);
          if (doctor.length > 0) {
            await db.query('UPDATE medical_records SET doctor_id = ? WHERE id = ?', [doctor[0].id, record.id]);
          }
        }
        console.log(`✅ Đã cập nhật ${records.length} records`);
        
        // Add new FK
        await db.query(`
          ALTER TABLE medical_records
          ADD CONSTRAINT fk_record_doctor
          FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
        `);
        console.log('✅ Đã thêm FK mới reference doctors');
      } else {
        console.log('✅ Foreign key đã đúng, reference doctors table');
      }
    }
    
    console.log('\n✅ Hoàn thành đồng bộ!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

syncDoctorsTable();
