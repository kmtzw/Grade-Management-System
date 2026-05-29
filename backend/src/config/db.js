const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

// On Render, DATABASE_URL is the most reliable connection method.
// Locally, we use individual DB_* variables from .env.
const poolConfig = isProduction && process.env.DATABASE_URL
  ? {
      // Use the full connection string Render provides.
      // This already has the correct host, port, user, password and database.
      connectionString: process.env.DATABASE_URL,
      ssl: {
        // Render uses self-signed certificates so we disable
        // certificate verification. This is safe for Render's
        // managed database environment.
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // longer timeout for cloud DB
    }
  : {
      // Local development — individual variables, no SSL needed
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || 'gradedb',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Database connection established successfully.');
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
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