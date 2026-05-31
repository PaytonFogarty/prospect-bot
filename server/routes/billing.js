const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { verifyToken } = require('../middleware/auth');
const {
  getCustomer,
  updateBillingInfo,
  updateSubscriptionStatusByStripeCustomerId,
} = require('../db/customers');

const router = express.Router();

const PRICE_ID = process.env.STRIPE_PRICE_ID; // $149/month flat price
const PLAN_NAME = 'Revara';
const PLAN_PRICE = 149;

// Map Stripe subscription statuses to the ones we store.
function mapStripeStatus(stripeStatus) {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
      return 'past_due';
    case 'incomplete_expired':
      return 'expired';
    case 'canceled':
      return 'cancelled';
    default:
      return 'cancelled';
  }
}

// POST /billing/checkout — create a Stripe Checkout session for the subscription
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      customer_email: req.customer.email,
      // Both let the webhook map the completed session back to our customer.
      client_reference_id: String(req.customer.id),
      metadata: { customerId: req.customer.id },
      success_url: `${process.env.CLIENT_URL}/billing?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/billing?cancelled=true`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /billing/webhook — Stripe webhook handler.
// The raw body parser is registered globally in index.js before express.json().
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.metadata?.customerId || session.client_reference_id;
        if (customerId) {
          await updateBillingInfo(customerId, {
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            status: 'active',
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await updateSubscriptionStatusByStripeCustomerId(subscription.customer, 'cancelled');
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await updateSubscriptionStatusByStripeCustomerId(
          subscription.customer,
          mapStripeStatus(subscription.status)
        );
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// GET /billing/status — current subscription state for the logged-in customer
router.get('/status', verifyToken, async (req, res) => {
  try {
    const customer = await getCustomer(req.customer.id);

    res.json({
      subscription_status: customer.subscription_status,
      stripe_customer_id: customer.stripe_customer_id,
      plan: PLAN_NAME,
      price: PLAN_PRICE,
    });
  } catch (err) {
    console.error('Billing status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /billing/cancel — cancel the subscription at the end of the period
router.post('/cancel', verifyToken, async (req, res) => {
  try {
    const customer = await getCustomer(req.customer.id);

    if (!customer.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    await stripe.subscriptions.update(customer.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
    await updateBillingInfo(req.customer.id, { status: 'cancelled' });

    res.json({
      subscription_status: 'cancelled',
      message: 'Your subscription will cancel at the end of the billing period.',
    });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
