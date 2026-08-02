const bcrypt = require('bcryptjs');
const { db, ensureSchema } = require('./connection');

ensureSchema();

// Deterministic 5-event movement history landing exactly on `targetQty`,
// spread across the last ~40 days so the dashboard's inventory trends chart
// has real, varied time-series data to plot instead of two lonely points.
// Always non-negative at every step, regardless of targetQty (incl. 0).
function buildMovementPlan(targetQty) {
  const initialReceipt = targetQty + 24;
  const events = [
    { offsetDays: 40, type: 'IN', quantity: initialReceipt, reason: 'Initial stock receipt' },
    { offsetDays: 27, type: 'OUT', quantity: 8, reason: 'Sales order fulfilment' },
    { offsetDays: 18, type: 'IN', quantity: 6, reason: 'Restock delivery' },
    { offsetDays: 9, type: 'OUT', quantity: 10, reason: 'Sales order fulfilment' },
  ];
  let balance = events.reduce((bal, e) => bal + (e.type === 'IN' ? e.quantity : -e.quantity), 0);
  const diff = targetQty - balance;
  if (diff !== 0) {
    events.push({ offsetDays: 2, type: diff > 0 ? 'IN' : 'OUT', quantity: Math.abs(diff), reason: diff > 0 ? 'Restock delivery' : 'Stock depleted by sales' });
  }
  return events;
}

const truncate = db.transaction(() => {
  db.exec(`
    DELETE FROM stock_movements;
    DELETE FROM products;
    DELETE FROM suppliers;
    DELETE FROM categories;
    DELETE FROM users;
    DELETE FROM sqlite_sequence WHERE name IN ('stock_movements','products','suppliers','categories','users');
  `);
});

const categories = [
  { name: 'Electronics', description: 'Consumer electronics, gadgets, and accessories' },
  { name: 'Office Supplies', description: 'Stationery, paper goods, and office equipment' },
  { name: 'Furniture', description: 'Desks, chairs, storage, and workplace furniture' },
];

const suppliers = [
  {
    name: 'Nova Components Ltd.',
    contact_email: 'sales@novacomponents.com',
    phone: '+1-555-0110',
    address: '221 Harbor Ave, Austin, TX',
    contact_person: 'Elena Novak',
    country: 'United States',
    website: 'https://novacomponents.com',
  },
  {
    name: 'Meridian Office Goods',
    contact_email: 'orders@meridiangoods.com',
    phone: '+1-555-0142',
    address: '89 Birchwood Rd, Columbus, OH',
    contact_person: 'James Whitfield',
    country: 'United States',
    website: 'https://meridiangoods.com',
  },
  {
    name: 'Atlas Furnishing Co.',
    contact_email: 'contact@atlasfurnishing.com',
    phone: '+1-555-0198',
    address: '14 Industrial Pkwy, Denver, CO',
    contact_person: 'Priya Anand',
    country: 'United States',
    website: 'https://atlasfurnishing.com',
  },
];

