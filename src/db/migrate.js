const { ensureSchema, DB_PATH } = require('./connection');

ensureSchema();
console.log(`Schema applied successfully at ${DB_PATH}`);
