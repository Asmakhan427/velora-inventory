const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const JWT_SECRET = process.env.JWT_SECRET || 'deimos-dev-secret-change-me';

// Authentication is optional-by-default in this assessment build: the API remains
// usable without logging in (per FAQ, auth is a stretch goal), but when a valid
// token IS supplied, req.user is populated so role checks can apply.
function attachUserIfPresent(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Invalid/expired token: proceed as anonymous rather than hard-failing,
      // so the demo app degrades gracefully instead of locking out.
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
    next();
  };
}

module.exports = { attachUserIfPresent, requireAuth, requireRole, JWT_SECRET };
