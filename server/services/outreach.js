const axios = require('axios');

const BASE_URL = 'https://api.outreach.io/api/v2';

function headers(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/vnd.api+json' };
}

async function searchProspects(query, token) {
  const response = await axios.get(`${BASE_URL}/prospects`, {
    params: { 'filter[emails]': query.email, 'filter[linkedInUrl]': query.linkedinUrl },
    headers: headers(token),
  });
  return response.data.data || [];
}

async function createProspect(data, token) {
  const response = await axios.post(`${BASE_URL}/prospects`, {
    data: {
      type: 'prospect',
      attributes: {
        firstName: data.firstName,
        lastName: data.lastName,
        emails: data.emails,
        title: data.title,
        company: data.company,
        linkedInUrl: data.linkedinUrl,
        mobilePhones: data.phones || [],
      },
    },
  }, { headers: headers(token) });
  return response.data.data;
}

async function addToSequence(prospectId, sequenceId, token) {
  const response = await axios.post(`${BASE_URL}/sequenceStates`, {
    data: {
      type: 'sequenceState',
      relationships: {
        prospect: { data: { type: 'prospect', id: prospectId } },
        sequence: { data: { type: 'sequence', id: sequenceId } },
      },
    },
  }, { headers: headers(token) });
  return response.data.data;
}

module.exports = { searchProspects, createProspect, addToSequence };
