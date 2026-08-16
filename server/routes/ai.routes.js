// AI Routes — MailPilot
// AI Copilot endpoints for email marketers

const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { getSubjectLines, getEmailCopy, checkSpamRisk } = require('../controllers/ai.controller');

const router = Router();

router.use(authMiddleware);

router.post('/subject-lines', getSubjectLines);
router.post('/email-copy', getEmailCopy);
router.post('/spam-check', checkSpamRisk);

module.exports = router;
