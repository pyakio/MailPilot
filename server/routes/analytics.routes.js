const { Router } = require('express');
const { getAnalytics } = require('../controllers/analytics.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/', getAnalytics);

module.exports = router;
