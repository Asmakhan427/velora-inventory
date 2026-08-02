const validator = require('validator');

const required = (label) => (value) => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return `${label} is required.`;
  }
  return null;
};

const optionalString = () => () => null;

const isString = (label) => (value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return `${label} must be a string.`;
  return null;
};

const maxLength = (label, max) => (value) => {
  if (typeof value === 'string' && value.length > max) return `${label} must be at most ${max} characters.`;
  return null;
};

const isNonNegativeNumber = (label) => (value) => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return `${label} must be a number.`;
  if (num < 0) return `${label} cannot be negative.`;
  return null;
};

const isPositiveInteger = (label) => (value) => {
  const num = Number(value);
  if (!Number.isInteger(num)) return `${label} must be a whole number.`;
  if (num <= 0) return `${label} must be greater than zero.`;
  return null;
};

const isNonNegativeInteger = (label) => (value) => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  if (!Number.isInteger(num)) return `${label} must be a whole number.`;
  if (num < 0) return `${label} cannot be negative.`;
  return null;
};

const isEmail = (label) => (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (!validator.isEmail(String(value))) return `${label} must be a valid email address.`;
  return null;
};

const isOneOf = (label, allowed) => (value) => {
  if (value === undefined || value === null) return null;
  if (!allowed.includes(value)) return `${label} must be one of: ${allowed.join(', ')}.`;
  return null;
};

const isPositiveIntegerRef = (label) => (value) => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) return `${label} must reference a valid record id.`;
  return null;
};

const isUrl = (label) => (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (!validator.isURL(String(value), { require_protocol: false })) return `${label} must be a valid URL.`;
  return null;
};

module.exports = {
  required,
  optionalString,
  isString,
  maxLength,
  isNonNegativeNumber,
  isPositiveInteger,
  isNonNegativeInteger,
  isEmail,
  isOneOf,
  isPositiveIntegerRef,
  isUrl,
};
