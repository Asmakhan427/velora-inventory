const API_BASE = window.__DEIMOS_API_BASE__ || 'http://localhost:4000/api';

class ApiClientError extends Error {
  constructor(payload, status) {
    super(payload?.error?.message || 'Request failed');
    this.code = payload?.error?.code || 'UNKNOWN';
    this.details = payload?.error?.details || null;
    this.status = status;
  }
}

function getToken() {
  return localStorage.getItem('deimos_token');
}

function setToken(token) {
  if (token) localStorage.setItem('deimos_token', token);
  else localStorage.removeItem('deimos_token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('deimos_user') || 'null');
  } catch {
    return null;
  }
}

function setUser(user) {
  if (user) localStorage.setItem('deimos_user', JSON.stringify(user));
  else localStorage.removeItem('deimos_user');
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken();
  const finalHeaders = { ...headers };
  let finalBody = body;

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers: finalHeaders, body: finalBody });
  } catch (err) {
    const netErr = new Error('Cannot reach the API server. Is the backend running on ' + API_BASE + '?');
    netErr.code = 'NETWORK_ERROR';
    netErr.isNetwork = true;
    throw netErr;
  }

  if (res.status === 204) return null;

  let payload = null;
  const text = await res.text();
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = null; }
  }

  if (!res.ok) {
    throw new ApiClientError(payload, res.status);
  }
  return payload;
}

export const api = {
  health: () => request('/health'),

  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request('/auth/me'),

  listProducts: (params) => request(`/products?${new URLSearchParams(cleanParams(params))}`),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  createStockMovement: (id, data) => request(`/products/${id}/stock-movements`, { method: 'POST', body: data }),
  listStockMovements: (id, params) => request(`/products/${id}/stock-movements?${new URLSearchParams(cleanParams(params))}`),
  exportProductsCsvUrl: (params) => `${API_BASE}/products/export/csv?${new URLSearchParams(cleanParams(params))}`,

  listCategories: (params) => request(`/categories?${new URLSearchParams(cleanParams(params))}`),
  createCategory: (data) => request('/categories', { method: 'POST', body: data }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: data }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  listSuppliers: (params) => request(`/suppliers?${new URLSearchParams(cleanParams(params))}`),
  createSupplier: (data) => request('/suppliers', { method: 'POST', body: data }),
  updateSupplier: (id, data) => request(`/suppliers/${id}`, { method: 'PUT', body: data }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),

  dashboardSummary: () => request('/dashboard/summary'),
};

function cleanParams(params = {}) {
  const out = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}

export { getToken, setToken, getUser, setUser, ApiClientError, API_BASE };
