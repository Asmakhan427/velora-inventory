const ApiError = require('../utils/ApiError');

/**
 * Minimal, dependency-light rule-based validator.
 * Each field maps to an array of rule functions: (value, body) => string | null
 * A returned string is treated as an error message; null/undefined means the rule passed.
 */
function runValidation(schema, payload) {
  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = payload[field];
    for (const rule of rules) {
      const message = rule(value, payload);
      if (message) {
        errors[field] = message;
        break; // stop at first failing rule per field
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.validation(errors);
  }
}

function validateBody(schema) {
  return (req, res, next) => {
    try {
      runValidation(schema, req.body || {});
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { runValidation, validateBody };
