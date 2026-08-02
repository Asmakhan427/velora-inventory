import { api, ApiClientError, API_BASE } from '../api.js';
import { authState } from '../state.js';
import { debounce, formatCurrency, formatDate } from '../utils.js';
import { icon } from '../icons.js';
import { tableSkeleton } from '../components/skeleton.js';
import { renderPagination } from '../components/pagination.js';
import { openModal, confirmDialog } from '../components/modal.js';
import { toastSuccess, toastError } from '../components/toast.js';

const LOW_STOCK_THRESHOLD = 10;

let state = {
  page: 1,
  pageSize: 10,
  search: '',
  category: '',
  supplier: '',
  status: '',
  sortBy: 'created_at',
  sortDir: 'desc',
};
let categoriesCache = [];
let suppliersCache = [];

export async function renderProducts(root) {
  document.getElementById('page-title').textContent = 'Products';
  document.getElementById('page-subtitle').textContent = 'Search, filter, and manage your full catalog';
  state = { page: 1, pageSize: 10, search: '', category: '', supplier: '', status: '', sortBy: 'created_at', sortDir: 'desc' };

  root.innerHTML = `
    <div class="toolbar">
      <div class="search-input-wrap">
        <span class="nav-icon">${icon('search', 16)}</span>
        <input class="input" id="prod-search" placeholder="Search by name or SKU…" />
      </div>
      <select class="select" id="prod-category-filter" style="max-width:180px;"><option value="">All categories</option></select>
      <select class="select" id="prod-supplier-filter" style="max-width:180px;"><option value="">All suppliers</option></select>
      <select class="select" id="prod-status-filter" style="max-width:160px;">
        <option value="">All stock status</option>
        <option value="in_stock">In stock</option>
        <option value="low_stock">Low stock (&lt; 10)</option>
        <option value="out_of_stock">Out of stock</option>
      </select>
      <div class="spacer"></div>
      <button class="btn btn-ghost" id="prod-export-btn">${icon('download', 16)} Export CSV</button>
      <button class="btn btn-primary" id="prod-add-btn">${icon('plus', 16)} Add Product</button>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th data-sort="name">Product<span class="sort-arrow"></span></th>
            <th data-sort="sku">SKU<span class="sort-arrow"></span></th>
            <th>Category</th>
            <th>Supplier</th>
            <th data-sort="unit_price">Price<span class="sort-arrow"></span></th>
            <th data-sort="quantity_in_stock">Stock<span class="sort-arrow"></span></th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="prod-tbody">${tableSkeleton(8, 6)}</tbody>
      </table>
    </div>
    <div id="prod-pagination"></div>
  `;

  await loadFilterOptions();
  wireToolbar(root);
  await loadProducts();
}

async function loadFilterOptions() {
  try {
    const [cats, sups] = await Promise.all([
      api.listCategories({ pageSize: 100 }),
      api.listSuppliers({ pageSize: 100 }),
    ]);
    categoriesCache = cats.data;
    suppliersCache = sups.data;
    const catSelect = document.getElementById('prod-category-filter');
    const supSelect = document.getElementById('prod-supplier-filter');
    if (catSelect) catSelect.innerHTML += categoriesCache.map((c) => `<option value="${c.id}">${escape(c.name)}</option>`).join('');
    if (supSelect) supSelect.innerHTML += suppliersCache.map((s) => `<option value="${s.id}">${escape(s.name)}</option>`).join('');
  } catch {
    /* filters degrade gracefully if this fails */
  }
}

function wireToolbar(root) {
  root.querySelector('#prod-search').addEventListener(
    'input',
    debounce((e) => { state.search = e.target.value; state.page = 1; loadProducts(); }, 350)
  );
  root.querySelector('#prod-category-filter').addEventListener('change', (e) => { state.category = e.target.value; state.page = 1; loadProducts(); });
  root.querySelector('#prod-supplier-filter').addEventListener('change', (e) => { state.supplier = e.target.value; state.page = 1; loadProducts(); });
  root.querySelector('#prod-status-filter').addEventListener('change', (e) => { state.status = e.target.value; state.page = 1; loadProducts(); });
  root.querySelector('#prod-add-btn').addEventListener('click', () => openProductForm());
  root.querySelector('#prod-export-btn').addEventListener('click', () => {
    const url = api.exportProductsCsvUrl({ search: state.search, category: state.category, supplier: state.supplier, status: state.status, sortBy: state.sortBy, sortDir: state.sortDir });
    window.open(url, '_blank');
  });
  root.querySelectorAll('th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (state.sortBy === col) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      else { state.sortBy = col; state.sortDir = 'asc'; }
      loadProducts();
    });
  });
}

