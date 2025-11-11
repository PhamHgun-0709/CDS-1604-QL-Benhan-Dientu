const { spawn } = require('child_process');

// Usage: node seedAll.js [patientsCount]
// If patientsCount is provided and > 0, seedPatients.js will be run first with that count.

function run(script, args = []) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [script, ...args], { stdio: 'inherit' });
    p.on('close', code => {
      if (code === 0) resolve(); else reject(new Error(`${script} exited ${code}`));
    });
  });
}

async function runAll() {
  const countArg = process.argv[2] ? parseInt(process.argv[2], 10) : 0;
  try {
    if (countArg > 0) {
      console.log(`Seeding ${countArg} patients first...`);
      await run(require.resolve('./seedPatients.js'), [String(countArg)]);
    } else {
      console.log('Skipping seeding patients (pass a number to seed them).');
    }

    console.log('Seeding records, prescriptions and lab results...');
    await run(require.resolve('./seedRecords.js'));
    await run(require.resolve('./seedPrescriptions.js'));
    await run(require.resolve('./seedLabs.js'));

    console.log('All seeding done');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

if (require.main === module) runAll();
