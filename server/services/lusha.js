const axios = require('axios');

const LUSHA_BASE_URL = 'https://api.lusha.com';

async function searchContacts(filters, apiKey) {
  const response = await axios.post(`${LUSHA_BASE_URL}/prospecting/api/v2/person/search`, {
    filters,
  }, {
    headers: { 'api_key': apiKey, 'Content-Type': 'application/json' },
  });
  return response.data;
}

async function enrichContact(id, apiKey) {
  const response = await axios.get(`${LUSHA_BASE_URL}/prospecting/api/v2/person/enrich`, {
    params: { personId: id },
    headers: { 'api_key': apiKey },
  });
  return response.data;
}

module.exports = { searchContacts, enrichContact };
