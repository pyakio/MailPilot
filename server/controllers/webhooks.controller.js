// Resend Webhook Controller — MailPilot
// Handles incoming signed webhook events from Resend (bounce, complaint, delivery).
// Uses Svix-compatible HMAC-SHA256 signature verification to reject forged payloads.
//
// Setup:
//   1. Go to Resend Dashboard → Webhooks → Add Endpoint
//   2. Set endpoint URL: POST https://your-api-domain.com/api/webhooks/resend
//   3. Select events: email.bounced, email.complained, email.delivery_delayed
//   4. Copy the signing secret → set RESEND_WEBHOOK_SECRET in your .env

const crypto = require('crypto');
const { RESEND_WEBHOOK_SECRET } = require('../config/env');
const { prisma } = require('../config/db');

// Resend uses Svix for webhook signing.
// The signature is sent as: "svix-signature: v1,<base64-hmac-sha256>"
// alongside "svix-id" and "svix-timestamp" headers.

/**
 * Verify a Resend webhook signature using HMAC-SHA256 (Svix protocol).
 * @param {Buffer} rawBody - Raw request body bytes (must NOT be parsed before this)
 * @param {object} headers - Request headers
 * @returns {boolean} true if the signature is valid
 */
function verifyResendSignature(rawBody, headers) {
  const secret = RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // No secret configured — reject in production, warn in dev
    console.warn('⚠️  [Webhooks] RESEND_WEBHOOK_SECRET is not set. Webhook signature verification skipped.');
    return process.env.NODE_ENV !== 'production';
  }

  const msgId = headers['svix-id'];
  const msgTimestamp = headers['svix-timestamp'];
  const msgSignature = headers['svix-signature'];

  if (!msgId || !msgTimestamp || !msgSignature) {
    return false;
  }

  // Replay attack protection: reject payloads older than 5 minutes
  const timestampMs = parseInt(msgTimestamp, 10) * 1000;
  if (Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    console.warn('⚠️  [Webhooks] Rejected stale Resend webhook (timestamp out of range).');
    return false;
  }

  // Svix signing input: "{msgId}.{msgTimestamp}.{rawBody}"
  const signingInput = `${msgId}.${msgTimestamp}.${rawBody.toString('utf8')}`;

  // Strip "v1," prefix and decode the base64 secret (Svix uses base64-encoded key)
  let secretBytes;
  try {
    const secretBase64 = secret.startsWith('whsec_') ? secret.slice(6) : secret;
    secretBytes = Buffer.from(secretBase64, 'base64');
  } catch {
    return false;
  }

  const expectedSig = crypto
    .createHmac('sha256', secretBytes)
    .update(signingInput)
    .digest('base64');

  // svix-signature may contain multiple comma-separated "v1,<sig>" values
  const signatures = msgSignature.split(' ').map((s) => s.replace(/^v1,/, ''));

  return signatures.some((sig) => {
    try {
      return crypto.timingSafeEqual(Buffer.from(sig, 'base64'), Buffer.from(expectedSig, 'base64'));
    } catch {
      return false;
    }
  });
}

/**
 * POST /api/webhooks/resend
 * Handles Resend email event webhooks.
 * Raw body is required for HMAC signature verification.
 */
async function handleResendWebhook(req, res) {
  // Verify signature before processing any payload
  if (!verifyResendSignature(req.body, req.headers)) {
    console.warn('❌ [Webhooks] Resend webhook signature verification failed. Request rejected.');
    return res.status(401).json({ error: 'Invalid webhook signature.' });
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }

  const eventType = payload?.type;
  const emailData = payload?.data;

  console.log(`📬 [Webhooks] Received Resend event: ${eventType}`);

  try {
    switch (eventType) {
      case 'email.bounced':
      case 'email.delivery_delayed':
        await handleBounce(emailData, eventType);
        break;
      case 'email.complained':
        await handleComplaint(emailData);
        break;
      case 'email.delivered':
        await handleDelivered(emailData);
        break;
      default:
        // Acknowledge unknown events silently (Resend expects 2xx for all events)
        console.log(`ℹ️  [Webhooks] Unhandled Resend event type: ${eventType}`);
    }
  } catch (err) {
    // Return 500 to signal Resend to retry the webhook
    console.error('❌ [Webhooks] Error processing Resend webhook event:', err.message);
    return res.status(500).json({ error: 'Internal webhook processing error.' });
  }

  // Always acknowledge with 200 so Resend doesn't retry
  return res.status(200).json({ received: true });
}

