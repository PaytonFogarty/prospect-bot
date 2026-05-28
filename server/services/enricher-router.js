const lusha = require('./lusha');
const apollo = require('./apollo');
const hunter = require('./hunter');

const ENRICHMENT_TOOLS = {
  lusha,
  apollo,
  hunter,
};

function getEnricher(integrations) {
  for (const integration of integrations) {
    const service = ENRICHMENT_TOOLS[integration.tool_name];
    if (service) {
      return { service, apiKey: integration.api_key_encrypted }; // Decrypt in production
    }
  }
  throw new Error('No enrichment tool connected. Please connect Lusha, Apollo, or Hunter in your integrations.');
}

module.exports = { getEnricher };
