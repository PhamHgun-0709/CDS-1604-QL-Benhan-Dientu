const db = require('../db');

async function seedNewDoctorsAndPatients() {
  console.log('🚀 Bắt đầu seed bác sĩ và bệnh nhân mới...');

  try {
    // Password đã hash sẵn cho '123456' (từ database hiện tại)
    const password = '$2b$10$8vZ7YqK0Z8pX0J0K0J0K0uJ0J0K0J0K0J0K0J0K0J0K0J0K0J0K0K';

    // 1. Thêm 3 bác sĩ mới
    const doctors = [
      { username: 'doctor2', full_name: 'BS. Nguyễn Văn Bình', email: 'binhnguyen@hospital.com', phone: '0912345679' },
      { username: 'doctor3', full_name: 'BS. Trần Thị Chi', email: 'chitran@hospital.com', phone: '0912345680' },
      { username: 'doctor4', full_name: 'BS. Lê Hoàng Dũng', email: 'dungle@hospital.com', phone: '0912345681' }
    ];

    for (const doctor of doctors) {
      await db.query(
        `INSERT INTO users (username, password, role, full_name, email, phone) 
         VALUES (?, ?, 'doctor', ?, ?, ?)`,
        [doctor.username, password, doctor.full_name, doctor.email, doctor.phone]
      );
      console.log(`✅ Đã thêm bác sĩ: ${doctor.full_name}`);
    }

    // 2. Thêm 4 bệnh nhân mới
    const patients = [
      { username: 'patient2', full_name: 'Phạm Văn E', email: 'phamvane@email.com', phone: '0912345682' },
      { username: 'patient3', full_name: 'Hoàng Thị F', email: 'hoangthif@email.com', phone: '0912345683' },
      { username: 'patient4', full_name: 'Vũ Văn G', email: 'vuvang@email.com', phone: '0912345684' },
      { username: 'patient5', full_name: 'Đặng Thị H', email: 'dangthih@email.com', phone: '0912345685' }
    ];

    for (const patient of patients) {
      await db.query(
        `INSERT INTO users (username, password, role, full_name, email, phone) 
         VALUES (?, ?, 'user', ?, ?, ?)`,
        [patient.username, password, patient.full_name, patient.email, patient.phone]
      );
      console.log(`✅ Đã thêm bệnh nhân: ${patient.full_name}`);
    }

    // 3. Thêm thông tin chi tiết bệnh nhân vào bảng patients
    const patientDetails = [
      {
        name: 'Phạm Văn E',
        dob: '1992-05-15',
        gender: 'Nam',
        address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
        phone: '0912345682',
        email: 'phamvane@email.com',
        bloodType: 'O+',
        allergies: 'Không',
        medicalHistory: 'Khỏe mạnh'
      },
      {
        name: 'Hoàng Thị F',
        dob: '1988-08-20',
        gender: 'Nữ',
        address: '456 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
        phone: '0912345683',
        email: 'hoangthif@email.com',
        bloodType: 'A+',
        allergies: 'Thuốc kháng sinh Penicillin',
        medicalHistory: 'Tiền sử dị ứng'
      },
      {
        name: 'Vũ Văn G',
        dob: '1995-12-10',
        gender: 'Nam',
        address: '789 Đường Nguyễn Huệ, Quận 1, TP.HCM',
        phone: '0912345684',
        email: 'vuvang@email.com',
        bloodType: 'B+',
        allergies: 'Không',
        medicalHistory: 'Khỏe mạnh'
      },
      {
        name: 'Đặng Thị H',
        dob: '1990-03-25',
        gender: 'Nữ',
        address: '321 Đường Hai Bà Trưng, Quận 3, TP.HCM',
        phone: '0912345685',
        email: 'dangthih@email.com',
        bloodType: 'AB+',
        allergies: 'Hải sản',
        medicalHistory: 'Tiền sử dị ứng thực phẩm'
      }
    ];

    for (const patient of patientDetails) {
      await db.query(
        `INSERT INTO patients (name, dob, gender, address, phone, email, blood_type, allergies, medical_history) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [patient.name, patient.dob, patient.gender, patient.address, patient.phone, 
         patient.email, patient.bloodType, patient.allergies, patient.medicalHistory]
      );
      console.log(`✅ Đã thêm chi tiết bệnh nhân: ${patient.name}`);
    }

    // 4. Thêm hồ sơ bệnh án cho các bệnh nhân mới với bác sĩ khác nhau
    const [allPatients] = await db.query('SELECT id, name FROM patients ORDER BY id DESC LIMIT 4');
    const [allDoctors] = await db.query('SELECT id, full_name FROM users WHERE role = "doctor"');

    const records = [
      {
        patient_id: allPatients[0].id,
        doctor_id: allDoctors[1]?.id || allDoctors[0].id, // BS. Nguyễn Văn Bình
        diagnosis: 'Viêm họng cấp',
        treatment: 'Kháng sinh, nghỉ ngơi, uống nhiều nước',
        notes: 'Tái khám sau 5 ngày'
      },
      {
        patient_id: allPatients[1].id,
        doctor_id: allDoctors[2]?.id || allDoctors[0].id, // BS. Trần Thị Chi
        diagnosis: 'Dị ứng da',
        treatment: 'Thuốc chống dị ứng, tránh tiếp xúc với chất gây dị ứng',
        notes: 'Kiêng Penicillin'
      },
      {
        patient_id: allPatients[2].id,
        doctor_id: allDoctors[3]?.id || allDoctors[0].id, // BS. Lê Hoàng Dũng
        diagnosis: 'Đau đầu, chóng mặt',
        treatment: 'Thuốc giảm đau, nghỉ ngơi',
        notes: 'Theo dõi triệu chứng'
      },
      {
        patient_id: allPatients[3].id,
        doctor_id: allDoctors[1]?.id || allDoctors[0].id, // BS. Nguyễn Văn Bình
        diagnosis: 'Dị ứng thực phẩm',
        treatment: 'Thuốc chống dị ứng, kiêng hải sản',
        notes: 'Tránh xa nguồn gây dị ứng'
      }
    ];

    for (const record of records) {
      const [result] = await db.query(
        `INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, notes) 
         VALUES (?, ?, ?, ?, ?)`,
        [record.patient_id, record.doctor_id, record.diagnosis, record.treatment, record.notes]
      );
      
      const doctorName = allDoctors.find(d => d.id === record.doctor_id)?.full_name;
      const patientName = allPatients.find(p => p.id === record.patient_id)?.name;
      console.log(`✅ Đã thêm hồ sơ: ${patientName} - Bác sĩ: ${doctorName}`);
    }

    console.log('✅ Hoàn thành seed dữ liệu mới!');
    console.log('📊 Tổng kết:');
    console.log('   - 3 bác sĩ mới');
    console.log('   - 4 bệnh nhân mới');
    console.log('   - 4 hồ sơ bệnh án mới');
    
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedNewDoctorsAndPatients()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error:', err);
      process.exit(1);
    });
}

module.exports = { seedNewDoctorsAndPatients };
