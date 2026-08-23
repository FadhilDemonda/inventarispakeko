const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/inventaris_kantor',
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.co') 
    ? { rejectUnauthorized: false } 
    : false,
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
 * Sesuai Development Rules §2.3
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
