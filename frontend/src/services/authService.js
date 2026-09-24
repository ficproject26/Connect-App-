import { getBackendUrl } from './apiSetup';

export const clearAuthCookies = () => {
  try {
    if (typeof document !== 'undefined') {
      const cookieNames = [
        'connect_access_token',
        'connect_refresh_token',
        'token',
        'accessToken',
        'refreshToken',
        'jwt',
        'sessionId',
        'connect_token',
        'connect_user_id',
        'connect_customer_id'
      ];
      const paths = ['/', '/api', '/api/auth', '/api/customer'];
      const domains = [
        window.location.hostname,
        '.' + window.location.hostname,
        ''
      ];
      cookieNames.forEach(name => {
        paths.forEach(path => {
          domains.forEach(domain => {
            const domainStr = domain ? `; domain=${domain}` : '';
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainStr}; SameSite=Lax`;
          });
        });
      });
    }
  } catch (e) {}
};

export const authService = {
  login: async (email, password, role) => {
    return { success: true, user: { email, role } };
  },
  logout: async () => {
    try {
      const baseBackend = typeof getBackendUrl === 'function' ? getBackendUrl() : '';
      const token = (typeof localStorage !== 'undefined' && (localStorage.getItem('connect_token') || localStorage.getItem('token'))) || '';
      
      const endpoints = [
        baseBackend ? `${baseBackend}/api/auth/logout` : '',
        baseBackend ? `${baseBackend}/api/customer/logout` : '',
        '/api/auth/logout',
        '/api/customer/logout'
      ].filter(Boolean);

      const uniqueEndpoints = [...new Set(endpoints)];

      // Attempt backend session revocation with short timeout
      for (const ep of uniqueEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          await fetch(ep, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            credentials: 'include',
            signal: controller.signal
          }).catch(() => null);
          clearTimeout(timeoutId);
          break; // First responding endpoint is sufficient
        } catch (err) {}
      }
    } catch (e) {}

    // Always clear client-side auth cookies regardless of API response
    clearAuthCookies();

    return { success: true };
  }
};

