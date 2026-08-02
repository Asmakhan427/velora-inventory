import { api, ApiClientError } from '../api.js';
import { authState } from '../state.js';
import { debounce, formatDate } from '../utils.js';
import { icon } from '../icons.js';
import { tableSkeleton } from '../components/skeleton.js';
import { renderPagination } from '../components/pagination.js';
import { openModal, confirmDialog } from '../components/modal.js';
import { toastSuccess, toastError } from '../components/toast.js';

let state = { page: 1, pageSize: 10, search: '' };

export async function renderSuppliers(root) {
  document.getElementById('page-title').textContent = 'Suppliers';
  document.getElementById('page-subtitle').textContent = 'Manage vendor contacts and relationships';
  state = { page: 1, pageSize: 10, search: '' };

  root.innerHTML = `
    <div class="toolbar">
      <div class="search-input-wrap">
        <span class="nav-icon">${icon('search', 16)}</span>
        <input class="input" id="sup-search" placeholder="Search suppliers…" />
      </div>
      <div class="spacer"></div>
      <button class="btn btn-primary" id="sup-add-btn">${icon('plus', 16)} Add Supplier</button>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Name</th><th>Contact Email</th><th>Phone</th><th>Products</th><th>Created</th><th></th></tr></thead>
        <tbody id="sup-tbody">${tableSkeleton(6, 5)}</tbody>
      </table>
    </div>
    <div id="sup-pagination"></div>
  `;

  root.querySelector('#sup-search').addEventListener(
    'input',
    debounce((e) => {
      state.search = e.target.value;
      state.page = 1;
      loadSuppliers();
    }, 350)
  );
  root.querySelector('#sup-add-btn').addEventListener('click', () => openSupplierForm());

  await loadSuppliers();
}

async function loadSuppliers() {
  const tbody = document.getElementById('sup-tbody');
  if (!tbody) return;
  tbody.innerHTML = tableSkeleton(6, 5);

  try {
    const { data, meta } = await api.listSuppliers({ search: state.search, page: state.page, pageSize: state.pageSize });
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">
        <div class="empty-icon">${icon('truck', 22)}</div>
        <div class="empty-title">No suppliers found</div>
        <div class="empty-sub">${state.search ? 'Try a different search term.' : 'Add your first supplier to get started.'}</div>
      </div></td></tr>`;
    } else {
      tbody.innerHTML = data
        .map(
          (s) => `
        <tr>
          <td><strong>${escape(s.name)}</strong><div class="cell-muted" style="font-size:12px;">${escape(s.address || '')}</div></td>
          <td class="cell-mono">${escape(s.contact_email)}</td>
          <td class="cell-muted">${escape(s.phone) || '—'}</td>
          <td><span class="badge badge-neutral">${s.product_count}</span></td>
          <td class="cell-muted">${formatDate(s.created_at)}</td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" data-edit="${s.id}" aria-label="Edit">${icon('edit', 15)}</button>
              <button class="icon-btn" data-delete="${s.id}" aria-label="Delete">${icon('trash', 15)}</button>
            </div>
          </td>
        </tr>`
        )
        .join('');

      tbody.querySelectorAll('[data-edit]').forEach((btn) =>
        btn.addEventListener('click', () => openSupplierForm(data.find((s) => s.id === Number(btn.dataset.edit))))
      );
      tbody.querySelectorAll('[data-delete]').forEach((btn) =>
        btn.addEventListener('click', () => handleDelete(data.find((s) => s.id === Number(btn.dataset.delete))))
      );
    }

    const paginationEl = document.getElementById('sup-pagination');
    paginationEl.innerHTML = '';
    paginationEl.appendChild(renderPagination(meta, (p) => { state.page = p; loadSuppliers(); }));
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">
      <div class="empty-icon">${icon('alertTriangle', 22)}</div>
      <div class="empty-title">Failed to load suppliers</div>
      <div class="empty-sub">${escape(err.message)}</div>
    </div></td></tr>`;
  }
}

function escape(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function openSupplierForm(supplier = null) {
  const isEdit = Boolean(supplier);
  const { close } = openModal({
    title: isEdit ? 'Edit Supplier' : 'Add Supplier',
    bodyHtml: `
      <form id="sup-form">
        <div class="form-grid">
          <div class="field full">
            <label>Name</label>
            <input class="input" id="sup-name" value="${isEdit ? escape(supplier.name) : ''}" />
            <div class="field-error" id="err-name"></div>
          </div>
          <div class="field">
            <label>Contact Email</label>
            <input class="input" id="sup-email" value="${isEdit ? escape(supplier.contact_email) : ''}" />
            <div class="field-error" id="err-contact_email"></div>
          </div>
          <div class="field">
            <label>Phone</label>
            <input class="input" id="sup-phone" value="${isEdit ? escape(supplier.phone || '') : ''}" />
            <div class="field-error" id="err-phone"></div>
          </div>
          <div class="field full">
            <label>Address</label>
            <textarea class="input" id="sup-address" rows="2">${isEdit ? escape(supplier.address || '') : ''}</textarea>
            <div class="field-error" id="err-address"></div>
          </div>
        </div>
      </form>
    `,
    footerHtml: `
      <button class="btn btn-ghost" data-action="cancel">Cancel</button>
      <button class="btn btn-primary" data-action="save">${isEdit ? 'Save changes' : 'Create supplier'}</button>
    `,
    onMount: (overlay) => {
      overlay.querySelector('[data-action="cancel"]').addEventListener('click', close);
      overlay.querySelector('[data-action="save"]').addEventListener('click', async () => {
        const saveBtn = overlay.querySelector('[data-action="save"]');
        const payload = {
          name: overlay.querySelector('#sup-name').value.trim(),
          contact_email: overlay.querySelector('#sup-email').value.trim(),
          phone: overlay.querySelector('#sup-phone').value.trim(),
          address: overlay.querySelector('#sup-address').value.trim(),
        };
        overlay.querySelectorAll('.field-error').forEach((n) => (n.textContent = ''));
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner"></span>';
        try {
          if (isEdit) await api.updateSupplier(supplier.id, payload);
          else await api.createSupplier(payload);
          toastSuccess(`Supplier ${isEdit ? 'updated' : 'created'} successfully.`);
          close();
          loadSuppliers();
        } catch (err) {
          saveBtn.disabled = false;
          saveBtn.textContent = isEdit ? 'Save changes' : 'Create supplier';
          if (err instanceof ApiClientError && err.details) {
            Object.entries(err.details).forEach(([field, msg]) => {
              const target = overlay.querySelector(`#err-${field}`);
              if (target) target.textContent = msg;
            });
          } else {
            toastError(err.message);
          }
        }
      });
    },
  });
}

async function handleDelete(supplier) {
  if (!authState.isAdmin) {
    toastError('Sign in as an Admin to delete suppliers.');
    return;
  }
  const ok = await confirmDialog({
    title: 'Delete supplier?',
    message: `This will permanently delete <strong>${escape(supplier.name)}</strong>. Suppliers with existing products cannot be deleted.`,
    confirmLabel: 'Delete',
  });
  if (!ok) return;

  try {
    await api.deleteSupplier(supplier.id);
    toastSuccess('Supplier deleted.');
    loadSuppliers();
  } catch (err) {
    toastError(err.message);
  }
}
