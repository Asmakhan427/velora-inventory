const { db } = require('../db/connection');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildMeta } = require('../utils/pagination');

const LOW_STOCK_THRESHOLD = 10;

function buildFilters(query) {
  const clauses = [];
  const params = {};

  const search = (query.search || '').trim();
  if (search) {
    clauses.push('(p.name LIKE @search OR p.sku LIKE @search)');
    params.search = `%${search}%`;
  }

  if (query.category) {
    clauses.push('p.category_id = @category');
    params.category = Number(query.category);
  }

  if (query.supplier) {
    clauses.push('p.supplier_id = @supplier');
    params.supplier = Number(query.supplier);
  }

  if (query.status) {
    if (query.status === 'out_of_stock') {
      clauses.push('p.quantity_in_stock = 0');
    } else if (query.status === 'low_stock') {
      clauses.push(`p.quantity_in_stock > 0 AND p.quantity_in_stock < ${LOW_STOCK_THRESHOLD}`);
    } else if (query.status === 'in_stock') {
      clauses.push(`p.quantity_in_stock >= ${LOW_STOCK_THRESHOLD}`);
    }
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

const SORTABLE_COLUMNS = {
  name: 'p.name',
  sku: 'p.sku',
  unit_price: 'p.unit_price',
  quantity_in_stock: 'p.quantity_in_stock',
  created_at: 'p.created_at',
};

function buildOrderBy(query) {
  const column = SORTABLE_COLUMNS[query.sortBy] || 'p.created_at';
  const direction = String(query.sortDir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  return `${column} ${direction}`;
}

const SELECT_PRODUCT = `
  SELECT p.*, c.name AS category_name, s.name AS supplier_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN suppliers s ON s.id = p.supplier_id
`;

const list = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query);
  const { where, params } = buildFilters(req.query);
  const orderBy = buildOrderBy(req.query);

  const total = db.prepare(`SELECT COUNT(*) AS count FROM products p ${where}`).get(params).count;
  const rows = db
    .prepare(`${SELECT_PRODUCT} ${where} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit: pageSize, offset });

  res.json({ data: rows, meta: buildMeta({ page, pageSize, total }) });
});

const exportCsv = asyncHandler(async (req, res) => {
  const { where, params } = buildFilters(req.query);
  const orderBy = buildOrderBy(req.query);
  const rows = db.prepare(`${SELECT_PRODUCT} ${where} ORDER BY ${orderBy}`).all(params);

  const header = ['id', 'name', 'sku', 'description', 'unit_price', 'quantity_in_stock', 'category', 'supplier', 'created_at', 'updated_at'];
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [r.id, r.name, r.sku, r.description, r.unit_price, r.quantity_in_stock, r.category_name, r.supplier_name, r.created_at, r.updated_at]
        .map(escape)
        .join(',')
    );
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products-export.csv"');
  res.send(lines.join('\n'));
});

const getOne = asyncHandler(async (req, res) => {
  const product = db.prepare(`${SELECT_PRODUCT} WHERE p.id = ?`).get(req.params.id);
  if (!product) throw ApiError.notFound('Product not found.');
  res.json({ data: product });
});

function assertCategoryAndSupplierExist(category_id, supplier_id) {
  if (category_id !== undefined) {
    const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!cat) throw ApiError.badRequest('The specified category does not exist.', { field: 'category_id' });
  }
  if (supplier_id !== undefined) {
    const sup = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(supplier_id);
    if (!sup) throw ApiError.badRequest('The specified supplier does not exist.', { field: 'supplier_id' });
  }
}

const create = asyncHandler(async (req, res) => {
  const {
    name,
    sku,
    description = null,
    unit_price,
    quantity_in_stock = 0,
    category_id,
    supplier_id,
  } = req.body;

  const existingSku = db.prepare('SELECT id FROM products WHERE sku = ?').get(sku);
  if (existingSku) throw ApiError.conflict(`A product with SKU "${sku}" already exists.`, { field: 'sku' });

  assertCategoryAndSupplierExist(Number(category_id), Number(supplier_id));

  const info = db
    .prepare(
      `INSERT INTO products (name, sku, description, unit_price, quantity_in_stock, category_id, supplier_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(name, sku, description, Number(unit_price), Number(quantity_in_stock), Number(category_id), Number(supplier_id));

  const created = db.prepare(`${SELECT_PRODUCT} WHERE p.id = ?`).get(info.lastInsertRowid);
  res.status(201).json({ data: created });
});

const update = asyncHandler(async (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) throw ApiError.notFound('Product not found.');

  const next = {
    name: req.body.name !== undefined ? req.body.name : product.name,
    sku: req.body.sku !== undefined ? req.body.sku : product.sku,
    description: req.body.description !== undefined ? req.body.description : product.description,
    unit_price: req.body.unit_price !== undefined ? Number(req.body.unit_price) : product.unit_price,
    category_id: req.body.category_id !== undefined ? Number(req.body.category_id) : product.category_id,
    supplier_id: req.body.supplier_id !== undefined ? Number(req.body.supplier_id) : product.supplier_id,
  };

  if (next.sku !== product.sku) {
    const dup = db.prepare('SELECT id FROM products WHERE sku = ? AND id != ?').get(next.sku, product.id);
    if (dup) throw ApiError.conflict(`A product with SKU "${next.sku}" already exists.`, { field: 'sku' });
  }

  assertCategoryAndSupplierExist(
    next.category_id !== product.category_id ? next.category_id : undefined,
    next.supplier_id !== product.supplier_id ? next.supplier_id : undefined
  );

  db.prepare(
    `UPDATE products
     SET name = ?, sku = ?, description = ?, unit_price = ?, category_id = ?, supplier_id = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(next.name, next.sku, next.description, next.unit_price, next.category_id, next.supplier_id, product.id);

  const updated = db.prepare(`${SELECT_PRODUCT} WHERE p.id = ?`).get(product.id);
  res.json({ data: updated });
});

const remove = asyncHandler(async (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) throw ApiError.notFound('Product not found.');

  db.prepare('DELETE FROM products WHERE id = ?').run(product.id); // stock_movements cascade
  res.status(204).send();
});

// --- Stock Movements -------------------------------------------------------

const createStockMovement = asyncHandler(async (req, res) => {
  const { type, quantity, reason = null } = req.body;
  const qty = Number(quantity);

  const runMovement = db.transaction(() => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) throw ApiError.notFound('Product not found.');

    let newQuantity;
    if (type === 'IN') {
      newQuantity = product.quantity_in_stock + qty;
    } else {
      newQuantity = product.quantity_in_stock - qty;
      if (newQuantity < 0) {
        throw ApiError.badRequest(
          `Cannot remove ${qty} unit(s): only ${product.quantity_in_stock} in stock.`,
          { field: 'quantity', available: product.quantity_in_stock }
        );
      }
    }

    db.prepare("UPDATE products SET quantity_in_stock = ?, updated_at = datetime('now') WHERE id = ?").run(
      newQuantity,
      product.id
    );
    const info = db
      .prepare('INSERT INTO stock_movements (product_id, type, quantity, reason) VALUES (?, ?, ?, ?)')
      .run(product.id, type, qty, reason);

    return { movementId: info.lastInsertRowid, newQuantity };
  });

  const { movementId, newQuantity } = runMovement();

  const movement = db.prepare('SELECT * FROM stock_movements WHERE id = ?').get(movementId);
  const product = db.prepare(`${SELECT_PRODUCT} WHERE p.id = ?`).get(req.params.id);
  res.status(201).json({ data: { movement, product, newQuantity } });
});

const listStockMovements = asyncHandler(async (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) throw ApiError.notFound('Product not found.');

  const { page, pageSize, offset } = parsePagination(req.query);
  const total = db.prepare('SELECT COUNT(*) AS count FROM stock_movements WHERE product_id = ?').get(product.id).count;
  const rows = db
    .prepare('SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at ASC, id ASC')
    .all(product.id);

  // Compute a running balance across full history, then paginate most-recent-first for display.
  let balance = 0;
  const withBalance = rows.map((m) => {
    balance += m.type === 'IN' ? m.quantity : -m.quantity;
    return { ...m, running_balance: balance };
  });
  withBalance.reverse();

  const page_rows = withBalance.slice(offset, offset + pageSize);

  res.json({ data: page_rows, meta: buildMeta({ page, pageSize, total }) });
});

module.exports = {
  list,
  exportCsv,
  getOne,
  create,
  update,
  remove,
  createStockMovement,
  listStockMovements,
  LOW_STOCK_THRESHOLD,
};
