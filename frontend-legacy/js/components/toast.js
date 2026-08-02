import { icon } from '../icons.js';
import { el, escapeHtml } from '../utils.js';

const root = () => document.getElementById('toast-root');

const ICON_BY_TYPE = { success: 'check', error: 'alertTriangle', info: 'info' };

export function toast(message, type = 'info', duration = 4200) {
  const node = el(`
    <div class="toast ${type}">
      <span class="toast-icon">${icon(ICON_BY_TYPE[type] || 'info', 18)}</span>
      <div class="toast-msg">${escapeHtml(message)}</div>
      <button class="toast-close" aria-label="Dismiss">${icon('x', 14)}</button>
    </div>
  `);

  const dismiss = () => {
    node.classList.add('leaving');
    setTimeout(() => node.remove(), 160);
  };

  node.querySelector('.toast-close').addEventListener('click', dismiss);
  root().appendChild(node);
  if (duration) setTimeout(dismiss, duration);
  return dismiss;
}

export const toastSuccess = (msg) => toast(msg, 'success');
export const toastError = (msg) => toast(msg, 'error');
export const toastInfo = (msg) => toast(msg, 'info');
