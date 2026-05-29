const cron = require('node-cron');
const { runPipeline } = require('./runner');

// Map of configId -> cron job
const activeJobs = new Map();

const DAY_MAP = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

function buildCronExpression(schedule) {
  const { days, time } = schedule;
  if (!days || days.length === 0) return null;

  const [hour, minute] = (time || '08:00').split(':').map(Number);
  const dayNumbers = days.map(d => DAY_MAP[d]).filter(n => n !== undefined).join(',');

  return `${minute} ${hour} * * ${dayNumbers}`;
}

/**
 * Register a cron job for a specific prospect config.
 * schedule: { days, time, customerId }
 */
function registerSchedule(configId, schedule) {
  if (activeJobs.has(configId)) {
    activeJobs.get(configId).stop();
    activeJobs.delete(configId);
  }

  const cronExpression = buildCronExpression(schedule);
  if (!cronExpression) {
    console.error(`No valid schedule days for config ${configId}`);
    return;
  }

  const { customerId } = schedule;
  const job = cron.schedule(cronExpression, async () => {
    console.log(`Scheduled pipeline run for config ${configId}`);
    try {
      await runPipeline(customerId, configId);
    } catch (err) {
      console.error(`Scheduled run failed for config ${configId}:`, err);
    }
  });

  activeJobs.set(configId, job);
  console.log(`Registered schedule for config ${configId}: ${cronExpression}`);
}

function unregisterSchedule(configId) {
  if (activeJobs.has(configId)) {
    activeJobs.get(configId).stop();
    activeJobs.delete(configId);
    console.log(`Unregistered schedule for config ${configId}`);
  }
}

/**
 * On startup, load all prospect_configs with auto_run_enabled and register cron jobs.
 */
async function initSchedules(pool) {
  try {
    const result = await pool.query(
      `SELECT pc.id, pc.customer_id, pc.assigned_days, pc.run_time
       FROM prospect_configs pc
       JOIN customers c ON pc.customer_id = c.id
       WHERE c.subscription_status = 'active'
         AND pc.auto_run_enabled = true
         AND array_length(pc.assigned_days, 1) > 0`
    );
    for (const row of result.rows) {
      registerSchedule(row.id, {
        days: row.assigned_days,
        time: row.run_time,
        customerId: row.customer_id,
      });
    }
    console.log(`Scheduler initialized: ${result.rows.length} active config schedules`);
  } catch (err) {
    console.error('Failed to initialize schedules:', err);
  }
}

module.exports = { registerSchedule, unregisterSchedule, initSchedules };