/**
 * Process a bounce event: record BOUNCED EmailEvent and update Campaign stats.
 */
async function handleBounce(emailData, eventType) {
  if (!emailData) return;

  // Resend includes custom headers we set during send in emailData.headers
  // We embed X-MailPilot-Campaign-Id and X-MailPilot-Workspace-Id headers
  const campaignId = emailData.headers?.['x-mailpilot-campaign-id'] || emailData.tags?.['campaign-id'];
  const workspaceId = emailData.headers?.['x-mailpilot-workspace-id'] || emailData.tags?.['workspace-id'];
  const recipientEmail = emailData.to?.[0] || emailData.to;

  if (!campaignId || !workspaceId || !recipientEmail) {
    console.warn(`⚠️  [Webhooks] Bounce event missing required identifiers. campaignId: ${campaignId}, workspaceId: ${workspaceId}, to: ${recipientEmail}`);
    return;
  }

  // Find the contact by email + workspace
  const contact = await prisma.contact.findUnique({
    where: { workspaceId_email: { workspaceId, email: recipientEmail } },
  }).catch(() => null);

  if (!contact) {
    console.warn(`⚠️  [Webhooks] Bounce event: contact not found for ${recipientEmail} in workspace ${workspaceId}`);
    return;
  }

  // Create a real BOUNCED EmailEvent
  await prisma.emailEvent.create({
    data: {
      workspaceId,
      campaignId,
      contactId: contact.id,
      eventType: 'BOUNCED',
      metadata: {
        bounceType: eventType === 'email.delivery_delayed' ? 'soft' : 'hard',
        resendEmailId: emailData.email_id,
        recipientEmail,
        reason: emailData.bounce?.message || emailData.last_event || null,
        rawEventType: eventType,
      },
    },
  });

  // Update Campaign.stats.bounced
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (campaign) {
    const currentStats = typeof campaign.stats === 'object' && campaign.stats ? { ...campaign.stats } : {};
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        stats: {
          ...currentStats,
          bounced: (currentStats.bounced || 0) + 1,
        },
      },
    });
  }

  console.log(`🔴 [Webhooks] Bounce recorded: campaign=${campaignId} contact=${contact.id} type=${eventType}`);
}

/**
 * Process a complaint (spam report): unsubscribe the contact and record EmailEvent.
 */
async function handleComplaint(emailData) {
  if (!emailData) return;

  const campaignId = emailData.headers?.['x-mailpilot-campaign-id'];
  const workspaceId = emailData.headers?.['x-mailpilot-workspace-id'];
  const recipientEmail = emailData.to?.[0] || emailData.to;

  if (!workspaceId || !recipientEmail) return;

  const contact = await prisma.contact.findUnique({
    where: { workspaceId_email: { workspaceId, email: recipientEmail } },
  }).catch(() => null);

  if (!contact) return;

  // Auto-unsubscribe on spam complaint
  await prisma.contact.update({
    where: { id: contact.id },
    data: { subscribed: false },
  });

  if (campaignId) {
    await prisma.emailEvent.create({
      data: {
        workspaceId,
        campaignId,
        contactId: contact.id,
        eventType: 'UNSUBSCRIBED',
        metadata: {
          reason: 'spam_complaint',
          resendEmailId: emailData.email_id,
          recipientEmail,
        },
      },
    });

    // Update Campaign.stats.unsubscribed
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (campaign) {
      const currentStats = typeof campaign.stats === 'object' && campaign.stats ? { ...campaign.stats } : {};
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          stats: {
            ...currentStats,
            unsubscribed: (currentStats.unsubscribed || 0) + 1,
          },
        },
      });
    }
  }

  console.log(`⚠️  [Webhooks] Spam complaint: contact ${contact.id} auto-unsubscribed.`);
}

/**
 * Process a delivered event: update Campaign.stats.delivered if under-counted.
 */
async function handleDelivered(emailData) {
  if (!emailData) return;
  const campaignId = emailData.headers?.['x-mailpilot-campaign-id'];
  if (!campaignId) return;
  // Delivered events are informational — Resend guarantees delivery for non-bounced
  // We currently count sent=delivered so no action needed, but log for observability
  console.log(`✅ [Webhooks] Email delivered: campaign=${campaignId} id=${emailData.email_id}`);
}

module.exports = { handleResendWebhook };
