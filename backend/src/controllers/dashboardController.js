const { db } = require('../db/connection');
const asyncHandler = require('../utils/asyncHandler');
const { LOW_STOCK_THRESHOLD } = require('./productController');

const summary = asyncHandler(async (req, res) => {
  const totals = db
    .prepare(
      `SELECT
         COUNT(*) AS total_products,
         COALESCE(SUM(unit_price * quantity_in_stock), 0) AS total_stock_value,
         COALESCE(SUM(quantity_in_stock), 0) AS total_units,
         SUM(CASE WHEN quantity_in_stock = 0 THEN 1 ELSE 0 END) AS out_of_stock_count,
         SUM(CASE WHEN quantity_in_stock > 0 AND quantity_in_stock < ${LOW_STOCK_THRESHOLD} THEN 1 ELSE 0 END) AS low_stock_count
       FROM products`
    )
    .get();

  const categoryCount = db.prepare('SELECT COUNT(*) AS count FROM categories').get().count;
  const supplierCount = db.prepare('SELECT COUNT(*) AS count FROM suppliers').get().count;

  const byCategory = db
    .prepare(
      `SELECT c.name AS category, COUNT(p.id) AS product_count, COALESCE(SUM(p.unit_price * p.quantity_in_stock), 0) AS stock_value
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY stock_value DESC`
    )
    .all();

  const bySupplier = db
    .prepare(
      `SELECT s.name AS supplier, COUNT(p.id) AS product_count, COALESCE(SUM(p.unit_price * p.quantity_in_stock), 0) AS stock_value
       FROM suppliers s
       LEFT JOIN products p ON p.supplier_id = s.id
       GROUP BY s.id
       ORDER BY stock_value DESC`
    )
    .all();

  const recentMovements = db
    .prepare(
      `SELECT sm.*, p.name AS product_name, p.sku
       FROM stock_movements sm
       JOIN products p ON p.id = sm.product_id
       ORDER BY sm.created_at DESC, sm.id DESC
       LIMIT 8`
    )
    .all();

  res.json({
    data: {
      totalProducts: totals.total_products,
      totalStockValue: totals.total_stock_value,
      totalUnits: totals.total_units,
      outOfStockCount: totals.out_of_stock_count,
      lowStockCount: totals.low_stock_count,
      categoryCount,
      supplierCount,
      byCategory,
      bySupplier,
      recentMovements,
    },
  });
});

// Daily IN/OUT movement totals for the trailing `days` window — powers the
// inventory trends chart. There's no historical stock-value snapshot table,
// so this reports real movement volume (units), not a reconstructed value
// curve, to stay honest about what the data actually supports.
const trends = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);

  const points = db
    .prepare(
      `SELECT date(created_at) AS date,
         COALESCE(SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END), 0) AS in_qty,
         COALESCE(SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END), 0) AS out_qty
       FROM stock_movements
       WHERE created_at >= datetime('now', @range)
       GROUP BY date(created_at)
       ORDER BY date ASC`
    )
    .all({ range: `-${days} days` });

  res.json({ data: { days, points } });
});

module.exports = { summary, trends };
