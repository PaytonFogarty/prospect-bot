/**
 * Check CRM for existing prospects to avoid duplicates.
 * Queries by LinkedIn URL first, then by email.
 */
async function checkDuplicates(profiles, crmService, token) {
  const newProspects = [];
  const existingProspects = [];

  for (const profile of profiles) {
    try {
      const matches = await crmService.searchProspects({
        linkedinUrl: profile.linkedinUrl,
        email: profile.email,
      }, token);

      if (matches && matches.length > 0) {
        existingProspects.push(profile);
      } else {
        newProspects.push(profile);
      }
    } catch (err) {
      // If CRM search fails for a profile, treat as new to avoid data loss
      console.error(`Dedup check failed for ${profile.email || 'unknown'}:`, err.message);
      newProspects.push(profile);
    }
  }

  return { newProspects, existingProspects };
}

module.exports = { checkDuplicates };
