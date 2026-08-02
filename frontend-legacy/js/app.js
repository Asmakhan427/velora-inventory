import { api } from './api.js';
import { authState } from './state.js';
import { icon } from './icons.js';
import { registerRoute, initRouter, handleRouteChange } from './router.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderProducts } from './pages/products.js';
import { renderCategories } from './pages/categories.js';
import { renderSuppliers } from './pages/suppliers.js';
import { openLoginModal, handleLogout } from './pages/authModal.js';

// Hydrate nav icons (kept as separate module for icon reuse/tree-shaking clarity)
document.querySelectorAll('.nav-icon[data-icon]').forEach((span) => {
  span.innerHTML = icon(span.dataset.icon, 18);
});
document.querySelector('#mobile-nav-toggle span[data-icon]').innerHTML = icon('menu', 20);

registerRoute('dashboard', renderDashboard);
registerRoute('products', renderProducts);
registerRoute('categories', renderCategories);
registerRoute('suppliers', renderSuppliers);

function updateUserChip() {
  const chip = document.getElementById('user-chip');
  const authBtn = document.getElementById('auth-btn');
  const user = authState.user;

  if (user) {
    chip.querySelector('.user-avatar').textContent = user.username.slice(0, 2).toUpperCase();
    chip.querySelector('.user-name').textContent = user.username;
    chip.querySelector('.user-role').textContent = user.role === 'ADMIN' ? 'Administrator' : 'Staff member';
    authBtn.textContent = 'Sign out';
  } else {
    chip.querySelector('.user-avatar').textContent = '?';
    chip.querySelector('.user-name').textContent = 'Guest';
    chip.querySelector('.user-role').textContent = 'Not signed in';
    authBtn.textContent = 'Sign in';
  }
}

document.getElementById('auth-btn').addEventListener('click', () => {
  if (authState.isAuthenticated) {
    handleLogout();
  } else {
    openLoginModal();
  }
});

authState.subscribe(updateUserChip);
updateUserChip();

// Mobile nav toggle
document.getElementById('mobile-nav-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Connection status indicator
async function checkConnection() {
  const pill = document.getElementById('connection-pill');
  const text = document.getElementById('connection-text');
  try {
    await api.health();
    pill.classList.remove('offline');
    text.textContent = 'API connected';
  } catch {
    pill.classList.add('offline');
    text.textContent = 'API unreachable';
  }
}
checkConnection();
setInterval(checkConnection, 20000);

initRouter();
handleRouteChange();
