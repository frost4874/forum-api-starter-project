/* istanbul ignore file */
const { Pool } = require('pg');

const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

const baseConfig = {
  host: isTest ? process.env.PGHOST_TEST : process.env.PGHOST,
  port: isTest ? process.env.PGPORT_TEST : process.env.PGPORT,
  user: isTest ? process.env.PGUSER_TEST : process.env.PGUSER,
  password: isTest ? process.env.PGPASSWORD_TEST : process.env.PGPASSWORD,
  database: isTest ? process.env.PGDATABASE_TEST : process.env.PGDATABASE,
};

if (isProduction) {
  baseConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(baseConfig);

module.exports = pool;
