const db = require('../db');

// Generate 100 realistic-looking patient records
const firstNames = [
  'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Vo', 'Dang', 'Bui', 'Do',
  'Phan', 'Trinh', 'Ngo', 'Dinh', 'Ly'
];

const givenNames = [
  'An', 'Binh', 'Chi', 'Dung', 'Hanh', 'Hanh2', 'Hung', 'Khanh', 'Lan', 'Linh',
  'Minh', 'Nam', 'Nga', 'Ngoc', 'Phong', 'Quang', 'Son', 'Tam', 'Trang', 'Tuan'
];

function randomName() {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const g = givenNames[Math.floor(Math.random() * givenNames.length)];
  return `${f} ${g}`;
}

function randomAge() {
  // Ages between 0 and 89
  return Math.floor(Math.random() * 90);
}

function dobFromAge(age) {
  const today = new Date();
  const year = today.getFullYear() - age;
  // random month/day
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  const d = new Date(year, month, day);
  return d.toISOString().slice(0,10);
}

function randomGender() {
  // map to table enum 'Nam' / 'Nữ'
  return Math.random() < 0.5 ? 'Nam' : 'Nữ';
}

function randomPhone() {
  const prefix = ['090','091','098','032','033','034','035','036','037','038','039'];
  const p = prefix[Math.floor(Math.random() * prefix.length)];
  let rest = '';
  for (let i = 0; i < 7; i++) rest += Math.floor(Math.random() * 10);
  return p + rest;
}

function randomAddress() {
  const streets = ['Nguyen Trai', 'Le Loi', 'Tran Phu', 'Hai Ba Trung', 'Ton Duc Thang', 'Tran Hung Dao'];
  const s = streets[Math.floor(Math.random() * streets.length)];
  return `${Math.floor(Math.random()*200)+1} ${s}`;
}

function insertPatients(count = 100) {
  const sql = 'INSERT INTO patients (name, dob, gender, address, phone) VALUES ?';
  const values = [];
  for (let i = 0; i < count; i++) {
    const age = randomAge();
    values.push([randomName(), dobFromAge(age), randomGender(), randomAddress(), randomPhone()]);
  }

  db.query(sql, [values], (err, result) => {
    if (err) {
      console.error('Error inserting patients:', err);
      process.exit(1);
    }
    console.log(`Inserted ${result.affectedRows} patients`);
    process.exit(0);
  });
}

if (require.main === module) {
  const countArg = process.argv[2] ? parseInt(process.argv[2], 10) : 100;
  console.log(`Seeding ${countArg} patients...`);
  insertPatients(countArg);
}

module.exports = { insertPatients };
