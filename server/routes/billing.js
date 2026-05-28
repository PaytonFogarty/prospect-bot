const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { verifyToken } = require('../middleware/auth');
const { getCustomer, updateSubscriptionStatus } = require('../db/customers');

const router = express.Router();

const PRICE_ID = process.env.STRIPE_PRICE_ID; // $149/month flat price

// POST /billing/checkout — create Stripe checkout session
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const customer = await getCustomer(req.customer.id);

    let stripeCustomerId = customer.stripe_customer_id;
    if (!stripeCustomerId) {
      const stripeCustomer = await stripe.customers.create({ email: customer.email });
      stripeCustomerId = stripeCustomer.id;
      // TODO: save stripeCustomerId to customer record
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?billing=success`,
      cancel_url: `${process.env.CLIENT_URL}/billing?billing=cancelled`,
      metadata: { customerId: req.customer.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /billing/webhook — Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerId = session.metadata.customerId;
      await updateSubscriptionStatus(customerId, 'active');
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      // TODO: look up customer by stripe_subscription_id and mark expired
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      // TODO: look up customer and mark past_due
      break;
    }
  }

  res.json({ received: true });
});

// GET /billing/status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const customer = await getCustomer(req.customer.id);
    const trialDaysLeft = customer.trial_ends_at
      ? Math.max(0, Math.ceil((new Date(customer.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)))
      : 0;

    res.json({
      subscriptionStatus: customer.subscription_status,
      trialDaysLeft,
      trialEndsAt: customer.trial_ends_at,
    });
  } catch (err) {
    console.error('Billing status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /billing/cancel
router.post('/cancel', verifyToken, async (req, res) => {
  try {
    const customer = await getCustomer(req.customer.id);
    if (customer.stripe_subscription_id) {
      await stripe.subscriptions.cancel(customer.stripe_subscription_id);
      await updateSubscriptionStatus(req.customer.id, 'cancelled');
    }
    res.json({ message: 'Subscription cancelled' });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
