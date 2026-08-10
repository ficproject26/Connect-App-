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

  if (p.isActive === false || p.isAvailable === false || p.isSuspended === true || p.isVendorSuspended === true || p.vendorIsActive === false) {
    return false;
  }

  const status = (p.status || p.vendorStatus || p.vendor_status || '').toString().toLowerCase().trim();
  if (['suspended', 'inactive', 'rejected', 'deactivated', 'blocked'].includes(status)) {
    return false;
  }

  const vId = String(p.vendorId || p.vendor_id || '');
  const pId = String(p.id || p._id || '');

  // Exclude hardcoded demo/dump ID formats from initial seed data
  if (vId.includes('mqg7ni') || pId.includes('mqg7ni') || vId.includes('mqhms') || pId.includes('mqhms') || vId.includes('mqhn3') || pId.includes('mqhn3') || vId.includes('mqkqu') || pId.includes('mqkqu')) return false;

  // Exclude static baseline/dump item IDs
  if (pId.startsWith('base-') || pId === 'p1' || pId === 'p2' || pId === 'p3' || pId === 'p4') return false;

  // Real vendor products with valid ID or vendor name are valid
  if (pId || vId || p.vendorName || p.name) return true;

  return false;
};

const DEFAULT_BASELINE_PRODUCTS = [];

const inferSubNavbarCategory = (p) => {
  if (!p) return 'Products';

  const rawSubNav = String(p.subNavbarCategory || '').trim();
  const rawMainCat = String(p.mainCategory || p.main_category || '').trim();
  const rawCat = String(p.category || '').trim();
  const rawSubCat = String(p.subcategory || '').trim();
  const rawSubSubCat = String(p.subSubcategory || '').trim();
  const rawTag = String(p.tag || '').trim();
  const rawType = String(p.type || p.jobType || p.workType || '').trim();
  const rawName = String(p.name || p.title || p.jobTitle || '').trim();

  const matchMainCat = (str) => {
    if (!str) return null;
    const lower = str.toLowerCase();

    // Exact or direct main category matches
    if (['services', 'service'].includes(lower)) return 'Services';
    if (['food', 'foods', 'dining', 'restaurant', 'restaurants'].includes(lower)) return 'Food';
    if (['stay', 'stays', 'hotel', 'hotels', 'homestay', 'resort', 'resorts'].includes(lower)) return 'Stay';
    if (['travel', 'travels', 'cab', 'cabs', 'bus', 'flight'].includes(lower)) return 'Travel';
    if (['jobs', 'job', 'hiring', 'career', 'recruitment'].includes(lower)) return 'Jobs';
    if (['daily needs', 'daily need', 'daily-needs', 'dailyneeds', 'grocery', 'groceries'].includes(lower)) return 'Daily Needs';
    if (['products', 'product'].includes(lower)) return 'Products';

    // Subcategory matches
    if (['doctor', 'clinic', 'hospital', 'physiotherapy', 'home service', 'repair', 'plumbing', 'electrician', 'cleaning', 'salon', 'spa', 'consulting', 'fitness', 'gym', 'automobile', 'car service', 'recharge', 'education', 'tutoring', 'photography', 'event management', 'laundry', 'carpentry', 'painter', 'pest control', 'legal', 'financial', 'insurance', 'maintenance'].some(k => lower === k || lower.includes(k))) return 'Services';
    if (['parotta', 'biryani', 'biriyani', 'dosa', 'idli', 'thali', 'pizza', 'burger', 'fast food', 'south indian', 'north indian', 'bakery', 'beverages', 'catering', 'home food', 'tiramisu', 'cafe', 'salad', 'sweets', 'ice cream', 'dessert', 'snack'].some(k => lower === k || lower.includes(k))) return 'Food';
    if (['villa', 'pg', 'hostel', 'apartment', 'lodge', 'room', 'accommodation', 'suite'].some(k => lower === k || lower.includes(k))) return 'Stay';
    if (['taxi', 'sleeper', 'train', 'car rental', 'bike rental', 'tour package', 'ticket', 'transport'].some(k => lower === k || lower.includes(k))) return 'Travel';
    if (['full time', 'part time', 'full stack', 'developer', 'software engineer', 'it jobs', 'non-it jobs', 'bpo jobs', 'opening', 'vacancy', 'employment'].some(k => lower === k || lower.includes(k))) return 'Jobs';
    if (['rice', 'egg', 'eggs', 'fruits', 'vegetables', 'dairy', 'milk', 'supermarket', 'pharmacy', 'medicine', 'organic', 'staples', 'provisions'].some(k => lower === k || lower.includes(k))) return 'Daily Needs';
    if (['saree', 'fashion', 'electronics', 'mobile', 'mobiles', 'smartphone', 'laptop', 'watch', 'jewellery', 'jewelry', 'furniture', 'appliance', 'jean', 'jeans', 'shoes', 'footwear', 'clothing', 'shirt', 'headphone', 'phone'].some(k => lower === k || lower.includes(k))) return 'Products';

    return null;
  };

  // 1. Check explicit fields first
  const subNavMatch = matchMainCat(rawSubNav);
  if (subNavMatch) return subNavMatch;

  const mainCatMatch = matchMainCat(rawMainCat);
  if (mainCatMatch) return mainCatMatch;

  const catMatch = matchMainCat(rawCat);
  if (catMatch) return catMatch;

  const subCatMatch = matchMainCat(rawSubCat);
  if (subCatMatch) return subCatMatch;

  const subSubCatMatch = matchMainCat(rawSubSubCat);
  if (subSubCatMatch) return subSubCatMatch;

  const tagMatch = matchMainCat(rawTag);
  if (tagMatch) return tagMatch;

  const typeMatch = matchMainCat(rawType);
  if (typeMatch) return typeMatch;

  // 2. Check for Jobs specific indicators (jobTitle, jobLocation, salary)
  if (p.jobTitle || p.jobLocation || p.experienceRequired || p.minExperience) {
    return 'Jobs';
  }

  // 3. Check product name/title
  const nameMatch = matchMainCat(rawName);
  if (nameMatch) return nameMatch;

  return rawSubNav || rawMainCat || 'Products';
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

  getCachedProducts: () => {
    try {
      const cached = localStorage.getItem('connect_cached_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
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
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`${getVendorBackendUrl()}/api/public/products?t=${Date.now()}`, { 
        signal: controller.signal,
        cache: 'no-store'
      }).catch(err => {
        return null;
      });
      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        const rawList = Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : (data && Array.isArray(data.data) ? data.data : []));
        if (Array.isArray(rawList)) {
          const vendorProducts = filterVendorAddedOnly(rawList);
          try {
            localStorage.setItem('connect_cached_products', JSON.stringify(vendorProducts));
          } catch(e) {}
          return { success: true, products: vendorProducts, source: 'live' };
        }
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        console.warn("Failed to fetch products from vendor backend:", err);
      }
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
