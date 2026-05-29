const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { encrypt } = require('../utils/crypto');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const router = express.Router();

router.use(verifyToken);

// GET /customer/integrations
router.get('/integrations', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT tool_name, created_at FROM customer_integrations WHERE customer_id = $1',
      [req.customer.id]
    );
    const integrations = result.rows.map(row => ({
      toolName: row.tool_name,
      connected: true,
      connectedAt: row.created_at,
    }));
    res.json(integrations);
  } catch (err) {
    console.error('Get integrations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /customer/integrations
router.post('/integrations', async (req, res) => {
  try {
    const { toolName, apiKey } = req.body;
    if (!toolName || !apiKey) {
      return res.status(400).json({ error: 'toolName and apiKey are required' });
    }

    const validTools = ['lusha', 'apollo', 'hunter', 'outreach', 'hubspot', 'salesforce'];
    if (!validTools.includes(toolName)) {
      return res.status(400).json({ error: 'Invalid tool name' });
    }

    const encrypted = encrypt(apiKey);

    await pool.query(
      `INSERT INTO customer_integrations (customer_id, tool_name, api_key_encrypted)
       VALUES ($1, $2, $3)
       ON CONFLICT (customer_id, tool_name) DO UPDATE SET
         api_key_encrypted = $3,
         created_at = NOW()`,
      [req.customer.id, toolName, encrypted]
    );

    res.status(201).json({ toolName, connected: true });
  } catch (err) {
    console.error('Save integration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /customer/integrations/:toolName
router.delete('/integrations/:toolName', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM customer_integrations WHERE customer_id = $1 AND tool_name = $2',
      [req.customer.id, req.params.toolName]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    res.json({ message: 'Integration removed' });
  } catch (err) {
    console.error('Delete integration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
