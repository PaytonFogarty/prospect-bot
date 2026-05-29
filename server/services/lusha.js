const axios = require('axios');

const LUSHA_BASE_URL = 'https://api.lusha.com/prospecting/v2';

/**
 * Search for contacts matching ICP filters using customer's Lusha API key.
 */
async function searchContacts(filters, apiKey) {
  const body = {};

  // Map ICP filter rules to Lusha search params
  if (Array.isArray(filters)) {
    for (const rule of filters) {
      if (rule.field === 'currentTitle') {
        body.jobTitles = body.jobTitles || [];
        body.jobTitles.push(rule.value);
      } else if (rule.field === 'location') {
        body.locations = body.locations || [];
        body.locations.push(rule.value);
      } else if (rule.field === 'companyName') {
        body.companyNames = body.companyNames || [];
        body.companyNames.push(rule.value);
      } else if (rule.field === 'industry') {
        body.industries = body.industries || [];
        body.industries.push(rule.value);
      } else if (rule.field === 'seniority') {
        body.seniorityLevels = body.seniorityLevels || [];
        body.seniorityLevels.push(rule.value);
      }
    }
  } else {
    // If filters is already a Lusha-shaped object, pass through
    Object.assign(body, filters);
  }

  const response = await axios.post(`${LUSHA_BASE_URL}/contacts`, body, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

/**
 * Enrich contacts by IDs using customer's Lusha API key.
 */
async function enrichContact(ids, apiKey) {
  const contactIds = Array.isArray(ids) ? ids : [ids];

  const response = await axios.post(`${LUSHA_BASE_URL}/contacts/enrich`, {
    contactIds,
  }, {
    headers: {
      'api_key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

module.exports = { searchContacts, enrichContact };
