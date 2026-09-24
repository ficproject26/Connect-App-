import { getBackendUrl } from './apiSetup';

export const authService = {
  login: async (email, password, role) => {
    return { success: true, user: { email, role } };
  },
  logout: async () => {
    try {
      const baseBackend = typeof getBackendUrl === 'function' ? getBackendUrl() : '';
      const token = typeof localStorage !== 'undefined'
        ? (localStorage.getItem('connect_token') || localStorage.getItem('token') || '')
        : '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`${baseBackend}/api/auth/logout`, {
        method: 'POST',
        headers,
        credentials: 'include'
      }).catch(() => null);
    } catch (e) {
      console.warn('Backend logout call note:', e);
    }
    return { success: true };
  }
};
