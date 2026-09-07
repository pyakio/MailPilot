// Inbox Routes — MailPilot
const { Router } = require('express');
const {
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
} = require('../controllers/inbox.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { aiLimiter, sendLimiter, syncLimiter, searchLimiter } = require('../middlewares/rateLimiter.middleware');

const router = Router();

// All inbox routes require authentication
router.use(authMiddleware);

// Inbox stats, sync, send, search, batch
router.get('/stats', getInboxStats);
router.post('/sync', syncLimiter, syncInbox);
router.post('/send', sendLimiter, sendEmail);
router.post('/polish', aiLimiter, polishEmailHandler);
router.get('/search', searchLimiter, searchThreads);
router.post('/batch', searchLimiter, batchAction);

// Drafts
router.get('/drafts', listDrafts);
router.post('/drafts', createOrUpdateDraft);
router.delete('/drafts/:id', deleteDraft);

// Threads collection and resource routes
router.get('/threads', listThreads);
router.get('/threads/:id', getThread);
router.post('/threads/:id/summarize', aiLimiter, summarizeThreadHandler);
router.post('/threads/:id/smart-replies', aiLimiter, getSmartRepliesHandler);
router.patch('/threads/:id/read', markThreadRead);
router.patch('/threads/:id/star', markThreadStarred);
router.post('/threads/:id/trash', trashThread);
router.post('/threads/:id/untrash', untrashThread);

module.exports = router;
