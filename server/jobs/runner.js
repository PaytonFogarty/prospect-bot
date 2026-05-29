const { Pool } = require('pg');
const { getEnricher } = require('../services/enricher-router');
const { getCRM } = require('../services/crm-router');
const { checkDuplicates, savePushedProspects } = require('../engine/dedup');
const { enrichProspects } = require('../engine/enricher');
const { pushToCRM } = require('../engine/pusher');
const { createRun, updateRun } = require('../db/runs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Run the prospecting pipeline for a specific config.
 */
async function runPipeline(customerId, configId) {
  // Create run log linked to this config
  const runResult = await pool.query(
    'INSERT INTO run_logs (customer_id, config_id) VALUES ($1, $2) RETURNING *',
    [customerId, configId]
  );
  const run = runResult.rows[0];

  try {
    // 1. Load the specific prospect config
    const configResult = await pool.query(
      'SELECT * FROM prospect_configs WHERE id = $1 AND customer_id = $2',
      [configId, customerId]
    );
    if (configResult.rows.length === 0) {
      throw new Error('Config not found');
    }
    const config = configResult.rows[0];

    // 2. Load customer integrations
    const intResult = await pool.query(
      'SELECT * FROM customer_integrations WHERE customer_id = $1',
      [customerId]
    );
    const integrations = intResult.rows;

    // 3. Get enrichment service and CRM service
    const { service: enrichService, apiKey } = getEnricher(integrations);
    const { service: crmService, token: crmToken } = getCRM(integrations);

    // 4. Search using config keywords, locations, companies
    const searchFilters = {
      jobTitles: config.keywords || [],
      locations: config.locations || [],
      companyNames: config.include_companies || [],
      industries: config.industries || [],
    };
    const searchResults = await enrichService.searchContacts(searchFilters, apiKey);
    const profiles = Array.isArray(searchResults) ? searchResults
      : Array.isArray(searchResults?.data) ? searchResults.data
      : [];

    await updateRun(run.id, { prospects_searched: profiles.length });
    console.log(`[${run.id}] Searched: ${profiles.length} profiles`);

    // 5. Filter out excluded companies
    const excludeSet = new Set((config.exclude_companies || []).map(c => c.toLowerCase()));
    const filtered = excludeSet.size > 0
      ? profiles.filter(p => {
          const companyName = (p.company?.name || p.companyName || '').toLowerCase();
          return !excludeSet.has(companyName);
        })
      : profiles;

    await updateRun(run.id, { prospects_filtered: filtered.length });
    console.log(`[${run.id}] After exclude filter: ${filtered.length}`);

    // 6. Limit to prospects_per_run
    const limited = filtered.slice(0, config.prospects_per_run || 50);

    // 7. Dedup against pushed_prospects
    const { newProspects, skipped } = await checkDuplicates(limited, customerId);
    await updateRun(run.id, { prospects_skipped_dedup: skipped.length });
    console.log(`[${run.id}] New: ${newProspects.length}, Skipped: ${skipped.length}`);

    // 8. Enrich
    const enriched = await enrichProspects(newProspects, enrichService, apiKey);
    await updateRun(run.id, { prospects_enriched: enriched.length });
    console.log(`[${run.id}] Enriched: ${enriched.length}`);

    // 9. Push to CRM
    const pushResults = await pushToCRM(enriched, crmService, crmToken, null);
    console.log(`[${run.id}] Pushed: ${pushResults.pushed.length}, Failed: ${pushResults.failed}`);

    // 10. Save pushed prospects for dedup
    if (pushResults.pushed.length > 0) {
      await savePushedProspects(customerId, pushResults.pushed);
    }

    // 11. Finalize
    await updateRun(run.id, {
      prospects_pushed: pushResults.pushed.length,
      status: 'success',
      completed_at: new Date(),
    });

    const summary = {
      runId: run.id,
      configName: config.name,
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
    return { runId: run.id, status: 'error', error: err.message };
  }
}

/**
 * Refresh existing CRM prospects with fresh enrichment data.
 */
async function runRefresh(customerId) {
  // Create refresh log
  const logResult = await pool.query(
    'INSERT INTO refresh_logs (customer_id) VALUES ($1) RETURNING *',
    [customerId]
  );
  const log = logResult.rows[0];

  try {
    // Load integrations
    const intResult = await pool.query(
      'SELECT * FROM customer_integrations WHERE customer_id = $1',
      [customerId]
    );
    const integrations = intResult.rows;

    const { service: enrichService, apiKey } = getEnricher(integrations);
    const { service: crmService, token: crmToken } = getCRM(integrations);

    // Get existing prospects from CRM (first 100)
    let existingProspects = [];
    try {
      existingProspects = await crmService.searchProspects({}, crmToken);
      if (!Array.isArray(existingProspects)) {
        existingProspects = existingProspects?.data || [];
      }
      existingProspects = existingProspects.slice(0, 100);
    } catch (err) {
      console.error('Failed to fetch CRM prospects for refresh:', err.message);
      throw new Error('Could not fetch existing prospects from CRM');
    }

    let checked = 0;
    let updated = 0;

    for (const prospect of existingProspects) {
      checked++;
      try {
        const name = prospect.firstName || prospect.name;
        const company = prospect.company || prospect.companyName;
        if (!name || !company) continue;

        // Search enrichment tool for fresh data
        const searchResults = await enrichService.searchContacts({
          jobTitles: [prospect.title || ''],
          companyNames: [company],
        }, apiKey);

        const freshData = Array.isArray(searchResults?.data) ? searchResults.data[0]
          : Array.isArray(searchResults) ? searchResults[0]
          : null;

        if (!freshData) continue;

        // Compare fields
        const changes = {};
        const freshEmail = freshData.emailAddresses?.[0]?.email || freshData.email;
        const freshPhone = freshData.phoneNumbers?.[0]?.number || freshData.phone;
        const freshTitle = freshData.jobTitle || freshData.currentTitle;

        if (freshEmail && freshEmail !== prospect.email) changes.email = freshEmail;
        if (freshPhone && freshPhone !== prospect.phone) changes.phone = freshPhone;
        if (freshTitle && freshTitle !== prospect.title) changes.title = freshTitle;

        if (Object.keys(changes).length > 0) {
          // Update in CRM
          try {
            await crmService.createProspect({
              ...prospect,
              emails: changes.email ? [changes.email] : prospect.emails,
              phones: changes.phone ? [changes.phone] : prospect.phones,
              title: changes.title || prospect.title,
            }, crmToken);
            updated++;
          } catch (updateErr) {
            console.error(`Failed to update prospect ${prospect.email}:`, updateErr.message);
          }
        }
      } catch (err) {
        console.error(`Refresh check failed for prospect:`, err.message);
      }
    }

    // Finalize
    await pool.query(
      'UPDATE refresh_logs SET prospects_checked = $1, prospects_updated = $2, status = $3, completed_at = NOW() WHERE id = $4',
      [checked, updated, 'success', log.id]
    );

    const summary = { logId: log.id, status: 'success', checked, updated };
    console.log('Refresh completed:', summary);
    return summary;
  } catch (err) {
    console.error(`Refresh failed:`, err);
    await pool.query(
      'UPDATE refresh_logs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3',
      ['error', err.message, log.id]
    );
    return { logId: log.id, status: 'error', error: err.message };
  }
}

module.exports = { runPipeline, runRefresh };
