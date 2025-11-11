const mysql = require('mysql2/promise');

async function fillUserData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luck2004!',
    database: 'hospital_db'
  });

  console.log('✏️ Điền dữ liệu mẫu cho các user hiện tại...\n');

  try {
    // Lấy danh sách users hiện tại
    const [users] = await connection.query('SELECT id, username, role FROM users');
    
    console.log(`📊 Tìm thấy ${users.length} users\n`);

    const sampleData = {
      admin: {
        full_name: 'Nguyễn Văn Admin',
        email: 'admin@hospital.vn',
        phone: '0901234567',
        address: '123 Đường Lê Lợi, Phường Hải Châu, Quận Hải Châu, Đà Nẵng',
        date_of_birth: '1985-05-15',
        gender: 'Nam'
      },
      doctor1: {
        full_name: 'Trần Thị Hương',
        email: 'huong.doctor@hospital.vn',
        phone: '0912345678',
        address: '456 Đường Nguyễn Văn Linh, Phường Thạc Gián, Quận Thanh Khê, Đà Nẵng',
        date_of_birth: '1990-08-20',
        gender: 'Nữ'
      },
      doctor2: {
        full_name: 'Lê Minh Tuấn',
        email: 'tuan.doctor@hospital.vn',
        phone: '0923456789',
        address: '789 Đường Trần Phú, Phường Phước Ninh, Quận Hải Châu, Đà Nẵng',
        date_of_birth: '1988-03-10',
        gender: 'Nam'
      },
      user1: {
        full_name: 'Phạm Thị Mai',
        email: 'mai.user@gmail.com',
        phone: '0934567890',
        address: '321 Đường Hoàng Diệu, Phường Bình Hiên, Quận Hải Châu, Đà Nẵng',
        date_of_birth: '1995-12-05',
        gender: 'Nữ'
      },
      user2: {
        full_name: 'Võ Văn Bình',
        email: 'binh.user@gmail.com',
        phone: '0945678901',
        address: '654 Đường Điện Biên Phủ, Phường Chính Gián, Quận Thanh Khê, Đà Nẵng',
        date_of_birth: '1992-07-18',
        gender: 'Nam'
      },
      user3: {
        full_name: 'Đặng Thị Lan',
        email: 'lan.user@gmail.com',
        phone: '0956789012',
        address: '987 Đường Hùng Vương, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng',
        date_of_birth: '1998-11-22',
        gender: 'Nữ'
      }
    };

    for (const user of users) {
      let data = sampleData[user.username];
      
      // Nếu không có data mẫu cho username này, tạo data generic
      if (!data) {
        const isDoctor = user.role === 'doctor';
        const isAdmin = user.role === 'admin';
        const genders = ['Nam', 'Nữ'];
        const randomGender = genders[Math.floor(Math.random() * genders.length)];
        
        data = {
          full_name: `${user.username.charAt(0).toUpperCase() + user.username.slice(1)} Full Name`,
          email: `${user.username}@${isAdmin || isDoctor ? 'hospital.vn' : 'gmail.com'}`,
          phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          address: `Số ${Math.floor(Math.random() * 999) + 1}, Đường ABC, Phường XYZ, Quận 123, Đà Nẵng`,
          date_of_birth: `19${85 + Math.floor(Math.random() * 15)}-0${Math.floor(Math.random() * 9) + 1}-${10 + Math.floor(Math.random() * 18)}`,
          gender: randomGender
        };
      }

      await connection.query(
        `UPDATE users SET 
          full_name = ?,
          email = ?,
          phone = ?,
          address = ?,
          date_of_birth = ?,
          gender = ?
         WHERE id = ?`,
        [data.full_name, data.email, data.phone, data.address, data.date_of_birth, data.gender, user.id]
      );

      console.log(`✅ Updated: ${user.username.padEnd(15)} → ${data.full_name}`);
    }

    console.log('\n✅ Hoàn thành! Đã điền dữ liệu cho tất cả users');

    // Hiển thị kết quả
    console.log('\n📋 Dữ liệu sau khi update:');
    const [updated] = await connection.query('SELECT id, username, full_name, email, phone, gender FROM users ORDER BY id');
    console.log('='.repeat(120));
    console.log('ID | Username'.padEnd(20) + '| Full Name'.padEnd(30) + '| Email'.padEnd(35) + '| Phone'.padEnd(15) + '| Gender');
    console.log('='.repeat(120));
    updated.forEach(u => {
      console.log(`${u.id.toString().padEnd(2)} | ${u.username.padEnd(17)} | ${u.full_name.padEnd(28)} | ${u.email.padEnd(33)} | ${u.phone.padEnd(13)} | ${u.gender}`);
    });
    console.log('='.repeat(120));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

fillUserData().catch(console.error);
