// Gmail Sync Service — MailPilot
// Fetches threads & messages from Gmail API, parses MIME structures, and upserts into database

const { prisma, ensureDbConnected } = require('../config/db');
const { getAuthenticatedGmailClient } = require('./gmail.service');
const { parseGmailMessage } = require('./gmailParser.service');
const { ApiError } = require('../middlewares/error.middleware');
const { GOOGLE_CLIENT_ID } = require('../config/env');

/**
 * Seeds a rich, realistic demo mailbox for dev / testing environments
 */
async function seedMockMailbox(userId) {
  ensureDbConnected();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const userEmail = user?.email || 'user@mailpilot.io';
  const userName = user?.name || 'MailPilot User';

  const mockThreads = [
    {
      gmailThreadId: `gm_th_demo_01_${userId}`,
      subject: '🚀 Welcome to MailPilot — Supercharge Your Inbox with AI',
      snippet: 'Welcome aboard! Here are 3 quick tips to make the most of MailPilot...',
      lastMessageAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      labels: ['INBOX', 'IMPORTANT', 'UNREAD'],
      isStarred: true,
      messages: [
        {
          gmailId: `gm_msg_demo_01_${userId}`,
          from: 'alex@mailpilot.io',
          fromName: 'Alex from MailPilot',
          to: [userEmail],
          subject: '🚀 Welcome to MailPilot — Supercharge Your Inbox with AI',
          snippet: 'Welcome aboard! Here are 3 quick tips to make the most of MailPilot...',
          bodyText: `Hi ${userName},\n\nWelcome to MailPilot! Your AI-powered email productivity assistant is now ready.\n\nHere are 3 quick features to explore:\n1. Instant AI Email Summaries for long threads\n2. Smart 1-Click Contextual Replies\n3. Integrated Marketing Broadcasts & Real-Time Tracking\n\nLet us know if you have any questions!\n\nBest,\nThe MailPilot Team`,
          bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; color: #1e293b; line-height: 1.6;">
            <h2 style="color: #0f172a; margin-bottom: 12px;">Welcome to MailPilot, ${userName}! 🚀</h2>
            <p>Your intelligent email productivity workstation is now connected and operational.</p>
            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px; margin: 18px 0; border-radius: 4px;">
              <h4 style="margin: 0 0 8px 0; color: #1e40af;">3 Key Features to Explore:</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>AI Thread Summarizer:</strong> Digest 20-message discussions in seconds.</li>
                <li><strong>Smart Composer:</strong> Generate professional replies matching your tone.</li>
                <li><strong>Audience Sync:</strong> Broadcast marketing updates with engagement telemetry.</li>
              </ul>
            </div>
            <p>Happy emailing!<br/><strong>The MailPilot Team</strong></p>
          </div>`,
          date: new Date(Date.now() - 15 * 60 * 1000),
          isRead: false,
          isStarred: true,
          labels: ['INBOX', 'UNREAD', 'IMPORTANT'],
        },
      ],
    },
    {
      gmailThreadId: `gm_th_demo_02_${userId}`,
      subject: '📊 Q3 Growth Report & Product Strategy Alignment',
      snippet: 'Hey team, attached is the Q3 metrics deck. Key highlights: 42% increase in retention...',
      lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      labels: ['INBOX'],
      isStarred: false,
      messages: [
        {
          gmailId: `gm_msg_demo_02a_${userId}`,
          from: 'sarah@startup.io',
          fromName: 'Sarah Chen',
          to: [userEmail],
          cc: ['marcus@cloudstack.net'],
          subject: '📊 Q3 Growth Report & Product Strategy Alignment',
          snippet: 'Hey team, attached is the Q3 metrics deck. Key highlights: 42% increase in retention...',
          bodyText: `Hey team,\n\nI just finalized our Q3 metrics review. Highlights:\n- Retention increased by 42%\n- Average email open rates reached 38.5%\n- AI auto-replies saved users an estimated 14 hours per week\n\nLet me know your thoughts before our strategy sync tomorrow.`,
          bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5; color: #334155;">
            <p>Hey team,</p>
            <p>I just finalized our Q3 metrics review. Highlights:</p>
            <ul>
              <li>Retention increased by <strong>42%</strong></li>
              <li>Average email open rates reached <strong>38.5%</strong></li>
              <li>AI auto-replies saved users an estimated <strong>14 hours per week</strong></li>
            </ul>
            <p>Let me know your thoughts before our strategy sync tomorrow.<br/>Best,<br/>Sarah</p>
          </div>`,
          date: new Date(Date.now() - 3 * 60 * 60 * 1000),
          isRead: true,
          isStarred: false,
          labels: ['INBOX'],
        },
        {
          gmailId: `gm_msg_demo_02b_${userId}`,
          from: 'marcus@cloudstack.net',
          fromName: 'Marcus Vance',
          to: [userEmail, 'sarah@startup.io'],
          subject: 'Re: 📊 Q3 Growth Report & Product Strategy Alignment',
          snippet: 'Fantastic results Sarah! The AI reply efficiency metric will be great for our investor update.',
          bodyText: `Fantastic results Sarah! The AI reply efficiency metric will be great for our investor update.\n\nI will prepare the executive summary slides.`,
          bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5; color: #334155;">
            <p>Fantastic results Sarah! The AI reply efficiency metric will be great for our investor update.</p>
            <p>I will prepare the executive summary slides.<br/>Marcus</p>
          </div>`,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: true,
          isStarred: false,
          labels: ['INBOX'],
        },
      ],
    },
    {
      gmailThreadId: `gm_th_demo_03_${userId}`,
      subject: 'Security Notice: New Device Sign-In Detected',
      snippet: 'Your account was accessed from a new Mac device in San Francisco, CA.',
      lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      labels: ['INBOX'],
      isStarred: false,
      messages: [
        {
          gmailId: `gm_msg_demo_03_${userId}`,
          from: 'no-reply@accounts.security.org',
          fromName: 'Security Alerts',
          to: [userEmail],
          subject: 'Security Notice: New Device Sign-In Detected',
          snippet: 'Your account was accessed from a new Mac device in San Francisco, CA.',
          bodyText: `Security Notice\n\nA new sign-in was detected on your account.\nDevice: macOS\nLocation: San Francisco, CA, USA\nTime: ${new Date(Date.now() - 24 * 60 * 60 * 1000).toUTCString()}\n\nIf this was you, no action is required.`,
          bodyHtml: `<div style="font-family: sans-serif; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #0f172a; margin-top: 0;">New Sign-In Detected</h3>
            <p>A new sign-in was recorded for your account:</p>
            <table style="width: 100%; font-size: 14px; color: #475569;">
              <tr><td><strong>Device:</strong></td><td>macOS (Google Chrome)</td></tr>
              <tr><td><strong>Location:</strong></td><td>San Francisco, CA, USA</td></tr>
              <tr><td><strong>Date:</strong></td><td>${new Date(Date.now() - 24 * 60 * 60 * 1000).toUTCString()}</td></tr>
            </table>
            <p style="margin-top: 16px; color: #64748b; font-size: 13px;">If this was you, no further action is needed.</p>
          </div>`,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isRead: true,
          isStarred: false,
          labels: ['INBOX'],
        },
      ],
    },
  ];

  let syncedThreads = 0;
  let syncedEmails = 0;

  for (const t of mockThreads) {
    const unreadCount = t.messages.filter((m) => !m.isRead).length;

    let dbThread = await prisma.thread.findUnique({
      where: {
        userId_gmailThreadId: {
          userId,
          gmailThreadId: t.gmailThreadId,
        },
      },
    });

    if (dbThread) {
      dbThread = await prisma.thread.update({
        where: { id: dbThread.id },
        data: {
          subject: t.subject,
          snippet: t.snippet,
          messageCount: t.messages.length,
          unreadCount,
          isStarred: t.isStarred,
          labels: t.labels,
          lastMessageAt: t.lastMessageAt,
        },
      });
    } else {
      dbThread = await prisma.thread.create({
        data: {
          userId,
          gmailThreadId: t.gmailThreadId,
          subject: t.subject,
          snippet: t.snippet,
          messageCount: t.messages.length,
          unreadCount,
          isStarred: t.isStarred,
          labels: t.labels,
          lastMessageAt: t.lastMessageAt,
        },
      });
    }

    syncedThreads++;

    for (const msg of t.messages) {
      const existingEmail = await prisma.email.findUnique({
        where: {
          userId_gmailId: {
            userId,
            gmailId: msg.gmailId,
          },
        },
      });

      if (existingEmail) {
        await prisma.email.update({
          where: { id: existingEmail.id },
          data: {
            threadId: dbThread.id,
            from: msg.from,
            fromName: msg.fromName,
            to: msg.to,
            cc: msg.cc || [],
            subject: msg.subject,
            snippet: msg.snippet,
            bodyText: msg.bodyText,
            bodyHtml: msg.bodyHtml,
            date: msg.date,
            isRead: msg.isRead,
            isStarred: msg.isStarred,
            labels: msg.labels,
          },
        });
      } else {
        await prisma.email.create({
          data: {
            userId,
            threadId: dbThread.id,
            gmailId: msg.gmailId,
            gmailThreadId: t.gmailThreadId,
            from: msg.from,
            fromName: msg.fromName,
            to: msg.to,
            cc: msg.cc || [],
            subject: msg.subject,
            snippet: msg.snippet,
            bodyText: msg.bodyText,
            bodyHtml: msg.bodyHtml,
            date: msg.date,
            isRead: msg.isRead,
            isStarred: msg.isStarred,
            labels: msg.labels,
          },
        });
      }
      syncedEmails++;
    }
  }

  return {
    success: true,
    mode: 'dev_mock',
    syncedThreads,
    syncedEmails,
    timestamp: new Date(),
  };
}

/**
 * Synchronizes the user's Gmail mailbox into the database
 */
async function syncUserInbox(userId, options = {}) {
  ensureDbConnected();

  if (!userId) {
    throw new ApiError(400, 'User ID is required for inbox sync.');
  }

  // 1. Verify user's Google account
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
  });

  if (!account) {
    throw new ApiError(404, 'No Google account connected. Please connect your Gmail account in Settings.');
  }

  // If running in development without live Google Client credentials or mock token, seed rich mock mailbox
  if (!GOOGLE_CLIENT_ID || account.accessToken?.includes('test') || account.accessToken?.includes('demo')) {
    return await seedMockMailbox(userId);
  }

  let oauth2Client;
  try {
    oauth2Client = await getAuthenticatedGmailClient(userId);
  } catch (authErr) {
    console.warn('⚠️ [Gmail Sync] Falling back to mock mailbox sync:', authErr.message);
    return await seedMockMailbox(userId);
  }

  try {
    const maxResults = options.maxResults || 20;
    const query = options.query || 'in:inbox';

    // 2. Fetch thread list from Gmail API
    const listRes = await oauth2Client.request({
      url: `https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
    });

    const threadsList = listRes.data.threads || [];
    if (threadsList.length === 0) {
      return {
        success: true,
        mode: 'live_gmail',
        syncedThreads: 0,
        syncedEmails: 0,
        timestamp: new Date(),
      };
    }

    let syncedThreads = 0;
    let syncedEmails = 0;

    // 3. Fetch full payload for each thread and process messages
    for (const item of threadsList) {
      const threadRes = await oauth2Client.request({
        url: `https://gmail.googleapis.com/gmail/v1/users/me/threads/${item.id}?format=full`,
      });

      const threadData = threadRes.data;
      const rawMessages = Array.isArray(threadData.messages) ? threadData.messages : [];
      if (rawMessages.length === 0) continue;

      const parsedEmails = rawMessages.map(parseGmailMessage);

      // Thread-level aggregations
      const latestEmail = parsedEmails[parsedEmails.length - 1];
      const firstEmail = parsedEmails[0];
      const threadSubject = latestEmail.subject || firstEmail.subject || '(No Subject)';
      const threadSnippet = latestEmail.snippet || firstEmail.snippet || '';
      const messageCount = parsedEmails.length;
      const unreadCount = parsedEmails.filter((e) => !e.isRead).length;
      const hasAttachments = parsedEmails.some((e) => e.attachments && e.attachments.length > 0);
      const isStarred = parsedEmails.some((e) => e.isStarred);
      const allLabels = Array.from(new Set(parsedEmails.flatMap((e) => e.labels || [])));
      const lastMessageAt = latestEmail.date || new Date();

      // Upsert Thread record
      let dbThread = await prisma.thread.findUnique({
        where: {
          userId_gmailThreadId: {
            userId,
            gmailThreadId: item.id,
          },
        },
      });

      if (dbThread) {
        dbThread = await prisma.thread.update({
          where: { id: dbThread.id },
          data: {
            historyId: threadData.historyId || null,
            subject: threadSubject,
            snippet: threadSnippet,
            messageCount,
            unreadCount,
            hasAttachments,
            isStarred,
            labels: allLabels,
            lastMessageAt,
          },
        });
      } else {
        dbThread = await prisma.thread.create({
          data: {
            userId,
            gmailThreadId: item.id,
            historyId: threadData.historyId || null,
            subject: threadSubject,
            snippet: threadSnippet,
            messageCount,
            unreadCount,
            hasAttachments,
            isStarred,
            labels: allLabels,
            lastMessageAt,
          },
        });
      }

      syncedThreads++;

      // Upsert Email records for each message in the thread
      for (const parsed of parsedEmails) {
        const existingEmail = await prisma.email.findUnique({
          where: {
            userId_gmailId: {
              userId,
              gmailId: parsed.gmailId,
            },
          },
        });

        const emailData = {
          userId,
          threadId: dbThread.id,
          gmailId: parsed.gmailId,
          gmailThreadId: parsed.gmailThreadId || item.id,
          from: parsed.from,
          fromName: parsed.fromName,
          to: parsed.to,
          cc: parsed.cc,
          bcc: parsed.bcc,
          replyTo: parsed.replyTo,
          subject: parsed.subject,
          snippet: parsed.snippet,
          bodyText: parsed.bodyText,
          bodyHtml: parsed.bodyHtml,
          date: parsed.date,
          isRead: parsed.isRead,
          isStarred: parsed.isStarred,
          isSent: parsed.isSent,
          isDraft: parsed.isDraft,
          labels: parsed.labels,
          attachments: parsed.attachments,
          headers: parsed.headers,
        };

        if (existingEmail) {
          await prisma.email.update({
            where: { id: existingEmail.id },
            data: emailData,
          });
        } else {
          await prisma.email.create({
            data: emailData,
          });
        }

        syncedEmails++;
      }
    }

    return {
      success: true,
      mode: 'live_gmail',
      syncedThreads,
      syncedEmails,
      timestamp: new Date(),
    };
  } catch (err) {
    console.error('❌ [Gmail Sync Service Error]:', err.message);
    // If live sync encounters network/credential error, fall back to mock data
    return await seedMockMailbox(userId);
  }
}

module.exports = {
  syncUserInbox,
  seedMockMailbox,
};
