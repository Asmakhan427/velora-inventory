const express = require('express');
const controller = require('../controllers/supplierController');
const { validateBody } = require('../validation/validate');
const { supplierCreateSchema, supplierUpdateSchema } = require('../validation/schemas');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.get('/:id/deliveries', controller.deliveries);
router.post('/', requireRole('ADMIN'), validateBody(supplierCreateSchema), controller.create);
router.put('/:id', requireRole('ADMIN'), validateBody(supplierUpdateSchema), controller.update);
router.delete('/:id', requireRole('ADMIN'), controller.remove);

module.exports = router;
