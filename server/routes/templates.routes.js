const { Router } = require('express');
const { getAll, getOne, create, update, remove } = require('../controllers/templates.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../validators/validate.middleware');
const { createTemplateSchema, updateTemplateSchema } = require('../validators/template.validator');

const router = Router();

router.use(authMiddleware);

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', requireRole(['ADMIN', 'EDITOR']), validate(createTemplateSchema), create);
router.put('/:id', requireRole(['ADMIN', 'EDITOR']), validate(updateTemplateSchema), update);
router.delete('/:id', requireRole(['ADMIN']), remove);

module.exports = router;

