const db = require('./db');

async function createRecords() {
  await db.query(
    'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, notes) VALUES (?, ?, ?, ?, ?)',
    [107, 3, 'Khám sức khỏe định kỳ', 'Bình thường', 'Tình trạng sức khỏe tốt']
  );
  
  await db.query(
    'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, treatment, notes) VALUES (?, ?, ?, ?, ?)',
    [108, 4, 'Khám tổng quát', 'Không có vấn đề', 'Sức khỏe tốt']
  );
  
  console.log('✅ Done');
  process.exit(0);
}

createRecords();
