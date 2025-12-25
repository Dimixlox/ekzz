const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD), 
  database: process.env.DB_NAME,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};