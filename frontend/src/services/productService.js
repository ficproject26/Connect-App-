export const productService = {
  getProducts: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/public/products');
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
