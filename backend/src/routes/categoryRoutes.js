const express = require('express');
const controller = require('../controllers/categoryController');
const { validateBody } = require('../validation/validate');
const { categoryCreateSchema, categoryUpdateSchema } = require('../validation/schemas');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', requireRole('ADMIN'), validateBody(categoryCreateSchema), controller.create);
router.put('/:id', requireRole('ADMIN'), validateBody(categoryUpdateSchema), controller.update);
router.delete('/:id', requireRole('ADMIN'), controller.remove);

module.exports = router;
