import { api } from '../api.js';
import { formatCurrency, formatNumber, formatDate } from '../utils.js';
import { icon } from '../icons.js';
import { statCardSkeleton } from '../components/skeleton.js';
import { donutChart, legendFor, horizontalBars } from '../components/charts.js';

export async function renderDashboard(root) {
  document.getElementById('page-title').textContent = 'Dashboard';
  document.getElementById('page-subtitle').textContent = 'Overview of your inventory health';

  root.innerHTML = `
    <div class="stat-grid" id="stat-grid">
      ${statCardSkeleton()}${statCardSkeleton()}${statCardSkeleton()}${statCardSkeleton()}
    </div>
    <div class="dash-grid">
      <div class="card card-pad">
        <div class="section-title">Stock value by category</div>
        <div id="category-bars"><div class="skeleton skeleton-line" style="height:120px;"></div></div>
      </div>
      <div class="card card-pad">
        <div class="section-title">Stock status split</div>
        <div id="donut-wrap" class="flex items-center" style="gap:24px; flex-wrap:wrap;">
          <div class="skeleton" style="width:180px;height:180px;border-radius:50%;"></div>
        </div>
      </div>
    </div>
    <div class="card card-pad mt-24">
      <div class="section-title">Recent stock movements</div>
      <div id="recent-movements"><div class="skeleton skeleton-line" style="height:140px;"></div></div>
    </div>
  `;

  try {
    const { data } = await api.dashboardSummary();
    renderStats(data);
    renderCategoryBars(data);
    renderDonut(data);
    renderRecent(data);
  } catch (err) {
    root.innerHTML = `
      <div class="card card-pad empty-state">
        <div class="empty-icon">${icon('alertTriangle', 26)}</div>
        <div class="empty-title">Could not load dashboard</div>
        <div class="empty-sub">${err.message || 'Please check the API connection and try again.'}</div>
      </div>
    `;
  }
}

function renderStats(data) {
  const grid = document.getElementById('stat-grid');
  const stats = [
    { label: 'Total Products', value: formatNumber(data.totalProducts), icon: 'box', color: 'var(--color-primary)', soft: 'var(--color-primary-soft)' },
    { label: 'Total Stock Value', value: formatCurrency(data.totalStockValue), icon: 'dollar', color: 'var(--color-accent)', soft: 'var(--color-accent-soft)' },
    { label: 'Low Stock Items', value: formatNumber(data.lowStockCount), icon: 'alertTriangle', color: '#F59E0B', soft: 'var(--color-warning-soft)' },
    { label: 'Out of Stock', value: formatNumber(data.outOfStockCount), icon: 'package', color: 'var(--color-danger)', soft: 'var(--color-danger-soft)' },
  ];

  grid.innerHTML = stats
    .map(
      (s, i) => `
    <div class="card stat-card" style="--glow-color:${s.soft}; animation-delay:${i * 60}ms;">
      <div class="stat-top">
        <div class="stat-icon" style="background:${s.soft}; color:${s.color};">${icon(s.icon, 19)}</div>
      </div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.value}</div>
    </div>
  `
    )
    .join('');
}

function renderCategoryBars(data) {
  const el = document.getElementById('category-bars');
  if (!data.byCategory.length) {
    el.innerHTML = `<div class="empty-sub">No categories yet.</div>`;
    return;
  }
  el.innerHTML = horizontalBars(
    data.byCategory.map((c) => ({ label: c.category, value: c.stock_value })),
    formatCurrency
  );
}

function renderDonut(data) {
  const el = document.getElementById('donut-wrap');
  const inStock = data.totalProducts - data.lowStockCount - data.outOfStockCount;
  const segments = [
    { label: 'In stock', value: Math.max(inStock, 0), color: '#10B981' },
    { label: 'Low stock', value: data.lowStockCount, color: '#F59E0B' },
    { label: 'Out of stock', value: data.outOfStockCount, color: '#F43F5E' },
  ];
  el.innerHTML = `
    <div>${donutChart(segments)}</div>
    <div>${legendFor(segments)}</div>
  `;
}

function renderRecent(data) {
  const el = document.getElementById('recent-movements');
  if (!data.recentMovements.length) {
    el.innerHTML = `
      <div class="empty-state" style="padding: 32px;">
        <div class="empty-icon">${icon('history', 22)}</div>
        <div class="empty-title">No stock movements yet</div>
        <div class="empty-sub">Record an IN or OUT movement from a product's detail view.</div>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Product</th><th>SKU</th><th>Type</th><th>Qty</th><th>Reason</th><th>Date</th></tr></thead>
        <tbody>
          ${data.recentMovements
            .map(
              (m) => `
            <tr>
              <td>${m.product_name}</td>
              <td class="cell-mono">${m.sku}</td>
              <td><span class="badge ${m.type === 'IN' ? 'badge-success' : 'badge-danger'}"><span class="badge-dot"></span>${m.type}</span></td>
              <td>${m.quantity}</td>
              <td class="cell-muted">${m.reason || '—'}</td>
              <td class="cell-muted">${formatDate(m.created_at)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}
