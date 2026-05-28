// TODO: Implement HubSpot CRM API integration
// HubSpot API docs: https://developers.hubspot.com/docs/api/crm/contacts

async function searchProspects(query, token) {
  // TODO: POST to /crm/v3/objects/contacts/search with filters
  throw new Error('HubSpot integration not yet implemented');
}

async function createProspect(data, token) {
  // TODO: POST to /crm/v3/objects/contacts with contact properties
  throw new Error('HubSpot integration not yet implemented');
}

async function addToSequence(prospectId, sequenceId, token) {
  // TODO: Enroll contact in HubSpot sequence via /automation/v4/enrollments
  throw new Error('HubSpot integration not yet implemented');
}

module.exports = { searchProspects, createProspect, addToSequence };
