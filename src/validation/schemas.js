const {
  required,
  isString,
  maxLength,
  isNonNegativeNumber,
  isNonNegativeInteger,
  isPositiveInteger,
  isEmail,
  isOneOf,
  isPositiveIntegerRef,
  isUrl,
} = require('./rules');

const categoryCreateSchema = {
  name: [required('Name'), isString('Name'), maxLength('Name', 120)],
  description: [isString('Description'), maxLength('Description', 500)],
};

const categoryUpdateSchema = {
  name: [isString('Name'), maxLength('Name', 120)],
  description: [isString('Description'), maxLength('Description', 500)],
};

const supplierCreateSchema = {
  name: [required('Name'), isString('Name'), maxLength('Name', 150)],
  contact_email: [required('Contact email'), isEmail('Contact email')],
  phone: [isString('Phone'), maxLength('Phone', 40)],
  address: [isString('Address'), maxLength('Address', 300)],
  contact_person: [isString('Contact person'), maxLength('Contact person', 150)],
  country: [isString('Country'), maxLength('Country', 100)],
  website: [isString('Website'), maxLength('Website', 200), isUrl('Website')],
};

const supplierUpdateSchema = {
  name: [isString('Name'), maxLength('Name', 150)],
  contact_email: [isEmail('Contact email')],
  phone: [isString('Phone'), maxLength('Phone', 40)],
  address: [isString('Address'), maxLength('Address', 300)],
  contact_person: [isString('Contact person'), maxLength('Contact person', 150)],
  country: [isString('Country'), maxLength('Country', 100)],
  website: [isString('Website'), maxLength('Website', 200), isUrl('Website')],
};

const productCreateSchema = {
  name: [required('Name'), isString('Name'), maxLength('Name', 150)],
  sku: [required('SKU'), isString('SKU'), maxLength('SKU', 60)],
  description: [isString('Description'), maxLength('Description', 1000)],
  unit_price: [required('Unit price'), isNonNegativeNumber('Unit price')],
  quantity_in_stock: [isNonNegativeInteger('Quantity in stock')],
  category_id: [required('Category'), isPositiveIntegerRef('Category')],
  supplier_id: [required('Supplier'), isPositiveIntegerRef('Supplier')],
};

const productUpdateSchema = {
  name: [isString('Name'), maxLength('Name', 150)],
  sku: [isString('SKU'), maxLength('SKU', 60)],
  description: [isString('Description'), maxLength('Description', 1000)],
  unit_price: [isNonNegativeNumber('Unit price')],
  category_id: [isPositiveIntegerRef('Category')],
  supplier_id: [isPositiveIntegerRef('Supplier')],
};

const stockMovementSchema = {
  type: [required('Type'), isOneOf('Type', ['IN', 'OUT'])],
  quantity: [required('Quantity'), isPositiveInteger('Quantity')],
  reason: [isString('Reason'), maxLength('Reason', 300)],
};

module.exports = {
  categoryCreateSchema,
  categoryUpdateSchema,
  supplierCreateSchema,
  supplierUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  stockMovementSchema,
};
