import { getBackendUrl } from './apiSetup';

export const productService = {
  getProducts: async () => {
    try {
      const res = await fetch(`${getBackendUrl()}/api/public/products`);
      if (res.ok) {
        return await res.json();
      }
      return { success: false, products: [] };
    } catch (err) {
      console.warn("Failed to fetch products from vendor backend:", err);
      return { success: false, products: [] };
    }
  }
};
