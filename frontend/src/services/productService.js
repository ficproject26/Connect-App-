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

const extractRawImage = (p) => {
  if (!p) return '';
  if (typeof p.image === 'string' && p.image.trim()) return p.image.trim();
  if (typeof p.imageUrl === 'string' && p.imageUrl.trim()) return p.imageUrl.trim();
  if (typeof p.imageURL === 'string' && p.imageURL.trim()) return p.imageURL.trim();
  if (typeof p.imgUrl === 'string' && p.imgUrl.trim()) return p.imgUrl.trim();
  if (typeof p.serviceImage === 'string' && p.serviceImage.trim()) return p.serviceImage.trim();
  if (typeof p.catalogImage === 'string' && p.catalogImage.trim()) return p.catalogImage.trim();
  if (typeof p.productImage === 'string' && p.productImage.trim()) return p.productImage.trim();
  if (typeof p.thumbnailUrl === 'string' && p.thumbnailUrl.trim()) return p.thumbnailUrl.trim();
  if (typeof p.thumbnailURL === 'string' && p.thumbnailURL.trim()) return p.thumbnailURL.trim();
  if (typeof p.mediaUrl === 'string' && p.mediaUrl.trim()) return p.mediaUrl.trim();
  if (typeof p.mediaURL === 'string' && p.mediaURL.trim()) return p.mediaURL.trim();
  if (typeof p.media === 'string' && p.media.trim()) return p.media.trim();
  
  if (Array.isArray(p.images) && p.images.length > 0) {
    const first = p.images[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (first && typeof first === 'object') {
      const url = first.url || first.src || first.path || first.imageUrl || first.imageURL || first.location || '';
      if (url && typeof url === 'string' && url.trim()) return url.trim();
    }
  }
  if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) {
    const first = p.imageUrls[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
  }

  if (typeof p.photo === 'string' && p.photo.trim()) return p.photo.trim();
  if (Array.isArray(p.photos) && p.photos.length > 0) {
    const first = p.photos[0];
    if (typeof first === 'string' && first.trim()) return first.trim();
    if (first && typeof first === 'object') {
      const url = first.url || first.src || first.path || first.imageUrl || first.imageURL || '';
      if (url && typeof url === 'string' && url.trim()) return url.trim();
    }
  }

  if (typeof p.picture === 'string' && p.picture.trim()) return p.picture.trim();
  if (typeof p.thumbnail === 'string' && p.thumbnail.trim()) return p.thumbnail.trim();
  if (typeof p.img === 'string' && p.img.trim()) return p.img.trim();
  if (typeof p.file === 'string' && p.file.trim()) return p.file.trim();
  if (typeof p.coverImage === 'string' && p.coverImage.trim()) return p.coverImage.trim();
  if (typeof p.bannerImage === 'string' && p.bannerImage.trim()) return p.bannerImage.trim();

  return '';
};

export const NEUTRAL_NO_IMAGE_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" fill="%23f8fafc"><rect width="400" height="300" fill="%23f8fafc"/><g transform="translate(170,110)" fill="%23cbd5e1"><path d="M5 0h50a5 5 0 0 1 5 5v40a5 5 0 0 1-5 5H5a5 5 0 0 1-5-5V5a5 5 0 0 1 5-5zm45 40V10H10v30h40zM17 22l8 10 6-6 12 14H17z"/><circle cx="20" cy="18" r="4"/></g><text x="200" y="185" font-family="sans-serif" font-size="13" font-weight="700" fill="%2394a3b8" text-anchor="middle">No image available</text></svg>`;

export const getCategoryFallbackImage = (pContext) => {
  return NEUTRAL_NO_IMAGE_PLACEHOLDER;
};

export const sanitizeImageUrl = (imgUrl, pContext = null) => {
  if (!imgUrl || typeof imgUrl !== 'string') return getCategoryFallbackImage(pContext);
  let url = imgUrl.trim();
  if (!url || url === 'null' || url === 'undefined' || url === 'false' || url === 'none') return getCategoryFallbackImage(pContext);

  if (url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('blob:')) {
    try {
      if (typeof window !== 'undefined' && url.includes(window.location.host)) {
        return url;
      }
    } catch (e) {}
    return getCategoryFallbackImage(pContext);
  }

  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    const baseBackend = typeof getBackendUrl === 'function' ? getBackendUrl() : '';
    if (baseBackend && !cleanPath.startsWith('http')) {
      return `${baseBackend.replace(/\/+$/, '')}${cleanPath}`;
    }
    return cleanPath;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('unsplash.com')) {
      const unsplashFallbacks = [
        'photo-1526738549149', 'photo-1565299624946', 'photo-1566073771259',
        'photo-1581578731548', 'photo-1544620347', 'photo-1486406146926',
        'photo-1542838132', 'photo-1511707171634'
      ];
      if (unsplashFallbacks.some(fb => url.includes(fb))) {
        return getCategoryFallbackImage(pContext);
      }
    }
    return url;
  }

  return getCategoryFallbackImage(pContext);
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

  // Infer category context first for fallback selection if needed
  updated.subNavbarCategory = inferSubNavbarCategory(updated);

  // Extract raw vendor uploaded image
  const rawImg = extractRawImage(p);
  updated.image = sanitizeImageUrl(rawImg, updated);

  const rawImagesList = [];
  if (rawImg) rawImagesList.push(rawImg);

  const extractUrlFromItem = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item.trim();
    if (typeof item === 'object') {
      return (item.url || item.src || item.path || item.imageUrl || item.imageURL || item.location || '').toString().trim();
    }
    return '';
  };

  if (Array.isArray(p.images) && p.images.length > 0) {
    p.images.forEach(img => {
      const url = extractUrlFromItem(img);
      if (url) rawImagesList.push(url);
    });
  }
  if (Array.isArray(p.photos) && p.photos.length > 0) {
    p.photos.forEach(img => {
      const url = extractUrlFromItem(img);
      if (url) rawImagesList.push(url);
    });
  }
  if (Array.isArray(p.imageUrls) && p.imageUrls.length > 0) {
    p.imageUrls.forEach(img => {
      const url = extractUrlFromItem(img);
      if (url) rawImagesList.push(url);
    });
  }

  // Sanitize all image URLs first, then deduplicate exact sanitized URLs
  const sanitizedList = rawImagesList.map(imgStr => sanitizeImageUrl(imgStr, updated)).filter(Boolean);
  const uniqueSanitized = Array.from(new Set(sanitizedList));

  if (uniqueSanitized.length > 0) {
    updated.images = uniqueSanitized;
    if (!updated.image || updated.image.includes('unsplash.com')) {
      updated.image = uniqueSanitized[0];
    }
  } else {
    updated.images = [updated.image];
  }

  for (const key in updated) {
    if (typeof updated[key] === 'string') {
      updated[key] = sanitizeString(updated[key]);
    } else if (Array.isArray(updated[key])) {
      updated[key] = updated[key].map(item => typeof item === 'string' ? sanitizeString(item) : item);
    }
  }

  return updated;
};

