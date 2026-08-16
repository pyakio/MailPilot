// Unsubscribe Controller — MailPilot
// Handles CAN-SPAM & GDPR compliant one-click unsubscribe actions

const { verifyTrackingToken } = require('../services/email.service');
const { prisma } = require('../config/db');
const { APP_URL } = require('../config/env');

/**
 * Handle unsubscribe logic for both GET and POST requests
 */
async function processUnsubscribe(token, ip, userAgent) {
  const decoded = verifyTrackingToken(token);
  if (!decoded) {
    return { success: false, error: 'Invalid or expired unsubscribe token.' };
  }

  const { contactId, campaignId, workspaceId } = decoded;

  try {
    // Find contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return { success: false, error: 'Contact subscriber not found.' };
    }

    // Set contact subscribed status to false
    await prisma.contact.update({
      where: { id: contactId },
      data: { subscribed: false },
    });

    // Record unsubscribe event in database
    await prisma.emailEvent.create({
      data: {
        workspaceId,
        campaignId: campaignId || 'direct',
        contactId,
        eventType: 'UNSUBSCRIBED',
        metadata: {
          ip,
          userAgent,
        },
      },
    });

    // Update campaign stats if campaignId is valid
    if (campaignId && campaignId !== 'direct' && campaignId !== 'sys') {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { stats: true },
      });

      if (campaign) {
        const stats = typeof campaign.stats === 'object' && campaign.stats ? { ...campaign.stats } : {};
        stats.unsubscribed = (stats.unsubscribed || 0) + 1;

        await prisma.campaign.update({
          where: { id: campaignId },
          data: { stats },
        });
      }
    }

    return {
      success: true,
      email: contact.email,
      name: contact.name,
      message: 'You have been successfully unsubscribed from future emails.',
    };
  } catch (err) {
    console.error('❌ [Unsubscribe] Error processing unsubscribe:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * GET /api/unsubscribe/:token
 * Public browser unsubscribe request — redirects to frontend confirmation page
 */
async function getUnsubscribe(req, res) {
  const { token } = req.params;
  const result = await processUnsubscribe(token, req.ip, req.headers['user-agent']);

  if (result.success) {
    return res.redirect(`${APP_URL}/unsubscribe?status=success&email=${encodeURIComponent(result.email)}`);
  }

  return res.redirect(`${APP_URL}/unsubscribe?status=error&message=${encodeURIComponent(result.error)}`);
}

/**
 * POST /api/unsubscribe/:token
 * RFC 8058 One-Click Unsubscribe endpoint for email clients
 */
async function postUnsubscribe(req, res) {
  const { token } = req.params;
  const result = await processUnsubscribe(token, req.ip, req.headers['user-agent']);

  if (result.success) {
    return res.json({ success: true, message: result.message, email: result.email });
  }

  return res.status(400).json({ success: false, error: result.error });
}

/**
 * GET /api/unsubscribe/verify/:token
 * Query unsubscribe status info for UI verification before final submit
 */
async function verifyToken(req, res) {
  const { token } = req.params;
  const decoded = verifyTrackingToken(token);

  if (!decoded) {
    return res.status(400).json({ valid: false, error: 'Invalid token' });
  }

  try {
    const contact = await prisma.contact.findUnique({
      where: { id: decoded.contactId },
      select: { email: true, name: true, subscribed: true },
    });

    if (!contact) {
      return res.status(404).json({ valid: false, error: 'Contact not found' });
    }

    return res.json({
      valid: true,
      email: contact.email,
      name: contact.name,
      subscribed: contact.subscribed,
    });
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
}

module.exports = { getUnsubscribe, postUnsubscribe, verifyToken };
