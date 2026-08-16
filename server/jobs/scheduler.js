// Campaign Scheduler Worker — MailPilot
// Background job runner that polls and executes scheduled campaign broadcasts

const { prisma, getConnectionStatus } = require('../config/db');
const emailService = require('../services/email.service');

let isRunning = false;
let intervalHandle = null;

/**
 * Poll and dispatch due scheduled campaigns
 */
async function processScheduledCampaigns() {
  if (isRunning || !getConnectionStatus()) {
    return;
  }

  isRunning = true;

  try {
    const now = new Date();

    // Find campaigns that are scheduled and due for dispatch
    const dueCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        workspace: true,
      },
    });

    if (dueCampaigns.length > 0) {
      console.log(`\n⏰ [Scheduler] Found ${dueCampaigns.length} scheduled campaign(s) due for broadcast.`);
    }

    for (const campaign of dueCampaigns) {
      try {
        console.log(`🚀 [Scheduler] Dispatching scheduled campaign "${campaign.name}" (ID: ${campaign.id})...`);

        // Atomically lock campaign status to SENDING
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'SENDING' },
        });

        // Execute batch send through Email Service
        const resolvedWorkspace = campaign.workspace || { id: campaign.workspaceId, name: 'MailPilot Workspace' };
        const result = await emailService.sendCampaignBatch({
          campaign,
          workspace: resolvedWorkspace,
        });

        // Update campaign to SENT with updated stats
        const currentStats = typeof campaign.stats === 'object' && campaign.stats ? { ...campaign.stats } : {};
        const updatedStats = {
          ...currentStats,
          sent: (currentStats.sent || 0) + result.sent,
          delivered: (currentStats.delivered || 0) + result.sent,
        };

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            stats: updatedStats,
          },
        });

        // Create in-app notification for the workspace
        await prisma.notification.create({
          data: {
            workspaceId: campaign.workspaceId,
            type: 'campaign_sent',
            title: `Campaign Broadcast Complete`,
            message: `Scheduled campaign "${campaign.name}" was sent to ${result.sent} recipient(s).`,
          },
        }).catch((e) => console.warn('Failed to create notification:', e.message));

        console.log(`✅ [Scheduler] Campaign "${campaign.name}" successfully sent to ${result.sent} recipient(s).`);
      } catch (err) {
        console.error(`❌ [Scheduler] Failed to process campaign ${campaign.id}:`, err.message);

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'FAILED' },
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('❌ [Scheduler] Error polling scheduled campaigns:', err.message);
  } finally {
    isRunning = false;
  }
}

/**
 * Start the background polling interval (runs every 30 seconds)
 */
function startScheduler(pollIntervalMs = 5000) {
  if (intervalHandle) {
    clearInterval(intervalHandle);
  }

  console.log(`⏰ [Scheduler] Campaign scheduler started (interval: ${pollIntervalMs / 1000}s).`);
  intervalHandle = setInterval(processScheduledCampaigns, pollIntervalMs);

  // Run initial check after 2 seconds
  setTimeout(processScheduledCampaigns, 2000);
}

/**
 * Stop the background scheduler
 */
function stopScheduler() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('🛑 [Scheduler] Campaign scheduler stopped.');
  }
}

module.exports = { startScheduler, stopScheduler, processScheduledCampaigns };
