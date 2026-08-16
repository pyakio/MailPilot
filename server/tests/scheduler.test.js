const test = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../config/prisma');
const { processScheduledCampaigns } = require('../jobs/scheduler');

test('processScheduledCampaigns automatically dispatches due scheduled campaigns', async () => {
  // Create a campaign scheduled in the past
  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: 'ws_default_01',
      name: 'Scheduler Auto-Fire Test',
      subject: 'Scheduled Broadcast Execution',
      content: '<p>Triggered automatically by background scheduler.</p>',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() - 60000), // 1 minute ago
    },
  });

  // Run the scheduler worker pass
  await processScheduledCampaigns();

  // Verify status transitioned from SCHEDULED -> SENT
  const updated = await prisma.campaign.findUnique({
    where: { id: campaign.id },
  });

  assert.equal(updated.status, 'SENT');
  assert.ok(updated.sentAt);
  assert.ok(updated.stats.sent >= 1);
});
