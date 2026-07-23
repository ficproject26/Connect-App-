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

const inferSubNavbarCategory = (p) => {
  if (p.subNavbarCategory) return p.subNavbarCategory;
  const cat = (p.category || '').toLowerCase();
  const name = (p.name || '').toLowerCase();

  if (['hospitals', 'physiotherapy', 'it services', 'non-it', 'job consulting', 'business consulting', 'healthcare', 'education', 'financial', 'insurance', 'home services', 'legal', 'digital', 'automobile services'].some(k => cat.includes(k) || name.includes(k))) {
    return 'Services';
  }
  if (['smartphones', 'headphones', 'monitors', 'electronics', 'furniture', 'fashion', 'beauty', 'baby care', 'sports', 'books', 'gaming', 'kitchen', 'pet', 'stores', 'saree'].some(k => cat.includes(k) || name.includes(k))) {
    return 'Products';
  }
  if (['rice', 'eggs', 'grocery', 'fruits', 'vegetables', 'dairy', 'water', 'household', 'personal care', 'pharmacy'].some(k => cat.includes(k) || name.includes(k))) {
    return 'Daily Needs';
  }
  if (['fine dining', 'restaurants', 'fast food', 'cafes', 'south indian', 'north indian', 'biryani', 'healthy food', 'bakery', 'beverages', 'catering', 'home food', 'tiramisu', 'pizza'].some(k => cat.includes(k) || name.includes(k))) {
    return 'Food';
  }
  if (['deluxe', 'hotels', 'resorts', 'homestays', 'service apartments', 'vacation', 'student accommodation', 'corporate stay', 'suite', 'stay'].some(k => cat.includes(k) || name.includes(k))) {
    return 'Stay';
  }
  if (['family packages', 'exclusive offers', 'flight', 'train', 'bus', 'cab', 'car rental', 'bike rental', 'tour', 'honeymoon', 'travel', 'pass'].some(k => cat.includes(k) || name.includes(k))) {
    return 'Travel';
  }
  if (['full stack developer', 'banking', 'it', 'non-it', 'bpo', 'sales', 'healthcare jobs', 'job'].some(k => cat.includes(k) || name.includes(k))) {
    return 'Jobs';
  }
  return 'Services';
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
  updated.subNavbarCategory = inferSubNavbarCategory(updated);
  return updated;
};

export const productService = {
  getProducts: async () => {
    // Helper to read cached products from persistent localStorage
    const getLocalCache = () => {
      try {
        const cached = localStorage.getItem('connect_cached_products');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
      return null;
    };

    try {
      // 1. Try Network Fetch with Abort Controller (2s timeout limit)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${getVendorBackendUrl()}/api/public/products`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          const sanitized = data.products.map(sanitizeProduct);
          try {
            localStorage.setItem('connect_cached_products', JSON.stringify(sanitized));
          } catch(e) {}
          return { success: true, products: sanitized };
        }
      }
    } catch (err) {
      console.warn("Failed to fetch products from vendor backend (using persistent local cache):", err);
    }

    // 2. Fallback to persistent localStorage cache when network fails (e.g. backend is closed)
    const localCached = getLocalCache();
    if (localCached) {
      return { success: true, products: localCached };
    }

    return { success: false, products: [] };
  },

  deleteAllProducts: async () => {
    try {
      const res = await fetch(`${getVendorBackendUrl()}/api/public/products/delete-all`, {
        method: 'DELETE'
      });
      if (res.ok) {
        localStorage.removeItem('connect_cached_products');
        return await res.json();
      }
      localStorage.removeItem('connect_cached_products');
      return { success: false, message: 'Failed to delete products' };
    } catch (err) {
      console.warn("Failed to delete products:", err);
      localStorage.removeItem('connect_cached_products');
      return { success: false, message: 'Server error' };
    }
  }
};