function statusFor(qty) {
  if (qty === 0) return { label: 'Out of stock', cls: 'badge-danger' };
  if (qty < LOW_STOCK_THRESHOLD) return { label: 'Low stock', cls: 'badge-warning' };
  return { label: 'In stock', cls: 'badge-success' };
}

async function loadProducts() {
  const tbody = document.getElementById('prod-tbody');
  if (!tbody) return;
  tbody.innerHTML = tableSkeleton(8, 6);
  updateSortArrows();

  try {
    const { data, meta } = await api.listProducts(state);
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">
        <div class="empty-icon">${icon('box', 22)}</div>
        <div class="empty-title">No products found</div>
        <div class="empty-sub">Try adjusting your search or filters, or add a new product.</div>
      </div></td></tr>`;
    } else {
      tbody.innerHTML = data
        .map((p) => {
          const status = statusFor(p.quantity_in_stock);
          return `
        <tr>
          <td><strong>${escape(p.name)}</strong>${p.description ? `<div class="cell-muted" style="font-size:12px; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escape(p.description)}</div>` : ''}</td>
          <td class="cell-mono">${escape(p.sku)}</td>
          <td class="cell-muted">${escape(p.category_name) || '—'}</td>
          <td class="cell-muted">${escape(p.supplier_name) || '—'}</td>
          <td>${formatCurrency(p.unit_price)}</td>
          <td>${p.quantity_in_stock}</td>
          <td><span class="badge ${status.cls}"><span class="badge-dot"></span>${status.label}</span></td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" data-stock="${p.id}" aria-label="Manage stock" title="Manage stock">${icon('boxes', 15)}</button>
              <button class="icon-btn" data-edit="${p.id}" aria-label="Edit">${icon('edit', 15)}</button>
              <button class="icon-btn" data-delete="${p.id}" aria-label="Delete">${icon('trash', 15)}</button>
            </div>
          </td>
        </tr>`;
        })
        .join('');

      tbody.querySelectorAll('[data-edit]').forEach((btn) =>
        btn.addEventListener('click', () => openProductForm(data.find((p) => p.id === Number(btn.dataset.edit))))
      );
      tbody.querySelectorAll('[data-delete]').forEach((btn) =>
        btn.addEventListener('click', () => handleDelete(data.find((p) => p.id === Number(btn.dataset.delete))))
      );
      tbody.querySelectorAll('[data-stock]').forEach((btn) =>
        btn.addEventListener('click', () => openStockModal(data.find((p) => p.id === Number(btn.dataset.stock))))
      );
    }

    const paginationEl = document.getElementById('prod-pagination');
    paginationEl.innerHTML = '';
    paginationEl.appendChild(renderPagination(meta, (p) => { state.page = p; loadProducts(); }));
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state">
      <div class="empty-icon">${icon('alertTriangle', 22)}</div>
      <div class="empty-title">Failed to load products</div>
      <div class="empty-sub">${escape(err.message)}</div>
    </div></td></tr>`;
  }
}

function updateSortArrows() {
  document.querySelectorAll('th[data-sort]').forEach((th) => {
    const arrow = th.querySelector('.sort-arrow');
    if (th.dataset.sort === state.sortBy) arrow.textContent = state.sortDir === 'asc' ? '▲' : '▼';
    else arrow.textContent = '';
  });
}

