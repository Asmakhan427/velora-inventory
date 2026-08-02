import { icon } from '../icons.js';
import { el } from '../utils.js';

const root = () => document.getElementById('modal-root');

export function openModal({ title, bodyHtml, footerHtml = '', size = '', onMount, onClose } = {}) {
  const overlay = el(`
    <div class="modal-overlay">
      <div class="modal ${size === 'lg' ? 'modal-lg' : ''}" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title">${title}</div>
          <button class="icon-btn modal-close-btn" aria-label="Close">${icon('x', 16)}</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    </div>
  `);

  function close() {
    overlay.style.animation = 'fadeIn 120ms ease reverse';
    setTimeout(() => {
      overlay.remove();
      document.removeEventListener('keydown', onKey);
      if (onClose) onClose();
    }, 100);
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  overlay.querySelector('.modal-close-btn').addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  root().appendChild(overlay);
  if (onMount) onMount(overlay, close);
  return { close, overlay };
}

export function confirmDialog({ title, message, confirmLabel = 'Confirm', danger = true }) {
  return new Promise((resolve) => {
    const { close } = openModal({
      title,
      bodyHtml: `<p style="color:var(--text-secondary); font-size: 14px; line-height:1.6;">${message}</p>`,
      footerHtml: `
        <button class="btn btn-ghost" data-action="cancel">Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">${confirmLabel}</button>
      `,
      onMount: (overlay) => {
        overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => {
          close();
          resolve(false);
        });
        overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => {
          close();
          resolve(true);
        });
      },
      onClose: () => resolve(false),
    });
  });
}
