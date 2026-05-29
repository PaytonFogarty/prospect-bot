const { Pool } = require('pg');
const { getEnricher } = require('../services/enricher-router');
const { getCRM } = require('../services/crm-router');
const { applyFilters } = require('../engine/filter');
const { checkDuplicates, savePushedProspects } = require('../engine/dedup');
const { enrichProspects } = require('../engine/enricher');
const { pushToCRM } = require('../engine/pusher');
const { createRun, updateRun } = require('../db/runs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Orchestrate the full prospecting pipeline for a customer.
 * Returns a run summary object.
 */
async function runPipeline(customerId) {
  const run = await createRun(customerId);

  try {
    // 1. Load customer config
    const configResult = await pool.query(
      'SELECT * FROM customer_configs WHERE customer_id = $1',
      [customerId]
    );
    const config = configResult.rows[0] || {
      icp_rules: [],
      prospects_per_run: 50,
      sequence_id: null,
    };

    // 2. Load customer integrations
    const intResult = await pool.query(
      'SELECT * FROM customer_integrations WHERE customer_id = $1',
      [customerId]
    );
    const integrations = intResult.rows;

    // 3. Get enrichment service and CRM service
    const { service: enrichService, apiKey } = getEnricher(integrations);
    const { service: crmService, token: crmToken } = getCRM(integrations);

    // 4. Search for contacts using enrichment tool with ICP filters
    const searchResults = await enrichService.searchContacts(config.icp_rules || [], apiKey);
    const profiles = Array.isArray(searchResults) ? searchResults
      : Array.isArray(searchResults?.data) ? searchResults.data
      : [];

    await updateRun(run.id, { prospects_searched: profiles.length });
    console.log(`[${run.id}] Searched: ${profiles.length} profiles`);

    // 5. Apply ICP filters
    const filtered = applyFilters(profiles, config.icp_rules || []);
    await updateRun(run.id, { prospects_filtered: filtered.length });
    console.log(`[${run.id}] After filters: ${filtered.length}`);

    // 6. Limit to prospects_per_run
    const limited = filtered.slice(0, config.prospects_per_run || 50);

    // 7. Check for duplicates against pushed_prospects table
    const { newProspects, skipped } = await checkDuplicates(limited, customerId);
    await updateRun(run.id, { prospects_skipped_dedup: skipped.length });
    console.log(`[${run.id}] New: ${newProspects.length}, Skipped (dedup): ${skipped.length}`);

    // 8. Enrich net-new prospects
    const enriched = await enrichProspects(newProspects, enrichService, apiKey);
    await updateRun(run.id, { prospects_enriched: enriched.length });
    console.log(`[${run.id}] Enriched: ${enriched.length}`);

    // 9. Push to CRM
    const pushResults = await pushToCRM(enriched, crmService, crmToken, config.sequence_id);
    console.log(`[${run.id}] Pushed: ${pushResults.pushed.length}, Failed: ${pushResults.failed}`);

    // 10. Save pushed prospects to dedup table
    if (pushResults.pushed.length > 0) {
      await savePushedProspects(customerId, pushResults.pushed);
    }

    // 11. Finalize run log
    await updateRun(run.id, {
      prospects_pushed: pushResults.pushed.length,
      status: 'success',
      completed_at: new Date(),
    });

    const summary = {
      runId: run.id,
      status: 'success',
      searched: profiles.length,
      filtered: filtered.length,
      skippedDedup: skipped.length,
      enriched: enriched.length,
      pushed: pushResults.pushed.length,
      failed: pushResults.failed,
    };

    console.log(`[${run.id}] Pipeline completed:`, summary);
    return summary;
  } catch (err) {
    console.error(`[${run.id}] Pipeline failed:`, err);
    await updateRun(run.id, {
      status: 'error',
      error_message: err.message,
      completed_at: new Date(),
    });
    return {
      runId: run.id,
      status: 'error',
      error: err.message,
    };
  }
}

module.exports = { runPipeline };
