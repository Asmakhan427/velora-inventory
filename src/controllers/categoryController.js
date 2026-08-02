const { db } = require('../db/connection');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { LOW_STOCK_THRESHOLD } = require('./productController');

const list = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query);
  const search = (req.query.search || '').trim();

  let where = '';
  const params = {};
  if (search) {
    where = 'WHERE c.name LIKE @search';
    params.search = `%${search}%`;
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM categories c ${where}`).get(params).count;
  const rows = db
    .prepare(
      `SELECT c.*, COUNT(p.id) AS product_count,
         COALESCE(SUM(p.unit_price * p.quantity_in_stock), 0) AS stock_value,
         SUM(CASE WHEN p.quantity_in_stock > 0 AND p.quantity_in_stock < ${LOW_STOCK_THRESHOLD} THEN 1 ELSE 0 END) AS low_stock_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.name ASC
       LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: pageSize, offset });

  res.json({ data: rows, meta: buildMeta({ page, pageSize, total }) });
});

const getOne = asyncHandler(async (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) throw ApiError.notFound('Category not found.');
  res.json({ data: category });
});

const create = asyncHandler(async (req, res) => {
  const { name, description = null } = req.body;

  const existing = db.prepare('SELECT id FROM categories WHERE name = ?').get(name);
  if (existing) throw ApiError.conflict('A category with this name already exists.', { field: 'name' });

  const info = db
    .prepare('INSERT INTO categories (name, description) VALUES (?, ?)')
    .run(name, description);
  const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ data: created });
});

const update = asyncHandler(async (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) throw ApiError.notFound('Category not found.');

  const name = req.body.name !== undefined ? req.body.name : category.name;
  const description = req.body.description !== undefined ? req.body.description : category.description;

  if (name !== category.name) {
    const dup = db.prepare('SELECT id FROM categories WHERE name = ? AND id != ?').get(name, category.id);
    if (dup) throw ApiError.conflict('A category with this name already exists.', { field: 'name' });
  }

  db.prepare("UPDATE categories SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?").run(
    name,
    description,
    category.id
  );
  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(category.id);
  res.json({ data: updated });
});

const remove = asyncHandler(async (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) throw ApiError.notFound('Category not found.');

  const productCount = db.prepare('SELECT COUNT(*) AS count FROM products WHERE category_id = ?').get(category.id).count;
  if (productCount > 0) {
    throw ApiError.conflict(
      `Cannot delete category "${category.name}" because it still has ${productCount} associated product(s). Reassign or delete those products first.`,
      { productCount }
    );
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(category.id);
  res.status(204).send();
});

module.exports = { list, getOne, create, update, remove };
