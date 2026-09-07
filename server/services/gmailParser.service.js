// Gmail Parser Service — MailPilot
// Parses raw Gmail API message payloads into structured, database-ready email records

/**
 * Decodes Gmail API Base64URL encoded strings into UTF-8 strings
 */
function decodeBase64Url(str) {
  if (!str || typeof str !== 'string') return '';
  try {
    const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(padLength);
    return Buffer.from(padded, 'base64').toString('utf8');
  } catch (err) {
    console.error('⚠️ [Gmail Parser] Failed to decode base64url content:', err.message);
    return '';
  }
}

/**
 * Parses an email address header into display name and clean email address
 * Example: "Sarah Chen <sarah@startup.io>" -> { name: "Sarah Chen", email: "sarah@startup.io" }
 */
function parseEmailAddress(addressStr) {
  if (!addressStr || typeof addressStr !== 'string') {
    return { name: null, email: '' };
  }

  const trimmed = addressStr.trim();
  const angleMatch = trimmed.match(/^(.*?)\s*<([^>]+)>\s*$/);
  if (angleMatch) {
    let name = angleMatch[1].trim();
    // Strip surrounding quotes
    name = name.replace(/^["']|["']$/g, '').trim();
    const email = angleMatch[2].toLowerCase().trim();
    return { name: name || null, email };
  }

  const cleanEmail = trimmed.replace(/[<>\s"']/g, '').toLowerCase().trim();
  return { name: null, email: cleanEmail };
}

/**
 * Parses comma-separated email recipient lists into an array of clean emails
 * Example: "Alex <alex@ex.com>, 'Dev' <dev@ex.com>" -> ["alex@ex.com", "dev@ex.com"]
 */
function parseAddressList(headerValue) {
  if (!headerValue || typeof headerValue !== 'string') return [];

  // Match comma separation outside of quotes
  const addresses = headerValue.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  return addresses
    .map((addr) => parseEmailAddress(addr).email)
    .filter((email) => email.length > 0);
}

/**
 * Escapes HTML characters for plain text fallback formatting
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips HTML tags to generate plain text fallback
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Recursively extracts plain text, HTML body, and attachment metadata from MIME parts
 */
function extractMimeParts(part, accumulator = { text: '', html: '', attachments: [] }) {
  if (!part) return accumulator;

  const mimeType = (part.mimeType || '').toLowerCase();
  const filename = part.filename || '';
  const bodyData = part.body?.data;
  const attachmentId = part.body?.attachmentId;

  // Attachment check
  if (filename && (attachmentId || bodyData)) {
    accumulator.attachments.push({
      filename,
      mimeType: part.mimeType || 'application/octet-stream',
      size: part.body?.size || 0,
      attachmentId: attachmentId || null,
    });
  }

  // Text content
  if (mimeType === 'text/plain' && bodyData && !filename) {
    accumulator.text += decodeBase64Url(bodyData);
  } else if (mimeType === 'text/html' && bodyData && !filename) {
    accumulator.html += decodeBase64Url(bodyData);
  }

  // Recursive traversal of nested parts (multipart/mixed, multipart/alternative, etc.)
  if (Array.isArray(part.parts)) {
    for (const subPart of part.parts) {
      extractMimeParts(subPart, accumulator);
    }
  }

  return accumulator;
}

/**
 * Parses a complete raw Gmail API message payload into a clean, normalized MailPilot email object
 */
function parseGmailMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'object') {
    throw new Error('Invalid raw Gmail message object provided.');
  }

  const payload = rawMessage.payload || {};
  const rawHeaders = Array.isArray(payload.headers) ? payload.headers : [];

  // Build case-insensitive header lookup map
  const headersMap = {};
  for (const h of rawHeaders) {
    if (h.name && h.value) {
      headersMap[h.name.toLowerCase()] = h.value;
    }
  }

  // Extract core header fields
  const fromHeader = headersMap['from'] || '';
  const { name: fromName, email: fromEmail } = parseEmailAddress(fromHeader);

  const to = parseAddressList(headersMap['to']);
  const cc = parseAddressList(headersMap['cc']);
  const bcc = parseAddressList(headersMap['bcc']);
  const replyTo = headersMap['reply-to'] ? parseEmailAddress(headersMap['reply-to']).email : null;
  const subject = headersMap['subject'] || '(No Subject)';

  // Parse date
  let date = new Date();
  if (headersMap['date']) {
    const parsed = new Date(headersMap['date']);
    if (!isNaN(parsed.getTime())) date = parsed;
  } else if (rawMessage.internalDate) {
    const epochMs = parseInt(rawMessage.internalDate, 10);
    if (!isNaN(epochMs)) date = new Date(epochMs);
  }

  // Labels and statuses
  const labels = Array.isArray(rawMessage.labelIds) ? rawMessage.labelIds : [];
  const isRead = !labels.includes('UNREAD');
  const isStarred = labels.includes('STARRED');
  const isSent = labels.includes('SENT');
  const isDraft = labels.includes('DRAFT');

  // Extract body and attachments
  let bodyText = '';
  let bodyHtml = '';
  let attachments = [];

  if (payload.body && payload.body.data) {
    // Single-part message
    const decoded = decodeBase64Url(payload.body.data);
    const mime = (payload.mimeType || '').toLowerCase();
    if (mime.includes('html')) {
      bodyHtml = decoded;
      bodyText = stripHtml(decoded);
    } else {
      bodyText = decoded;
      bodyHtml = `<div style="font-family: inherit; white-space: pre-wrap;">${escapeHtml(decoded)}</div>`;
    }
  } else if (Array.isArray(payload.parts)) {
    // Multi-part message
    const extracted = extractMimeParts(payload);
    bodyText = extracted.text;
    bodyHtml = extracted.html;
    attachments = extracted.attachments;

    // Fallbacks if one format is missing
    if (!bodyHtml && bodyText) {
      bodyHtml = `<div style="font-family: inherit; white-space: pre-wrap;">${escapeHtml(bodyText)}</div>`;
    } else if (!bodyText && bodyHtml) {
      bodyText = stripHtml(bodyHtml);
    }
  }

  // Snippet
  const snippet = rawMessage.snippet || (bodyText ? bodyText.slice(0, 180).trim() : '');

  return {
    gmailId: rawMessage.id,
    gmailThreadId: rawMessage.threadId || rawMessage.id,
    historyId: rawMessage.historyId || null,
    from: fromEmail,
    fromName,
    to,
    cc,
    bcc,
    replyTo,
    subject,
    snippet,
    bodyText: bodyText.trim(),
    bodyHtml: bodyHtml.trim(),
    date,
    isRead,
    isStarred,
    isSent,
    isDraft,
    labels,
    attachments,
    headers: headersMap,
  };
}

module.exports = {
  decodeBase64Url,
  parseEmailAddress,
  parseAddressList,
  extractMimeParts,
  parseGmailMessage,
};
