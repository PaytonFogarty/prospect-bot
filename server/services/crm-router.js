const outreach = require('./outreach');
const hubspot = require('./hubspot');
const salesforce = require('./salesforce');

const CRM_TOOLS = {
  outreach,
  hubspot,
  salesforce,
};

function getCRM(integrations) {
  for (const integration of integrations) {
    const service = CRM_TOOLS[integration.tool_name];
    if (service) {
      return { service, token: integration.access_token_encrypted }; // Decrypt in production
    }
  }
  throw new Error('No CRM connected. Please connect Outreach, HubSpot, or Salesforce in your integrations.');
}

module.exports = { getCRM };
