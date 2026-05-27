const { Pool } = require('pg');

// Pool creates a set of reusable database connections.
// Instead of opening and closing a connection for every query,
// the pool keeps several connections alive and hands them out as needed.
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                      // max 20 simultaneous connections
  idleTimeoutMillis: 30000,     // close idle connections after 30s
  connectionTimeoutMillis: 2000 // error if connection takes > 2s
});

// If the pool itself has an unexpected error, log it instead of crashing
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

// Simple query helper — always use $1, $2 params, NEVER string concat
// This prevents SQL injection attacks
const query = (text, params) => pool.query(text, params);

// Transaction helper — wraps multiple queries in a single atomic operation.
// If ANY query fails, ALL of them are rolled back (undone).
// Usage: await withTransaction(async (client) => { await client.query(...) })
const withTransaction = async (callback) => {
  const client = await pool.connect(); // grab one connection from the pool
  try {
    await client.query('BEGIN');        // start transaction
    const result = await callback(client);
    await client.query('COMMIT');       // save all changes
    return result;
  } catch (err) {
    await client.query('ROLLBACK');     // undo all changes on error
    throw err;
  } finally {
    client.release(); // always return the connection to the pool
  }
};

module.exports = { query, withTransaction, pool };