const test = require('node:test');
const assert = require('node:assert/strict');
const {
  decodeBase64Url,
  parseEmailAddress,
  parseAddressList,
  parseGmailMessage,
} = require('../services/gmailParser.service');

test('decodeBase64Url correctly decodes URL-safe base64 strings', () => {
  // "Hello from MailPilot! Special chars: <>&?_-"
  const utf8Text = 'Hello from MailPilot! Special chars: <>&?_-';
  const base64Url = Buffer.from(utf8Text)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const decoded = decodeBase64Url(base64Url);
  assert.equal(decoded, utf8Text);
});

test('parseEmailAddress extracts display names and normalized email addresses', () => {
  const case1 = parseEmailAddress('Sarah Chen <sarah@startup.io>');
  assert.equal(case1.name, 'Sarah Chen');
  assert.equal(case1.email, 'sarah@startup.io');

  const case2 = parseEmailAddress('"Alex Morgan" <alex.morgan@corp.com>');
  assert.equal(case2.name, 'Alex Morgan');
  assert.equal(case2.email, 'alex.morgan@corp.com');

  const case3 = parseEmailAddress('simple@domain.org');
  assert.equal(case3.name, null);
  assert.equal(case3.email, 'simple@domain.org');

  const case4 = parseEmailAddress('<just_brackets@domain.com>');
  assert.equal(case4.name, null);
  assert.equal(case4.email, 'just_brackets@domain.com');
});

test('parseAddressList extracts clean email lists from header strings', () => {
  const header = 'Sarah <sarah@startup.io>, alex@example.com, "Support Team" <support@mailpilot.io>';
  const list = parseAddressList(header);

  assert.deepEqual(list, ['sarah@startup.io', 'alex@example.com', 'support@mailpilot.io']);
});

test('parseGmailMessage parses single-part plain text email correctly', () => {
  const plainText = 'Hi team, the server migration is scheduled for tonight at 10 PM UTC.';
  const base64Data = Buffer.from(plainText).toString('base64url');

  const mockPayload = {
    id: '18991a2b3c4d5e',
    threadId: 'th_998877',
    labelIds: ['INBOX', 'UNREAD'],
    snippet: 'Hi team, the server migration is scheduled...',
    internalDate: '1725148800000',
    payload: {
      mimeType: 'text/plain',
      headers: [
        { name: 'From', value: 'DevOps Lead <devops@cloud.internal>' },
        { name: 'To', value: 'engineering@cloud.internal, cto@cloud.internal' },
        { name: 'Subject', value: 'Infrastructure Maintenance Notice' },
        { name: 'Date', value: 'Mon, 1 Sep 2026 00:00:00 +0000' },
      ],
      body: {
        data: base64Data,
        size: plainText.length,
      },
    },
  };

  const parsed = parseGmailMessage(mockPayload);

  assert.equal(parsed.gmailId, '18991a2b3c4d5e');
  assert.equal(parsed.gmailThreadId, 'th_998877');
  assert.equal(parsed.from, 'devops@cloud.internal');
  assert.equal(parsed.fromName, 'DevOps Lead');
  assert.deepEqual(parsed.to, ['engineering@cloud.internal', 'cto@cloud.internal']);
  assert.equal(parsed.subject, 'Infrastructure Maintenance Notice');
  assert.equal(parsed.bodyText, plainText);
  assert.ok(parsed.bodyHtml.includes(plainText));
  assert.equal(parsed.isRead, false);
  assert.equal(parsed.isStarred, false);
});

test('parseGmailMessage parses multipart email with HTML and attachments', () => {
  const textContent = 'Welcome to MailPilot. Please find the attached onboarding report.';
  const htmlContent = '<h1>Welcome to MailPilot</h1><p>Please find the attached onboarding report.</p>';

  const rawPayload = {
    id: '18992f3a4b5c6d',
    threadId: 'th_112233',
    labelIds: ['INBOX', 'STARRED', 'IMPORTANT'],
    snippet: 'Welcome to MailPilot. Please find the attached...',
    internalDate: '1725148800000',
    payload: {
      mimeType: 'multipart/mixed',
      headers: [
        { name: 'From', value: 'Emma <emma@growthlabs.co>' },
        { name: 'To', value: 'founder@mailpilot.io' },
        { name: 'Cc', value: 'advisor@growthlabs.co' },
        { name: 'Subject', value: 'Q3 Onboarding & Growth Metrics' },
        { name: 'Reply-To', value: 'team@growthlabs.co' },
      ],
      parts: [
        {
          mimeType: 'multipart/alternative',
          parts: [
            {
              mimeType: 'text/plain',
              body: { data: Buffer.from(textContent).toString('base64url') },
            },
            {
              mimeType: 'text/html',
              body: { data: Buffer.from(htmlContent).toString('base64url') },
            },
          ],
        },
        {
          mimeType: 'application/pdf',
          filename: 'growth_report_q3.pdf',
          body: {
            size: 2048500,
            attachmentId: 'att_pdf_9988776655',
          },
        },
      ],
    },
  };

  const parsed = parseGmailMessage(rawPayload);

  assert.equal(parsed.from, 'emma@growthlabs.co');
  assert.equal(parsed.fromName, 'Emma');
  assert.deepEqual(parsed.to, ['founder@mailpilot.io']);
  assert.deepEqual(parsed.cc, ['advisor@growthlabs.co']);
  assert.equal(parsed.replyTo, 'team@growthlabs.co');
  assert.equal(parsed.subject, 'Q3 Onboarding & Growth Metrics');
  assert.equal(parsed.bodyText, textContent);
  assert.equal(parsed.bodyHtml, htmlContent);
  assert.equal(parsed.isRead, true); // No UNREAD label
  assert.equal(parsed.isStarred, true); // Has STARRED label
  assert.equal(parsed.attachments.length, 1);
  assert.equal(parsed.attachments[0].filename, 'growth_report_q3.pdf');
  assert.equal(parsed.attachments[0].attachmentId, 'att_pdf_9988776655');
});
