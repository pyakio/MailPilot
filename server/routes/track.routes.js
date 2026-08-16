// Tracking Routes — MailPilot
// Public tracking endpoints for email open pixels and click redirects

const { Router } = require('express');
const { trackOpen, trackClick } = require('../controllers/track.controller');

const router = Router();

// Public tracking endpoints (no auth required)
router.get('/open/:token', trackOpen);
router.get('/click/:token', trackClick);

module.exports = router;
