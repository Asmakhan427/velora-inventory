const express = require('express');
const controller = require('../controllers/productController');
const { validateBody } = require('../validation/validate');
const { productCreateSchema, productUpdateSchema, stockMovementSchema } = require('../validation/schemas');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', controller.list);
router.get('/export/csv', controller.exportCsv);
router.get('/:id', controller.getOne);
router.get('/:id/stock-movements', controller.listStockMovements);

router.post('/', requireRole('ADMIN'), validateBody(productCreateSchema), controller.create);
router.post('/:id/stock-movements', requireRole('ADMIN'), validateBody(stockMovementSchema), controller.createStockMovement);

router.put('/:id', requireRole('ADMIN'), validateBody(productUpdateSchema), controller.update);
router.delete('/:id', requireRole('ADMIN'), controller.remove);

module.exports = router;
