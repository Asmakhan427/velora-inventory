require('./setup');
const request = require('supertest');
const bcrypt = require('bcryptjs');

const { ensureSchema, db } = require('../db/connection');
const app = require('../app');

ensureSchema();

function seedMinimal() {
  db.exec('DELETE FROM stock_movements; DELETE FROM products; DELETE FROM suppliers; DELETE FROM categories; DELETE FROM users;');
  const cat = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)').run('Electronics', 'desc');
  const sup = db
    .prepare('INSERT INTO suppliers (name, contact_email, phone, address) VALUES (?, ?, ?, ?)')
    .run('Acme Supplies', 'acme@example.com', '123', 'Somewhere');
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(
    'admin',
    bcrypt.hashSync('Admin@123', 4),
    'ADMIN'
  );
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(
    'staff',
    bcrypt.hashSync('Staff@123', 4),
    'STAFF'
  );
  return { categoryId: cat.lastInsertRowid, supplierId: sup.lastInsertRowid };
}

let categoryId;
let supplierId;
let adminToken;
let staffToken;

beforeEach(async () => {
  const ids = seedMinimal();
  categoryId = ids.categoryId;
  supplierId = ids.supplierId;

  const adminLogin = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Admin@123' });
  adminToken = adminLogin.body.data.token;
  const staffLogin = await request(app).post('/api/auth/login').send({ username: 'staff', password: 'Staff@123' });
  staffToken = staffLogin.body.data.token;
});

// Products/categories/suppliers create/update, and stock-movement recording,
// are ADMIN-only (Staff is read-only on inventory; Guest can't reach these at
// all from the UI) — every mutating request below authenticates as admin.
function asAdmin(req) {
  return req.set('Authorization', `Bearer ${adminToken}`);
}

