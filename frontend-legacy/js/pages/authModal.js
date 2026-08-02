import { api, ApiClientError } from '../api.js';
import { authState } from '../state.js';
import { openModal } from '../components/modal.js';
import { toastSuccess, toastError, toastInfo } from '../components/toast.js';

export function openLoginModal(onSuccess) {
  const { close } = openModal({
    title: 'Sign in',
    bodyHtml: `
      <form id="login-form">
        <div class="field">
          <label>Username</label>
          <input class="input" id="login-username" autocomplete="username" />
        </div>
        <div class="field mt-16">
          <label>Password</label>
          <input class="input" id="login-password" type="password" autocomplete="current-password" />
        </div>
        <div class="field-error mt-8" id="login-error"></div>
        <div class="login-hint">
          Demo credentials — Admin: <strong>admin</strong> / <strong>Admin@123</strong><br/>
          Staff: <strong>staff</strong> / <strong>Staff@123</strong><br/>
          Admins can delete records; Staff cannot. The app is fully usable without signing in.
        </div>
      </form>
    `,
    footerHtml: `
      <button class="btn btn-ghost" data-action="cancel">Cancel</button>
      <button class="btn btn-primary" data-action="login">Sign in</button>
    `,
    onMount: (overlay) => {
      const submit = async () => {
        const username = overlay.querySelector('#login-username').value.trim();
        const password = overlay.querySelector('#login-password').value;
        const errorEl = overlay.querySelector('#login-error');
        const btn = overlay.querySelector('[data-action="login"]');
        errorEl.textContent = '';
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span>';
        try {
          const { data } = await api.login(username, password);
          authState.login(data.token, data.user);
          toastSuccess(`Signed in as ${data.user.username} (${data.user.role}).`);
          close();
          if (onSuccess) onSuccess();
        } catch (err) {
          errorEl.textContent = err instanceof ApiClientError ? err.message : 'Sign-in failed.';
          btn.disabled = false;
          btn.textContent = 'Sign in';
        }
      };

      overlay.querySelector('[data-action="cancel"]').addEventListener('click', close);
      overlay.querySelector('[data-action="login"]').addEventListener('click', submit);
      overlay.querySelector('#login-password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
      });
    },
  });
}

export function handleLogout() {
  authState.logout();
  toastInfo('Signed out.');
}
