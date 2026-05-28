// TODO: Implement Salesforce CRM API integration
// Salesforce API docs: https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/

async function searchProspects(query, token) {
  // TODO: GET /services/data/vXX.0/query with SOQL searching by email or LinkedIn URL
  throw new Error('Salesforce integration not yet implemented');
}

async function createProspect(data, token) {
  // TODO: POST /services/data/vXX.0/sobjects/Lead with lead fields
  throw new Error('Salesforce integration not yet implemented');
}

async function addToSequence(prospectId, sequenceId, token) {
  // TODO: Salesforce doesn't have native sequences — integrate with Salesforce Engage or custom flow
  throw new Error('Salesforce integration not yet implemented');
}

module.exports = { searchProspects, createProspect, addToSequence };
