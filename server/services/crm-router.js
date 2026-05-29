const outreach = require('./outreach');
const hubspot = require('./hubspot');
const salesforce = require('./salesforce');
const { decrypt } = require('../utils/crypto');

const CRM_TOOLS = {
  outreach,
  hubspot,
  salesforce,
};

function getCRM(integrations) {
  for (const integration of integrations) {
    const service = CRM_TOOLS[integration.tool_name];
    if (service) {
      const token = integration.access_token_encrypted ? decrypt(integration.access_token_encrypted) : null;
      if (!token) continue;
      return { service, token };
    }
  }
  throw new Error('No CRM connected. Please connect Outreach, HubSpot, or Salesforce in your integrations.');
}

module.exports = { getCRM };
