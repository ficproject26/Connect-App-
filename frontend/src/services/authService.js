import { getBackendUrl } from './apiSetup';

export const clearClientAuthState = () => {
  try {
    const keysToRemove = [
      'connect_current_user',
      'connect_token',
      'token',
      'accessToken',
      'refreshToken',
      'connect_customer_id',
      'connect_user_id',
      'connect_customer_tier',
      'connect_customer_wallet',
      'connect_customer_transactions',
      'connect_active_profile_tab',
      'connect_profile_modal_open',
      'connect_user_orders',
      'user_orders',
      'connect_read_notifications',
      'connect_deleted_notifications',
      'connect_notifications_cleared_at',
      'connect_fallback_orders'
    ];
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
      try { sessionStorage.removeItem(k); } catch (e) {}
    });

    const dynamicPrefixes = [
      'connect_customer_wallet_',
      'connect_customer_transactions_',
      'connect_customer_tier_',
      'connect_profile_phone_'
    ];

    if (typeof localStorage !== 'undefined') {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && dynamicPrefixes.some(prefix => k.startsWith(prefix))) {
          try { localStorage.removeItem(k); } catch (e) {}
        }
      }
    }

    if (typeof sessionStorage !== 'undefined') {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i);
        if (k && dynamicPrefixes.some(prefix => k.startsWith(prefix))) {
          try { sessionStorage.removeItem(k); } catch (e) {}
        }
      }
    }

    // Set designated public destination
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('connect_current_page', 'home');
    }
  } catch (e) {}
};

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
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      const domains = [
        currentHost,
        currentHost ? `.${currentHost}` : '',
        '',
        '.ficapp.in',
        'ficapp.in',
        'www.ficapp.in'
      ].filter(Boolean);

      cookieNames.forEach(name => {
        paths.forEach(path => {
          domains.forEach(domain => {
            const domainStr = domain ? `; domain=${domain}` : '';
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainStr}; SameSite=Lax`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainStr}; SameSite=Strict`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainStr}; Secure; SameSite=None`;
          });
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
        });
      });
    }
  } catch (e) {}
};

export const authService = {
  login: async (email, password, role) => {
    return { success: true, user: { email, role } };
  },
  logout: async (tokenOverride) => {
    try {
      const baseBackend = typeof getBackendUrl === 'function' ? getBackendUrl() : '';
      const token = tokenOverride || (typeof localStorage !== 'undefined' && (localStorage.getItem('connect_token') || localStorage.getItem('token'))) || '';
      
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
          const res = await fetch(ep, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            credentials: 'include',
            signal: controller.signal
          }).catch(() => null);
          clearTimeout(timeoutId);
          if (res && res.ok) {
            break; // First responding endpoint is sufficient
          }
        } catch (err) {}
      }
    } catch (e) {}

    // Always clear client-side auth cookies and client auth storage regardless of API response
    clearAuthCookies();
    clearClientAuthState();

    return { success: true };
  }
};

