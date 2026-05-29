const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Check if prospects have already been pushed for this customer.
 * Queries pushed_prospects table by LinkedIn URL and email.
 * Returns { newProspects, skipped }.
 */
async function checkDuplicates(profiles, customerId) {
  const newProspects = [];
  const skipped = [];

  for (const profile of profiles) {
    try {
      const linkedinUrl = profile.linkedinUrl || profile.linkedin_url || null;
      const email = profile.email || null;

      // Skip profiles with no identifiers
      if (!linkedinUrl && !email) {
        newProspects.push(profile);
        continue;
      }

      // Check by LinkedIn URL first, then email
      let found = false;

      if (linkedinUrl) {
        const result = await pool.query(
          'SELECT id FROM pushed_prospects WHERE customer_id = $1 AND linkedin_url = $2 LIMIT 1',
          [customerId, linkedinUrl]
        );
        if (result.rows.length > 0) found = true;
      }

      if (!found && email) {
        const result = await pool.query(
          'SELECT id FROM pushed_prospects WHERE customer_id = $1 AND email = $2 LIMIT 1',
          [customerId, email]
        );
        if (result.rows.length > 0) found = true;
      }

      if (found) {
        skipped.push(profile);
      } else {
        newProspects.push(profile);
      }
    } catch (err) {
      console.error(`Dedup check failed for ${profile.email || 'unknown'}:`, err.message);
      // If check fails, treat as new to avoid losing prospects
      newProspects.push(profile);
    }
  }

  return { newProspects, skipped };
}

/**
 * Save pushed prospects to the dedup table.
 */
async function savePushedProspects(customerId, contacts) {
  for (const contact of contacts) {
    const linkedinUrl = contact.linkedinUrl || contact.linkedin_url || null;
    const email = contact.email || null;

    if (!linkedinUrl && !email) continue;

    try {
      await pool.query(
        'INSERT INTO pushed_prospects (customer_id, linkedin_url, email) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [customerId, linkedinUrl, email]
      );
    } catch (err) {
      console.error(`Failed to save pushed prospect ${email || linkedinUrl}:`, err.message);
    }
  }
}

module.exports = { checkDuplicates, savePushedProspects };
