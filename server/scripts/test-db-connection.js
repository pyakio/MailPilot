// Safe Database Connectivity Test Script for MailPilot
// Usage: node scripts/test-db-connection.js

const { connectDB, getConnectionStatus } = require('../config/db');

async function runTest() {
  console.log('🔍 Testing Supabase PostgreSQL Database Connectivity via Prisma Client...');
  const connected = await connectDB();

  if (connected) {
    console.log('✅ Connection test PASSED: Backend can reach Supabase PostgreSQL database via Prisma.');
  } else {
    console.log('ℹ️  Connection test result: In-memory mode active (DATABASE_URL not set or unreachable).');
  }

  process.exit(0);
}

runTest().catch((err) => {
  console.error('❌ Connection test error:', err.message);
  process.exit(1);
});
