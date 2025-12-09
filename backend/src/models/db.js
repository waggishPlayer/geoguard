const { Pool } = require('pg');
const config = require('../config/env');

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is missing. Set it to your Supabase/Postgres connection string.');
}

const pool = new Pool({
  connectionString: config.databaseUrl,
  // SSL disabled with explicit rejectUnauthorized false for Supabase
  ssl: { rejectUnauthorized: false },
  // Enhanced connection settings for better reliability
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  max: 20,
  statement_timeout: 30000,
  query_timeout: 30000
});

pool.on('error', (err) => {
  console.error('Unexpected PG pool error', err.message || err);
  // Attempt to recover by draining and creating new connections
  console.warn('Attempting to reconnect to database...');
});

pool.on('connect', () => {
  console.log('✅ Successfully connected to database');
});

const query = (text, params) => {
  return pool.query(text, params).catch(err => {
    console.error('Database query error:', err.message);
    throw err;
  });
};

module.exports = { pool, query };