const products = [
  { name: 'Wireless Mechanical Keyboard', sku: 'ELEC-KBD-001', description: 'Hot-swappable wireless mechanical keyboard', unit_price: 89.99, quantity_in_stock: 42, category: 'Electronics', supplier: 'Nova Components Ltd.' },
  { name: '4K USB-C Monitor 27"', sku: 'ELEC-MON-002', description: '27-inch 4K IPS monitor with USB-C power delivery', unit_price: 349.0, quantity_in_stock: 15, category: 'Electronics', supplier: 'Nova Components Ltd.' },
  { name: 'Noise-Cancelling Headphones', sku: 'ELEC-HPH-003', description: 'Over-ear ANC headphones, 30h battery', unit_price: 199.5, quantity_in_stock: 8, category: 'Electronics', supplier: 'Nova Components Ltd.' },
  { name: 'USB-C Docking Station', sku: 'ELEC-DOK-004', description: '10-in-1 USB-C hub with HDMI and Ethernet', unit_price: 64.0, quantity_in_stock: 60, category: 'Electronics', supplier: 'Nova Components Ltd.' },
  { name: 'Wireless Ergonomic Mouse', sku: 'ELEC-MOU-005', description: 'Vertical ergonomic wireless mouse', unit_price: 39.99, quantity_in_stock: 0, category: 'Electronics', supplier: 'Nova Components Ltd.' },
  { name: '1080p Webcam', sku: 'ELEC-CAM-006', description: 'Full HD webcam with auto light correction', unit_price: 54.5, quantity_in_stock: 25, category: 'Electronics', supplier: 'Nova Components Ltd.' },
  { name: 'Portable SSD 1TB', sku: 'ELEC-SSD-007', description: 'USB 3.2 portable SSD, 1TB', unit_price: 109.0, quantity_in_stock: 5, category: 'Electronics', supplier: 'Nova Components Ltd.' },
  { name: 'Smart LED Desk Lamp', sku: 'ELEC-LMP-008', description: 'Dimmable LED lamp with wireless charging base', unit_price: 45.0, quantity_in_stock: 30, category: 'Electronics', supplier: 'Nova Components Ltd.' },
  { name: 'A4 Copy Paper (Case)', sku: 'OFF-PPR-001', description: '5000 sheets, 80gsm A4 copy paper', unit_price: 42.0, quantity_in_stock: 120, category: 'Office Supplies', supplier: 'Meridian Office Goods' },
  { name: 'Gel Pens (Box of 50)', sku: 'OFF-PEN-002', description: 'Assorted colour gel pens, box of 50', unit_price: 18.75, quantity_in_stock: 75, category: 'Office Supplies', supplier: 'Meridian Office Goods' },
  { name: 'Sticky Notes Pack', sku: 'OFF-STN-003', description: '12-pad pack of 3x3 sticky notes', unit_price: 9.99, quantity_in_stock: 9, category: 'Office Supplies', supplier: 'Meridian Office Goods' },
  { name: 'Heavy Duty Stapler', sku: 'OFF-STP-004', description: 'All-metal heavy-duty stapler, 50-sheet capacity', unit_price: 22.5, quantity_in_stock: 18, category: 'Office Supplies', supplier: 'Meridian Office Goods' },
  { name: 'Whiteboard Markers (Set of 12)', sku: 'OFF-MRK-005', description: 'Low-odour dry-erase markers, assorted colours', unit_price: 14.25, quantity_in_stock: 0, category: 'Office Supplies', supplier: 'Meridian Office Goods' },
  { name: 'Lever Arch Files (Pack of 10)', sku: 'OFF-FIL-006', description: 'A4 lever arch box files, pack of 10', unit_price: 33.0, quantity_in_stock: 40, category: 'Office Supplies', supplier: 'Meridian Office Goods' },
  { name: 'Ergonomic Office Chair', sku: 'FUR-CHR-001', description: 'Mesh-back ergonomic chair with lumbar support', unit_price: 259.0, quantity_in_stock: 12, category: 'Furniture', supplier: 'Atlas Furnishing Co.' },
  { name: 'Standing Desk (Electric)', sku: 'FUR-DSK-002', description: 'Height-adjustable electric standing desk', unit_price: 429.0, quantity_in_stock: 6, category: 'Furniture', supplier: 'Atlas Furnishing Co.' },
  { name: '3-Drawer Filing Cabinet', sku: 'FUR-CAB-003', description: 'Lockable steel 3-drawer filing cabinet', unit_price: 149.0, quantity_in_stock: 7, category: 'Furniture', supplier: 'Atlas Furnishing Co.' },
  { name: 'Bookshelf 5-Tier', sku: 'FUR-SHF-004', description: 'Industrial-style 5-tier bookshelf', unit_price: 119.0, quantity_in_stock: 0, category: 'Furniture', supplier: 'Atlas Furnishing Co.' },
  { name: 'Conference Table 8-Seat', sku: 'FUR-TBL-005', description: 'Oak-veneer 8-seat conference table', unit_price: 899.0, quantity_in_stock: 3, category: 'Furniture', supplier: 'Atlas Furnishing Co.' },
  { name: 'Guest Chair (Set of 2)', sku: 'FUR-CHR-006', description: 'Upholstered guest chairs, set of 2', unit_price: 189.0, quantity_in_stock: 20, category: 'Furniture', supplier: 'Atlas Furnishing Co.' },
];

const insertAll = db.transaction(() => {
  truncate();

  const insertCategory = db.prepare('INSERT INTO categories (name, description) VALUES (@name, @description)');
  const categoryIds = {};
  for (const c of categories) {
    const info = insertCategory.run(c);
    categoryIds[c.name] = info.lastInsertRowid;
  }

  const insertSupplier = db.prepare(
    `INSERT INTO suppliers (name, contact_email, phone, address, contact_person, country, website)
     VALUES (@name, @contact_email, @phone, @address, @contact_person, @country, @website)`
  );
  const supplierIds = {};
  for (const s of suppliers) {
    const info = insertSupplier.run(s);
    supplierIds[s.name] = info.lastInsertRowid;
  }

  const insertProduct = db.prepare(`
    INSERT INTO products (name, sku, description, unit_price, quantity_in_stock, category_id, supplier_id)
    VALUES (@name, @sku, @description, @unit_price, @quantity_in_stock, @category_id, @supplier_id)
  `);
  const insertMovement = db.prepare(`
    INSERT INTO stock_movements (product_id, type, quantity, reason, created_at)
    VALUES (@product_id, @type, @quantity, @reason, datetime('now', @offset))
  `);

  for (const p of products) {
    const info = insertProduct.run({
      name: p.name,
      sku: p.sku,
      description: p.description,
      unit_price: p.unit_price,
      quantity_in_stock: p.quantity_in_stock,
      category_id: categoryIds[p.category],
      supplier_id: supplierIds[p.supplier],
    });
    const productId = info.lastInsertRowid;

    // Seed a richer movement history (5 events over ~40 days, landing exactly
    // on the product's target stock level) so the running-balance view and
    // the dashboard's inventory trends chart both have real data to show.
    for (const event of buildMovementPlan(p.quantity_in_stock)) {
      insertMovement.run({
        product_id: productId,
        type: event.type,
        quantity: event.quantity,
        reason: event.reason,
        offset: `-${event.offsetDays} days`,
      });
    }
  }

  const insertUser = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (@username, @password_hash, @role)');
  insertUser.run({ username: 'admin', password_hash: bcrypt.hashSync('Admin@123', 10), role: 'ADMIN' });
  insertUser.run({ username: 'staff', password_hash: bcrypt.hashSync('Staff@123', 10), role: 'STAFF' });
});

insertAll();

console.log('Seed complete:');
console.log(`  Categories: ${categories.length}`);
console.log(`  Suppliers:  ${suppliers.length}`);
console.log(`  Products:   ${products.length}`);
console.log('  Users:      admin / Admin@123 (ADMIN), staff / Staff@123 (STAFF)');
