const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

let poolConfig;

if (isProduction && process.env.DATABASE_URL) {
  // Parse the DATABASE_URL manually so we control every setting.
  // Using connectionString directly lets pg-connection-string parse
  // the sslmode from the URL which overrides our ssl object.
  // Parsing it ourselves gives us full control.
  const url = new URL(process.env.DATABASE_URL);

  poolConfig = {
    host:     url.hostname,
    port:     parseInt(url.port) || 5432,
    database: url.pathname.replace('/', ''), // remove leading slash
    user:     url.username,
    password: url.password,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    // This is the critical part — we set SSL directly on the pool config
    // rejectUnauthorized: false accepts Render's self-signed certificate
    ssl: {
      rejectUnauthorized: false
    }
  };

  console.log('Using production DB config — host:', url.hostname);

} else {
  // Local development — no SSL needed
  poolConfig = {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || 'gradedb',
    user:     process.env.DB_USER     || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  console.log('Using local DB config — host:', poolConfig.host);
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Database connected successfully.');
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