function escape(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function categoryOptions(selectedId) {
  return categoriesCache.map((c) => `<option value="${c.id}" ${Number(selectedId) === c.id ? 'selected' : ''}>${escape(c.name)}</option>`).join('');
}
function supplierOptions(selectedId) {
  return suppliersCache.map((s) => `<option value="${s.id}" ${Number(selectedId) === s.id ? 'selected' : ''}>${escape(s.name)}</option>`).join('');
}

function openProductForm(product = null) {
  const isEdit = Boolean(product);
  const { close } = openModal({
    title: isEdit ? 'Edit Product' : 'Add Product',
    size: 'lg',
    bodyHtml: `
      <form id="prod-form">
        <div class="form-grid">
          <div class="field full">
            <label>Name</label>
            <input class="input" id="p-name" value="${isEdit ? escape(product.name) : ''}" />
            <div class="field-error" id="err-name"></div>
          </div>
          <div class="field">
            <label>SKU</label>
            <input class="input" id="p-sku" value="${isEdit ? escape(product.sku) : ''}" />
            <div class="field-error" id="err-sku"></div>
          </div>
          <div class="field">
            <label>Unit Price ($)</label>
            <input class="input" id="p-price" type="number" step="0.01" min="0" value="${isEdit ? product.unit_price : ''}" />
            <div class="field-error" id="err-unit_price"></div>
          </div>
          <div class="field">
            <label>Category</label>
            <select class="select" id="p-category"><option value="">Select category…</option>${categoryOptions(product?.category_id)}</select>
            <div class="field-error" id="err-category_id"></div>
          </div>
          <div class="field">
            <label>Supplier</label>
            <select class="select" id="p-supplier"><option value="">Select supplier…</option>${supplierOptions(product?.supplier_id)}</select>
            <div class="field-error" id="err-supplier_id"></div>
          </div>
          ${!isEdit ? `
          <div class="field">
            <label>Initial Quantity in Stock</label>
            <input class="input" id="p-qty" type="number" step="1" min="0" value="0" />
            <div class="field-error" id="err-quantity_in_stock"></div>
          </div>` : `
          <div class="field">
            <label>Current Stock</label>
            <input class="input" value="${product.quantity_in_stock}" disabled style="opacity:0.6;" />
            <div class="muted" style="font-size:11.5px;">Use "Manage stock" to adjust quantity via a movement.</div>
          </div>`}
          <div class="field full">
            <label>Description</label>
            <textarea class="input" id="p-desc" rows="3">${isEdit ? escape(product.description || '') : ''}</textarea>
            <div class="field-error" id="err-description"></div>
          </div>
        </div>
      </form>
    `,
    footerHtml: `
      <button class="btn btn-ghost" data-action="cancel">Cancel</button>
      <button class="btn btn-primary" data-action="save">${isEdit ? 'Save changes' : 'Create product'}</button>
    `,
    onMount: (overlay) => {
      overlay.querySelector('[data-action="cancel"]').addEventListener('click', close);
      overlay.querySelector('[data-action="save"]').addEventListener('click', async () => {
        const saveBtn = overlay.querySelector('[data-action="save"]');
        const payload = {
          name: overlay.querySelector('#p-name').value.trim(),
          sku: overlay.querySelector('#p-sku').value.trim(),
          description: overlay.querySelector('#p-desc').value.trim(),
          unit_price: overlay.querySelector('#p-price').value,
          category_id: overlay.querySelector('#p-category').value,
          supplier_id: overlay.querySelector('#p-supplier').value,
        };
        if (!isEdit) payload.quantity_in_stock = overlay.querySelector('#p-qty').value;

        overlay.querySelectorAll('.field-error').forEach((n) => (n.textContent = ''));
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner"></span>';
        try {
          if (isEdit) await api.updateProduct(product.id, payload);
          else await api.createProduct(payload);
          toastSuccess(`Product ${isEdit ? 'updated' : 'created'} successfully.`);
          close();
          loadProducts();
        } catch (err) {
          saveBtn.disabled = false;
          saveBtn.textContent = isEdit ? 'Save changes' : 'Create product';
          if (err instanceof ApiClientError && err.details) {
            Object.entries(err.details).forEach(([field, msg]) => {
              const target = overlay.querySelector(`#err-${field}`);
              if (target) target.textContent = typeof msg === 'string' ? msg : JSON.stringify(msg);
            });
          } else {
            toastError(err.message);
          }
        }
      });
    },
  });
}

async function handleDelete(product) {
  if (!authState.isAdmin) {
    toastError('Sign in as an Admin to delete products.');
    return;
  }
  const ok = await confirmDialog({
    title: 'Delete product?',
    message: `This will permanently delete <strong>${escape(product.name)}</strong> (${escape(product.sku)}) and all of its stock-movement history.`,
    confirmLabel: 'Delete',
  });
  if (!ok) return;

  try {
    await api.deleteProduct(product.id);
    toastSuccess('Product deleted.');
    loadProducts();
  } catch (err) {
    toastError(err.message);
  }
}

function openStockModal(product) {
  const { close, overlay } = openModal({
    title: `Manage Stock · ${escape(product.name)}`,
    size: 'lg',
    bodyHtml: `
      <div class="flex justify-between items-center" style="margin-bottom:18px;">
        <div>
          <div class="cell-muted" style="font-size:12px;">Current quantity</div>
          <div style="font-size:24px; font-weight:800;" id="stock-current-qty">${product.quantity_in_stock}</div>
        </div>
        <span class="cell-mono cell-muted">${escape(product.sku)}</span>
      </div>
      <div class="tabs">
        <div class="tab-btn active" data-tab="move">Record movement</div>
        <div class="tab-btn" data-tab="history">History &amp; balance</div>
      </div>
      <div id="tab-move">
        <div class="form-grid">
          <div class="field">
            <label>Movement type</label>
            <select class="select" id="mv-type">
              <option value="IN">Stock IN (receive)</option>
              <option value="OUT">Stock OUT (dispatch)</option>
            </select>
          </div>
          <div class="field">
            <label>Quantity</label>
            <input class="input" id="mv-qty" type="number" min="1" step="1" value="1" />
            <div class="field-error" id="err-quantity"></div>
          </div>
          <div class="field full">
            <label>Reason (optional)</label>
            <input class="input" id="mv-reason" placeholder="e.g. Purchase order #1042" />
          </div>
        </div>
        <button class="btn btn-primary mt-16" id="mv-submit">${icon('boxes', 15)} Record movement</button>
      </div>
      <div id="tab-history" style="display:none;">
        <div id="history-content"><div class="skeleton skeleton-line" style="height:120px;"></div></div>
      </div>
    `,
    onMount: (ov) => {
      ov.querySelectorAll('.tab-btn').forEach((tab) => {
        tab.addEventListener('click', () => {
          ov.querySelectorAll('.tab-btn').forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');
          const isMove = tab.dataset.tab === 'move';
          ov.querySelector('#tab-move').style.display = isMove ? 'block' : 'none';
          ov.querySelector('#tab-history').style.display = isMove ? 'none' : 'block';
          if (!isMove) loadHistory(ov, product.id);
        });
      });

      ov.querySelector('#mv-submit').addEventListener('click', async () => {
        const btn = ov.querySelector('#mv-submit');
        ov.querySelector('#err-quantity').textContent = '';
        const payload = {
          type: ov.querySelector('#mv-type').value,
          quantity: ov.querySelector('#mv-qty').value,
          reason: ov.querySelector('#mv-reason').value.trim(),
        };
        btn.disabled = true;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span>';
        try {
          const { data } = await api.createStockMovement(product.id, payload);
          ov.querySelector('#stock-current-qty').textContent = data.newQuantity;
          product.quantity_in_stock = data.newQuantity;
          toastSuccess(`Stock movement recorded. New quantity: ${data.newQuantity}.`);
          ov.querySelector('#mv-qty').value = 1;
          ov.querySelector('#mv-reason').value = '';
          loadProducts();
        } catch (err) {
          if (err instanceof ApiClientError && err.details?.field === 'quantity') {
            ov.querySelector('#err-quantity').textContent = err.message;
          } else if (err instanceof ApiClientError && err.details) {
            ov.querySelector('#err-quantity').textContent = err.details.quantity || err.message;
          } else {
            toastError(err.message);
          }
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }
      });
    },
  });
}

async function loadHistory(overlay, productId) {
  const container = overlay.querySelector('#history-content');
  container.innerHTML = '<div class="skeleton skeleton-line" style="height:120px;"></div>';
  try {
    const { data } = await api.listStockMovements(productId, { pageSize: 50 });
    if (!data.length) {
      container.innerHTML = `<div class="empty-sub">No stock movements recorded yet.</div>`;
      return;
    }
    container.innerHTML = `
      <div class="table-wrap" style="max-height:320px; overflow-y:auto;">
        <table class="data-table">
          <thead><tr><th>Date</th><th>Type</th><th>Qty</th><th>Reason</th><th>Balance</th></tr></thead>
          <tbody>
            ${data
              .map(
                (m) => `
              <tr>
                <td class="cell-muted">${formatDate(m.created_at)}</td>
                <td><span class="badge ${m.type === 'IN' ? 'badge-success' : 'badge-danger'}"><span class="badge-dot"></span>${m.type}</span></td>
                <td>${m.quantity}</td>
                <td class="cell-muted">${escape(m.reason) || '—'}</td>
                <td><strong>${m.running_balance}</strong></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="empty-sub">Failed to load history: ${escape(err.message)}</div>`;
  }
}
