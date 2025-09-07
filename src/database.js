import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pool } = require('pg');

const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'findplacedb',
  password: 'findplacedb',
  port: 5432,
});

const DB = {
  query: (text, params) => pool.query(text, params),
  pool,
};

export default DB;
