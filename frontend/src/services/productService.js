import { getVendorBackendUrl } from './apiSetup';

export const productService = {
  getProducts: async () => {
    try {
      const res = await fetch(`${getVendorBackendUrl()}/api/public/products`);
      if (res.ok) {
        return await res.json();
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
