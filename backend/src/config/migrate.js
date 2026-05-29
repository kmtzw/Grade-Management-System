const { pool } = require('./db');
const fs       = require('fs');
const path     = require('path');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runMigrations = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    let client;
    try {
      console.log(`Migration attempt ${attempt} of ${retries}...`);
      client = await pool.connect();

      const migrationPath = path.join(
        __dirname, '../../migrations/001_initial_schema.sql'
      );
      const sql = fs.readFileSync(migrationPath, 'utf8');

      await client.query(sql);
      console.log('Migrations completed successfully.');
      return; // success — exit the retry loop

    } catch (err) {
      // Tables already exist — migration not needed
      if (err.code === '42P07') {
        console.log('Tables already exist — skipping migration.');
        return;
      }

      console.error(`Migration attempt ${attempt} failed:`, err.message);

      // If we have retries left, wait before trying again
      if (attempt < retries) {
        const waitSeconds = attempt * 3;
        console.log(`Retrying in ${waitSeconds} seconds...`);
        await sleep(waitSeconds * 1000);
      } else {
        console.error('All migration attempts failed. The app will still start.');
        console.error('Check your DATABASE_URL environment variable on Render.');
      }
    } finally {
      if (client) client.release();
    }
  }
};

module.exports = { runMigrations };