const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/trialCheck');
const { saveIntegration, deleteIntegration } = require('../db/customers');

const router = express.Router();

const OAUTH_CONFIGS = {
  outreach: {
    authorizeUrl: 'https://api.outreach.io/api/v2/oauth/authorize',
    tokenUrl: 'https://api.outreach.io/api/v2/oauth/token',
    clientId: process.env.OUTREACH_CLIENT_ID,
    clientSecret: process.env.OUTREACH_CLIENT_SECRET,
    scopes: 'prospects.all sequences.all',
  },
  hubspot: {
    authorizeUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    clientId: process.env.HUBSPOT_CLIENT_ID,
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
    scopes: 'crm.objects.contacts.read crm.objects.contacts.write',
  },
  salesforce: {
    authorizeUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
    scopes: 'api refresh_token',
  },
};

// GET /crm/oauth/:provider — redirect to OAuth provider
router.get('/oauth/:provider', verifyToken, checkSubscription, (req, res) => {
  const provider = req.params.provider;
  const config = OAUTH_CONFIGS[provider];
  if (!config) {
    return res.status(400).json({ error: `Unknown CRM provider: ${provider}` });
  }

  const redirectUri = `${process.env.CLIENT_URL}/crm/callback/${provider}`;
  const state = req.customer.id; // In production, use a signed state token

  const url = `${config.authorizeUrl}?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(config.scopes)}&state=${state}`;

  res.json({ url });
});

// GET /crm/callback/:provider — handle OAuth callback
router.get('/callback/:provider', async (req, res) => {
  const provider = req.params.provider;
  const config = OAUTH_CONFIGS[provider];
  const { code, state } = req.query;

  if (!config || !code) {
    return res.status(400).json({ error: 'Invalid callback' });
  }

  try {
    const axios = require('axios');
    const redirectUri = `${process.env.CLIENT_URL}/crm/callback/${provider}`;

    const tokenResponse = await axios.post(config.tokenUrl, {
      grant_type: 'authorization_code',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      code,
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : null;

    const customerId = state; // In production, verify signed state token
    await saveIntegration(customerId, provider, null, access_token, refresh_token, expiresAt);

    res.redirect(`${process.env.CLIENT_URL}/integrations?connected=${provider}`);
  } catch (err) {
    console.error(`OAuth callback error for ${provider}:`, err);
    res.status(500).json({ error: 'OAuth exchange failed' });
  }
});

// DELETE /crm/disconnect/:provider
router.delete('/disconnect/:provider', verifyToken, checkSubscription, async (req, res) => {
  try {
    await deleteIntegration(req.customer.id, req.params.provider);
    res.json({ message: `Disconnected ${req.params.provider}` });
  } catch (err) {
    console.error('Disconnect error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
