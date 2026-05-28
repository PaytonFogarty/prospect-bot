// TODO: Implement Apollo.io API integration
// Apollo API docs: https://apolloio.github.io/apollo-api-docs/

async function searchContacts(filters, apiKey) {
  // TODO: POST to Apollo /v1/mixed_people/search with filters and api_key
  throw new Error('Apollo integration not yet implemented');
}

async function enrichContact(id, apiKey) {
  // TODO: POST to Apollo /v1/people/match with person ID
  throw new Error('Apollo integration not yet implemented');
}

module.exports = { searchContacts, enrichContact };