describe('Products CRUD & business rules', () => {
  test('creates a product with valid data', async () => {
    const res = await asAdmin(request(app).post('/api/products')).send({
      name: 'Test Widget',
      sku: 'TW-001',
      unit_price: 19.99,
      quantity_in_stock: 5,
      category_id: categoryId,
      supplier_id: supplierId,
    });
    expect(res.status).toBe(201);
    expect(res.body.data.sku).toBe('TW-001');
  });

  test('rejects duplicate SKU with 409', async () => {
    await asAdmin(request(app).post('/api/products')).send({
      name: 'A', sku: 'DUP-1', unit_price: 1, category_id: categoryId, supplier_id: supplierId,
    });
    const res = await asAdmin(request(app).post('/api/products')).send({
      name: 'B', sku: 'DUP-1', unit_price: 2, category_id: categoryId, supplier_id: supplierId,
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  test('rejects negative unit_price with 422', async () => {
    const res = await asAdmin(request(app).post('/api/products')).send({
      name: 'Neg', sku: 'NEG-1', unit_price: -5, category_id: categoryId, supplier_id: supplierId,
    });
    expect(res.status).toBe(422);
  });

  test('rejects missing required fields with 422', async () => {
    const res = await asAdmin(request(app).post('/api/products')).send({ name: 'Incomplete' });
    expect(res.status).toBe(422);
    expect(res.body.error.details).toHaveProperty('sku');
  });

  test('404s for a non-existent product', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.status).toBe(404);
  });

  test('stock movement IN increases quantity atomically', async () => {
    const create = await asAdmin(request(app).post('/api/products')).send({
      name: 'Stocked', sku: 'ST-1', unit_price: 5, quantity_in_stock: 10, category_id: categoryId, supplier_id: supplierId,
    });
    const id = create.body.data.id;
    const res = await asAdmin(request(app).post(`/api/products/${id}/stock-movements`)).send({ type: 'IN', quantity: 5, reason: 'restock' });
    expect(res.status).toBe(201);
    expect(res.body.data.newQuantity).toBe(15);
  });

  test('stock movement OUT larger than stock is rejected', async () => {
    const create = await asAdmin(request(app).post('/api/products')).send({
      name: 'Low', sku: 'LOW-1', unit_price: 5, quantity_in_stock: 2, category_id: categoryId, supplier_id: supplierId,
    });
    const id = create.body.data.id;
    const res = await asAdmin(request(app).post(`/api/products/${id}/stock-movements`)).send({ type: 'OUT', quantity: 10, reason: 'sale' });
    expect(res.status).toBe(400);
  });

  test('quantity_in_stock never goes negative after OUT', async () => {
    const create = await asAdmin(request(app).post('/api/products')).send({
      name: 'Exact', sku: 'EX-1', unit_price: 5, quantity_in_stock: 3, category_id: categoryId, supplier_id: supplierId,
    });
    const id = create.body.data.id;
    const res = await asAdmin(request(app).post(`/api/products/${id}/stock-movements`)).send({ type: 'OUT', quantity: 3, reason: 'sale' });
    expect(res.status).toBe(201);
    expect(res.body.data.newQuantity).toBe(0);
  });

  test('search and pagination work together', async () => {
    for (let i = 0; i < 15; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await asAdmin(request(app).post('/api/products')).send({
        name: `Gadget ${i}`, sku: `GD-${i}`, unit_price: 1, category_id: categoryId, supplier_id: supplierId,
      });
    }
    const res = await request(app).get('/api/products?search=Gadget&page=2&pageSize=5');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.meta.total).toBe(15);
    expect(res.body.meta.page).toBe(2);
  });

  test('filters by stock status', async () => {
    await asAdmin(request(app).post('/api/products')).send({
      name: 'OutOfStock', sku: 'OOS-1', unit_price: 1, quantity_in_stock: 0, category_id: categoryId, supplier_id: supplierId,
    });
    const res = await request(app).get('/api/products?status=out_of_stock');
    expect(res.status).toBe(200);
    expect(res.body.data.every((p) => p.quantity_in_stock === 0)).toBe(true);
  });
});

describe('Categories & Suppliers referential integrity', () => {
  test('rejects invalid contact_email on supplier creation', async () => {
    const res = await asAdmin(request(app).post('/api/suppliers')).send({ name: 'X', contact_email: 'invalid' });
    expect(res.status).toBe(422);
  });

  test('prevents deleting a category that still has products (as ADMIN)', async () => {
    await asAdmin(request(app).post('/api/products')).send({
      name: 'Linked', sku: 'LINK-1', unit_price: 1, category_id: categoryId, supplier_id: supplierId,
    });
    const res = await asAdmin(request(app).delete(`/api/categories/${categoryId}`));
    expect(res.status).toBe(409);
  });

  test('allows deleting an unused category (as ADMIN)', async () => {
    const cat = await asAdmin(request(app).post('/api/categories')).send({ name: 'Unused Category' });
    const res = await asAdmin(request(app).delete(`/api/categories/${cat.body.data.id}`));
    expect(res.status).toBe(204);
  });

  test('category list includes stock_value and low_stock_count aggregates', async () => {
    await asAdmin(request(app).post('/api/products')).send({
      name: 'Aggregated', sku: 'AGG-1', unit_price: 10, quantity_in_stock: 5, category_id: categoryId, supplier_id: supplierId,
    });
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    const cat = res.body.data.find((c) => c.id === categoryId);
    expect(cat).toHaveProperty('stock_value');
    expect(cat).toHaveProperty('low_stock_count');
    expect(cat.stock_value).toBeGreaterThanOrEqual(50);
    expect(cat.low_stock_count).toBeGreaterThanOrEqual(1);
  });

  test('supplier deliveries endpoint returns recent IN movements and totals', async () => {
    const create = await asAdmin(request(app).post('/api/products')).send({
      name: 'Delivered', sku: 'DLV-1', unit_price: 5, quantity_in_stock: 0, category_id: categoryId, supplier_id: supplierId,
    });
    await asAdmin(request(app).post(`/api/products/${create.body.data.id}/stock-movements`)).send({ type: 'IN', quantity: 20, reason: 'restock' });

    const res = await request(app).get(`/api/suppliers/${supplierId}/deliveries`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalDeliveries).toBeGreaterThanOrEqual(1);
    expect(res.body.data.deliveries.every((d) => d.quantity > 0)).toBe(true);
  });

  test('supplier accepts contact_person, country, and website fields', async () => {
    const res = await asAdmin(request(app).post('/api/suppliers')).send({
      name: 'Full Supplier', contact_email: 'full@example.com', contact_person: 'Jane Doe', country: 'Canada', website: 'https://example.com',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.contact_person).toBe('Jane Doe');
    expect(res.body.data.country).toBe('Canada');
    expect(res.body.data.website).toBe('https://example.com');
  });
});

describe('Dashboard', () => {
  test('summary includes bySupplier breakdown', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.bySupplier)).toBe(true);
  });

  test('trends endpoint returns daily points within the requested range', async () => {
    const res = await request(app).get('/api/dashboard/trends?days=7');
    expect(res.status).toBe(200);
    expect(res.body.data.days).toBe(7);
    expect(Array.isArray(res.body.data.points)).toBe(true);
  });
});

describe('Authentication & role-based authorization', () => {
  test('rejects invalid login credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('STAFF role cannot create a product (403)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ name: 'Staff Product', sku: 'STF-1', unit_price: 1, category_id: categoryId, supplier_id: supplierId });
    expect(res.status).toBe(403);
  });

  test('unauthenticated create request is rejected (401)', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Anon Product', sku: 'ANON-1', unit_price: 1, category_id: categoryId, supplier_id: supplierId });
    expect(res.status).toBe(401);
  });

  test('STAFF role cannot delete a category (403)', async () => {
    const cat = await asAdmin(request(app).post('/api/categories')).send({ name: 'Staff Test Category' });
    const res = await request(app)
      .delete(`/api/categories/${cat.body.data.id}`)
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(403);
  });

  test('unauthenticated delete request is rejected (401)', async () => {
    const cat = await asAdmin(request(app).post('/api/categories')).send({ name: 'Anon Test Category' });
    const res = await request(app).delete(`/api/categories/${cat.body.data.id}`);
    expect(res.status).toBe(401);
  });
});
