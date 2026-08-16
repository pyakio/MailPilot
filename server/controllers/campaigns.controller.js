const { getConnectionStatus, prisma } = require('../config/db');
const { ApiError } = require('../middlewares/error.middleware');
const { getUserWorkspaceId } = require('../services/workspace.service');
const emailService = require('../services/email.service');

function ensureDbConnected() {
  if (!getConnectionStatus()) {
    throw new ApiError(
      503,
      'Database connection unavailable. Please ensure DATABASE_URL is configured in server/.env.'
    );
  }
}

/**
 * GET /api/campaigns
 * List campaigns scoped to authenticated user's workspace
 */
async function getAll(req, res, next) {
  try {
    ensureDbConnected();
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(campaigns);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/campaigns/:id
 * Get single campaign with workspace isolation
 */
async function getOne(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const campaign = await prisma.campaign.findFirst({
      where: { id, workspaceId },
      include: {
        emailEvents: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!campaign) {
      throw new ApiError(404, 'Campaign not found or access denied.');
    }

    res.json(campaign);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/campaigns
 * Create campaign for authenticated user's workspace
 */
async function create(req, res, next) {
  try {
    ensureDbConnected();
    const { name, subject, previewText, content, templateId, audienceList, scheduledAt, tags } = req.body;

    if (!name || !subject) {
      throw new ApiError(400, 'Campaign name and subject line are required.');
    }

    const workspaceId = await getUserWorkspaceId(req.user.id);

    const campaign = await prisma.campaign.create({
      data: {
        workspaceId,
        name: name.trim(),
        subject: subject.trim(),
        previewText: previewText ? previewText.trim() : null,
        content: content || null,
        templateId: templateId || null,
        audienceList: audienceList || 'All Contacts',
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        tags: Array.isArray(tags) ? tags : [],
      },
    });

    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/campaigns/:id
 * Update campaign with workspace isolation
 */
async function update(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const workspaceId = await getUserWorkspaceId(req.user.id);

    // Verify workspace ownership
    const existing = await prisma.campaign.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) {
      throw new ApiError(404, 'Campaign not found or access denied.');
    }

    const { name, subject, previewText, content, templateId, audienceList, scheduledAt, tags, status } = req.body;

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        subject: subject !== undefined ? subject.trim() : undefined,
        previewText: previewText !== undefined ? previewText : undefined,
        content: content !== undefined ? content : undefined,
        templateId: templateId !== undefined ? templateId : undefined,
        audienceList: audienceList !== undefined ? audienceList : undefined,
        status: status !== undefined ? status : (scheduledAt ? 'SCHEDULED' : undefined),
        scheduledAt: scheduledAt !== undefined ? (scheduledAt ? new Date(scheduledAt) : null) : undefined,
        tags: Array.isArray(tags) ? tags : undefined,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/campaigns/:id
 * Delete campaign with workspace isolation
 */
async function remove(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const existing = await prisma.campaign.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) {
      throw new ApiError(404, 'Campaign not found or access denied.');
    }

    await prisma.campaign.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Campaign removed successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/campaigns/:id/send
 * Dispatches real emails to all subscribed contacts in the workspace
 */
async function sendNow(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const campaign = await prisma.campaign.findFirst({
      where: { id, workspaceId },
    });
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found or access denied.');
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    // Temporarily mark as SENDING
    await prisma.campaign.update({
      where: { id },
      data: { status: 'SENDING' },
    });

    // Execute batch delivery through ESP adapter
    const dispatchResult = await emailService.sendCampaignBatch({
      campaign,
      workspace,
    });

    const currentStats = typeof campaign.stats === 'object' && campaign.stats ? { ...campaign.stats } : {};
    const updatedStats = {
      ...currentStats,
      sent: (currentStats.sent || 0) + dispatchResult.sent,
      delivered: (currentStats.delivered || 0) + dispatchResult.sent,
      bounced: (currentStats.bounced || 0) + dispatchResult.failed,
    };

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: dispatchResult.sent > 0 ? 'SENT' : (dispatchResult.total === 0 ? 'DRAFT' : 'FAILED'),
        sentAt: new Date(),
        scheduledAt: null,
        stats: updatedStats,
      },
    });

    // Create in-app notification for the workspace
    await prisma.notification.create({
      data: {
        workspaceId,
        type: 'campaign_sent',
        title: `Campaign Broadcast Dispatched`,
        message: `Campaign "${campaign.name}" was dispatched to ${dispatchResult.sent} subscriber(s) via ${dispatchResult.provider}.`,
      },
    }).catch((e) => console.warn('Failed to create notification:', e.message));

    res.json({
      ...updated,
      emailProvider: dispatchResult.provider,
      sentCount: dispatchResult.sent,
      failedCount: dispatchResult.failed,
      errors: dispatchResult.errors,
      note: dispatchResult.provider === 'dev_mock'
        ? 'Dispatched in dev_mock mode (logged to console). Configure RESEND_API_KEY for live inbox delivery.'
        : `Dispatched successfully via ${dispatchResult.provider}.`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/campaigns/summary
 * Aggregate metrics for workspace dashboard
 */
async function getSummary(req, res, next) {
  try {
    ensureDbConnected();
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const [totalCampaigns, contactCount, campaigns] = await Promise.all([
      prisma.campaign.count({ where: { workspaceId } }),
      prisma.contact.count({ where: { workspaceId, subscribed: true } }),
      prisma.campaign.findMany({ where: { workspaceId }, select: { stats: true } }),
    ]);

    let totalSent = 0;
    let totalDelivered = 0;
    let totalOpened = 0;
    let totalClicked = 0;

    for (const c of campaigns) {
      if (c.stats && typeof c.stats === 'object') {
        if (typeof c.stats.sent === 'number') totalSent += c.stats.sent;
        if (typeof c.stats.delivered === 'number') totalDelivered += c.stats.delivered;
        if (typeof c.stats.opened === 'number') totalOpened += c.stats.opened;
        if (typeof c.stats.clicked === 'number') totalClicked += c.stats.clicked;
      }
    }

    const openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 1000) / 10 : 0;
    const clickRate = totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 1000) / 10 : 0;

    res.json({
      totalCampaigns,
      emailsSent: totalSent,
      emailsDelivered: totalDelivered,
      openRate,
      clickRate,
      contacts: contactCount,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove, sendNow, getSummary };

