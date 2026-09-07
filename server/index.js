const app = require('./app');
const { connectDB } = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');
const { startScheduler, stopScheduler } = require('./jobs/scheduler');
const { startGmailSyncScheduler, stopGmailSyncScheduler } = require('./jobs/gmailSyncJob');

async function start() {
  // Attempt database connection (gracefully skips if DATABASE_URL not set)
  await connectDB();

  // Start campaign background scheduler (5s in dev, configurable via env)
  const pollInterval = process.env.SCHEDULER_INTERVAL_MS ? parseInt(process.env.SCHEDULER_INTERVAL_MS, 10) : 5000;
  startScheduler(pollInterval);

  // Start Gmail mailbox background sync worker (60s in dev, configurable via env)
  const syncInterval = process.env.GMAIL_SYNC_INTERVAL_MS ? parseInt(process.env.GMAIL_SYNC_INTERVAL_MS, 10) : 60000;
  startGmailSyncScheduler(syncInterval);

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 MailPilot API running in ${NODE_ENV} mode`);
    console.log(`   → http://localhost:${PORT}/api/status\n`);
  });

  const shutdown = () => {
    console.log('\n🛑 Gracefully shutting down MailPilot server...');
    stopScheduler();
    stopGmailSyncScheduler();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
