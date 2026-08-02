const ApiError = require('../utils/ApiError');

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist.`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // SQLite constraint violations that slip through validation (defensive fallback).
  if (err && err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'A record with this unique value already exists.' },
    });
  }
  if (err && err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'This action violates a referential integrity constraint.' },
    });
  }
  if (err && (err.code === 'SQLITE_CONSTRAINT_CHECK' || err.code === 'SQLITE_CONSTRAINT')) {
    return res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'The request violates a data constraint (e.g. negative quantity or price).' },
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred. Please try again.' },
  });
}

module.exports = { notFoundHandler, errorHandler };
