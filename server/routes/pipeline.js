const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/trialCheck');
const { runPipeline, runRefresh } = require('../jobs/runner');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const router = express.Router();

router.use(verifyToken);
router.use(checkSubscription);

// GET /pipeline/configs — all prospect configs for this customer
router.get('/configs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM prospect_configs WHERE customer_id = $1 ORDER BY created_at DESC',
      [req.customer.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get configs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /pipeline/configs — create a new config
router.post('/configs', async (req, res) => {
  try {
    const { name, keywords, includeCompanies, excludeCompanies, locations, industries, assignedDays, runTime, prospectsPerRun, autoRunEnabled } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Config name is required' });
    }
    if (!keywords || keywords.length === 0) {
      return res.status(400).json({ error: 'At least one keyword is required' });
    }

    const result = await pool.query(
      `INSERT INTO prospect_configs (customer_id, name, keywords, include_companies, exclude_companies, locations, industries, assigned_days, run_time, prospects_per_run, auto_run_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        req.customer.id,
        name.trim(),
        keywords,
        includeCompanies || [],
        excludeCompanies || [],
        locations || [],
        industries || [],
        assignedDays || [],
        runTime || '08:00',
        prospectsPerRun || 50,
        autoRunEnabled ?? false,
      ]
    );

    // Register schedule if auto-run enabled
    if (autoRunEnabled && assignedDays && assignedDays.length > 0) {
      const { registerSchedule } = require('../jobs/scheduler');
      registerSchedule(result.rows[0].id, {
        days: assignedDays,
        time: runTime || '08:00',
        customerId: req.customer.id,
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /pipeline/configs/:id — update a config
router.put('/configs/:id', async (req, res) => {
  try {
    const { name, keywords, includeCompanies, excludeCompanies, locations, industries, assignedDays, runTime, prospectsPerRun, autoRunEnabled } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Config name is required' });
    }
    if (!keywords || keywords.length === 0) {
      return res.status(400).json({ error: 'At least one keyword is required' });
    }

    const result = await pool.query(
      `UPDATE prospect_configs SET
         name = $1, keywords = $2, include_companies = $3, exclude_companies = $4,
         locations = $5, industries = $6, assigned_days = $7, run_time = $8,
         prospects_per_run = $9, auto_run_enabled = $10, updated_at = NOW()
       WHERE id = $11 AND customer_id = $12
       RETURNING *`,
      [
        name.trim(),
        keywords,
        includeCompanies || [],
        excludeCompanies || [],
        locations || [],
        industries || [],
        assignedDays || [],
        runTime || '08:00',
        prospectsPerRun || 50,
        autoRunEnabled ?? false,
        req.params.id,
        req.customer.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }

    // Update schedule
    const { registerSchedule, unregisterSchedule } = require('../jobs/scheduler');
    if (autoRunEnabled && assignedDays && assignedDays.length > 0) {
      registerSchedule(req.params.id, {
        days: assignedDays,
        time: runTime || '08:00',
        customerId: req.customer.id,
      });
    } else {
      unregisterSchedule(req.params.id);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /pipeline/configs/:id — delete a config
router.delete('/configs/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM prospect_configs WHERE id = $1 AND customer_id = $2',
      [req.params.id, req.customer.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Config not found' });
    }
    const { unregisterSchedule } = require('../jobs/scheduler');
    unregisterSchedule(req.params.id);
    res.json({ message: 'Config deleted' });
  } catch (err) {
    console.error('Delete config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /pipeline/configs/:id/run — manually run a specific config
router.post('/configs/:id/run', async (req, res) => {
  try {
    const summary = await runPipeline(req.customer.id, req.params.id);
    res.json(summary);
  } catch (err) {
    console.error('Pipeline run error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /pipeline/refresh — trigger prospect refresh
router.post('/refresh', async (req, res) => {
  try {
    const summary = await runRefresh(req.customer.id);
    res.json(summary);
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /pipeline/runs — last 20 run logs
router.get('/runs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rl.*, pc.name as config_name
       FROM run_logs rl
       LEFT JOIN prospect_configs pc ON rl.config_id = pc.id
       WHERE rl.customer_id = $1
       ORDER BY rl.started_at DESC LIMIT 20`,
      [req.customer.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get runs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /pipeline/refresh-logs — last 20 refresh logs
router.get('/refresh-logs', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM refresh_logs WHERE customer_id = $1
       ORDER BY started_at DESC LIMIT 20`,
      [req.customer.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get refresh logs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
