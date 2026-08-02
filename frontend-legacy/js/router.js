const routes = new Map();
let currentCleanup = null;

export function registerRoute(name, renderFn) {
  routes.set(name, renderFn);
}

export function navigate(name) {
  window.location.hash = `#/${name}`;
}

export async function handleRouteChange() {
  const hash = window.location.hash.replace('#/', '') || 'dashboard';
  const [routeName] = hash.split('?');
  const renderFn = routes.get(routeName) || routes.get('dashboard');

  if (typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch { /* noop */ }
    currentCleanup = null;
  }

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.route === routeName);
  });

  const content = document.getElementById('content');
  content.classList.remove('content');
  // force reflow to restart fade-in animation
  void content.offsetWidth;
  content.classList.add('content');

  const result = await renderFn(content);
  if (typeof result === 'function') currentCleanup = result;

  // Close mobile sidebar after navigation
  document.getElementById('sidebar').classList.remove('open');
  content.focus({ preventScroll: true });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange);
}
