const db = require('./db');

async function checkData() {
  console.log('=== KIỂM TRA USERS ===');
  const [users] = await db.query('SELECT id, username, role, full_name, email FROM users ORDER BY id');
  console.table(users);
  
  console.log('\n=== KIỂM TRA MEDICAL_RECORDS ===');
  const [records] = await db.query(`
    SELECT 
      mr.id, 
      mr.patient_id, 
      mr.doctor_id,
      mr.diagnosis,
      u.full_name as doctor_name,
      p.name as patient_name
    FROM medical_records mr
    LEFT JOIN users u ON mr.doctor_id = u.id
    LEFT JOIN patients p ON mr.patient_id = p.id
    ORDER BY mr.id DESC
    LIMIT 10
  `);
  console.table(records);
  
  process.exit(0);
}

checkData().catch(err => {
  console.error(err);
  process.exit(1);
});
