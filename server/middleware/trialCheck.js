const { getCustomer } = require('../db/customers');

async function checkSubscription(req, res, next) {
  try {
    const customer = await getCustomer(req.customer.id);
    if (!customer) {
      return res.status(401).json({ error: 'Customer not found' });
    }

    const { subscription_status, trial_ends_at } = customer;

    if (subscription_status === 'active') {
      return next();
    }

    if (subscription_status === 'trialing') {
      if (new Date(trial_ends_at) > new Date()) {
        return next();
      }
      return res.status(402).json({
        error: 'Trial expired',
        message: 'Your 14-day free trial has ended. Please subscribe to continue.',
      });
    }

    return res.status(402).json({
      error: 'Subscription required',
      message: 'Please subscribe to access this feature.',
    });
  } catch (err) {
    console.error('Subscription check error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { checkSubscription };
