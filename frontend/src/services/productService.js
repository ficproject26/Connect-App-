import { getBackendUrl, getVendorBackendUrl } from './apiSetup';

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

  // 1. Check Vendor Status
  if (p.vendorIsActive === false || p.isVendorSuspended === true || p.isSuspended === true) return false;
  const vStatus = (p.vendorStatus || p.vendor_status || '').toString().toLowerCase().trim();
  if (['suspended', 'inactive', 'rejected', 'deactivated', 'blocked'].includes(vStatus)) return false;

  // 2. Check Business Outlet Status
  if (p.businessIsActive === false || p.business_is_active === false) return false;
  const bStatus = (p.businessStatus || p.business_status || '').toString().toLowerCase().trim();
  if (['suspended', 'inactive', 'rejected', 'deactivated', 'blocked'].includes(bStatus)) return false;

  // 3. Check Listing Status
  if (p.isActive === false || p.isAvailable === false || p.listingIsActive === false) return false;
  const lStatus = (p.status || p.listingStatus || '').toString().toLowerCase().trim();
  if (['suspended', 'inactive', 'rejected', 'deactivated', 'blocked'].includes(lStatus)) return false;

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

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';

const sanitizeImageUrl = (imgUrl) => {
  if (!imgUrl || typeof imgUrl !== 'string') return DEFAULT_FALLBACK_IMAGE;
  let url = imgUrl.trim();
  if (!url || url === 'null' || url === 'undefined') return DEFAULT_FALLBACK_IMAGE;

  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  if (url.includes('/uploads/')) {
    const relativePath = url.substring(url.indexOf('/uploads/'));
    if (isHttps) {
      return relativePath;
    }
    let backendUrl = getVendorBackendUrl() || getBackendUrl();
    if (!backendUrl || !backendUrl.startsWith('http')) {
      backendUrl = 'http://13.203.197.69:8002';
    }
    return `${backendUrl}${relativePath}`;
  }

  if (isHttps && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }

  let backendUrl = getVendorBackendUrl() || getBackendUrl();
  if (!backendUrl || !backendUrl.startsWith('http')) {
    backendUrl = isHttps ? '' : 'http://13.203.197.69:8002';
  }

  if (url.includes('trycloudflare.com') || url.includes(':8000') || url.includes(':8001') || url.includes('43.204.141.105') || url.includes('13.203.197.69')) {
    if (isHttps) {
      const pathIndex = url.indexOf('/', url.indexOf('://') + 3);
      return pathIndex !== -1 ? url.substring(pathIndex) : url.replace('http://', 'https://');
    }
    return url.replace(/^https?:\/\/[^/]+/, backendUrl);
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    if (isHttps) {
      return cleanPath;
    }
    return `${backendUrl}${cleanPath}`;
  }

  return url;
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
  const rawImg = p.image || p.imageUrl || (p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : '') || p.img || '';
  updated.image = sanitizeImageUrl(rawImg);
  if (Array.isArray(p.images) && p.images.length > 0) {
    updated.images = p.images.map(sanitizeImageUrl);
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

  getProducts: async () => {
    const filterVendorAddedOnly = (fetchedList) => {
      const sanitized = Array.isArray(fetchedList) ? fetchedList.map(sanitizeProduct) : [];
      return sanitized.filter(isRealVendorProduct);
    };

    const baseVendorUrl = getVendorBackendUrl();
    const baseUrl = getBackendUrl();
    const endpoints = [
      '/api/public/products',
      baseVendorUrl ? `${baseVendorUrl}/api/public/products` : null,
      baseUrl ? `${baseUrl}/api/public/products` : null
    ];
    const uniqueEndpoints = [...new Set(endpoints.filter(Boolean))];

    for (const endpoint of uniqueEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(`${endpoint}?t=${Date.now()}`, { 
          signal: controller.signal,
          cache: 'no-store'
        }).catch(() => null);
        clearTimeout(timeoutId);

        if (res && res.status === 401) {
          continue;
        }

        if (res && res.ok) {
          const data = await res.json().catch(() => null);
          const rawList = Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : (data && Array.isArray(data.data) ? data.data : []));
          if (Array.isArray(rawList)) {
            const vendorProducts = filterVendorAddedOnly(rawList);
            try {
              if (vendorProducts.length > 0) {
                localStorage.setItem('connect_cached_products', JSON.stringify(vendorProducts));
              }
            } catch(e) {}
            return { success: true, products: vendorProducts, source: 'live' };
          }
        }
      } catch (err) {}
    }

    const cached = productService.getCachedProducts();
    if (cached.length > 0) {
      return { success: true, products: cached, source: 'cache' };
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
