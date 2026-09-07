const test = require('node:test');
const assert = require('node:assert/strict');
const { prisma } = require('../config/db');

test('Thread and Email models support full mailbox structure and relationships', async () => {
  const userId = `usr_model_test_${Date.now()}`;

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      id: userId,
      name: 'Model Test User',
      email: `${userId}@mailpilot.test`,
    },
  });
  assert.equal(user.id, userId);

  // 2. Create Thread
  const thread = await prisma.thread.create({
    data: {
      userId,
      gmailThreadId: `gm_th_${Date.now()}`,
      subject: 'Quarterly Strategy & AI Productivity',
      snippet: 'Hey team, here is the recap for our Q3 planning session...',
      messageCount: 2,
      unreadCount: 1,
      labels: ['INBOX', 'IMPORTANT'],
    },
  });
  assert.ok(thread.id);
  assert.equal(thread.userId, userId);
  assert.equal(thread.messageCount, 2);

  // 3. Create Email messages within the thread
  const email1 = await prisma.email.create({
    data: {
      userId,
      threadId: thread.id,
      gmailId: `gm_msg_1_${Date.now()}`,
      gmailThreadId: thread.gmailThreadId,
      from: 'sarah@startup.io',
      fromName: 'Sarah Chen',
      to: [user.email],
      subject: 'Quarterly Strategy & AI Productivity',
      snippet: 'Hey team, here is the recap for our Q3 planning session...',
      bodyText: 'Hey team, here is the recap for our Q3 planning session...',
      bodyHtml: '<p>Hey team, here is the recap for our Q3 planning session...</p>',
      isRead: true,
      labels: ['INBOX'],
    },
  });

  const email2 = await prisma.email.create({
    data: {
      userId,
      threadId: thread.id,
      gmailId: `gm_msg_2_${Date.now()}`,
      gmailThreadId: thread.gmailThreadId,
      from: 'alex@example.com',
      fromName: 'Alex Morgan',
      to: [user.email, 'sarah@startup.io'],
      subject: 'Re: Quarterly Strategy & AI Productivity',
      snippet: 'Looks great! I added 2 bullet points on the AI agent features.',
      bodyText: 'Looks great! I added 2 bullet points on the AI agent features.',
      bodyHtml: '<p>Looks great! I added 2 bullet points on the AI agent features.</p>',
      isRead: false,
      labels: ['INBOX', 'UNREAD'],
    },
  });

  assert.equal(email1.threadId, thread.id);
  assert.equal(email2.threadId, thread.id);

  // 4. Create EmailDraft associated with the thread
  const draft = await prisma.emailDraft.create({
    data: {
      userId,
      threadId: thread.id,
      to: ['sarah@startup.io', 'alex@example.com'],
      subject: 'Re: Quarterly Strategy & AI Productivity',
      body: 'Thanks everyone, drafting final action items now.',
      inReplyTo: email2.gmailId,
    },
  });
  assert.ok(draft.id);
  assert.equal(draft.threadId, thread.id);

  // 5. Create AiSummary for the thread
  const summary = await prisma.aiSummary.create({
    data: {
      threadId: thread.id,
      summary: 'Discussion regarding Q3 strategy planning and AI productivity roadmap.',
      keyPoints: ['Sarah shared Q3 planning recap', 'Alex proposed 2 AI agent features'],
      actionItems: ['Draft final action items by Friday'],
      provider: 'gemini',
    },
  });
  assert.ok(summary.id);
  assert.equal(summary.threadId, thread.id);
  assert.equal(summary.actionItems.length, 1);

  // 6. Query thread with relation checks
  const fetchedThread = await prisma.thread.findUnique({
    where: { id: thread.id },
    include: {
      emails: { orderBy: { date: 'asc' } },
      drafts: true,
      aiSummary: true,
    },
  });

  assert.equal(fetchedThread.emails.length, 2);
  assert.equal(fetchedThread.drafts.length, 1);
  assert.equal(fetchedThread.aiSummary.summary, summary.summary);
});