let activeGetProductsPromise = null;
let memoryProductCache = null;

try {
  if (typeof window !== 'undefined') {
    const saved = window.sessionStorage?.getItem('cached_vendor_products') || window.localStorage?.getItem('cached_vendor_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProductCache = parsed;
      }
    }
  }
} catch (e) {}

export const productService = {
  clearCache: () => {
    activeGetProductsPromise = null;
    memoryProductCache = null;
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage?.removeItem('cached_vendor_products');
        window.localStorage?.removeItem('cached_vendor_products');
      }
    } catch (e) {}
  },

  getCachedProducts: () => {
    return memoryProductCache || [];
  },

  getProducts: async (forceRefresh = false) => {
    if (!forceRefresh && Array.isArray(memoryProductCache) && memoryProductCache.length > 0) {
      if (!activeGetProductsPromise) {
        productService.getProducts(true).catch(() => {});
      }
      return { success: true, products: memoryProductCache, source: 'cache' };
    }

    if (activeGetProductsPromise) {
      return activeGetProductsPromise;
    }

    activeGetProductsPromise = (async () => {
      try {
        const filterVendorAddedOnly = (fetchedList) => {
          const sanitized = Array.isArray(fetchedList) ? fetchedList.map(sanitizeProduct) : [];
          return sanitized.filter(isRealVendorProduct);
        };

        const baseVendorUrl = getVendorBackendUrl();
        const baseUrl = getBackendUrl();
        const endpoints = [
          baseVendorUrl ? `${baseVendorUrl}/api/public/products` : null,
          baseUrl ? `${baseUrl}/api/public/products` : null,
          '/api/public/products',
          'https://connect-app-7s6g.onrender.com/api/public/products'
        ];
        const uniqueEndpoints = [...new Set(endpoints.filter(Boolean))];

        const fetchEndpoint = (endpoint) => {
          return new Promise(async (resolve, reject) => {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000);

              const res = await fetch(`${endpoint}?t=${Date.now()}`, { 
                signal: controller.signal,
                cache: 'no-store'
              }).catch(() => null);
              clearTimeout(timeoutId);

              if (res && res.ok) {
                const data = await res.json().catch(() => null);
                const rawList = Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : (data && Array.isArray(data.data) ? data.data : []));
                if (Array.isArray(rawList)) {
                  const vendorProducts = filterVendorAddedOnly(rawList);
                  if (vendorProducts.length > 0) {
                    return resolve(vendorProducts);
                  }
                }
              }
              reject(new Error(`Failed endpoint ${endpoint}`));
            } catch (err) {
              reject(err);
            }
          });
        };

        try {
          const fastestProducts = await Promise.any(uniqueEndpoints.map(ep => fetchEndpoint(ep)));
          if (Array.isArray(fastestProducts) && fastestProducts.length > 0) {
            memoryProductCache = fastestProducts;
            try {
              if (typeof window !== 'undefined') {
                window.sessionStorage?.setItem('cached_vendor_products', JSON.stringify(fastestProducts));
                window.localStorage?.setItem('cached_vendor_products', JSON.stringify(fastestProducts));
              }
            } catch (e) {}
            return { success: true, products: fastestProducts, source: 'live' };
          }
        } catch (raceErr) {
          for (const endpoint of uniqueEndpoints) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 8000);

              const res = await fetch(`${endpoint}?t=${Date.now()}`, { 
                signal: controller.signal,
                cache: 'no-store'
              }).catch(() => null);
              clearTimeout(timeoutId);

              if (res && res.ok) {
                const data = await res.json().catch(() => null);
                const rawList = Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : (data && Array.isArray(data.data) ? data.data : []));
                if (Array.isArray(rawList)) {
                  const vendorProducts = filterVendorAddedOnly(rawList);
                  if (vendorProducts.length > 0) {
                    memoryProductCache = vendorProducts;
                    try {
                      if (typeof window !== 'undefined') {
                        window.sessionStorage?.setItem('cached_vendor_products', JSON.stringify(vendorProducts));
                        window.localStorage?.setItem('cached_vendor_products', JSON.stringify(vendorProducts));
                      }
                    } catch (e) {}
                    return { success: true, products: vendorProducts, source: 'live' };
                  }
                }
              }
            } catch (err) {}
          }
        }

        if (Array.isArray(memoryProductCache) && memoryProductCache.length > 0) {
          return { success: true, products: memoryProductCache, source: 'cache_fallback' };
        }

        return { success: true, products: [], source: 'empty' };
      } finally {
        activeGetProductsPromise = null;
      }
    })();

    return activeGetProductsPromise;
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
