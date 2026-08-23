const { Pool } = require('pg');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL || '';
const isRemote = dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: dbUrl || 'postgresql://postgres:postgres@localhost:5432/inventaris_kantor',
  ssl: isRemote ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

/**
 * Execute query directly on pool
 */
const query = (text, params) => pool.query(text, params);

/**
 * Transaction helper for atomic operations (ACID)
 */
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  withTransaction
};
