// STEP 1 — Load the path module (built into Node, no install needed)
const path = require('path');

// STEP 2 — Load dotenv and tell it EXACTLY where your .env file is.
//
// __dirname = the folder THIS file lives in = backend/scripts
// '..'      = go one folder up              = backend
// '.env'    = the file we want              = backend/.env
//
// So the full path becomes: C:\Users\kudzi\grade-management-system\backend\.env
//
// This must come BEFORE requiring db.js because db.js reads
// process.env.DB_PASSWORD the moment it is imported.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// STEP 3 — Now it is safe to import db.js because env vars are loaded
const { query } = require('../src/config/db');
const bcrypt    = require('bcryptjs');

async function main() {
  const email    = 'admin@university.ac.zw';
  const password = 'Password123';

  console.log('\n--- Diagnostics ---');
  console.log('DB_HOST:            ', process.env.DB_HOST);
  console.log('DB_USER:            ', process.env.DB_USER);
  console.log('DB_NAME:            ', process.env.DB_NAME);
  console.log('DB_PASSWORD is set: ', !!process.env.DB_PASSWORD);
  console.log('-------------------\n');

  console.log(`Checking login for: ${email}`);

  const { rows } = await query(
    'SELECT email, password_hash, role FROM users WHERE email = $1',
    [email]
  );

  if (!rows[0]) {
    console.log('ERROR: User not found in database.');
    process.exit(1);
  }

  console.log('User found in database. Role:', rows[0].role);

  const isMatch = await bcrypt.compare(password, rows[0].password_hash);

  if (isMatch) {
    console.log('SUCCESS: Password matches. Login will work.\n');
  } else {
    console.log('FAIL: Password does not match the hash.');
    console.log('Re-run generateHash.js and update the seed file.\n');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Database connection error:', err.message);
  process.exit(1);
});