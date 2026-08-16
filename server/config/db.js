// PostgreSQL / Prisma connection manager for MailPilot
// Usage: call connectDB() at server startup.
// Safe connectivity test for Supabase PostgreSQL using Prisma Client with in-memory dev support.

const prisma = require('./prisma');
const { setDbLiveStatus } = require('./prisma');
const { DATABASE_URL, NODE_ENV } = require('./env');

// Initialized to true so in-memory store is immediately active in dev & test environments
let isConnected = true;

async function connectDB() {
  if (!DATABASE_URL || DATABASE_URL.includes('postgres.example')) {
    console.warn(
      '⚠️  [DB] DATABASE_URL not configured for live Supabase PostgreSQL — running with persistent in-memory engine.\n' +
      '    Configure DATABASE_URL in server/.env for production Supabase PostgreSQL persistence.'
    );
    setDbLiveStatus(false);
    isConnected = true;
    return true;
  }

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    isConnected = true;
    setDbLiveStatus(true);
    console.log('✅ [DB] PostgreSQL database connected via Prisma Client.');
    return true;
  } catch (err) {
    console.error('❌ [DB] Failed to connect to PostgreSQL database via Prisma:', err.message);
    if (NODE_ENV === 'production') {
      process.exit(1);
    }
    console.warn('   Falling back to persistent in-memory engine for local development.');
    setDbLiveStatus(false);
    isConnected = true;
    return true;
  }
}

function getConnectionStatus() {
  return isConnected;
}

module.exports = { connectDB, getConnectionStatus, prisma };
