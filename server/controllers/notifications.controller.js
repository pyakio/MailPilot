// Notifications Controller — MailPilot
// Database-backed notification management scoped to workspace

const { getConnectionStatus, prisma } = require('../config/db');
const { ApiError } = require('../middlewares/error.middleware');
const { getUserWorkspaceId } = require('../services/workspace.service');

function ensureDbConnected() {
  if (!getConnectionStatus()) {
    throw new ApiError(
      503,
      'Database connection unavailable. Please ensure DATABASE_URL is configured in server/.env.'
    );
  }
}

/**
 * GET /api/notifications
 */
async function getAll(req, res, next) {
  try {
    ensureDbConnected();
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const notifications = await prisma.notification.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/notifications/:id/read or POST /api/notifications/:id/read
 */
async function markAsRead(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const workspaceId = await getUserWorkspaceId(req.user.id);

    const existing = await prisma.notification.findFirst({
      where: { id, workspaceId },
    });

    if (!existing) {
      throw new ApiError(404, 'Notification not found or access denied.');
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ success: true, notificationId: id });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/notifications or POST /api/notifications/read-all
 */
async function clearAll(req, res, next) {
  try {
    ensureDbConnected();
    const workspaceId = await getUserWorkspaceId(req.user.id);

    await prisma.notification.updateMany({
      where: { workspaceId, read: false },
      data: { read: true },
    });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, markAsRead, clearAll };
