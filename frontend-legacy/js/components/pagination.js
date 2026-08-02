import { icon } from '../icons.js';

export function renderPagination(meta, onPageChange) {
  if (!meta) return '';
  const { page, totalPages, total, pageSize } = meta;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages = [];
  const span = 1;
  for (let p = 1; p <= totalPages; p += 1) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= span) pages.push(p);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  const pageBtns = pages
    .map((p) =>
      p === '…'
        ? '<span class="page-btn" style="background:none;border:none;cursor:default;">…</span>'
        : `<button class="page-btn ${p === page ? 'active' : ''}" data-page="${p}">${p}</button>`
    )
    .join('');

  const wrap = document.createElement('div');
  wrap.className = 'pagination';
  wrap.innerHTML = `
    <div class="pagination-info">Showing <strong>${from}</strong>–<strong>${to}</strong> of <strong>${total}</strong></div>
    <div class="pagination-controls">
      <button class="page-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>${icon('chevronLeft', 14)}</button>
      ${pageBtns}
      <button class="page-btn" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>${icon('chevronRight', 14)}</button>
    </div>
  `;
  wrap.querySelectorAll('button[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => onPageChange(Number(btn.dataset.page)));
  });
  return wrap;
}
