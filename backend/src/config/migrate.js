const { pool } = require('./db');
const fs       = require('fs');
const path     = require('path');

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log('Running database migrations...');

    const migrationPath = path.join(
      __dirname, '../../migrations/001_initial_schema.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await client.query(sql);
    console.log('Migrations completed successfully.');
  } catch (err) {
    // Code 42P07 means "table already exists" — safe to ignore
    // because our schema uses IF NOT EXISTS
    if (err.code === '42P07') {
      console.log('Tables already exist — skipping migration.');
    } else {
      // Log but do not crash the server — the app can still
      // serve requests even if migrations fail on a re-deploy
      console.error('Migration error:', err.message);
    }
  } finally {
    client.release();
  }
};

module.exports = { runMigrations };