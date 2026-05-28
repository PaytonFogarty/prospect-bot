const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/trialCheck');
const { runPipeline } = require('../jobs/runner');
const { getLastRun, getRunsByCustomer } = require('../db/runs');
const db = require('../db/customers');

const router = express.Router();

router.use(verifyToken);
router.use(checkSubscription);

// POST /pipeline/run — manual trigger
router.post('/run', async (req, res) => {
  try {
    // Fire and forget — don't block the response
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
    // TODO: fetch from customer_configs table
    res.json({ icpRules: [], schedule: 'daily', sequenceId: null });
  } catch (err) {
    console.error('Get config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /pipeline/config
router.put('/config', async (req, res) => {
  try {
    const { icpRules, schedule, sequenceId } = req.body;
    // TODO: save to customer_configs table and re-register cron schedule
    res.json({ message: 'Config updated', icpRules, schedule, sequenceId });
  } catch (err) {
    console.error('Update config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
