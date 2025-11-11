const db = require('../db');


function getRecordIds(callback) {
  db.query('SELECT id FROM medical_records', (err, results) => {
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

const tests = ['CBC', 'Blood Sugar', 'Lipid Panel', 'X-Ray', 'ECG', 'Urinalysis'];
const results = ['Normal', 'Abnormal', 'High', 'Low', 'Pending'];

function seedLabs(minPerRecord = 0, maxPerRecord = 2) {
  getRecordIds((err, ids) => {
    if (err) {
      console.error('Error getting record ids', err);
      process.exit(1);
    }
    if (!ids.length) {
      console.log('No records found to create lab results for.');
      process.exit(0);
    }

    const values = [];
    ids.forEach(id => {
      const count = Math.floor(Math.random() * (maxPerRecord - minPerRecord + 1)) + minPerRecord;
      for (let i = 0; i < count; i++) {
        values.push([id, tests[Math.floor(Math.random() * tests.length)], results[Math.floor(Math.random() * results.length)], null]);
      }
    });

    if (!values.length) {
      console.log('No lab results to insert (counts were zero).');
      process.exit(0);
    }

    const sql = 'INSERT INTO lab_results (record_id, test_name, result, file_url) VALUES ?';
    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error('Error inserting lab results:', err);
        process.exit(1);
      }
      console.log(`Inserted ${result.affectedRows} lab_results`);
      process.exit(0);
    });
  });
}

if (require.main === module) {
  const min = process.argv[2] ? parseInt(process.argv[2],10) : 0;
  const max = process.argv[3] ? parseInt(process.argv[3],10) : 2;
  seedLabs(min, max);
}

module.exports = { seedLabs };
