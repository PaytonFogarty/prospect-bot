/**
 * Push enriched contacts to the customer's CRM and optionally add to a sequence.
 * Returns { pushed (array of contacts), failed, errors }.
 */
async function pushToCRM(contacts, crmService, token, sequenceId) {
  const pushed = [];
  const errors = [];

  for (const contact of contacts) {
    try {
      const created = await crmService.createProspect({
        firstName: contact.firstName,
        lastName: contact.lastName,
        emails: contact.email ? [contact.email] : [],
        title: contact.jobTitle || contact.currentTitle,
        company: contact.company?.name || contact.companyName,
        linkedinUrl: contact.linkedinUrl || contact.linkedin_url,
        phones: contact.phone ? [contact.phone] : [],
      }, token);

      if (sequenceId && created?.id) {
        try {
          await crmService.addToSequence(created.id, sequenceId, token);
        } catch (seqErr) {
          console.error(`Added to CRM but sequence enrollment failed for ${contact.email}:`, seqErr.message);
        }
      }

      pushed.push(contact);
    } catch (err) {
      console.error(`Failed to push contact ${contact.email || 'unknown'}:`, err.message);
      errors.push({ contact: contact.email, error: err.message });
    }
  }

  return { pushed, failed: errors.length, errors };
}

module.exports = { pushToCRM };
