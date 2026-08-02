const path = require('path');
const fs = require('fs');

const TEST_DB_PATH = path.join(__dirname, 'test.db');
process.env.DB_PATH = TEST_DB_PATH;
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// Clean slate before every test file that requires this setup.
for (const ext of ['', '-wal', '-shm']) {
  const p = TEST_DB_PATH + ext;
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

module.exports = { TEST_DB_PATH };
