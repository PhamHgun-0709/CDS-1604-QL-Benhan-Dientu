const db = require('./db');

async function checkPatients() {
  console.log('🔍 Kiểm tra bệnh nhân...');
  
  const [patients] = await db.query(`
    SELECT id, name, email, phone 
    FROM patients 
    WHERE email IN ('patient1@gmail.com', 'patient2@gmail.com') 
       OR phone IN ('0924841016', '0962643773')
  `);
  
  console.table(patients);
  
  if (patients.length === 0) {
    console.log('\n❌ Không tìm thấy bệnh nhân matching với user!');
    console.log('📝 Cần tạo bệnh nhân trong bảng patients...');
  }
  
  process.exit(0);
}

checkPatients();
