const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function getCustomer(id) {
  const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
  return result.rows[0];
}

async function getCustomerByEmail(email) {
  const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
  return result.rows[0];
}

async function createCustomer(email, passwordHash) {
  const result = await pool.query(
    'INSERT INTO customers (email, password_hash) VALUES ($1, $2) RETURNING id, email, subscription_status, created_at',
    [email, passwordHash]
  );
  return result.rows[0];
}

async function updateSubscriptionStatus(id, status) {
  const result = await pool.query(
    'UPDATE customers SET subscription_status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
}

async function getCustomerWithIntegrations(id) {
  const customer = await getCustomer(id);
  if (!customer) return null;

  const integrations = await pool.query(
    'SELECT * FROM customer_integrations WHERE customer_id = $1',
    [id]
  );

  const config = await pool.query(
    'SELECT * FROM customer_configs WHERE customer_id = $1',
    [id]
  );

  return {
    ...customer,
    integrations: integrations.rows,
    config: config.rows[0] || null,
  };
}

async function saveIntegration(customerId, toolName, apiKeyEncrypted, accessToken, refreshToken, expiresAt) {
  const result = await pool.query(
    `INSERT INTO customer_integrations (customer_id, tool_name, api_key_encrypted, access_token_encrypted, refresh_token_encrypted, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (customer_id, tool_name) DO UPDATE SET
       api_key_encrypted = COALESCE($3, customer_integrations.api_key_encrypted),
       access_token_encrypted = COALESCE($4, customer_integrations.access_token_encrypted),
       refresh_token_encrypted = COALESCE($5, customer_integrations.refresh_token_encrypted),
       expires_at = COALESCE($6, customer_integrations.expires_at)
     RETURNING *`,
    [customerId, toolName, apiKeyEncrypted, accessToken, refreshToken, expiresAt]
  );
  return result.rows[0];
}

async function deleteIntegration(customerId, toolName) {
  await pool.query(
    'DELETE FROM customer_integrations WHERE customer_id = $1 AND tool_name = $2',
    [customerId, toolName]
  );
}

module.exports = {
  getCustomer,
  getCustomerByEmail,
  createCustomer,
  updateSubscriptionStatus,
  getCustomerWithIntegrations,
  saveIntegration,
  deleteIntegration,
};
