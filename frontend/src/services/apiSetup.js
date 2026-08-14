const matchProtocol = (url) => {
  if (!url) return url;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
    return url.replace(/^http:\/\//, 'https://');
  }
  return url;
};

export const getBackendUrl = () => {
  let url = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;

  if (!url) {
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
      url = `http://${hostname || 'localhost'}:8001`;
    } else {
      url = 'http://13.201.132.46:8001';
    }
  }
  
  return matchProtocol(url);
};

export const getVendorBackendUrl = () => {
  let url = import.meta.env.VITE_API_URL || import.meta.env.VITE_VENDOR_BACKEND_URL;

  if (!url) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    if (
      !hostname || 
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.startsWith('192.168.') || 
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      url = `http://${hostname || 'localhost'}:8001`;
    } else {
      url = 'http://13.201.132.46:8001';
    }
  }
  
  return matchProtocol(url);
};

export const getAdminBackendUrl = () => {
  let url = import.meta.env.VITE_ADMIN_BACKEND_URL || import.meta.env.VITE_API_URL;

  if (!url) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    if (
      !hostname || 
      hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.startsWith('192.168.') || 
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      url = `http://${hostname || 'localhost'}:5001`;
    } else {
      url = 'http://13.201.132.46:8001';
    }
  }
  
  return matchProtocol(url);
};
