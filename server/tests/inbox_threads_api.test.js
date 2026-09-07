const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/db');
const { encryptToken } = require('../services/crypto.service');

async function createAuthenticatedUser(namePrefix) {
  const email = `${namePrefix}_${Date.now()}@mailpilot.test`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: `${namePrefix} User`,
      email,
      password: 'password123',
    });

  const userId = res.body.user.id;
  const token = res.body.token;

  // Link Google account so sync & mailbox features work
  await prisma.account.create({
    data: {
      userId,
      type: 'oauth',
      provider: 'google',
      providerAccountId: `google_${userId}`,
      accessToken: encryptToken('test_tok_demo'),
      refreshToken: encryptToken('test_ref_demo'),
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
      scope: 'https://www.googleapis.com/auth/gmail.modify',
    },
  });

  return { userId, email, token };
}

test('GET /api/inbox/threads requires authentication', async () => {
  const res = await request(app).get('/api/inbox/threads');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('GET /api/inbox/threads auto-syncs and returns paginated thread collection', async () => {
  const user = await createAuthenticatedUser('inbox_list');

  const res = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.threads));
  assert.ok(res.body.threads.length >= 3);
  assert.ok(res.body.pagination);
  assert.equal(res.body.pagination.page, 1);
  assert.equal(typeof res.body.unreadTotal, 'number');
});

test('GET /api/inbox/threads/:id returns full message stream and attached metadata', async () => {
  const user = await createAuthenticatedUser('thread_detail');

  // Trigger sync
  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const listRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user.token}`);

  const targetThread = listRes.body.threads[0];
  assert.ok(targetThread);

  const detailRes = await request(app)
    .get(`/api/inbox/threads/${targetThread.id}`)
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(detailRes.status, 200);
  assert.equal(detailRes.body.success, true);
  assert.equal(detailRes.body.thread.id, targetThread.id);
  assert.ok(Array.isArray(detailRes.body.thread.emails));
  assert.ok(detailRes.body.thread.emails.length > 0);
  assert.equal(detailRes.body.thread.emails[0].threadId, targetThread.id);
});

test('GET /api/inbox/threads/:id denies access to other users threads with 404', async () => {
  const user1 = await createAuthenticatedUser('owner_user');
  const user2 = await createAuthenticatedUser('attacker_user');

  // Sync user1
  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user1.token}`);

  const listRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user1.token}`);

  const user1ThreadId = listRes.body.threads[0].id;

  // Try to access user1's thread with user2's token
  const res = await request(app)
    .get(`/api/inbox/threads/${user1ThreadId}`)
    .set('Authorization', `Bearer ${user2.token}`);

  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

test('PATCH /api/inbox/threads/:id/read marks thread and emails as read/unread', async () => {
  const user = await createAuthenticatedUser('read_toggle');
  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const listRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user.token}`);

  const thread = listRes.body.threads[0];

  // Mark as read
  const readRes = await request(app)
    .patch(`/api/inbox/threads/${thread.id}/read`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ isRead: true });

  assert.equal(readRes.status, 200);
  assert.equal(readRes.body.success, true);
  assert.equal(readRes.body.isRead, true);
  assert.equal(readRes.body.thread.unreadCount, 0);

  // Mark as unread
  const unreadRes = await request(app)
    .patch(`/api/inbox/threads/${thread.id}/read`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ isRead: false });

  assert.equal(unreadRes.status, 200);
  assert.equal(unreadRes.body.isRead, false);
  assert.ok(unreadRes.body.thread.unreadCount >= 1);
});

test('PATCH /api/inbox/threads/:id/star toggles starred flag on thread and emails', async () => {
  const user = await createAuthenticatedUser('star_toggle');
  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const listRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user.token}`);

  const thread = listRes.body.threads[0];

  const starRes = await request(app)
    .patch(`/api/inbox/threads/${thread.id}/star`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ isStarred: true });

  assert.equal(starRes.status, 200);
  assert.equal(starRes.body.isStarred, true);
  assert.equal(starRes.body.thread.isStarred, true);

  const unstarRes = await request(app)
    .patch(`/api/inbox/threads/${thread.id}/star`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ isStarred: false });

  assert.equal(unstarRes.status, 200);
  assert.equal(unstarRes.body.isStarred, false);
  assert.equal(unstarRes.body.thread.isStarred, false);
});

test('POST /api/inbox/threads/:id/trash and /untrash updates labels cleanly', async () => {
  const user = await createAuthenticatedUser('trash_test');
  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const listRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user.token}`);

  const thread = listRes.body.threads[0];

  const trashRes = await request(app)
    .post(`/api/inbox/threads/${thread.id}/trash`)
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(trashRes.status, 200);
  assert.ok(trashRes.body.thread.labels.includes('TRASH'));
  assert.ok(!trashRes.body.thread.labels.includes('INBOX'));

  const untrashRes = await request(app)
    .post(`/api/inbox/threads/${thread.id}/untrash`)
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(untrashRes.status, 200);
  assert.ok(!untrashRes.body.thread.labels.includes('TRASH'));
  assert.ok(untrashRes.body.thread.labels.includes('INBOX'));
});

test('GET /api/inbox/stats returns sidebar badge counts', async () => {
  const user = await createAuthenticatedUser('stats_test');
  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const res = await request(app)
    .get('/api/inbox/stats')
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(typeof res.body.stats.inboxUnread, 'number');
  assert.equal(typeof res.body.stats.starred, 'number');
  assert.equal(typeof res.body.stats.sent, 'number');
  assert.equal(typeof res.body.stats.trash, 'number');
});
