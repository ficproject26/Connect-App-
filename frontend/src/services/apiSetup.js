const formatUrl = (url) => {
  if (!url) return '';
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `http://${cleaned}`;
  }
  // Strip trailing /api so callers doing `${getBackendUrl()}/api` don't create double /api/api
  if (cleaned.endsWith('/api')) {
    cleaned = cleaned.slice(0, -4);
  }
  return cleaned;
};

const isLocalHostname = (hostname) => {
  return (
    !hostname || 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  );
};

export const getBackendUrl = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (isLocalHostname(hostname)) {
    return `http://${hostname || 'localhost'}:8001`;
  }

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  if (isHttps) {
    if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('https://') && !import.meta.env.VITE_API_URL.includes('www.ficapp.in')) {
      return formatUrl(import.meta.env.VITE_API_URL);
    }
    if (import.meta.env.VITE_BACKEND_URL && import.meta.env.VITE_BACKEND_URL.startsWith('https://') && !import.meta.env.VITE_BACKEND_URL.includes('www.ficapp.in')) {
      return formatUrl(import.meta.env.VITE_BACKEND_URL);
    }
    return 'https://api.ficapp.in';
  }

  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('www.ficapp.in')) return formatUrl(import.meta.env.VITE_API_URL);
  if (import.meta.env.VITE_BACKEND_URL && !import.meta.env.VITE_BACKEND_URL.includes('www.ficapp.in')) return formatUrl(import.meta.env.VITE_BACKEND_URL);

  return 'https://api.ficapp.in';
};

export const getVendorBackendUrl = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (isLocalHostname(hostname)) {
    return `http://${hostname || 'localhost'}:8001`;
  }

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  if (isHttps) {
    if (import.meta.env.VITE_VENDOR_BACKEND_URL && import.meta.env.VITE_VENDOR_BACKEND_URL.startsWith('https://') && !import.meta.env.VITE_VENDOR_BACKEND_URL.includes('www.ficapp.in')) {
      return formatUrl(import.meta.env.VITE_VENDOR_BACKEND_URL);
    }
    if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('https://') && !import.meta.env.VITE_API_URL.includes('www.ficapp.in')) {
      return formatUrl(import.meta.env.VITE_API_URL);
    }
    return 'https://api.ficapp.in';
  }

  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('www.ficapp.in')) return formatUrl(import.meta.env.VITE_API_URL);
  if (import.meta.env.VITE_VENDOR_BACKEND_URL && !import.meta.env.VITE_VENDOR_BACKEND_URL.includes('www.ficapp.in')) return formatUrl(import.meta.env.VITE_VENDOR_BACKEND_URL);

  return 'https://api.ficapp.in';
};

export const getAdminBackendUrl = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (isLocalHostname(hostname)) {
    return `http://${hostname || 'localhost'}:8001`;
  }

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  if (isHttps) {
    if (import.meta.env.VITE_ADMIN_BACKEND_URL && import.meta.env.VITE_ADMIN_BACKEND_URL.startsWith('https://') && !import.meta.env.VITE_ADMIN_BACKEND_URL.includes('www.ficapp.in')) {
      return formatUrl(import.meta.env.VITE_ADMIN_BACKEND_URL);
    }
    if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('https://') && !import.meta.env.VITE_API_URL.includes('www.ficapp.in')) {
      return formatUrl(import.meta.env.VITE_API_URL);
    }
    return 'https://api.ficapp.in';
  }

  if (import.meta.env.VITE_ADMIN_BACKEND_URL && !import.meta.env.VITE_ADMIN_BACKEND_URL.includes('www.ficapp.in')) return formatUrl(import.meta.env.VITE_ADMIN_BACKEND_URL);
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('www.ficapp.in')) return formatUrl(import.meta.env.VITE_API_URL);

  return 'https://api.ficapp.in';
};

export const getSocketUrl = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (isLocalHostname(hostname)) {
    return `http://${hostname || 'localhost'}:8001`;
  }
  return 'https://api.ficapp.in';
};

