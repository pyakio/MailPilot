const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/db');
const { encryptToken } = require('../services/crypto.service');

test('POST /api/inbox/sync rejects unauthenticated requests with 401', async () => {
  const res = await request(app).post('/api/inbox/sync');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('POST /api/inbox/sync returns 404 if user has not connected Gmail', async () => {
  const email = `no_gmail_${Date.now()}@example.com`;
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'No Gmail User',
      email,
      password: 'password123',
    });

  const token = regRes.body.token;

  const syncRes = await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(syncRes.status, 404);
  assert.equal(syncRes.body.success, false);
});

test('POST /api/inbox/sync synchronizes mailbox threads and messages into database', async () => {
  const email = `sync_tester_${Date.now()}@example.com`;
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Sync Tester',
      email,
      password: 'password123',
    });

  const userId = regRes.body.user.id;
  const token = regRes.body.token;

  // Link a Google account with mock token
  await prisma.account.create({
    data: {
      userId,
      type: 'oauth',
      provider: 'google',
      providerAccountId: `google_${userId}`,
      accessToken: encryptToken('test_access_token_demo'),
      refreshToken: encryptToken('test_refresh_token_demo'),
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      scope: 'https://www.googleapis.com/auth/gmail.modify',
    },
  });

  const syncRes = await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(syncRes.status, 200);
  assert.equal(syncRes.body.success, true);
  assert.ok(syncRes.body.syncedThreads > 0);
  assert.ok(syncRes.body.syncedEmails > 0);

  // Verify threads were persisted to database
  const userThreads = await prisma.thread.findMany({
    where: { userId },
    include: { emails: true },
  });

  assert.ok(userThreads.length >= 3);
  assert.ok(userThreads.some((t) => t.subject.includes('Welcome to MailPilot')));

  // Verify email messages exist under thread
  const welcomeThread = userThreads.find((t) => t.subject.includes('Welcome to MailPilot'));
  assert.ok(welcomeThread);
  assert.ok(welcomeThread.emails.length > 0);
  assert.ok(welcomeThread.emails[0].bodyText.includes('Welcome to MailPilot'));
});
