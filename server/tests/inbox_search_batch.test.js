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

  await prisma.account.create({
    data: {
      userId,
      type: 'oauth',
      provider: 'google',
      providerAccountId: `google_${userId}`,
      accessToken: encryptToken('test_tok_demo'),
      refreshToken: encryptToken('test_ref_demo'),
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    },
  });

  return { userId, email, token };
}

test('GET /api/inbox/search performs multi-criteria search and returns matching threads', async () => {
  const user = await createAuthenticatedUser('search_tester');

  // Trigger sync to seed mailbox
  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  // 1. Search with general query
  const res1 = await request(app)
    .get('/api/inbox/search?q=proposal')
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(res1.status, 200);
  assert.equal(res1.body.success, true);
  assert.ok(Array.isArray(res1.body.threads));

  // 2. Search with label filter
  const res2 = await request(app)
    .get('/api/inbox/search?label=INBOX&isStarred=false')
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(res2.status, 200);
  assert.ok(Array.isArray(res2.body.threads));
});

test('POST /api/inbox/batch executes atomic mark_read and mark_unread on multiple threads', async () => {
  const user = await createAuthenticatedUser('batch_read_test');

  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const listRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user.token}`);

  const threads = listRes.body.threads;
  assert.ok(threads.length >= 2);
  const targetIds = [threads[0].id, threads[1].id];

  // Bulk mark as read
  const readRes = await request(app)
    .post('/api/inbox/batch')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      threadIds: targetIds,
      action: 'mark_read',
    });

  assert.equal(readRes.status, 200);
  assert.equal(readRes.body.success, true);
  assert.equal(readRes.body.count, 2);

  // Verify in DB
  const dbThreads = await prisma.thread.findMany({
    where: { id: { in: targetIds } },
  });
  assert.ok(dbThreads.every((t) => t.unreadCount === 0));

  // Bulk mark as unread
  const unreadRes = await request(app)
    .post('/api/inbox/batch')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      threadIds: targetIds,
      action: 'mark_unread',
    });

  assert.equal(unreadRes.status, 200);
  assert.equal(unreadRes.body.count, 2);

  const dbThreads2 = await prisma.thread.findMany({
    where: { id: { in: targetIds } },
  });
  assert.ok(dbThreads2.every((t) => t.unreadCount >= 1));
});

test('POST /api/inbox/batch executes bulk star, trash, and restore operations', async () => {
  const user = await createAuthenticatedUser('batch_star_trash');

  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const listRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user.token}`);

  const threads = listRes.body.threads;
  const targetIds = [threads[0].id, threads[1].id];

  // 1. Bulk star
  const starRes = await request(app)
    .post('/api/inbox/batch')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      threadIds: targetIds,
      action: 'star',
    });

  assert.equal(starRes.status, 200);
  const starredThreads = await prisma.thread.findMany({
    where: { id: { in: targetIds } },
  });
  assert.ok(starredThreads.every((t) => t.isStarred === true));

  // 2. Bulk trash
  const trashRes = await request(app)
    .post('/api/inbox/batch')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      threadIds: targetIds,
      action: 'trash',
    });

  assert.equal(trashRes.status, 200);
  const trashedThreads = await prisma.thread.findMany({
    where: { id: { in: targetIds } },
  });
  assert.ok(trashedThreads.every((t) => t.labels.includes('TRASH')));

  // 3. Bulk untrash
  const untrashRes = await request(app)
    .post('/api/inbox/batch')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      threadIds: targetIds,
      action: 'untrash',
    });

  assert.equal(untrashRes.status, 200);
  const restoredThreads = await prisma.thread.findMany({
    where: { id: { in: targetIds } },
  });
  assert.ok(restoredThreads.every((t) => !t.labels.includes('TRASH') && t.labels.includes('INBOX')));
});

test('POST /api/inbox/batch rejects attempts to modify other users threads', async () => {
  const user1 = await createAuthenticatedUser('owner_batch');
  const user2 = await createAuthenticatedUser('attacker_batch');

  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user1.token}`);

  const listRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user1.token}`);

  const user1ThreadId = listRes.body.threads[0].id;

  // User 2 tries to batch trash User 1's thread
  const res = await request(app)
    .post('/api/inbox/batch')
    .set('Authorization', `Bearer ${user2.token}`)
    .send({
      threadIds: [user1ThreadId],
      action: 'trash',
    });

  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});
