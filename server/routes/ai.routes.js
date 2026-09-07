// AI Routes — MailPilot
// AI Copilot endpoints for email marketers

const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { getSubjectLines, getEmailCopy, checkSpamRisk, assistantChat } = require('../controllers/ai.controller');
const { aiLimiter } = require('../middlewares/rateLimiter.middleware');

const router = Router();

router.use(authMiddleware);

router.post('/assistant', aiLimiter, assistantChat);
router.post('/subject-lines', aiLimiter, getSubjectLines);
router.post('/email-copy', aiLimiter, getEmailCopy);
router.post('/spam-check', aiLimiter, checkSpamRisk);

module.exports = router;
