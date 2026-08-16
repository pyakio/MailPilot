const { Router } = require('express');
const { getAll, create, update, remove, importContacts } = require('../controllers/contacts.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');
const { validate } = require('../validators/validate.middleware');
const { createContactSchema, updateContactSchema, importContactsSchema } = require('../validators/contact.validator');

const router = Router();

router.use(authMiddleware);

router.get('/', getAll);
router.post('/', requireRole(['ADMIN', 'EDITOR']), validate(createContactSchema), create);
router.put('/:id', requireRole(['ADMIN', 'EDITOR']), validate(updateContactSchema), update);
router.delete('/:id', requireRole(['ADMIN']), remove);
router.post('/import', requireRole(['ADMIN', 'EDITOR']), validate(importContactsSchema), importContacts);

module.exports = router;

