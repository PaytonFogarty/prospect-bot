const { getCustomerWithIntegrations } = require('../db/customers');
const { createRun, updateRun } = require('../db/runs');
const { getEnricher } = require('../services/enricher-router');
const { getCRM } = require('../services/crm-router');
const { applyFilters } = require('../engine/filter');
const { checkDuplicates } = require('../engine/dedup');
const { enrichProspects } = require('../engine/enricher');
const { pushToCRM } = require('../engine/pusher');

/**
 * Orchestrate the full prospecting pipeline for a customer.
 */
async function runPipeline(customerId) {
  const run = await createRun(customerId);

  try {
    // 1. Load customer config and integrations
    const customer = await getCustomerWithIntegrations(customerId);
    const config = customer.config || { icp_rules: [], schedule: 'daily', sequence_id: null };

    // 2. Get the right enrichment tool and CRM
    const { service: enrichService, apiKey } = getEnricher(customer.integrations);
    const { service: crmService, token: crmToken } = getCRM(customer.integrations);

    // 3. Search for contacts using enrichment tool
    const searchResults = await enrichService.searchContacts(config.icp_rules, apiKey);
    const profiles = searchResults.data || searchResults || [];
    await updateRun(run.id, { prospects_searched: profiles.length });

    // 4. Apply ICP filters
    const filtered = applyFilters(profiles, config.icp_rules);
    await updateRun(run.id, { prospects_filtered: filtered.length });

    // 5. Check CRM for duplicates
    const { newProspects, existingProspects } = await checkDuplicates(filtered, crmService, crmToken);
    await updateRun(run.id, { prospects_skipped_dedup: existingProspects.length });

    // 6. Enrich net-new contacts
    const enriched = await enrichProspects(newProspects, enrichService, apiKey);
    await updateRun(run.id, { prospects_enriched: enriched.length });

    // 7. Push to CRM
    const pushResults = await pushToCRM(enriched, crmService, crmToken, config.sequence_id);
    await updateRun(run.id, {
      prospects_pushed: pushResults.pushed,
      status: 'success',
      completed_at: new Date(),
    });

    console.log(`Pipeline run ${run.id} completed: ${pushResults.pushed} prospects pushed`);
    return run.id;
  } catch (err) {
    console.error(`Pipeline run ${run.id} failed:`, err);
    await updateRun(run.id, {
      status: 'error',
      error_message: err.message,
      completed_at: new Date(),
    });
    throw err;
  }
}

module.exports = { runPipeline };
