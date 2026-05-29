/**
 * Enrich prospects with email and phone data via the customer's enrichment tool.
 * Batches IDs and calls enrichContact, then merges enriched data back onto prospects.
 */
async function enrichProspects(prospects, enrichService, apiKey) {
  if (prospects.length === 0) return [];

  const enriched = [];

  // Try batch enrichment first (Lusha supports array of IDs)
  const ids = prospects.map(p => p.id || p.contactId).filter(Boolean);

  if (ids.length > 0) {
    try {
      const result = await enrichService.enrichContact(ids, apiKey);
      const enrichedData = result.data || result || [];
      const enrichedMap = new Map();

      if (Array.isArray(enrichedData)) {
        for (const item of enrichedData) {
          const key = item.id || item.contactId;
          if (key) enrichedMap.set(key, item);
        }
      }

      for (const prospect of prospects) {
        const key = prospect.id || prospect.contactId;
        const data = enrichedMap.get(key);
        if (data) {
          enriched.push({
            ...prospect,
            email: data.emailAddresses?.[0]?.email || data.email || prospect.email,
            phone: data.phoneNumbers?.[0]?.number || data.phone || prospect.phone,
            firstName: data.firstName || prospect.firstName,
            lastName: data.lastName || prospect.lastName,
            enrichedAt: new Date().toISOString(),
          });
        } else {
          enriched.push(prospect);
        }
      }

      return enriched;
    } catch (err) {
      console.error('Batch enrichment failed, falling back to individual:', err.message);
    }
  }

  // Fallback: enrich individually
  for (const prospect of prospects) {
    try {
      const id = prospect.id || prospect.contactId;
      if (!id) {
        enriched.push(prospect);
        continue;
      }
      const result = await enrichService.enrichContact(id, apiKey);
      const data = result.data?.[0] || result || {};
      enriched.push({
        ...prospect,
        email: data.emailAddresses?.[0]?.email || data.email || prospect.email,
        phone: data.phoneNumbers?.[0]?.number || data.phone || prospect.phone,
        firstName: data.firstName || prospect.firstName,
        lastName: data.lastName || prospect.lastName,
        enrichedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`Enrichment failed for prospect ${prospect.id}:`, err.message);
      enriched.push(prospect);
    }
  }

  return enriched;
}

module.exports = { enrichProspects };
