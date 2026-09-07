// Gmail Send Service — MailPilot
// RFC 2822 MIME builder and Gmail API message dispatcher

const { prisma, ensureDbConnected } = require('../config/db');
const { getAuthenticatedGmailClient } = require('./gmail.service');
const { ApiError } = require('../middlewares/error.middleware');
const { GOOGLE_CLIENT_ID } = require('../config/env');

/**
 * Builds standard RFC 2822 MIME message formatted as a Base64URL string for Gmail API
 */
function buildRfc2822MimeMessage({
  from,
  to = [],
  cc = [],
  bcc = [],
  replyTo,
  inReplyTo,
  references,
  subject = '',
  bodyText = '',
  bodyHtml = '',
}) {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const toList = Array.isArray(to) ? to.join(', ') : to;
  const ccList = Array.isArray(cc) ? cc.join(', ') : cc;
  const bccList = Array.isArray(bcc) ? bcc.join(', ') : bcc;

  const headers = [
    `From: ${from}`,
    `To: ${toList}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject || '').toString('base64')}?=`,
    `MIME-Version: 1.0`,
    `Date: ${new Date().toUTCString()}`,
  ];

  if (ccList) headers.push(`Cc: ${ccList}`);
  if (bccList) headers.push(`Bcc: ${bccList}`);
  if (replyTo) headers.push(`Reply-To: ${replyTo}`);
  if (inReplyTo) headers.push(`In-Reply-To: ${inReplyTo}`);
  if (references) headers.push(`References: ${references}`);

  let mimeMessage = '';

  if (bodyHtml) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    mimeMessage = headers.join('\r\n') + '\r\n\r\n';

    // Plain text part
    mimeMessage += `--${boundary}\r\n`;
    mimeMessage += `Content-Type: text/plain; charset="UTF-8"\r\n`;
    mimeMessage += `Content-Transfer-Encoding: base64\r\n\r\n`;
    mimeMessage += Buffer.from(bodyText || '').toString('base64') + '\r\n\r\n';

    // HTML part
    mimeMessage += `--${boundary}\r\n`;
    mimeMessage += `Content-Type: text/html; charset="UTF-8"\r\n`;
    mimeMessage += `Content-Transfer-Encoding: base64\r\n\r\n`;
    mimeMessage += Buffer.from(bodyHtml).toString('base64') + '\r\n\r\n';

    mimeMessage += `--${boundary}--\r\n`;
  } else {
    headers.push(`Content-Type: text/plain; charset="UTF-8"`);
    headers.push(`Content-Transfer-Encoding: base64`);
    mimeMessage = headers.join('\r\n') + '\r\n\r\n';
    mimeMessage += Buffer.from(bodyText || '').toString('base64');
  }

  // Base64URL encoding (RFC 4648 §5)
  const base64Url = Buffer.from(mimeMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return {
    raw: base64Url,
    mimeMessage,
  };
}

/**
 * Dispatches an email message via Gmail API or local dev mock
 */
async function sendGmailMessage(userId, {
  to = [],
  cc = [],
  bcc = [],
  subject = '',
  bodyText = '',
  bodyHtml = '',
  threadId = null,
  inReplyTo = null,
  references = null,
  draftId = null,
}) {
  ensureDbConnected();

  if (!userId) throw new ApiError(400, 'User ID is required.');
  const toList = Array.isArray(to) ? to : (to ? [to] : []);
  if (toList.length === 0) throw new ApiError(400, 'At least one recipient email address is required.');
  if (!subject && !bodyText && !bodyHtml) {
    throw new ApiError(400, 'Email must have a subject or body content.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found.');

  const senderEmail = user.email;
  const senderName = user.name || 'MailPilot User';
  const fromHeader = `"${senderName}" <${senderEmail}>`;

  const { raw } = buildRfc2822MimeMessage({
    from: fromHeader,
    to: toList,
    cc: Array.isArray(cc) ? cc : (cc ? [cc] : []),
    bcc: Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []),
    subject,
    bodyText: bodyText || '',
    bodyHtml: bodyHtml || '',
    inReplyTo,
    references,
  });

  const account = await prisma.account.findFirst({
    where: { userId, provider: 'google' },
  });

  let gmailMessageId = `gm_sent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  let targetGmailThreadId = threadId || `gm_th_${Date.now()}`;

  // If live Google credentials exist, send via Gmail API
  if (GOOGLE_CLIENT_ID && account && !account.accessToken?.includes('test') && !account.accessToken?.includes('demo')) {
    try {
      const oauth2Client = await getAuthenticatedGmailClient(userId);
      const sendPayload = { raw };
      if (threadId) {
        const existingThread = await prisma.thread.findUnique({ where: { id: threadId } });
        if (existingThread?.gmailThreadId) {
          sendPayload.threadId = existingThread.gmailThreadId;
        }
      }

      const res = await oauth2Client.request({
        url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        method: 'POST',
        data: sendPayload,
      });

      if (res.data?.id) {
        gmailMessageId = res.data.id;
        targetGmailThreadId = res.data.threadId || targetGmailThreadId;
      }
    } catch (sendErr) {
      console.warn('⚠️ [Gmail Send] API send error, falling back to local dispatch:', sendErr.message);
    }
  }

  // 1. Resolve or create Thread
  let dbThread = null;
  if (threadId) {
    dbThread = await prisma.thread.findUnique({ where: { id: threadId } });
  }

  const snippet = (bodyText || bodyHtml.replace(/<[^>]+>/g, '')).slice(0, 150).trim();

  if (dbThread) {
    dbThread = await prisma.thread.update({
      where: { id: dbThread.id },
      data: {
        lastMessageAt: new Date(),
        snippet: snippet || dbThread.snippet,
        messageCount: (dbThread.messageCount || 1) + 1,
      },
    });
  } else {
    dbThread = await prisma.thread.create({
      data: {
        userId,
        gmailThreadId: targetGmailThreadId,
        subject: subject || '(No Subject)',
        snippet,
        messageCount: 1,
        unreadCount: 0,
        labels: ['SENT', 'INBOX'],
        lastMessageAt: new Date(),
      },
    });
  }

  // 2. Create Email message record
  const emailRecord = await prisma.email.create({
    data: {
      userId,
      threadId: dbThread.id,
      gmailId: gmailMessageId,
      gmailThreadId: targetGmailThreadId,
      from: senderEmail,
      fromName: senderName,
      to: toList,
      cc: Array.isArray(cc) ? cc : (cc ? [cc] : []),
      bcc: Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []),
      subject: subject || '(No Subject)',
      snippet,
      bodyText: bodyText || '',
      bodyHtml: bodyHtml || `<pre style="font-family: inherit;">${bodyText}</pre>`,
      date: new Date(),
      isRead: true,
      isStarred: false,
      isSent: true,
      isDraft: false,
      labels: ['SENT'],
    },
  });

  // 3. Delete draft if draftId provided
  if (draftId) {
    await prisma.emailDraft.deleteMany({
      where: { id: draftId, userId },
    }).catch(() => {});
  }

  return {
    success: true,
    email: emailRecord,
    threadId: dbThread.id,
    messageId: gmailMessageId,
  };
}

module.exports = {
  buildRfc2822MimeMessage,
  sendGmailMessage,
};
