const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Luck2004!',
    database: 'hospital_db',
    multipleStatements: true
  });

  try {
    // Migration 1: Add patient fields
    console.log('🔄 Running migration 1: add_patient_fields.sql');
    const sqlFile1 = path.join(__dirname, 'migrations', 'add_patient_fields.sql');
    const sql1 = fs.readFileSync(sqlFile1, 'utf8');
    await connection.query(sql1);
    console.log('✅ Migration 1 completed!');
    
    // Migration 2: Add patient_id to other tables
    console.log('🔄 Running migration 2: add_patient_id_to_tables.sql');
    const sqlFile2 = path.join(__dirname, 'migrations', 'add_patient_id_to_tables.sql');
    const sql2 = fs.readFileSync(sqlFile2, 'utf8');
    await connection.query(sql2);
    console.log('✅ Migration 2 completed!');
    
    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();
