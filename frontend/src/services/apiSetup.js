export const getBackendUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // If running locally, connect to local backend on port 8001
  if (
    !hostname || 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  ) {
    return `http://${hostname || 'localhost'}:8001`;
  }
  
  // Production server URL
  return 'https://api.ficapp.in';
};

export const getVendorBackendUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_VENDOR_BACKEND_URL) return import.meta.env.VITE_VENDOR_BACKEND_URL;

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  if (
    !hostname || 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  ) {
    return `http://${hostname || 'localhost'}:8001`;
  }
  
  return 'https://api.ficapp.in';
};

export const getAdminBackendUrl = () => {
  if (import.meta.env.VITE_ADMIN_BACKEND_URL) return import.meta.env.VITE_ADMIN_BACKEND_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  
  if (
    !hostname || 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  ) {
    return `http://${hostname || 'localhost'}:5001`;
  }
  
  return 'https://api.ficapp.in';
};
