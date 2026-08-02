import { getUser, getToken, setUser, setToken } from './api.js';

const listeners = new Set();

export const authState = {
  get user() { return getUser(); },
  get token() { return getToken(); },
  get isAuthenticated() { return Boolean(getToken()); },
  get isAdmin() { return this.user?.role === 'ADMIN'; },
  login(token, user) {
    setToken(token);
    setUser(user);
    listeners.forEach((fn) => fn());
  },
  logout() {
    setToken(null);
    setUser(null);
    listeners.forEach((fn) => fn());
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
