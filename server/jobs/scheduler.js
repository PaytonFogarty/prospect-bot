const cron = require('node-cron');
const { runPipeline } = require('./runner');

// Map of customerId -> cron job
const activeJobs = new Map();

const SCHEDULE_CRON = {
  daily: '0 9 * * *',           // Every day at 9 AM
  weekdays: '0 9 * * 1-5',     // Weekdays at 9 AM
  weekly: '0 9 * * 1',         // Every Monday at 9 AM
};

function registerSchedule(customerId, schedule) {
  // Remove existing job if any
  if (activeJobs.has(customerId)) {
    activeJobs.get(customerId).stop();
    activeJobs.delete(customerId);
  }

  const cronExpression = SCHEDULE_CRON[schedule];
  if (!cronExpression) {
    console.error(`Unknown schedule type: ${schedule}`);
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
  console.log(`Registered ${schedule} schedule for customer ${customerId}`);
}

function unregisterSchedule(customerId) {
  if (activeJobs.has(customerId)) {
    activeJobs.get(customerId).stop();
    activeJobs.delete(customerId);
  }
}

/**
 * On startup, load all active customers with schedules and register their cron jobs.
 * Call this after DB is ready.
 */
async function initSchedules(db) {
  // TODO: Query all customers with active subscriptions and configured schedules
  // const customers = await db.query('SELECT c.id, cc.schedule FROM customers c JOIN customer_configs cc ON c.id = cc.customer_id WHERE c.subscription_status IN ($1, $2)', ['active', 'trialing']);
  // for (const customer of customers.rows) {
  //   registerSchedule(customer.id, customer.schedule);
  // }
  console.log('Scheduler initialized');
}

module.exports = { registerSchedule, unregisterSchedule, initSchedules };
