const { pool } = require('./db');
const fs       = require('fs');
const path     = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log('Running database migrations...');

    const migrationPath = path.join(__dirname, '../../migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await client.query(sql);
    console.log('Migrations completed successfully.');
  } catch (err) {
    // If tables already exist PostgreSQL throws an error — that is fine
    // The IF NOT EXISTS in the schema handles this gracefully
    if (err.code === '42P07') {
      console.log('Tables already exist — skipping migration.');
    } else {
      console.error('Migration error:', err.message);
    }
  } finally {
    client.release();
  }
};

module.exports = { runMigrations };