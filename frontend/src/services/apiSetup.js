export const getBackendUrl = () => {
  const hostname = window.location.hostname;
  
  // If running locally, connect to local backend on port 8000
  if (
    !hostname || 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.')
  ) {
    return `http://${hostname || 'localhost'}:8001`;
  }
  
  // If running in production, connect to deployed Render backend URL
  return import.meta.env.VITE_BACKEND_URL || 'https://connect-vendor.onrender.com';
};

export const getVendorBackendUrl = () => {
  const hostname = window.location.hostname;
  
  if (
    !hostname || 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.')
  ) {
    return `http://${hostname || 'localhost'}:8000`;
  }
  
  return import.meta.env.VITE_VENDOR_BACKEND_URL || 'https://connect-vendor.onrender.com';
};

export const getAdminBackendUrl = () => {
  const hostname = window.location.hostname;
  
  if (
    !hostname || 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.')
  ) {
    return `http://${hostname || 'localhost'}:5001`;
  }
  
  return import.meta.env.VITE_ADMIN_BACKEND_URL || 'https://connect-admin.onrender.com';
};
