// Unsubscribe Routes — MailPilot
// Public endpoints for recipient email unsubscription

const { Router } = require('express');
const { getUnsubscribe, postUnsubscribe, verifyToken } = require('../controllers/unsubscribe.controller');

const router = Router();

// Public unsubscribe routes
router.get('/verify/:token', verifyToken);
router.get('/:token', getUnsubscribe);
router.post('/:token', postUnsubscribe);

module.exports = router;
