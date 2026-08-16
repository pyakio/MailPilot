// Email Service — MailPilot
// Universal ESP Adapter (Resend, SMTP, and local dev mock)
// Enforces open tracking, click tracking, and one-click unsubscribe compliance

const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {
  RESEND_API_KEY,
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  API_URL,
  APP_URL,
  TRACKING_SECRET,
} = require('../config/env');
const { prisma } = require('../config/db');

// Initialize Resend Client if API key provided
const resendClient = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Initialize SMTP Transporter if SMTP credentials provided
let smtpTransporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  smtpTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Generates an HMAC-signed token encoding campaignId, contactId, and workspaceId
 */
function generateTrackingToken(campaignId, contactId, workspaceId) {
  const payload = Buffer.from(JSON.stringify({ cId: campaignId, kId: contactId, wId: workspaceId, t: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', TRACKING_SECRET).update(payload).digest('hex').substring(0, 16);
  return `${payload}.${signature}`;
}

/**
 * Verifies and decodes an HMAC-signed tracking/unsubscribe token
 */
function verifyTrackingToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', TRACKING_SECRET).update(payload).digest('hex').substring(0, 16);

    if (signature !== expectedSig) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    return {
      campaignId: decoded.cId,
      contactId: decoded.kId,
      workspaceId: decoded.wId,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Personalizes and wraps email content with tracking pixel, link redirection, and unsubscribe footer
 */
function compileEmailHtml({ body, htmlBody, contact, campaign, workspace }) {
  let content = htmlBody || body || '';

  // Variable interpolation
  const contactName = contact.name || contact.email.split('@')[0];
  const firstName = contactName.split(' ')[0];
  content = content
    .replace(/\{\{\s*name\s*\}\}/gi, contactName)
    .replace(/\{\{\s*first_name\s*\}\}/gi, firstName)
    .replace(/\{\{\s*email\s*\}\}/gi, contact.email)
    .replace(/\{\{\s*workspace_name\s*\}\}/gi, workspace?.name || 'MailPilot Workspace');

  // Generate tokens
  const token = generateTrackingToken(campaign.id, contact.id, workspace.id);
  const unsubscribeUrl = `${APP_URL}/unsubscribe?token=${token}`;

  // Replace {{unsubscribe_url}} if explicitly present
  content = content.replace(/\{\{\s*unsubscribe_url\s*\}\}/gi, unsubscribeUrl);

  // Rewrite all <a href="..."> links for click tracking (excluding mailto: and unsubscribe)
  const linkRegex = /<a\s+([^>]*?)href=["'](https?:\/\/[^"']+)["']([^>]*?)>/gi;
  content = content.replace(linkRegex, (match, prefix, url, suffix) => {
    if (url.includes('/api/unsubscribe') || url.includes('/unsubscribe')) {
      return match;
    }
    const trackedUrl = `${API_URL}/api/track/click/${token}?url=${encodeURIComponent(url)}`;
    return `<a ${prefix}href="${trackedUrl}"${suffix}>`;
  });

  // Inject Open Tracking Pixel
  const trackingPixel = `<img src="${API_URL}/api/track/open/${token}" width="1" height="1" style="display:none !important; width:1px; height:1px; border:0;" alt="" />`;

  // Standard compliant unsubscribe footer
  const unsubscribeFooter = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; line-height: 1.5;">
      <p style="margin: 0 0 8px 0;">You received this email from ${workspace?.name || 'MailPilot'} because you are subscribed to our updates.</p>
      <p style="margin: 0;">
        <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> &bull;
        <a href="${APP_URL}" style="color: #6b7280; text-decoration: none;">Powered by MailPilot</a>
      </p>
    </div>
  `;

  // If content is full HTML document, insert before </body>
  if (content.toLowerCase().includes('</body>')) {
    return content.replace(/<\/body>/i, `${unsubscribeFooter}${trackingPixel}</body>`);
  }

  // Otherwise wrap as responsive HTML container
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${campaign.subject || 'MailPilot Broadcast'}</title>
      </head>
      <body style="margin: 0; padding: 24px; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <div style="font-size: 15px; line-height: 1.6; color: #1f2937;">
            ${content}
          </div>
          ${unsubscribeFooter}
        </div>
        ${trackingPixel}
      </body>
    </html>
  `;
}

/**
 * Dispatch a single email to an individual recipient
 */
async function sendSingleEmail({ to, subject, html, text, headers = {}, campaignId, contactId, workspaceId }) {
  const token = generateTrackingToken(campaignId || 'sys', contactId || 'sys', workspaceId || 'sys');
  const directUnsubApi = `${API_URL}/api/unsubscribe/${token}`;
  const webUnsubUrl = `${APP_URL}/unsubscribe?token=${token}`;

  const emailHeaders = {
    'List-Unsubscribe': `<${directUnsubApi}>, <${webUnsubUrl}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    'X-MailPilot-Campaign-Id': campaignId || 'direct',
    'X-MailPilot-Workspace-Id': workspaceId || 'default',
    ...headers,
  };

  // 1. Resend Delivery Provider
  if (resendClient) {
    try {
      const response = await resendClient.emails.send({
        from: EMAIL_FROM,
        to,
        reply_to: EMAIL_REPLY_TO,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
        headers: emailHeaders,
      });

      return {
        success: true,
        provider: 'resend',
        messageId: response.data?.id || response.id,
      };
    } catch (err) {
      console.error(`❌ [Email Service] Resend dispatch error to ${to}:`, err.message);
      return {
        success: false,
        provider: 'resend',
        error: err.message,
      };
    }
  }

  // 2. SMTP Transporter
  if (smtpTransporter) {
    try {
      const info = await smtpTransporter.sendMail({
        from: EMAIL_FROM,
        to,
        replyTo: EMAIL_REPLY_TO,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
        headers: emailHeaders,
      });

      return {
        success: true,
        provider: 'smtp',
        messageId: info.messageId,
      };
    } catch (err) {
      console.error(`❌ [Email Service] SMTP dispatch error to ${to}:`, err.message);
      return {
        success: false,
        provider: 'smtp',
        error: err.message,
      };
    }
  }

  // 3. Local Development Mock (Zero API key needed for local testing)
  const mockId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  console.log(`\n📬 [Mock Email Dispatch] To: ${to} | Subject: "${subject}" | Provider: DEV_MOCK (MessageId: ${mockId})`);
  return {
    success: true,
    provider: 'dev_mock',
    messageId: mockId,
    note: 'Dispatched in dev_mock mode. Add RESEND_API_KEY in server/.env for live inbox delivery.',
  };
}

/**
 * Sends a full campaign to all subscribed contacts in the workspace
 */
async function sendCampaignBatch({ campaign, workspace }) {
  // Fetch subscribed contacts in this workspace
  const workspaceId = workspace?.id || campaign?.workspaceId || 'ws_default_01';
  const contacts = await prisma.contact.findMany({
    where: {
      workspaceId,
      subscribed: true,
    },
  });

  if (contacts.length === 0) {
    return {
      total: 0,
      sent: 0,
      failed: 0,
      provider: resendClient ? 'resend' : smtpTransporter ? 'smtp' : 'dev_mock',
      message: 'No subscribed contacts in audience to receive campaign.',
    };
  }

  let sentCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const contact of contacts) {
    try {
      const html = compileEmailHtml({
        body: campaign.content || '',
        htmlBody: campaign.content || '',
        contact,
        campaign,
        workspace,
      });

      const result = await sendSingleEmail({
        to: contact.email,
        subject: campaign.subject,
        html,
        campaignId: campaign.id,
        contactId: contact.id,
        workspaceId: workspace.id,
      });

      if (result.success) {
        sentCount++;
        // Log EmailEvent in DB
        await prisma.emailEvent.create({
          data: {
            workspaceId: workspace.id,
            campaignId: campaign.id,
            contactId: contact.id,
            eventType: 'SENT',
            metadata: {
              provider: result.provider,
              messageId: result.messageId,
              recipient: contact.email,
            },
          },
        }).catch((e) => console.warn('Failed to record EmailEvent:', e.message));
      } else {
        failedCount++;
        errors.push({ email: contact.email, error: result.error });
      }
    } catch (err) {
      failedCount++;
      errors.push({ email: contact.email, error: err.message });
    }
  }

  return {
    total: contacts.length,
    sent: sentCount,
    failed: failedCount,
    provider: resendClient ? 'resend' : smtpTransporter ? 'smtp' : 'dev_mock',
    errors: errors.length > 0 ? errors : undefined,
  };
}

module.exports = {
  sendSingleEmail,
  sendCampaignBatch,
  compileEmailHtml,
  generateTrackingToken,
  verifyTrackingToken,
};
