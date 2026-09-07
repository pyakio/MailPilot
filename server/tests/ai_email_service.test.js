const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/db');
const { summarizeThread, generateSmartReplies, polishEmailDraft } = require('../services/aiEmail.service');
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

test('summarizeThread generates and persists structured AI summary with key points and action items', async () => {
  const user = await createAuthenticatedUser('ai_sum_test');

  // Trigger sync to get threads
  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const threads = await prisma.thread.findMany({ where: { userId: user.userId } });
  assert.ok(threads.length > 0);

  const targetThread = threads[0];

  const summary = await summarizeThread(user.userId, targetThread.id);

  assert.ok(summary);
  assert.equal(summary.threadId, targetThread.id);
  assert.ok(typeof summary.summary === 'string');
  assert.ok(summary.summary.length > 10);
  assert.ok(Array.isArray(summary.keyPoints));
  assert.ok(Array.isArray(summary.actionItems));
  assert.ok(['POSITIVE', 'NEUTRAL', 'URGENT', 'NEGATIVE'].includes(summary.sentiment));

  // Verify in DB
  const dbSummary = await prisma.aiSummary.findFirst({ where: { threadId: targetThread.id } });
  assert.ok(dbSummary);
  assert.equal(dbSummary.id, summary.id);
});

test('generateSmartReplies returns 3 contextual response options', async () => {
  const user = await createAuthenticatedUser('smart_reply_test');

  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const threads = await prisma.thread.findMany({ where: { userId: user.userId } });
  const targetThread = threads[0];

  const result = await generateSmartReplies(user.userId, targetThread.id);

  assert.ok(result);
  assert.ok(Array.isArray(result.replies));
  assert.equal(result.replies.length, 3);
  assert.ok(result.replies.every((r) => typeof r === 'string' && r.length > 5));
});

test('polishEmailDraft rewrites draft text into polished version', async () => {
  const user = await createAuthenticatedUser('polish_test');

  const result = await polishEmailDraft(user.userId, {
    text: 'hey i need the report by tomorrow can you send it thx',
    tone: 'professional',
  });

  assert.ok(result);
  assert.ok(typeof result.polishedText === 'string');
  assert.ok(result.polishedText.length > 10);
});

test('POST /api/inbox/threads/:id/summarize endpoint generates AI summary via HTTP API', async () => {
  const user = await createAuthenticatedUser('http_sum');

  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const listRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user.token}`);

  const threadId = listRes.body.threads[0].id;

  const res = await request(app)
    .post(`/api/inbox/threads/${threadId}/summarize`)
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.aiSummary);
  assert.equal(res.body.aiSummary.threadId, threadId);
});

test('POST /api/inbox/threads/:id/smart-replies endpoint returns reply options', async () => {
  const user = await createAuthenticatedUser('http_replies');

  await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${user.token}`);

  const listRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${user.token}`);

  const threadId = listRes.body.threads[0].id;

  const res = await request(app)
    .post(`/api/inbox/threads/${threadId}/smart-replies`)
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.replies));
  assert.equal(res.body.replies.length, 3);
});

test('POST /api/inbox/polish endpoint refines email content', async () => {
  const user = await createAuthenticatedUser('http_polish');

  const res = await request(app)
    .post('/api/inbox/polish')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      text: 'let us talk about pricing soon',
      tone: 'friendly',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.polishedText);
});
