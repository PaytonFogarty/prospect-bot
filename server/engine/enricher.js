/**
 * Enrich prospects with email and phone data via the customer's enrichment tool.
 */
async function enrichProspects(prospects, enrichService, apiKey) {
  const enriched = [];

  for (const prospect of prospects) {
    try {
      const data = await enrichService.enrichContact(prospect.id, apiKey);
      enriched.push({
        ...prospect,
        email: data.email || prospect.email,
        phone: data.phone || prospect.phone,
        enrichedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`Enrichment failed for prospect ${prospect.id}:`, err.message);
      // Still include the prospect with whatever data we have
      enriched.push(prospect);
    }
  }

  return enriched;
}

module.exports = { enrichProspects };
