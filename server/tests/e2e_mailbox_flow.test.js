const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/db');
const { encryptToken } = require('../services/crypto.service');

test('E2E Complete Mailbox Lifecycle Flow: Register -> Connect -> Sync -> Read -> AI -> Send -> Batch -> Disconnect', async () => {
  // 1. User Registration
  const userEmail = `e2e_pilot_${Date.now()}@mailpilot.test`;
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'E2E Pilot User',
      email: userEmail,
      password: 'StrongPassword123!',
    });

  assert.equal(registerRes.status, 201);
  assert.equal(registerRes.body.success, true);
  const { token, user } = registerRes.body;
  assert.ok(token);
  assert.ok(user.id);

  // 2. Connect Gmail Account with AES-256-GCM Token Encryption
  const rawAccessToken = 'ya29.a0AfH6SMA_E2E_ACCESS_TOKEN';
  const rawRefreshToken = '1//0gE2E_REFRESH_TOKEN';

  const account = await prisma.account.create({
    data: {
      userId: user.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: `google_${user.id}`,
      accessToken: encryptToken(rawAccessToken),
      refreshToken: encryptToken(rawRefreshToken),
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    },
  });

  assert.ok(account.id);
  assert.ok(account.accessToken.startsWith('enc:'));

  // 3. Verify Gmail Connection Status API
  const statusRes = await request(app)
    .get('/api/auth/gmail/status')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(statusRes.status, 200);
  assert.equal(statusRes.body.connected, true);
  assert.equal(statusRes.body.account.email, userEmail);

  // 4. Trigger Mailbox Sync
  const syncRes = await request(app)
    .post('/api/inbox/sync')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(syncRes.status, 200);
  assert.equal(syncRes.body.success, true);
  assert.ok(syncRes.body.syncedThreads > 0);
  assert.ok(syncRes.body.syncedEmails > 0);

  // 5. Fetch Threads and Inbox Stats
  const threadsRes = await request(app)
    .get('/api/inbox/threads')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(threadsRes.status, 200);
  assert.ok(Array.isArray(threadsRes.body.threads));
  assert.ok(threadsRes.body.threads.length > 0);
  const targetThread = threadsRes.body.threads[0];

  const statsRes = await request(app)
    .get('/api/inbox/stats')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(statsRes.status, 200);
  assert.ok(statsRes.body.stats.inboxUnread >= 0);

  // 6. View Full Thread Conversation Stream
  const threadDetailRes = await request(app)
    .get(`/api/inbox/threads/${targetThread.id}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(threadDetailRes.status, 200);
  assert.equal(threadDetailRes.body.thread.id, targetThread.id);
  assert.ok(Array.isArray(threadDetailRes.body.thread.emails));
  assert.ok(threadDetailRes.body.thread.emails.length > 0);

  // 7. Generate AI Thread Executive Summary
  const summaryRes = await request(app)
    .post(`/api/inbox/threads/${targetThread.id}/summarize`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(summaryRes.status, 200);
  assert.ok(summaryRes.body.aiSummary);
  assert.equal(summaryRes.body.aiSummary.threadId, targetThread.id);
  assert.ok(summaryRes.body.aiSummary.summary.length > 10);

  // 8. Generate AI Smart Replies
  const smartRepliesRes = await request(app)
    .post(`/api/inbox/threads/${targetThread.id}/smart-replies`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(smartRepliesRes.status, 200);
  assert.ok(Array.isArray(smartRepliesRes.body.replies));
  assert.equal(smartRepliesRes.body.replies.length, 3);

  // 9. Polish Email Draft Body
  const polishRes = await request(app)
    .post('/api/inbox/polish')
    .set('Authorization', `Bearer ${token}`)
    .send({
      text: 'please confirm if the contract is signed asap',
      tone: 'professional',
    });

  assert.equal(polishRes.status, 200);
  assert.ok(polishRes.body.polishedText);

  // 10. Draft Lifecycle (Create, List, Delete)
  const draftCreateRes = await request(app)
    .post('/api/inbox/drafts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      to: ['client@acme.corp'],
      subject: 'Draft Q4 Review Proposal',
      bodyText: polishRes.body.polishedText,
    });

  assert.equal(draftCreateRes.status, 200);
  const draftId = draftCreateRes.body.draft.id;

  const draftsListRes = await request(app)
    .get('/api/inbox/drafts')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(draftsListRes.status, 200);
  assert.ok(draftsListRes.body.drafts.some((d) => d.id === draftId));

  const draftDeleteRes = await request(app)
    .delete(`/api/inbox/drafts/${draftId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(draftDeleteRes.status, 200);

  // 11. Send New Outbound Email
  const sendRes = await request(app)
    .post('/api/inbox/send')
    .set('Authorization', `Bearer ${token}`)
    .send({
      to: ['partner@globalventures.io'],
      subject: 'MailPilot Partnership Agreement',
      bodyText: 'We are thrilled to begin our enterprise integration partnership.',
    });

  assert.equal(sendRes.status, 200);
  assert.equal(sendRes.body.success, true);
  assert.ok(sendRes.body.messageId);

  // 12. Send In-Reply-To Message to Existing Thread
  const firstEmail = threadDetailRes.body.thread.emails[0];
  const replyRes = await request(app)
    .post('/api/inbox/send')
    .set('Authorization', `Bearer ${token}`)
    .send({
      to: [firstEmail?.from || 'contact@example.com'],
      subject: `Re: ${targetThread.subject}`,
      bodyText: smartRepliesRes.body.replies[0],
      threadId: targetThread.id,
      inReplyTo: firstEmail?.gmailId || null,
    });

  assert.equal(replyRes.status, 200);
  assert.equal(replyRes.body.threadId, targetThread.id);

  // 13. Search and Multi-Thread Batch Operations
  const searchRes = await request(app)
    .get('/api/inbox/search?q=Partnership')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(searchRes.status, 200);
  assert.ok(Array.isArray(searchRes.body.threads));

  const batchRes = await request(app)
    .post('/api/inbox/batch')
    .set('Authorization', `Bearer ${token}`)
    .send({
      threadIds: [targetThread.id],
      action: 'mark_read',
    });

  assert.equal(batchRes.status, 200);
  assert.equal(batchRes.body.count, 1);

  // 14. Disconnect Gmail Account & Verify Token Purge
  const disconnectRes = await request(app)
    .post('/api/auth/gmail/disconnect')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(disconnectRes.status, 200);
  assert.equal(disconnectRes.body.success, true);

  const statusAfterDisconnect = await request(app)
    .get('/api/auth/gmail/status')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(statusAfterDisconnect.status, 200);
  assert.equal(statusAfterDisconnect.body.connected, false);
});
