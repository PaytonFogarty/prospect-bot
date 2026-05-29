const lusha = require('./lusha');
const apollo = require('./apollo');
const hunter = require('./hunter');
const { decrypt } = require('../utils/crypto');

const ENRICHMENT_TOOLS = {
  lusha,
  apollo,
  hunter,
};

function getEnricher(integrations) {
  for (const integration of integrations) {
    const service = ENRICHMENT_TOOLS[integration.tool_name];
    if (service) {
      const apiKey = integration.api_key_encrypted ? decrypt(integration.api_key_encrypted) : null;
      if (!apiKey) continue;
      return { service, apiKey };
    }
  }
  throw new Error('No enrichment tool connected. Please connect Lusha, Apollo, or Hunter in your integrations.');
}

module.exports = { getEnricher };
