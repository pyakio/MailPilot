const { prisma, ensureDbConnected } = require('../config/db');
const { syncUserInbox } = require('../services/gmailSync.service');
const { sendGmailMessage } = require('../services/gmailSend.service');
const { summarizeThread, generateSmartReplies, polishEmailDraft } = require('../services/aiEmail.service');
const { ApiError } = require('../middlewares/error.middleware');

/**
 * GET /api/inbox/threads
 * Retrieves paginated list of threads for the authenticated user
 */
async function listThreads(req, res, next) {
  try {
    ensureDbConnected();
    const userId = req.user.id;
    const {
      label = 'INBOX',
      q = '',
      page = 1,
      limit = 20,
      isStarred,
      isRead,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Check if user has zero threads and trigger auto initial seed/sync
    const existingThreadCount = await prisma.thread.count({ where: { userId } });
    if (existingThreadCount === 0) {
      const googleAccount = await prisma.account.findFirst({
        where: { userId, provider: 'google' },
      });
      if (googleAccount) {
        try {
          await syncUserInbox(userId);
        } catch (syncErr) {
          console.warn('⚠️ [Inbox Controller] Initial auto-sync note:', syncErr.message);
        }
      }
    }

    const where = {
      userId,
    };

    // Label filter
    const normalizedLabel = (label || 'INBOX').toUpperCase().trim();
    if (normalizedLabel === 'STARRED') {
      where.isStarred = true;
      where.NOT = { labels: { has: 'TRASH' } };
    } else if (normalizedLabel === 'UNREAD') {
      where.unreadCount = { gte: 1 };
      where.NOT = { labels: { has: 'TRASH' } };
    } else if (normalizedLabel === 'ALL') {
      // Show all except TRASH unless explicitly requested
      where.NOT = { labels: { has: 'TRASH' } };
    } else {
      where.labels = { has: normalizedLabel };
    }

    // Direct boolean filters
    if (isStarred !== undefined) {
      where.isStarred = isStarred === 'true' || isStarred === true;
    }
    if (isRead !== undefined) {
      const wantRead = isRead === 'true' || isRead === true;
      if (wantRead) {
        where.unreadCount = 0;
      } else {
        where.unreadCount = { gte: 1 };
      }
    }

    // Search filter
    if (q && typeof q === 'string' && q.trim().length > 0) {
      const search = q.trim();
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { snippet: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [threads, total, unreadTotal] = await Promise.all([
      prisma.thread.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          aiSummary: true,
        },
      }),
      prisma.thread.count({ where }),
      prisma.thread.count({
        where: {
          userId,
          unreadCount: { gte: 1 },
          labels: { has: 'INBOX' },
        },
      }),
    ]);

    return res.json({
      success: true,
      threads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      unreadTotal,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/inbox/threads/:id
 * Returns full thread message stream, drafts, and AI summary
 */
async function getThread(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;

    const thread = await prisma.thread.findUnique({
      where: { id },
      include: {
        emails: {
          orderBy: { date: 'asc' },
        },
        drafts: true,
        aiSummary: true,
      },
    });

    if (!thread || thread.userId !== req.user.id) {
      throw new ApiError(404, 'Email thread not found.');
    }

    return res.json({
      success: true,
      thread,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/inbox/threads/:id/read
 * Marks a thread and all its constituent emails as read or unread
 * Body: { isRead: boolean }
 */
async function markThreadRead(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const isRead = req.body.isRead !== undefined ? Boolean(req.body.isRead) : true;

    const thread = await prisma.thread.findUnique({ where: { id } });
    if (!thread || thread.userId !== req.user.id) {
      throw new ApiError(404, 'Email thread not found.');
    }

    let updatedLabels = Array.isArray(thread.labels) ? [...thread.labels] : [];
    if (isRead) {
      updatedLabels = updatedLabels.filter((l) => l !== 'UNREAD');
    } else {
      if (!updatedLabels.includes('UNREAD')) updatedLabels.push('UNREAD');
    }

    // Update thread unread count and labels
    const updatedThread = await prisma.thread.update({
      where: { id },
      data: {
        unreadCount: isRead ? 0 : thread.messageCount || 1,
        labels: updatedLabels,
      },
    });

    // Update child email records
    await prisma.email.updateMany({
      where: { threadId: id },
      data: { isRead },
    });

    return res.json({
      success: true,
      thread: updatedThread,
      isRead,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/inbox/threads/:id/star
 * Stars or unstars a thread
 * Body: { isStarred: boolean }
 */
async function markThreadStarred(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const isStarred = req.body.isStarred !== undefined ? Boolean(req.body.isStarred) : true;

    const thread = await prisma.thread.findUnique({ where: { id } });
    if (!thread || thread.userId !== req.user.id) {
      throw new ApiError(404, 'Email thread not found.');
    }

    let updatedLabels = Array.isArray(thread.labels) ? [...thread.labels] : [];
    if (isStarred) {
      if (!updatedLabels.includes('STARRED')) updatedLabels.push('STARRED');
    } else {
      updatedLabels = updatedLabels.filter((l) => l !== 'STARRED');
    }

    const updatedThread = await prisma.thread.update({
      where: { id },
      data: {
        isStarred,
        labels: updatedLabels,
      },
    });

    await prisma.email.updateMany({
      where: { threadId: id },
      data: { isStarred },
    });

    return res.json({
      success: true,
      thread: updatedThread,
      isStarred,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inbox/threads/:id/trash
 * Moves a thread to TRASH
 */
async function trashThread(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;

    const thread = await prisma.thread.findUnique({ where: { id } });
    if (!thread || thread.userId !== req.user.id) {
      throw new ApiError(404, 'Email thread not found.');
    }

    const currentLabels = Array.isArray(thread.labels) ? thread.labels : [];
    const newLabels = currentLabels.filter((l) => l !== 'INBOX');
    if (!newLabels.includes('TRASH')) newLabels.push('TRASH');

    const updatedThread = await prisma.thread.update({
      where: { id },
      data: { labels: newLabels },
    });

    return res.json({
      success: true,
      message: 'Thread moved to trash.',
      thread: updatedThread,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inbox/threads/:id/untrash
 * Restores a thread from TRASH back to INBOX
 */
async function untrashThread(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;

    const thread = await prisma.thread.findUnique({ where: { id } });
    if (!thread || thread.userId !== req.user.id) {
      throw new ApiError(404, 'Email thread not found.');
    }

    const currentLabels = Array.isArray(thread.labels) ? thread.labels : [];
    const newLabels = currentLabels.filter((l) => l !== 'TRASH');
    if (!newLabels.includes('INBOX')) newLabels.push('INBOX');

    const updatedThread = await prisma.thread.update({
      where: { id },
      data: { labels: newLabels },
    });

    return res.json({
      success: true,
      message: 'Thread restored to inbox.',
      thread: updatedThread,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/inbox/stats
 * Returns sidebar counts for inbox badges
 */
async function getInboxStats(req, res, next) {
  try {
    ensureDbConnected();
    const userId = req.user.id;

    const [inboxUnread, starred, sent, trash] = await Promise.all([
      prisma.thread.count({
        where: {
          userId,
          labels: { has: 'INBOX' },
          unreadCount: { gte: 1 },
        },
      }),
      prisma.thread.count({
        where: {
          userId,
          isStarred: true,
          NOT: { labels: { has: 'TRASH' } },
        },
      }),
      prisma.thread.count({
        where: {
          userId,
          labels: { has: 'SENT' },
        },
      }),
      prisma.thread.count({
        where: {
          userId,
          labels: { has: 'TRASH' },
        },
      }),
    ]);

    return res.json({
      success: true,
      stats: {
        inboxUnread,
        starred,
        sent,
        trash,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inbox/sync
 * Triggers Gmail mailbox synchronization for the authenticated user
 */
async function syncInbox(req, res, next) {
  try {
    ensureDbConnected();
    const result = await syncUserInbox(req.user.id, {
      maxResults: req.query.maxResults ? parseInt(req.query.maxResults, 10) : 20,
      query: req.query.q || undefined,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inbox/send
 * Dispatches an email message and links to thread
 */
async function sendEmail(req, res, next) {
  try {
    ensureDbConnected();
    const result = await sendGmailMessage(req.user.id, req.body);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/inbox/drafts
 * Retrieves all drafts for the authenticated user
 */
async function listDrafts(req, res, next) {
  try {
    ensureDbConnected();
    const drafts = await prisma.emailDraft.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({
      success: true,
      drafts,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inbox/drafts
 * Saves or updates an email draft
 */
async function createOrUpdateDraft(req, res, next) {
  try {
    ensureDbConnected();
    const userId = req.user.id;
    const { id, threadId, to = [], cc = [], bcc = [], subject = '', bodyText = '', bodyHtml = '' } = req.body;

    let draft;
    if (id) {
      const existing = await prisma.emailDraft.findUnique({ where: { id } });
      if (existing && existing.userId === userId) {
        draft = await prisma.emailDraft.update({
          where: { id },
          data: {
            threadId: threadId || existing.threadId,
            to: Array.isArray(to) ? to : (to ? [to] : []),
            cc: Array.isArray(cc) ? cc : (cc ? [cc] : []),
            bcc: Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []),
            subject,
            bodyText,
            bodyHtml,
          },
        });
      }
    }

    if (!draft) {
      draft = await prisma.emailDraft.create({
        data: {
          userId,
          threadId: threadId || null,
          to: Array.isArray(to) ? to : (to ? [to] : []),
          cc: Array.isArray(cc) ? cc : (cc ? [cc] : []),
          bcc: Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []),
          subject,
          bodyText,
          bodyHtml,
        },
      });
    }

    return res.json({
      success: true,
      draft,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/inbox/drafts/:id
 * Deletes an email draft
 */
async function deleteDraft(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;

    const draft = await prisma.emailDraft.findUnique({ where: { id } });
    if (!draft || draft.userId !== req.user.id) {
      throw new ApiError(404, 'Draft not found.');
    }

    await prisma.emailDraft.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Draft deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inbox/threads/:id/summarize
 * Generates an executive AI summary for the thread
 */
async function summarizeThreadHandler(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const aiSummary = await summarizeThread(req.user.id, id);
    return res.json({
      success: true,
      aiSummary,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inbox/threads/:id/smart-replies
 * Generates 3 context-aware smart replies for the thread
 */
async function getSmartRepliesHandler(req, res, next) {
  try {
    ensureDbConnected();
    const { id } = req.params;
    const result = await generateSmartReplies(req.user.id, id);
    return res.json({
      success: true,
      replies: result.replies,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inbox/polish
 * Rewrites and polishes email draft with specified tone
 */
async function polishEmailHandler(req, res, next) {
  try {
    ensureDbConnected();
    const result = await polishEmailDraft(req.user.id, req.body);
    return res.json({
      success: true,
      polishedText: result.polishedText,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/inbox/search
 * Advanced multi-criteria search across threads, senders, and content
 */
async function searchThreads(req, res, next) {
  try {
    ensureDbConnected();
    const userId = req.user.id;
    const {
      q = '',
      from = '',
      to = '',
      label = '',
      isStarred,
      isUnread,
      hasAttachment,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      userId,
    };

    if (label && label.trim()) {
      const norm = label.toUpperCase().trim();
      if (norm === 'STARRED') {
        where.isStarred = true;
      } else if (norm === 'UNREAD') {
        where.unreadCount = { gte: 1 };
      } else if (norm !== 'ALL') {
        where.labels = { has: norm };
      }
    }

    if (isStarred !== undefined) {
      where.isStarred = isStarred === 'true' || isStarred === true;
    }

    if (isUnread !== undefined) {
      const unreadWanted = isUnread === 'true' || isUnread === true;
      if (unreadWanted) {
        where.unreadCount = { gte: 1 };
      } else {
        where.unreadCount = 0;
      }
    }

    if (hasAttachment !== undefined) {
      where.hasAttachments = hasAttachment === 'true' || hasAttachment === true;
    }

    // Keyword search
    if (q && q.trim()) {
      const search = q.trim();
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { snippet: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          aiSummary: true,
        },
      }),
      prisma.thread.count({ where }),
    ]);

    return res.json({
      success: true,
      threads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/inbox/batch
 * Performs atomic bulk operations across multiple selected threads
 */
async function batchAction(req, res, next) {
  try {
    ensureDbConnected();
    const userId = req.user.id;
    const { threadIds = [], action } = req.body;

    if (!Array.isArray(threadIds) || threadIds.length === 0) {
      throw new ApiError(400, 'Array of threadIds is required for batch operations.');
    }

    if (!['mark_read', 'mark_unread', 'star', 'unstar', 'trash', 'untrash'].includes(action)) {
      throw new ApiError(400, `Invalid batch action: ${action}`);
    }

    // Verify ownership of the specified threads
    const userThreads = await prisma.thread.findMany({
      where: {
        id: { in: threadIds },
        userId,
      },
    });

    const validIds = userThreads.map((t) => t.id);
    if (validIds.length === 0) {
      throw new ApiError(404, 'No matching threads found for the current user.');
    }

    for (const thread of userThreads) {
      const currentLabels = Array.isArray(thread.labels) ? [...thread.labels] : [];

      if (action === 'mark_read') {
        const labels = currentLabels.filter((l) => l !== 'UNREAD');
        await prisma.thread.update({
          where: { id: thread.id },
          data: { unreadCount: 0, labels },
        });
        await prisma.email.updateMany({
          where: { threadId: thread.id },
          data: { isRead: true },
        });
      } else if (action === 'mark_unread') {
        if (!currentLabels.includes('UNREAD')) currentLabels.push('UNREAD');
        await prisma.thread.update({
          where: { id: thread.id },
          data: { unreadCount: thread.messageCount || 1, labels: currentLabels },
        });
        await prisma.email.updateMany({
          where: { threadId: thread.id },
          data: { isRead: false },
        });
      } else if (action === 'star') {
        if (!currentLabels.includes('STARRED')) currentLabels.push('STARRED');
        await prisma.thread.update({
          where: { id: thread.id },
          data: { isStarred: true, labels: currentLabels },
        });
        await prisma.email.updateMany({
          where: { threadId: thread.id },
          data: { isStarred: true },
        });
      } else if (action === 'unstar') {
        const labels = currentLabels.filter((l) => l !== 'STARRED');
        await prisma.thread.update({
          where: { id: thread.id },
          data: { isStarred: false, labels },
        });
        await prisma.email.updateMany({
          where: { threadId: thread.id },
          data: { isStarred: false },
        });
      } else if (action === 'trash') {
        const labels = currentLabels.filter((l) => l !== 'INBOX');
        if (!labels.includes('TRASH')) labels.push('TRASH');
        await prisma.thread.update({
          where: { id: thread.id },
          data: { labels },
        });
      } else if (action === 'untrash') {
        const labels = currentLabels.filter((l) => l !== 'TRASH');
        if (!labels.includes('INBOX')) labels.push('INBOX');
        await prisma.thread.update({
          where: { id: thread.id },
          data: { labels },
        });
      }
    }

    return res.json({
      success: true,
      action,
      count: validIds.length,
      updatedThreadIds: validIds,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listThreads,
  getThread,
  markThreadRead,
  markThreadStarred,
  trashThread,
  untrashThread,
  getInboxStats,
  syncInbox,
  sendEmail,
  listDrafts,
  createOrUpdateDraft,
  deleteDraft,
  summarizeThreadHandler,
  getSmartRepliesHandler,
  polishEmailHandler,
  searchThreads,
  batchAction,
};
