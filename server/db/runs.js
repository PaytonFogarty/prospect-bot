const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function createRun(customerId) {
  const result = await pool.query(
    'INSERT INTO run_logs (customer_id) VALUES ($1) RETURNING *',
    [customerId]
  );
  return result.rows[0];
}

async function updateRun(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx++;
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE run_logs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

async function getRunsByCustomer(customerId, limit = 20) {
  const result = await pool.query(
    'SELECT * FROM run_logs WHERE customer_id = $1 ORDER BY started_at DESC LIMIT $2',
    [customerId, limit]
  );
  return result.rows;
}

async function getLastRun(customerId) {
  const result = await pool.query(
    'SELECT * FROM run_logs WHERE customer_id = $1 ORDER BY started_at DESC LIMIT 1',
    [customerId]
  );
  return result.rows[0] || null;
}

module.exports = { createRun, updateRun, getRunsByCustomer, getLastRun };
