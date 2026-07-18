import { getVendorBackendUrl } from './apiSetup';

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/â€¢/g, '•')
    .replace(/â˜…/g, '★')
    .replace(/Â°/g, '°')
    .replace(/ðŸ“…/g, '')
    .replace(/ðŸ“/g, '')
    .replace(/ðŸŒ™/g, '')
    .replace(/ðŸ› ï¸ /g, '')
    .replace(/ðŸ“ /g, '')
    .replace(/ðŸ‘¤/g, '')
    .replace(/ðŸ‘¥/g, '')
    .replace(/ðŸ‘ /g, '')
    .replace(/ðŸ›°ï¸ /g, '');
};

const sanitizeProduct = (p) => {
  const updated = { ...p };
  for (const key in updated) {
    if (typeof updated[key] === 'string') {
      updated[key] = sanitizeString(updated[key]);
    } else if (Array.isArray(updated[key])) {
      updated[key] = updated[key].map(item => typeof item === 'string' ? sanitizeString(item) : item);
    }
  }
  return updated;
};

export const productService = {
  getProducts: async () => {
    try {
      const res = await fetch(`${getVendorBackendUrl()}/api/public/products`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          data.products = data.products.map(sanitizeProduct);
        }
        return data;
      }
      return { success: false, products: [] };
    } catch (err) {
      console.warn("Failed to fetch products from vendor backend:", err);
      return { success: false, products: [] };
    }
  },
  deleteAllProducts: async () => {
    try {
      const res = await fetch(`${getVendorBackendUrl()}/api/public/products/delete-all`, {
        method: 'DELETE'
      });
      if (res.ok) {
        return await res.json();
      }
      return { success: false, message: 'Failed to delete products' };
    } catch (err) {
      console.warn("Failed to delete products:", err);
      return { success: false, message: 'Server error' };
    }
  }
};
