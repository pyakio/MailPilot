const app = require('./app');
const { connectDB } = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');
const { startScheduler } = require('./jobs/scheduler');

async function start() {
  // Attempt database connection (gracefully skips if DATABASE_URL not set)
  await connectDB();

  // Start campaign background scheduler (5s in dev, configurable via env)
  const pollInterval = process.env.SCHEDULER_INTERVAL_MS ? parseInt(process.env.SCHEDULER_INTERVAL_MS, 10) : 5000;
  startScheduler(pollInterval);

  app.listen(PORT, () => {
    console.log(`\n🚀 MailPilot API running in ${NODE_ENV} mode`);
    console.log(`   → http://localhost:${PORT}/api/status\n`);
  });
}

start().catch((err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

