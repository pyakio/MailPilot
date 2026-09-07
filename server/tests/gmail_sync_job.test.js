const test = require('node:test');
const assert = require('node:assert/strict');
const { prisma } = require('../config/db');
const { encryptToken } = require('../services/crypto.service');
const {
  syncAllConnectedAccounts,
  startGmailSyncScheduler,
  stopGmailSyncScheduler,
  inFlightUsers,
} = require('../jobs/gmailSyncJob');

test('syncAllConnectedAccounts iterates across all connected Google users and syncs mailboxes', async () => {
  const user1Id = `usr_syncjob_1_${Date.now()}`;
  const user2Id = `usr_syncjob_2_${Date.now()}`;

  await prisma.user.create({
    data: { id: user1Id, name: 'Sync User 1', email: `${user1Id}@test.io` },
  });
  await prisma.user.create({
    data: { id: user2Id, name: 'Sync User 2', email: `${user2Id}@test.io` },
  });

  await prisma.account.create({
    data: {
      userId: user1Id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: `google_${user1Id}`,
      accessToken: encryptToken('test_tok_1'),
      refreshToken: encryptToken('test_ref_1'),
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    },
  });

  await prisma.account.create({
    data: {
      userId: user2Id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: `google_${user2Id}`,
      accessToken: encryptToken('test_tok_2'),
      refreshToken: encryptToken('test_ref_2'),
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    },
  });

  const result = await syncAllConnectedAccounts();

  assert.equal(result.success, true);
  assert.ok(result.totalAccounts >= 2);
  assert.ok(result.synced >= 2);

  // Check both users have threads created
  const threads1 = await prisma.thread.findMany({ where: { userId: user1Id } });
  const threads2 = await prisma.thread.findMany({ where: { userId: user2Id } });

  assert.ok(threads1.length > 0);
  assert.ok(threads2.length > 0);
});

test('syncAllConnectedAccounts skips users with active in-flight sync locks', async () => {
  const lockedUserId = `usr_locked_${Date.now()}`;

  await prisma.user.create({
    data: { id: lockedUserId, name: 'Locked User', email: `${lockedUserId}@test.io` },
  });

  await prisma.account.create({
    data: {
      userId: lockedUserId,
      type: 'oauth',
      provider: 'google',
      providerAccountId: `google_${lockedUserId}`,
      accessToken: encryptToken('test_tok_locked'),
    },
  });

  // Manually acquire lock
  inFlightUsers.add(lockedUserId);

  try {
    const result = await syncAllConnectedAccounts();
    assert.equal(result.success, true);
    assert.ok(result.skipped >= 1);
  } finally {
    inFlightUsers.delete(lockedUserId);
  }
});

test('startGmailSyncScheduler and stopGmailSyncScheduler start and stop cleanly', () => {
  startGmailSyncScheduler(100000);
  stopGmailSyncScheduler();
});
