const { Pool } = require('pg');

// Render's PostgreSQL requires SSL in production.
// In development (local) we don't need SSL so we check NODE_ENV.
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,

  // Enable SSL on Render but not locally.
  // rejectUnauthorized: false tells Node to accept Render's
  // self-signed certificate without needing the root CA installed.
  ...(isProduction && {
    ssl: {
      rejectUnauthorized: false
    }
  })
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

const query = (text, params) => pool.query(text, params);

const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { query, withTransaction, pool };