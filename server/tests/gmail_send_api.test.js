const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/db');
const { buildRfc2822MimeMessage } = require('../services/gmailSend.service');
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
      scope: 'https://www.googleapis.com/auth/gmail.send',
    },
  });

  return { userId, email, token };
}

test('buildRfc2822MimeMessage formats RFC headers and generates valid Base64URL output', () => {
  const { raw, mimeMessage } = buildRfc2822MimeMessage({
    from: '"Tester" <tester@mailpilot.io>',
    to: ['recipient@test.io', 'team@test.io'],
    cc: ['boss@test.io'],
    subject: 'Quarterly Strategic Update',
    bodyText: 'Hello team, here is the update.',
    bodyHtml: '<p>Hello <b>team</b>, here is the update.</p>',
  });

  assert.ok(raw);
  assert.ok(typeof raw === 'string');
  assert.ok(!raw.includes('+'));
  assert.ok(!raw.includes('/'));
  assert.ok(!raw.includes('='));

  assert.ok(mimeMessage.includes('From: "Tester" <tester@mailpilot.io>'));
  assert.ok(mimeMessage.includes('To: recipient@test.io, team@test.io'));
  assert.ok(mimeMessage.includes('Cc: boss@test.io'));
  assert.ok(mimeMessage.includes('Subject: =?UTF-8?B?'));
  assert.ok(mimeMessage.includes('Content-Type: multipart/alternative; boundary='));
});

test('POST /api/inbox/send requires authentication', async () => {
  const res = await request(app)
    .post('/api/inbox/send')
    .send({
      to: ['client@example.com'],
      subject: 'Test Send',
      bodyText: 'Hello World',
    });

  assert.equal(res.status, 401);
});

test('POST /api/inbox/send validates recipient list', async () => {
  const user = await createAuthenticatedUser('send_val');

  const res = await request(app)
    .post('/api/inbox/send')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      to: [],
      subject: 'Missing recipient',
      bodyText: 'Should fail',
    });

  assert.equal(res.status, 400);
});

test('POST /api/inbox/send creates thread and sent email record', async () => {
  const user = await createAuthenticatedUser('send_ok');

  const res = await request(app)
    .post('/api/inbox/send')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      to: ['client@acme.corp'],
      subject: 'Project Kickoff Proposal',
      bodyText: 'Looking forward to our collaboration.',
      bodyHtml: '<p>Looking forward to our <b>collaboration</b>.</p>',
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.email);
  assert.ok(res.body.threadId);
  assert.equal(res.body.email.isSent, true);
  assert.equal(res.body.email.from, user.email);

  // Check thread created in DB
  const thread = await prisma.thread.findUnique({
    where: { id: res.body.threadId },
    include: { emails: true },
  });

  assert.ok(thread);
  assert.equal(thread.subject, 'Project Kickoff Proposal');
  assert.equal(thread.emails.length, 1);
});

test('POST /api/inbox/send appends reply to existing thread', async () => {
  const user = await createAuthenticatedUser('reply_test');

  // 1. Initial send
  const initialRes = await request(app)
    .post('/api/inbox/send')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      to: ['partner@startup.co'],
      subject: 'Initial Partnership Discussion',
      bodyText: 'First message.',
    });

  const threadId = initialRes.body.threadId;

  // 2. Reply send
  const replyRes = await request(app)
    .post('/api/inbox/send')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      threadId,
      to: ['partner@startup.co'],
      subject: 'Re: Initial Partnership Discussion',
      bodyText: 'Second message in thread.',
    });

  assert.equal(replyRes.status, 200);
  assert.equal(replyRes.body.threadId, threadId);

  const updatedThread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: { emails: true },
  });

  assert.equal(updatedThread.messageCount, 2);
  assert.equal(updatedThread.emails.length, 2);
});

test('Drafts API supports create, list, and delete workflow', async () => {
  const user = await createAuthenticatedUser('draft_user');

  // Create draft
  const createRes = await request(app)
    .post('/api/inbox/drafts')
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      to: ['draft_target@test.com'],
      subject: 'Unfinished Draft Note',
      bodyText: 'Work in progress...',
    });

  assert.equal(createRes.status, 200);
  assert.ok(createRes.body.draft);
  const draftId = createRes.body.draft.id;

  // List drafts
  const listRes = await request(app)
    .get('/api/inbox/drafts')
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.drafts.some((d) => d.id === draftId));

  // Delete draft
  const deleteRes = await request(app)
    .delete(`/api/inbox/drafts/${draftId}`)
    .set('Authorization', `Bearer ${user.token}`);

  assert.equal(deleteRes.status, 200);
  assert.equal(deleteRes.body.success, true);
});
