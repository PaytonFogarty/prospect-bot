// Blocks API access for customers without an active subscription.
// Must run AFTER verifyToken, which populates req.customer (including
// subscription_status). Inactive/cancelled/past-due customers get a 402 with a
// redirect hint the client uses to send them to the billing page.
function checkSubscription(req, res, next) {
  const customer = req.customer;
  if (!customer) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (customer.subscription_status === 'active') {
    return next();
  }

  return res.status(402).json({
    error: 'subscription_inactive',
    message: 'You need to subscribe to continue.',
    redirect: '/billing',
  });
}

module.exports = { checkSubscription };
