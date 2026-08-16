const { Router } = require('express');
const {
  getAll,
  getOne,
  create,
  update,
  remove,
  sendNow,
  getSummary,
} = require('../controllers/campaigns.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../validators/validate.middleware');
const { createCampaignSchema, updateCampaignSchema } = require('../validators/campaign.validator');

const router = Router();

// All campaign routes are protected
router.use(authMiddleware);

router.get('/summary', getSummary);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', requireRole(['ADMIN', 'EDITOR']), validate(createCampaignSchema), create);
router.put('/:id', requireRole(['ADMIN', 'EDITOR']), validate(updateCampaignSchema), update);
router.delete('/:id', requireRole(['ADMIN']), remove);
router.post('/:id/send', requireRole(['ADMIN', 'EDITOR']), sendNow);

module.exports = router;

