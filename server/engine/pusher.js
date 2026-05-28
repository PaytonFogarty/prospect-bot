/**
 * Push enriched contacts to the customer's CRM and optionally add to a sequence.
 */
async function pushToCRM(contacts, crmService, token, sequenceId) {
  const results = { pushed: 0, failed: 0, errors: [] };

  for (const contact of contacts) {
    try {
      const created = await crmService.createProspect({
        firstName: contact.firstName,
        lastName: contact.lastName,
        emails: contact.email ? [contact.email] : [],
        title: contact.currentTitle,
        company: contact.companyName,
        linkedinUrl: contact.linkedinUrl,
        phones: contact.phone ? [contact.phone] : [],
      }, token);

      if (sequenceId && created.id) {
        await crmService.addToSequence(created.id, sequenceId, token);
      }

      results.pushed++;
    } catch (err) {
      console.error(`Failed to push contact ${contact.email || 'unknown'}:`, err.message);
      results.failed++;
      results.errors.push({ contact: contact.email, error: err.message });
    }
  }

  return results;
}

module.exports = { pushToCRM };
