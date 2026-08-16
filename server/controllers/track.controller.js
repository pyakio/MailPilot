const { verifyTrackingToken } = require('../services/email.service');
const { prisma, getConnectionStatus } = require('../config/db');

// 1x1 transparent GIF buffer
const TRANSPARENT_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

/**
 * GET /api/track/open/:token
 * Returns 1x1 transparent GIF and records email open
 */
async function trackOpen(req, res) {
  const { token } = req.params;

  // Always return the GIF immediately with no-cache headers
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': TRANSPARENT_GIF.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.end(TRANSPARENT_GIF);

  // Asynchronously record open event in database if DB is connected
  if (!getConnectionStatus() || !prisma || !prisma.emailEvent) return;

  const decoded = verifyTrackingToken(token);
  if (!decoded) return;

  const { campaignId, contactId, workspaceId } = decoded;

  try {

    // Check if this contact has already registered an OPENED event for this campaign
    const existingOpen = await prisma.emailEvent.findFirst({
      where: {
        campaignId,
        contactId,
        eventType: 'OPENED',
      },
    });

    // Record the open event
    await prisma.emailEvent.create({
      data: {
        workspaceId,
        campaignId,
        contactId,
        eventType: 'OPENED',
        metadata: {
          ip: req.ip || req.headers['x-forwarded-for'],
          userAgent: req.headers['user-agent'],
        },
      },
    });

    // If first unique open, increment campaign and contact stats
    if (!existingOpen) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { stats: true },
      });

      if (campaign) {
        const stats = typeof campaign.stats === 'object' && campaign.stats ? { ...campaign.stats } : {};
        stats.opened = (stats.opened || 0) + 1;

        await prisma.campaign.update({
          where: { id: campaignId },
          data: { stats },
        });
      }

      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        select: { engagement: true },
      });

      if (contact) {
        const engagement = typeof contact.engagement === 'object' && contact.engagement ? { ...contact.engagement } : {};
        engagement.opens = (engagement.opens || 0) + 1;

        await prisma.contact.update({
          where: { id: contactId },
          data: { engagement },
        });
      }
    }
  } catch (err) {
    console.error('❌ [Tracking] Error recording email open:', err.message);
  }
}

/**
 * GET /api/track/click/:token?url=...
 * Records link click and redirects recipient to original destination
 */
async function trackClick(req, res) {
  const { token } = req.params;
  const targetUrl = req.query.url;

  // Validate URL to prevent open redirect vulnerabilities
  let destination = 'https://mailpilot.io';
  if (targetUrl && (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))) {
    destination = targetUrl;
  }

  // Redirect recipient immediately
  res.redirect(302, destination);

  if (!getConnectionStatus() || !prisma || !prisma.emailEvent) return;

  const decoded = verifyTrackingToken(token);
  if (!decoded) return;

  const { campaignId, contactId, workspaceId } = decoded;


  try {
    // Record click event in database
    await prisma.emailEvent.create({
      data: {
        workspaceId,
        campaignId,
        contactId,
        eventType: 'CLICKED',
        metadata: {
          url: destination,
          ip: req.ip || req.headers['x-forwarded-for'],
          userAgent: req.headers['user-agent'],
        },
      },
    });

    // Check unique click
    const previousClicks = await prisma.emailEvent.count({
      where: {
        campaignId,
        contactId,
        eventType: 'CLICKED',
      },
    });

    if (previousClicks <= 1) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        select: { stats: true },
      });

      if (campaign) {
        const stats = typeof campaign.stats === 'object' && campaign.stats ? { ...campaign.stats } : {};
        stats.clicked = (stats.clicked || 0) + 1;

        await prisma.campaign.update({
          where: { id: campaignId },
          data: { stats },
        });
      }

      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        select: { engagement: true },
      });

      if (contact) {
        const engagement = typeof contact.engagement === 'object' && contact.engagement ? { ...contact.engagement } : {};
        engagement.clicks = (engagement.clicks || 0) + 1;

        await prisma.contact.update({
          where: { id: contactId },
          data: { engagement },
        });
      }
    }
  } catch (err) {
    console.error('❌ [Tracking] Error recording click event:', err.message);
  }
}

module.exports = { trackOpen, trackClick };
