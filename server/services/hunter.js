// TODO: Implement Hunter.io API integration
// Hunter API docs: https://hunter.io/api-documentation

async function searchContacts(filters, apiKey) {
  // TODO: GET https://api.hunter.io/v2/domain-search with domain and api_key
  throw new Error('Hunter integration not yet implemented');
}

async function enrichContact(id, apiKey) {
  // TODO: GET https://api.hunter.io/v2/email-finder with name/domain and api_key
  throw new Error('Hunter integration not yet implemented');
}

module.exports = { searchContacts, enrichContact };
