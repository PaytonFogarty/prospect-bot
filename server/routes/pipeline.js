const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/trialCheck');
const { runPipeline } = require('../jobs/runner');
const { getLastRun, getRunsByCustomer } = require('../db/runs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const router = express.Router();

router.use(verifyToken);
router.use(checkSubscription);

// POST /pipeline/run — manual trigger
router.post('/run', async (req, res) => {
  try {
    runPipeline(req.customer.id).catch(err => {
      console.error(`Pipeline run failed for customer ${req.customer.id}:`, err);
    });
    res.json({ message: 'Pipeline run started' });
  } catch (err) {
    console.error('Pipeline trigger error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /pipeline/status
router.get('/status', async (req, res) => {
  try {
    const lastRun = await getLastRun(req.customer.id);
    const recentRuns = await getRunsByCustomer(req.customer.id, 5);
    res.json({ lastRun, recentRuns });
  } catch (err) {
    console.error('Pipeline status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /pipeline/config
router.get('/config', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customer_configs WHERE customer_id = $1',
      [req.customer.id]
    );
    const config = result.rows[0];
    if (!config) {
      return res.json({
        icpRules: [],
        sequenceId: null,
        runMode: 'manual',
        autoRunEnabled: false,
        scheduleDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        scheduleTime: '08:00',
        prospectsPerRun: 50,
      });
    }
    res.json({
      icpRules: config.icp_rules || [],
      sequenceId: config.sequence_id,
      runMode: config.run_mode,
      autoRunEnabled: config.auto_run_enabled,
      scheduleDays: config.schedule_days || [],
      scheduleTime: config.schedule_time,
      prospectsPerRun: config.prospects_per_run,
    });
  } catch (err) {
    console.error('Get config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /pipeline/config
router.put('/config', async (req, res) => {
  try {
    const {
      icpRules,
      sequenceId,
      runMode,
      autoRunEnabled,
      scheduleDays,
      scheduleTime,
      prospectsPerRun,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO customer_configs (customer_id, icp_rules, sequence_id, run_mode, auto_run_enabled, schedule_days, schedule_time, prospects_per_run, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (customer_id) DO UPDATE SET
         icp_rules = COALESCE($2, customer_configs.icp_rules),
         sequence_id = $3,
         run_mode = COALESCE($4, customer_configs.run_mode),
         auto_run_enabled = COALESCE($5, customer_configs.auto_run_enabled),
         schedule_days = COALESCE($6, customer_configs.schedule_days),
         schedule_time = COALESCE($7, customer_configs.schedule_time),
         prospects_per_run = COALESCE($8, customer_configs.prospects_per_run),
         updated_at = NOW()
       RETURNING *`,
      [
        req.customer.id,
        JSON.stringify(icpRules || []),
        sequenceId || null,
        runMode || 'manual',
        autoRunEnabled ?? false,
        scheduleDays || [],
        scheduleTime || '08:00',
        prospectsPerRun || 50,
      ]
    );

    // Re-register schedule if automatic
    const { registerSchedule, unregisterSchedule } = require('../jobs/scheduler');
    if (runMode === 'automatic' && autoRunEnabled) {
      registerSchedule(req.customer.id, {
        days: scheduleDays || [],
        time: scheduleTime || '08:00',
      });
    } else {
      unregisterSchedule(req.customer.id);
    }

    res.json({ message: 'Config updated' });
  } catch (err) {
    console.error('Update config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
