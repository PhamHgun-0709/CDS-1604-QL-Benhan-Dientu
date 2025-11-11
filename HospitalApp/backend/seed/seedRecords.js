const db = require('../db');

function getPatientIds(callback) {
  db.query('SELECT id FROM patients', (err, results) => {
    if (err) return callback(err);
    const ids = results.map(r => r.id);
    callback(null, ids);
  });
}

function randomDateTimeWithinYear() {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  const end = new Date();
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().slice(0,19).replace('T',' ');
}

const diagnoses = ['Flu', 'Hypertension', 'Diabetes', 'Fracture', 'Allergy', 'Infection', 'Asthma', 'Gastritis'];

function seedRecords(minPerPatient = 0, maxPerPatient = 2) {
  getPatientIds((err, ids) => {
    if (err) {
      console.error('Error getting patient ids', err);
      process.exit(1);
    }
    if (!ids.length) {
      console.log('No patients found to create records for.');
      process.exit(0);
    }

    const values = [];
    ids.forEach(id => {
      const count = Math.floor(Math.random() * (maxPerPatient - minPerPatient + 1)) + minPerPatient;
      for (let i = 0; i < count; i++) {
        // doctor_id left null for synthetic data
        values.push([id, null, diagnoses[Math.floor(Math.random() * diagnoses.length)], randomDateTimeWithinYear()]);
      }
    });

    if (!values.length) {
      console.log('No records to insert (counts were zero).');
      process.exit(0);
    }

    const sql = 'INSERT INTO medical_records (patient_id, doctor_id, diagnosis, created_at) VALUES ?';
    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error('Error inserting records:', err);
        process.exit(1);
      }
      console.log(`Inserted ${result.affectedRows} medical_records`);
      process.exit(0);
    });
  });
}

if (require.main === module) {
  // optional args: min max
  const min = process.argv[2] ? parseInt(process.argv[2],10) : 0;
  const max = process.argv[3] ? parseInt(process.argv[3],10) : 2;
  seedRecords(min, max);
}

module.exports = { seedRecords };
