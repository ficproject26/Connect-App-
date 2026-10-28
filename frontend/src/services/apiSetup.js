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

export const isLocalHostname = (hostname) => {
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
  // 1. Authoritative configured environment URL (e.g. VITE_API_URL / VITE_BACKEND_URL)
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('www.ficapp.in')) {
    return formatUrl(import.meta.env.VITE_API_URL);
  }
  if (import.meta.env.VITE_BACKEND_URL && !import.meta.env.VITE_BACKEND_URL.includes('www.ficapp.in')) {
    return formatUrl(import.meta.env.VITE_BACKEND_URL);
  }

  // 2. Local fallback if explicitly running locally without configured remote URL
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (isLocalHostname(hostname)) {
    return `http://${hostname || 'localhost'}:8001`;
  }

  return 'https://api.ficapp.in';
};

export const getVendorBackendUrl = () => {
  if (import.meta.env.VITE_VENDOR_BACKEND_URL && !import.meta.env.VITE_VENDOR_BACKEND_URL.includes('www.ficapp.in')) {
    return formatUrl(import.meta.env.VITE_VENDOR_BACKEND_URL);
  }
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('www.ficapp.in')) {
    return formatUrl(import.meta.env.VITE_API_URL);
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (isLocalHostname(hostname)) {
    return `http://${hostname || 'localhost'}:8001`;
  }

  return 'https://api.ficapp.in';
};

export const getAdminBackendUrl = () => {
  if (import.meta.env.VITE_ADMIN_BACKEND_URL && !import.meta.env.VITE_ADMIN_BACKEND_URL.includes('www.ficapp.in')) {
    return formatUrl(import.meta.env.VITE_ADMIN_BACKEND_URL);
  }
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('www.ficapp.in')) {
    return formatUrl(import.meta.env.VITE_API_URL);
  }

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (isLocalHostname(hostname)) {
    return `http://${hostname || 'localhost'}:8001`;
  }

  return 'https://api.ficapp.in';
};

export const getSocketUrl = () => {
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('www.ficapp.in')) {
    return formatUrl(import.meta.env.VITE_API_URL);
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (isLocalHostname(hostname)) {
    return `http://${hostname || 'localhost'}:8001`;
  }
  return 'https://api.ficapp.in';
};

