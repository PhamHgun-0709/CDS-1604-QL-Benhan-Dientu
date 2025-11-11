const db = require('../db');

function getRecordIds(callback) {
  db.query('SELECT id FROM medical_records', (err, results) => {
    if (err) return callback(err);
    const ids = results.map(r => r.id);
    callback(null, ids);
  });
}

function randomDateWithinYear() {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  const end = new Date();
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().slice(0,10);
}

const meds = ['Paracetamol', 'Amoxicillin', 'Metformin', 'Lisinopril', 'Omeprazole', 'Salbutamol'];
const dosages = ['500mg', '250mg', '1000mg', '10mg', '20mg', '2 puffs'];

function seedPrescriptions(minPerRecord = 0, maxPerRecord = 2) {
  getRecordIds((err, ids) => {
    if (err) {
      console.error('Error getting record ids', err);
      process.exit(1);
    }
    if (!ids.length) {
      console.log('No records found to create prescriptions for.');
      process.exit(0);
    }

    const values = [];
    ids.forEach(id => {
      const count = Math.floor(Math.random() * (maxPerRecord - minPerRecord + 1)) + minPerRecord;
      for (let i = 0; i < count; i++) {
        values.push([id, meds[Math.floor(Math.random() * meds.length)], dosages[Math.floor(Math.random() * dosages.length)], null]);
      }
    });

    if (!values.length) {
      console.log('No prescriptions to insert (counts were zero).');
      process.exit(0);
    }

    const sql = 'INSERT INTO prescriptions (record_id, medicine_name, dosage, note) VALUES ?';
    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error('Error inserting prescriptions:', err);
        process.exit(1);
      }
      console.log(`Inserted ${result.affectedRows} prescriptions`);
      process.exit(0);
    });
  });
}

if (require.main === module) {
  const min = process.argv[2] ? parseInt(process.argv[2],10) : 0;
  const max = process.argv[3] ? parseInt(process.argv[3],10) : 2;
  seedPrescriptions(min, max);
}

module.exports = { seedPrescriptions };
