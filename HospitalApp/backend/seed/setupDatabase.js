const db = require('../db');
const bcrypt = require('bcryptjs');

/**
 * Script khởi tạo Database và Seed Data
 * Chạy: node setupDatabase.js
 */

async function createTables() {
  console.log('📋 Đang tạo các bảng...');
  
  return new Promise((resolve, reject) => {
    // Tạo bảng users
    db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'doctor', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `, (err) => {
      if (err) { reject(err); return; }
      console.log('✅ Bảng users đã tạo');
      
      // Tạo bảng patients
      db.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT DEFAULT NULL,
          name VARCHAR(100) NOT NULL,
          dob DATE,
          gender ENUM('Nam', 'Nữ', 'Khác') DEFAULT 'Nam',
          address VARCHAR(255),
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_name (name),
          INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `, (err) => {
        if (err) { reject(err); return; }
        console.log('✅ Bảng patients đã tạo');
        
        // Tạo bảng doctors
        db.query(`
          CREATE TABLE IF NOT EXISTS doctors (
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
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `, (err) => {
          if (err) { reject(err); return; }
          console.log('✅ Bảng doctors đã tạo');
          
          // Tạo bảng medical_records
          db.query(`
            CREATE TABLE IF NOT EXISTS medical_records (
              id INT AUTO_INCREMENT PRIMARY KEY,
              patient_id INT NOT NULL,
              doctor_id INT DEFAULT NULL,
              diagnosis TEXT NOT NULL,
              treatment TEXT,
              notes TEXT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
              FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
              INDEX idx_patient_id (patient_id),
              INDEX idx_doctor_id (doctor_id),
              INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `, (err) => {
            if (err) { reject(err); return; }
            console.log('✅ Bảng medical_records đã tạo');
            
            // Tạo bảng prescriptions
            db.query(`
              CREATE TABLE IF NOT EXISTS prescriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                record_id INT NOT NULL,
                medicine_name VARCHAR(200) NOT NULL,
                dosage VARCHAR(100),
                frequency VARCHAR(100),
                duration VARCHAR(50),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
                INDEX idx_record_id (record_id)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `, (err) => {
              if (err) { reject(err); return; }
              console.log('✅ Bảng prescriptions đã tạo');
              
              // Tạo bảng lab_results
              db.query(`
                CREATE TABLE IF NOT EXISTS lab_results (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  record_id INT NOT NULL,
                  test_name VARCHAR(200) NOT NULL,
                  result TEXT,
                  test_date DATE,
                  notes TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
                  INDEX idx_record_id (record_id),
                  INDEX idx_test_date (test_date)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
              `, (err) => {
                if (err) { reject(err); return; }
                console.log('✅ Bảng lab_results đã tạo');
                resolve();
              });
            });
          });
        });
      });
    });
  });
}

async function seedData() {
  console.log('\n🌱 Đang seed dữ liệu mẫu...');
  
  // Hash password mặc định
  const defaultPassword = await bcrypt.hash('Admin@123', 10);
  
  return new Promise(async (resolve, reject) => {
    // 1. Tạo tài khoản admin
    db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = ?',
      ['admin', defaultPassword, 'admin', 'admin'],
      (err) => {
        if (err) { reject(err); return; }
        console.log('✅ Tạo tài khoản admin (username: admin, password: Admin@123)');
        
        // 2. Tạo tài khoản bác sĩ
        db.query(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?), (?, ?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role)',
          ['doctor1', defaultPassword, 'doctor', 'doctor2', defaultPassword, 'doctor'],
          async (err, result) => {
            if (err) { reject(err); return; }
            console.log('✅ Tạo 2 tài khoản bác sĩ (doctor1, doctor2, password: Admin@123)');
            
            // Lấy ID của bác sĩ để tạo bảng doctors
            db.query('SELECT id FROM users WHERE username IN (?, ?)', ['doctor1', 'doctor2'], (err, doctors) => {
              if (err) { reject(err); return; }
              
              if (doctors.length >= 2) {
                db.query(
                  `INSERT INTO doctors (user_id, full_name, specialization, phone, email) VALUES 
                   (?, 'Bác sĩ Nguyễn Văn A', 'Tim mạch', '0901234567', 'doctor1@hospital.com'),
                   (?, 'Bác sĩ Trần Thị B', 'Nội khoa', '0912345678', 'doctor2@hospital.com')
                   ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
                  [doctors[0].id, doctors[1].id],
                  (err) => {
                    if (err) console.log('⚠️  Thông tin bác sĩ đã tồn tại');
                    else console.log('✅ Tạo thông tin chi tiết cho bác sĩ');
                  }
                );
              }
            });
            
            // 3. Tạo tài khoản bệnh nhân mẫu
            db.query(
              'INSERT INTO users (username, password, role) VALUES (?, ?, ?), (?, ?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role)',
              ['patient1', defaultPassword, 'user', 'patient2', defaultPassword, 'user'],
              (err) => {
                if (err) { reject(err); return; }
                console.log('✅ Tạo 2 tài khoản bệnh nhân (patient1, patient2, password: Admin@123)');
                
                // 4. Tạo dữ liệu bệnh nhân
                const patients = [
                  ['Nguyễn Văn An', '1991-04-12', 'Nam', '12 Nguyễn Trãi, Q1, TP.HCM', '0901234567'],
                  ['Trần Thị Bình', '1998-01-21', 'Nữ', '45 Lê Lợi, Q3, TP.HCM', '0912345678'],
                  ['Lê Văn Chi', '1978-09-02', 'Nam', '8 Trần Phú, Q5, TP.HCM', '0987654321'],
                  ['Phạm Thị Dung', '2013-06-15', 'Nữ', '22 Hai Bà Trưng, Q1, TP.HCM', '0321234567'],
                  ['Hoàng Văn Hạnh', '1968-11-05', 'Nam', '77 Tôn Đức Thắng, Q1, TP.HCM', '0332345678']
                ];
                
                const values = patients.map(p => `('${p[0]}', '${p[1]}', '${p[2]}', '${p[3]}', '${p[4]}')`).join(',');
                db.query(
                  `INSERT INTO patients (name, dob, gender, address, phone) VALUES ${values}`,
                  (err) => {
                    if (err) { console.log('⚠️  Bệnh nhân mẫu đã tồn tại'); }
                    else { console.log('✅ Tạo 5 bệnh nhân mẫu'); }
                    resolve();
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

async function run() {
  try {
    console.log('🏥 KHỞI TẠO DATABASE - HỆ THỐNG QUẢN LÝ BỆNH VIỆN\n');
    console.log('='.repeat(60));
    
    await createTables();
    await seedData();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ HOÀN TẤT! Database đã sẵn sàng sử dụng\n');
    console.log('📝 TÀI KHOẢN MẪU:');
    console.log('   🔑 Admin: username=admin, password=Admin@123');
    console.log('   👨‍⚕️ Bác sĩ 1: username=doctor1, password=Admin@123');
    console.log('   👨‍⚕️ Bác sĩ 2: username=doctor2, password=Admin@123');
    console.log('   👤 Bệnh nhân 1: username=patient1, password=Admin@123');
    console.log('   👤 Bệnh nhân 2: username=patient2, password=Admin@123');
    console.log('\n💡 Người dùng ĐĂNG KÝ mới sẽ có role = "user" (bệnh nhân)');
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ LỖI:', error);
    process.exit(1);
  }
}

// Chạy script
if (require.main === module) {
  run();
}

module.exports = { createTables, seedData };
