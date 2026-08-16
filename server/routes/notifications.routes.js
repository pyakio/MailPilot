// Notifications Routes — MailPilot
// Express API endpoints for in-app notifications (Prisma DB-backed)

const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { getAll, markAsRead, clearAll } = require('../controllers/notifications.controller');

const router = Router();

router.use(authMiddleware);

// GET /api/notifications
router.get('/', getAll);

// Mark notification read (supports both PUT and POST methods)
router.put('/:id/read', markAsRead);
router.post('/:id/read', markAsRead);

// Clear / read all notifications (supports both DELETE and POST methods)
router.delete('/', clearAll);
router.post('/read-all', clearAll);

module.exports = router;

