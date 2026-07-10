export const productService = {
  getProducts: async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/public/products');
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
