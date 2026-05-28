const cron = require('node-cron');
const { runPipeline } = require('./runner');

// Map of customerId -> cron job
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

function registerSchedule(customerId, schedule) {
  // Remove existing job if any
  if (activeJobs.has(customerId)) {
    activeJobs.get(customerId).stop();
    activeJobs.delete(customerId);
  }

  const cronExpression = buildCronExpression(schedule);
  if (!cronExpression) {
    console.error(`No valid schedule days for customer ${customerId}`);
    return;
  }

  const job = cron.schedule(cronExpression, async () => {
    console.log(`Scheduled pipeline run for customer ${customerId}`);
    try {
      await runPipeline(customerId);
    } catch (err) {
      console.error(`Scheduled run failed for customer ${customerId}:`, err);
    }
  });

  activeJobs.set(customerId, job);
  console.log(`Registered schedule for customer ${customerId}: ${cronExpression}`);
}

function unregisterSchedule(customerId) {
  if (activeJobs.has(customerId)) {
    activeJobs.get(customerId).stop();
    activeJobs.delete(customerId);
    console.log(`Unregistered schedule for customer ${customerId}`);
  }
}

/**
 * On startup, load all customers with auto_run_enabled and register their cron jobs.
 */
async function initSchedules(pool) {
  try {
    const result = await pool.query(
      `SELECT c.id, cc.schedule_days, cc.schedule_time
       FROM customers c
       JOIN customer_configs cc ON c.id = cc.customer_id
       WHERE c.subscription_status = 'active'
         AND cc.run_mode = 'automatic'
         AND cc.auto_run_enabled = true`
    );
    for (const row of result.rows) {
      registerSchedule(row.id, {
        days: row.schedule_days,
        time: row.schedule_time,
      });
    }
    console.log(`Scheduler initialized: ${result.rows.length} active schedules`);
  } catch (err) {
    console.error('Failed to initialize schedules:', err);
  }
}

module.exports = { registerSchedule, unregisterSchedule, initSchedules };
