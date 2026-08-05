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

const DEFAULT_BASELINE_PRODUCTS = [];

const inferSubNavbarCategory = (p) => {
  if (p.subNavbarCategory) return p.subNavbarCategory;
  if (p.mainCategory) return p.mainCategory;

  const normalizeCat = (val) => {
    if (!val || typeof val !== 'string') return '';
    const v = val.trim().toLowerCase();
    if (v === 'services' || v === 'service') return 'Services';
    if (v === 'products' || v === 'product') return 'Products';
    if (v === 'daily needs' || v === 'daily-needs' || v === 'dailyneeds' || v === 'grocery' || v === 'groceries') return 'Daily Needs';
    if (v === 'food' || v === 'foods' || v === 'dining' || v === 'restaurant') return 'Food';
    if (v === 'stay' || v === 'stays' || v === 'hotel' || v === 'hotels') return 'Stay';
    if (v === 'travel' || v === 'travels' || v === 'tour' || v === 'tours') return 'Travel';
    if (v === 'jobs' || v === 'job' || v === 'hiring' || v === 'recruitment') return 'Jobs';
    return '';
  };

  const directTag = normalizeCat(p.tag) || normalizeCat(p.type);
  if (directTag) return directTag;

  const directCat = normalizeCat(p.category) || normalizeCat(p.subcategory) || normalizeCat(p.subSubcategory);
  if (directCat) return directCat;

  if (p.jobTitle || p.offeredSalary || p.salary || p.jobType) return 'Jobs';

  const catStr = `${p.category || ''} ${p.subcategory || ''} ${p.subSubcategory || ''} ${p.tag || ''}`.toLowerCase();

  if (['parotta', 'biryani', 'dosa', 'idli', 'thali', 'pizza', 'burger', 'fast food', 'south indian', 'north indian', 'bakery', 'beverages', 'catering', 'home food', 'tiramisu', 'restaurant', 'cafe'].some(k => catStr.includes(k))) {
    return 'Food';
  }
  if (['cab', 'taxi', 'bus', 'sleeper', 'flight', 'train', 'car rental', 'bike rental', 'tour package', 'travel'].some(k => catStr.includes(k))) {
    return 'Travel';
  }
  if (['hotel', 'resort', 'homestay', 'suite', 'deluxe room', 'lodge', 'accommodation', 'stay'].some(k => catStr.includes(k))) {
    return 'Stay';
  }
  if (['rice', 'egg', 'eggs', 'fruits', 'vegetables', 'dairy', 'milk', 'supermarket', 'daily needs', 'pharmacy'].some(k => catStr.includes(k))) {
    return 'Daily Needs';
  }
  if (['full time', 'part time', 'full stack', 'developer', 'software engineer', 'it jobs', 'non-it jobs', 'bpo jobs', 'jobs', 'opening'].some(k => catStr.includes(k))) {
    return 'Jobs';
  }
  if (['doctor', 'clinic', 'hospital', 'physiotherapy', 'home service', 'repair', 'plumbing', 'electrician', 'cleaning', 'salon', 'spa', 'consulting'].some(k => catStr.includes(k))) {
    return 'Services';
  }
  if (['saree', 'fashion', 'electronics', 'mobile', 'smartphone', 'laptop', 'watch', 'jewellery', 'furniture', 'appliance'].some(k => catStr.includes(k))) {
    return 'Products';
  }

  return 'Products';
};

const sanitizeProduct = (p) => {
  if (!p) return p;
  const updated = { ...p };

  // Standardize ID
  updated.id = p.id || p._id || p.productId || `vendor-prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  // Standardize Name / Title
  updated.name = p.name || p.title || p.productName || p.serviceName || p.jobTitle || 'Vendor Listing';

  // Standardize Price & Offer Price
  const rawPrice = p.price !== undefined && p.price !== null ? p.price : (p.offerPrice || p.mrp || p.rate || p.amount || p.cost || 0);
  updated.price = typeof rawPrice === 'number' ? rawPrice : (parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) || 0);

  if (p.offerPrice || p.originalPrice || p.mrp) {
    const rawOrig = p.originalPrice || p.mrp || p.price;
    updated.originalPrice = typeof rawOrig === 'number' ? rawOrig : (parseFloat(String(rawOrig).replace(/[^0-9.]/g, '')) || 0);
    const rawOffer = p.offerPrice || p.price;
    updated.offerPrice = typeof rawOffer === 'number' ? rawOffer : (parseFloat(String(rawOffer).replace(/[^0-9.]/g, '')) || 0);
  }

  // Standardize Vendor Name / Brand
  updated.vendorName = p.vendorName || p.brand || p.companyName || p.company || p.vendor_name || 'Verified Vendor';

  // Standardize Rating & Reviews
  updated.rating = p.rating ? Number(p.rating) : 4.5;
  updated.reviews = p.reviews ? Number(p.reviews) : 12;

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
  clearCache: () => {
    try {
      localStorage.removeItem('connect_cached_products');
    } catch (e) {}
  },

  getProducts: async (forceLive = true) => {
    const mergeWithBaseline = (fetchedList) => {
      const sanitizedFetched = Array.isArray(fetchedList) ? fetchedList.map(sanitizeProduct) : [];
      const sanitizedBaseline = DEFAULT_BASELINE_PRODUCTS.map(sanitizeProduct);

      if (sanitizedFetched.length === 0) {
        return sanitizedBaseline;
      }

      // Prepend vendor-added items at top and deduplicate with baseline items
      const vendorIds = new Set(sanitizedFetched.map(p => String(p.id || p._id)));
      const vendorNames = new Set(sanitizedFetched.map(p => (p.name || '').toLowerCase().trim()));

      const filteredBaseline = sanitizedBaseline.filter(p => {
        const pId = String(p.id || p._id);
        const pName = (p.name || '').toLowerCase().trim();
        return !vendorIds.has(pId) && !vendorNames.has(pName);
      });

      return [...sanitizedFetched, ...filteredBaseline];
    };

    const getLocalCache = () => {
      try {
        const cached = localStorage.getItem('connect_cached_products');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return mergeWithBaseline(parsed);
          }
        }
      } catch (e) {}
      return null;
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${getVendorBackendUrl()}/api/public/products`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          const merged = mergeWithBaseline(data.products);
          try {
            localStorage.setItem('connect_cached_products', JSON.stringify(merged));
          } catch(e) {}
          return { success: true, products: merged, source: 'live' };
        }
      }
    } catch (err) {
      console.warn("Failed to fetch products from vendor backend (using persistent local cache):", err);
    }

    const localCached = getLocalCache();
    if (localCached) {
      return { success: true, products: localCached, source: 'cache' };
    }

    return { success: true, products: mergeWithBaseline([]), source: 'baseline' };
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
