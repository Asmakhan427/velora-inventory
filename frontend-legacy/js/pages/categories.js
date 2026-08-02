import { api, ApiClientError } from '../api.js';
import { authState } from '../state.js';
import { debounce, formatDate } from '../utils.js';
import { icon } from '../icons.js';
import { tableSkeleton } from '../components/skeleton.js';
import { renderPagination } from '../components/pagination.js';
import { openModal, confirmDialog } from '../components/modal.js';
import { toastSuccess, toastError } from '../components/toast.js';

let state = { page: 1, pageSize: 10, search: '' };

export async function renderCategories(root) {
  document.getElementById('page-title').textContent = 'Categories';
  document.getElementById('page-subtitle').textContent = 'Organize products into logical groupings';
  state = { page: 1, pageSize: 10, search: '' };

  root.innerHTML = `
    <div class="toolbar">
      <div class="search-input-wrap">
        <span class="nav-icon">${icon('search', 16)}</span>
        <input class="input" id="cat-search" placeholder="Search categories…" />
      </div>
      <div class="spacer"></div>
      <button class="btn btn-primary" id="cat-add-btn">${icon('plus', 16)} Add Category</button>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Name</th><th>Description</th><th>Products</th><th>Created</th><th></th></tr></thead>
        <tbody id="cat-tbody">${tableSkeleton(5, 5)}</tbody>
      </table>
    </div>
    <div id="cat-pagination"></div>
  `;

  const search = root.querySelector('#cat-search');
  search.addEventListener(
    'input',
    debounce((e) => {
      state.search = e.target.value;
      state.page = 1;
      loadCategories();
    }, 350)
  );
  root.querySelector('#cat-add-btn').addEventListener('click', () => openCategoryForm());

  await loadCategories();
}

async function loadCategories() {
  const tbody = document.getElementById('cat-tbody');
  if (!tbody) return;
  tbody.innerHTML = tableSkeleton(5, 5);

  try {
    const { data, meta } = await api.listCategories({ search: state.search, page: state.page, pageSize: state.pageSize });
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5">
        <div class="empty-state">
          <div class="empty-icon">${icon('tag', 22)}</div>
          <div class="empty-title">No categories found</div>
          <div class="empty-sub">${state.search ? 'Try a different search term.' : 'Add your first category to get started.'}</div>
        </div>
      </td></tr>`;
    } else {
      tbody.innerHTML = data
        .map(
          (c) => `
        <tr>
          <td><strong>${escape(c.name)}</strong></td>
          <td class="cell-muted">${escape(c.description) || '—'}</td>
          <td><span class="badge badge-neutral">${c.product_count}</span></td>
          <td class="cell-muted">${formatDate(c.created_at)}</td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" data-edit="${c.id}" aria-label="Edit">${icon('edit', 15)}</button>
              <button class="icon-btn" data-delete="${c.id}" aria-label="Delete">${icon('trash', 15)}</button>
            </div>
          </td>
        </tr>`
        )
        .join('');

      tbody.querySelectorAll('[data-edit]').forEach((btn) =>
        btn.addEventListener('click', () => {
          const cat = data.find((c) => c.id === Number(btn.dataset.edit));
          openCategoryForm(cat);
        })
      );
      tbody.querySelectorAll('[data-delete]').forEach((btn) =>
        btn.addEventListener('click', () => {
          const cat = data.find((c) => c.id === Number(btn.dataset.delete));
          handleDelete(cat);
        })
      );
    }

    const paginationEl = document.getElementById('cat-pagination');
    paginationEl.innerHTML = '';
    paginationEl.appendChild(
      renderPagination(meta, (p) => {
        state.page = p;
        loadCategories();
      })
    );
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">
      <div class="empty-icon">${icon('alertTriangle', 22)}</div>
      <div class="empty-title">Failed to load categories</div>
      <div class="empty-sub">${escape(err.message)}</div>
    </div></td></tr>`;
  }
}

function escape(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function openCategoryForm(category = null) {
  const isEdit = Boolean(category);
  const { close } = openModal({
    title: isEdit ? 'Edit Category' : 'Add Category',
    bodyHtml: `
      <form id="cat-form">
        <div class="field">
          <label for="cat-name">Name</label>
          <input class="input" id="cat-name" name="name" value="${isEdit ? escape(category.name) : ''}" />
          <div class="field-error" id="err-name"></div>
        </div>
        <div class="field mt-16">
          <label for="cat-desc">Description</label>
          <textarea class="input" id="cat-desc" name="description" rows="3">${isEdit ? escape(category.description || '') : ''}</textarea>
          <div class="field-error" id="err-description"></div>
        </div>
      </form>
    `,
    footerHtml: `
      <button class="btn btn-ghost" data-action="cancel">Cancel</button>
      <button class="btn btn-primary" data-action="save">${isEdit ? 'Save changes' : 'Create category'}</button>
    `,
    onMount: (overlay) => {
      overlay.querySelector('[data-action="cancel"]').addEventListener('click', close);
      overlay.querySelector('[data-action="save"]').addEventListener('click', async () => {
        const saveBtn = overlay.querySelector('[data-action="save"]');
        const payload = {
          name: overlay.querySelector('#cat-name').value.trim(),
          description: overlay.querySelector('#cat-desc').value.trim(),
        };
        overlay.querySelectorAll('.field-error').forEach((n) => (n.textContent = ''));
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner"></span>';
        try {
          if (isEdit) await api.updateCategory(category.id, payload);
          else await api.createCategory(payload);
          toastSuccess(`Category ${isEdit ? 'updated' : 'created'} successfully.`);
          close();
          loadCategories();
        } catch (err) {
          saveBtn.disabled = false;
          saveBtn.textContent = isEdit ? 'Save changes' : 'Create category';
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

async function handleDelete(category) {
  if (!authState.isAdmin) {
    toastError('Sign in as an Admin to delete categories.');
    return;
  }
  const ok = await confirmDialog({
    title: 'Delete category?',
    message: `This will permanently delete <strong>${escape(category.name)}</strong>. Categories with existing products cannot be deleted.`,
    confirmLabel: 'Delete',
  });
  if (!ok) return;

  try {
    await api.deleteCategory(category.id);
    toastSuccess('Category deleted.');
    loadCategories();
  } catch (err) {
    toastError(err.message);
  }
}
