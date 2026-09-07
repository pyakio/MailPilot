// Gmail Sync Background Worker — MailPilot
// Periodically synchronizes connected Gmail accounts with in-flight concurrency locks

const { prisma, getConnectionStatus } = require('../config/db');
const { syncUserInbox } = require('../services/gmailSync.service');

const inFlightUsers = new Set();
let isGlobalSyncing = false;
let intervalHandle = null;

/**
 * Executes a sync pass for all users with a connected Google account
 */
async function syncAllConnectedAccounts() {
  if (isGlobalSyncing || !getConnectionStatus()) {
    return { success: false, reason: 'Already running or DB offline' };
  }

  isGlobalSyncing = true;
  const results = {
    totalAccounts: 0,
    synced: 0,
    skipped: 0,
    failed: 0,
  };

  try {
    const googleAccounts = await prisma.account.findMany({
      where: {
        provider: 'google',
      },
    });

    results.totalAccounts = googleAccounts.length;

    for (const account of googleAccounts) {
      const { userId } = account;

      // Concurrency lock: skip if a sync for this user is already in-flight
      if (inFlightUsers.has(userId)) {
        results.skipped++;
        continue;
      }

      inFlightUsers.add(userId);

      try {
        await syncUserInbox(userId);
        results.synced++;
      } catch (err) {
        results.failed++;
        console.warn(`⚠️ [Gmail Sync Job] Sync failed for user ${userId}:`, err.message);
      } finally {
        inFlightUsers.delete(userId);
      }
    }
  } catch (err) {
    console.error('❌ [Gmail Sync Job] Error in syncAllConnectedAccounts:', err.message);
  } finally {
    isGlobalSyncing = false;
  }

  return { success: true, ...results };
}

/**
 * Starts the periodic Gmail sync scheduler
 */
function startGmailSyncScheduler(pollIntervalMs = 60000) {
  if (intervalHandle) {
    clearInterval(intervalHandle);
  }

  console.log(`📬 [Gmail Sync Job] Scheduler started (interval: ${pollIntervalMs / 1000}s).`);
  intervalHandle = setInterval(syncAllConnectedAccounts, pollIntervalMs);

  // Initial pass after 5 seconds
  setTimeout(syncAllConnectedAccounts, 5000);
}

/**
 * Stops the periodic Gmail sync scheduler
 */
function stopGmailSyncScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('🛑 [Gmail Sync Job] Scheduler stopped.');
  }
}

module.exports = {
  syncAllConnectedAccounts,
  startGmailSyncScheduler,
  stopGmailSyncScheduler,
  inFlightUsers,
};
