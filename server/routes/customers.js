const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/trialCheck');
const { getCustomer, getCustomerWithIntegrations, saveIntegration, deleteIntegration } = require('../db/customers');

const router = express.Router();

router.use(verifyToken);
router.use(checkSubscription);

// GET /customer/profile
router.get('/profile', async (req, res) => {
  try {
    const customer = await getCustomer(req.customer.id);
    const { password_hash, ...safe } = customer;
    res.json(safe);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /customer/profile
router.put('/profile', async (req, res) => {
  // TODO: update customer profile fields
  res.json({ message: 'Profile updated' });
});

// GET /customer/integrations
router.get('/integrations', async (req, res) => {
  try {
    const customer = await getCustomerWithIntegrations(req.customer.id);
    res.json(customer.integrations || []);
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
    const integration = await saveIntegration(req.customer.id, toolName, apiKey);
    res.status(201).json(integration);
  } catch (err) {
    console.error('Save integration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /customer/integrations/:id
router.delete('/integrations/:id', async (req, res) => {
  try {
    await deleteIntegration(req.customer.id, req.params.id);
    res.json({ message: 'Integration removed' });
  } catch (err) {
    console.error('Delete integration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
