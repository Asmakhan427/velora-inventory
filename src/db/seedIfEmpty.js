const { ensureSchema, db } = require('./connection');

ensureSchema();

const count = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
if (count > 0) {
  console.log(`Database already has ${count} product(s) — skipping seed.`);
  process.exit(0);
}

// Defer to the full seed script.
require('./seed');
