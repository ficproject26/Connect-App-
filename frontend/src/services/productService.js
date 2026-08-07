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

export const isRealVendorProduct = (p) => {
  if (!p) return false;

  const status = (p.status || p.vendorStatus || '').toString().toLowerCase().trim();
  if (['suspended', 'inactive', 'rejected', 'deactivated', 'blocked'].includes(status) || p.isSuspended === true || p.isVendorSuspended === true) {
    return false;
  }

  const vId = String(p.vendorId || p.vendor_id || '');
  const pId = String(p.id || p._id || '');

  // Exclude hardcoded demo/dump ID formats (like u06q3qsi5mqg7ni0h, 9iitzyfekmqg7ni0w)
  if (vId.includes('mqg7ni') || pId.includes('mqg7ni')) return false;

  // Exclude static baseline/dump item IDs
  if (pId.startsWith('base-') || pId === 'p1' || pId === 'p2' || pId === 'p3' || pId === 'p4') return false;

  // Real vendor products with valid ID or vendor name are valid
  if (pId || vId || p.vendorName || p.name) return true;

  return false;
};

const DEFAULT_BASELINE_PRODUCTS = [];

const inferSubNavbarCategory = (p) => {
  if (!p) return 'Products';

  const catStr = `${p.name || ''} ${p.category || ''} ${p.subcategory || ''} ${p.subSubcategory || ''} ${p.tag || ''}`.toLowerCase();

  // 1. Check for Jobs keywords
  if (['full time', 'part time', 'full stack', 'developer', 'software engineer', 'it jobs', 'non-it jobs', 'bpo jobs', 'jobs', 'job', 'opening', 'talent', 'operator', 'specialist', 'recruiter', 'manager', 'analyst'].some(k => catStr.includes(k))) {
    return 'Jobs';
  }
  // 2. Check for Services keywords
  if (['doctor', 'clinic', 'hospital', 'physiotherapy', 'home service', 'repair', 'plumbing', 'electrician', 'cleaning', 'salon', 'spa', 'consulting', 'gym', 'fitness', 'automobile', 'car service', 'recharge'].some(k => catStr.includes(k))) {
    return 'Services';
  }
  // 3. Check for Food keywords
  if (['parotta', 'biryani', 'biriyani', 'dosa', 'idli', 'thali', 'pizza', 'burger', 'fast food', 'south indian', 'north indian', 'bakery', 'beverages', 'catering', 'home food', 'tiramisu', 'restaurant', 'cafe', 'salad'].some(k => catStr.includes(k))) {
    return 'Food';
  }
  // 4. Check for Stay keywords
  if (['hotel', 'resort', 'homestay', 'suite', 'deluxe room', 'lodge', 'accommodation', 'stay'].some(k => catStr.includes(k))) {
    return 'Stay';
  }
  // 5. Check for Travel keywords
  if (['cab', 'taxi', 'bus', 'sleeper', 'flight', 'train', 'car rental', 'bike rental', 'tour package', 'travel'].some(k => catStr.includes(k))) {
    return 'Travel';
  }
  // 6. Check for Daily Needs keywords
  if (['rice', 'egg', 'eggs', 'fruits', 'vegetables', 'dairy', 'milk', 'supermarket', 'daily needs', 'pharmacy', 'tomato', 'onions', 'urad dal'].some(k => catStr.includes(k))) {
    return 'Daily Needs';
  }
  // 7. Check for Products keywords
  if (['saree', 'fashion', 'electronics', 'mobile', 'mobiles', 'smartphone', 'smartphones', 'laptop', 'watch', 'jewellery', 'jewelry', 'furniture', 'appliance', 'jean', 'jeans', 'shoes', 'footwear', 'clothing', 'shirt', 'headphone', 'phone'].some(k => catStr.includes(k))) {
    return 'Products';
  }

  if (p.subNavbarCategory && p.subNavbarCategory !== 'Products') return p.subNavbarCategory;
  if (p.mainCategory && p.mainCategory !== 'Products') return p.mainCategory;

  return p.subNavbarCategory || p.mainCategory || 'Products';
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

  // Standardize Image
  updated.image = p.image || p.imageUrl || (p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : '') || p.img || '';
  if (Array.isArray(p.images) && p.images.length > 0) {
    updated.images = p.images;
  } else if (updated.image) {
    updated.images = [updated.image];
  }

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
    const filterVendorAddedOnly = (fetchedList) => {
      const sanitized = Array.isArray(fetchedList) ? fetchedList.map(sanitizeProduct) : [];
      return sanitized.filter(isRealVendorProduct);
    };

    const getLocalCache = () => {
      try {
        const cached = localStorage.getItem('connect_cached_products');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return filterVendorAddedOnly(parsed);
          }
        }
      } catch (e) {}
      return [];
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${getVendorBackendUrl()}/api/public/products?t=${Date.now()}`, { 
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          const vendorProducts = filterVendorAddedOnly(data.products);
          try {
            localStorage.setItem('connect_cached_products', JSON.stringify(vendorProducts));
          } catch(e) {}
          return { success: true, products: vendorProducts, source: 'live' };
        }
      }
    } catch (err) {
      console.warn("Failed to fetch products from vendor backend:", err);
    }

    const localCached = getLocalCache();
    if (localCached && localCached.length > 0) {
      return { success: true, products: localCached, source: 'cache' };
    }

    return { success: true, products: [], source: 'empty' };
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
