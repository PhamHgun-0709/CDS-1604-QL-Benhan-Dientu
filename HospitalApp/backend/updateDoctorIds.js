const db = require('./db');

async function updateDoctorIds() {
  console.log('🔧 Cập nhật doctor_id cho medical_records...');
  
  try {
    // Lấy danh sách bác sĩ
    const [doctors] = await db.query('SELECT id FROM users WHERE role = "doctor" ORDER BY id');
    
    if (doctors.length === 0) {
      console.log('❌ Không có bác sĩ nào trong hệ thống');
      process.exit(1);
    }
    
    console.log(`✅ Tìm thấy ${doctors.length} bác sĩ`);
    
    // Lấy tất cả records chưa có doctor_id
    const [records] = await db.query('SELECT id FROM medical_records WHERE doctor_id IS NULL');
    
    console.log(`📝 Có ${records.length} hồ sơ cần cập nhật`);
    
    // Phân bổ ngẫu nhiên bác sĩ cho mỗi record
    for (let i = 0; i < records.length; i++) {
      const randomDoctor = doctors[i % doctors.length]; // Round-robin
      await db.query(
        'UPDATE medical_records SET doctor_id = ? WHERE id = ?',
        [randomDoctor.id, records[i].id]
      );
    }
    
    console.log(`✅ Đã cập nhật ${records.length} hồ sơ`);
    
    // Kiểm tra lại
    const [updated] = await db.query(`
      SELECT 
        mr.id,
        mr.diagnosis,
        u.full_name as doctor_name
      FROM medical_records mr
      LEFT JOIN users u ON mr.doctor_id = u.id
      ORDER BY mr.id DESC
      LIMIT 10
    `);
    
    console.log('\n📊 Kết quả sau khi cập nhật:');
    console.table(updated);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

updateDoctorIds();
