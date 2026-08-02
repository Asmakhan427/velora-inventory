const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'inventory.db');

// Ensure the data directory exists before opening the file.
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Columns added after the initial release. `CREATE TABLE IF NOT EXISTS` in
// schema.sql only covers brand-new databases — an existing data/inventory.db
// file needs these ALTERed in explicitly, since SQLite has no
// "ADD COLUMN IF NOT EXISTS". Safe to re-run: each column is only added if
// PRAGMA table_info doesn't already report it.
const ADDED_COLUMNS = {
  suppliers: [
    { name: 'contact_person', ddl: 'TEXT' },
    { name: 'country', ddl: 'TEXT' },
    { name: 'website', ddl: 'TEXT' },
  ],
};

function applyColumnMigrations() {
  for (const [table, columns] of Object.entries(ADDED_COLUMNS)) {
    const existing = new Set(db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name));
    for (const column of columns) {
      if (!existing.has(column.name)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column.name} ${column.ddl}`);
      }
    }
  }
}

function ensureSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
  applyColumnMigrations();
}

module.exports = { db, ensureSchema, DB_PATH };
