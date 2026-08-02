const { db } = require('../db/connection');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { parsePagination, buildMeta } = require('../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query);
  const search = (req.query.search || '').trim();

  let where = '';
  const params = {};
  if (search) {
    where = 'WHERE s.name LIKE @search OR s.contact_email LIKE @search';
    params.search = `%${search}%`;
  }

  const total = db.prepare(`SELECT COUNT(*) AS count FROM suppliers s ${where}`).get(params).count;
  const rows = db
    .prepare(
      `SELECT s.*, COUNT(p.id) AS product_count
       FROM suppliers s
       LEFT JOIN products p ON p.supplier_id = s.id
       ${where}
       GROUP BY s.id
       ORDER BY s.name ASC
       LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit: pageSize, offset });

  res.json({ data: rows, meta: buildMeta({ page, pageSize, total }) });
});

const getOne = asyncHandler(async (req, res) => {
  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
  if (!supplier) throw ApiError.notFound('Supplier not found.');
  res.json({ data: supplier });
});

const create = asyncHandler(async (req, res) => {
  const { name, contact_email, phone = null, address = null, contact_person = null, country = null, website = null } = req.body;
  const info = db
    .prepare(
      `INSERT INTO suppliers (name, contact_email, phone, address, contact_person, country, website)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(name, contact_email, phone, address, contact_person, country, website);
  const created = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ data: created });
});

const update = asyncHandler(async (req, res) => {
  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
  if (!supplier) throw ApiError.notFound('Supplier not found.');

  const name = req.body.name !== undefined ? req.body.name : supplier.name;
  const contact_email = req.body.contact_email !== undefined ? req.body.contact_email : supplier.contact_email;
  const phone = req.body.phone !== undefined ? req.body.phone : supplier.phone;
  const address = req.body.address !== undefined ? req.body.address : supplier.address;
  const contact_person = req.body.contact_person !== undefined ? req.body.contact_person : supplier.contact_person;
  const country = req.body.country !== undefined ? req.body.country : supplier.country;
  const website = req.body.website !== undefined ? req.body.website : supplier.website;

  db.prepare(
    `UPDATE suppliers
     SET name = ?, contact_email = ?, phone = ?, address = ?, contact_person = ?, country = ?, website = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(name, contact_email, phone, address, contact_person, country, website, supplier.id);

  const updated = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(supplier.id);
  res.json({ data: updated });
});

const remove = asyncHandler(async (req, res) => {
  const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(req.params.id);
  if (!supplier) throw ApiError.notFound('Supplier not found.');

  const productCount = db.prepare('SELECT COUNT(*) AS count FROM products WHERE supplier_id = ?').get(supplier.id).count;
  if (productCount > 0) {
    throw ApiError.conflict(
      `Cannot delete supplier "${supplier.name}" because it still has ${productCount} associated product(s). Reassign or delete those products first.`,
      { productCount }
    );
  }

  db.prepare('DELETE FROM suppliers WHERE id = ?').run(supplier.id);
  res.status(204).send();
});

// "Deliveries" = IN stock movements against this supplier's products — there's
// no separate shipments/purchase-orders concept in the schema, so this is the
// real, honest signal available for "recent deliveries" and delivery frequency.
const deliveries = asyncHandler(async (req, res) => {
  const supplier = db.prepare('SELECT id FROM suppliers WHERE id = ?').get(req.params.id);
  if (!supplier) throw ApiError.notFound('Supplier not found.');

  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

  const rows = db
    .prepare(
      `SELECT sm.id, sm.product_id, sm.quantity, sm.reason, sm.created_at, p.name AS product_name, p.sku
       FROM stock_movements sm
       JOIN products p ON p.id = sm.product_id
       WHERE p.supplier_id = ? AND sm.type = 'IN'
       ORDER BY sm.created_at DESC, sm.id DESC
       LIMIT ?`
    )
    .all(supplier.id, limit);

  const agg = db
    .prepare(
      `SELECT COUNT(*) AS total_deliveries, MAX(sm.created_at) AS last_delivery_at
       FROM stock_movements sm
       JOIN products p ON p.id = sm.product_id
       WHERE p.supplier_id = ? AND sm.type = 'IN'`
    )
    .get(supplier.id);

  res.json({
    data: {
      deliveries: rows,
      totalDeliveries: agg.total_deliveries,
      lastDeliveryAt: agg.last_delivery_at,
    },
  });
});

module.exports = { list, getOne, create, update, remove, deliveries };
