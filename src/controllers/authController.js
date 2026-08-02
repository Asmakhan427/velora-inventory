const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../db/connection');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_SECRET } = require('../middleware/auth');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    throw ApiError.badRequest('Username and password are required.');
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid username or password.');
  }

  const token = jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    data: {
      token,
      user: { id: user.id, username: user.username, role: user.role },
    },
  });
});

const me = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  res.json({ data: req.user });
});

module.exports = { login, me };
