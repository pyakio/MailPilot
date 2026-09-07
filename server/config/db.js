// PostgreSQL / Prisma connection manager for MailPilot
// Connects to Supabase PostgreSQL via Prisma, falls back to in-memory store in dev.

const prisma = require('./prisma');
const { setDbLiveStatus } = require('./prisma');
const { DATABASE_URL, NODE_ENV, SUPABASE_URL } = require('./env');
const { ApiError } = require('../middlewares/error.middleware');

let isConnected = true; // In-memory fallback store is active immediately

async function connectDB() {
  if (!DATABASE_URL || DATABASE_URL.includes('[YOUR_DB_PASSWORD]') || DATABASE_URL.includes('postgres.example')) {
    console.warn(
      '⚠️  [DB] DATABASE_URL not configured for live Supabase PostgreSQL — running with persistent in-memory engine.\n' +
      '    To connect to Supabase PostgreSQL:\n' +
      '    1. Go to: Supabase Dashboard → Settings → Database → Connection string\n' +
      '    2. Copy the Transaction Pooler URL (port 6543)\n' +
      '    3. Replace [YOUR_DB_PASSWORD] in server/.env with your database password\n' +
      (SUPABASE_URL ? `    4. Your Supabase project: ${SUPABASE_URL}` : '')
    );
    setDbLiveStatus(false);
    isConnected = true; // In-memory store is ready immediately
    return true;
  }

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;

    isConnected = true;
    setDbLiveStatus(true);
    console.log('✅ [DB] Connected to Supabase PostgreSQL via Prisma.');
    if (SUPABASE_URL) console.log(`   Project: ${SUPABASE_URL}`);
    return true;
  } catch (err) {
    console.error('❌ [DB] Failed to connect to Supabase PostgreSQL:', err.message);
    if (err.message.includes('password')) {
      console.error('   → Check your DATABASE_URL password in server/.env');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('   → Could not resolve DB host. Check your DATABASE_URL hostname in server/.env');
    }
    if (NODE_ENV === 'production') process.exit(1);
    console.warn('   Falling back to persistent in-memory engine for local development.');
    setDbLiveStatus(false);
    isConnected = true; // In-memory store is ready as fallback
    return true;
  }
}

function getConnectionStatus() {
  return isConnected;
}

/**
 * Throws a 503 ApiError if the DB/in-memory store is not yet ready.
 * Import this in controllers instead of copy-pasting the check.
 */
function ensureDbConnected() {
  if (!isConnected) {
    throw new ApiError(503, 'Database connection unavailable. Please ensure DATABASE_URL is configured in server/.env.');
  }
}

module.exports = { connectDB, getConnectionStatus, ensureDbConnected, prisma };
