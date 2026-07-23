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

const DEFAULT_BASELINE_PRODUCTS = [
  // FOOD
  {
    id: 'base-food-1',
    name: 'Parotta & Special Curry',
    category: 'South Indian',
    subcategory: 'Parotta',
    subNavbarCategory: 'Food',
    price: 70,
    originalPrice: 77,
    rating: 4.5,
    reviews: 120,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Annapoorna Hotel',
    city: 'Bangalore',
    foodType: 'Veg',
    description: 'Fresh hot flaky parottas served with spicy veg kurma and salna.'
  },
  {
    id: 'base-food-2',
    name: 'Hyderabadi Dum Chicken Biryani',
    category: 'Biryani',
    subcategory: 'Biryani',
    subNavbarCategory: 'Food',
    price: 240,
    originalPrice: 290,
    rating: 4.8,
    reviews: 350,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Paradise Biryani',
    city: 'Hyderabad',
    foodType: 'Non-Veg',
    description: 'Authentic dum biryani made with long grain basmati rice and tender chicken.'
  },
  {
    id: 'base-food-3',
    name: 'The Rameshwaram Ghee Podi Dosa',
    category: 'South Indian',
    subcategory: 'Dosa',
    subNavbarCategory: 'Food',
    price: 110,
    originalPrice: 130,
    rating: 4.9,
    reviews: 580,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Rameshwaram Cafe',
    city: 'Bangalore',
    foodType: 'Veg',
    description: 'Crispy ghee podi dosa loaded with authentic podi spice mix and fresh butter.'
  },
  // TRAVEL
  {
    id: 'base-travel-1',
    name: 'City Cab & Taxi Service',
    category: 'Cab',
    subcategory: 'Taxi',
    subNavbarCategory: 'Travel',
    price: 300,
    originalPrice: 341,
    rating: 4.5,
    reviews: 120,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Connect Cabs',
    city: 'Bangalore',
    description: 'On-demand AC Sedan cab for local city rides and airport pickup.'
  },
  {
    id: 'base-travel-2',
    name: 'Intercity AC Sleeper Bus',
    category: 'Bus',
    subcategory: 'AC Sleeper',
    subNavbarCategory: 'Travel',
    price: 850,
    originalPrice: 1100,
    rating: 4.7,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=60',
    vendorName: 'KSRTC / Private Express',
    city: 'Bangalore',
    fromCity: 'Bangalore',
    toCity: 'Chennai',
    busType: 'AC',
    busClass: 'Sleeper',
    description: 'Luxury AC multi-axle sleeper bus with live tracking and charging ports.'
  },
  // STAY
  {
    id: 'base-stay-1',
    name: 'Hotel Shubha Sai Deluxe Stay',
    category: 'Hotels',
    subcategory: 'Deluxe Rooms',
    subNavbarCategory: 'Stay',
    price: 1800,
    originalPrice: 2400,
    rating: 4.8,
    reviews: 190,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Shubha Sai Hospitality',
    city: 'Bangalore',
    description: 'Premium air-conditioned hotel room with king bed, complimentary breakfast and Wi-Fi.'
  },
  {
    id: 'base-stay-2',
    name: 'Royal Orchid Luxury Suite',
    category: 'Hotels',
    subcategory: 'Luxury Stay',
    subNavbarCategory: 'Stay',
    price: 4500,
    originalPrice: 5900,
    rating: 4.9,
    reviews: 310,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Royal Orchid Group',
    city: 'Bangalore',
    description: '5-Star luxury suite featuring city view balcony, swimming pool and breakfast buffet.'
  },
  // SERVICES
  {
    id: 'base-service-1',
    name: 'Dr. Robert Wilson (Cardiologist)',
    category: 'Healthcare',
    subcategory: 'Doctors',
    subNavbarCategory: 'Services',
    price: 800,
    originalPrice: 1000,
    rating: 4.9,
    reviews: 230,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Apollo Speciality Clinic',
    city: 'Bangalore',
    description: 'Senior Consultant Cardiologist with 15+ years experience.'
  },
  {
    id: 'base-service-2',
    name: 'AC Repair & Servicing',
    category: 'Home Services',
    subcategory: 'Appliance Repair',
    subNavbarCategory: 'Services',
    price: 499,
    originalPrice: 899,
    rating: 4.7,
    reviews: 440,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Connect Tech Care',
    city: 'Bangalore',
    description: 'Comprehensive split/window AC jet service, gas top-up and filter cleaning.'
  },
  // PRODUCTS
  {
    id: 'base-product-1',
    name: 'Kanjeevaram Soft Silk Saree',
    category: 'Fashion',
    subcategory: 'Saree',
    subNavbarCategory: 'Products',
    price: 2499,
    originalPrice: 3999,
    rating: 4.8,
    reviews: 165,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Pothys Silks',
    city: 'Chennai',
    color: 'Red',
    description: 'Pure Kanjeevaram woven silk saree with rich zari border and unstitched blouse.'
  },
  {
    id: 'base-product-2',
    name: 'iPhone 15 Pro (128GB)',
    category: 'Electronics',
    subcategory: 'Mobiles',
    subNavbarCategory: 'Products',
    price: 79900,
    originalPrice: 89900,
    rating: 4.9,
    reviews: 510,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Apple Official Partner',
    city: 'Bangalore',
    description: 'Titanium design, A17 Pro chip, 48MP main camera and USB-C.'
  },
  // DAILY NEEDS
  {
    id: 'base-daily-1',
    name: 'Sona Masoori Premium Rice (25kg)',
    category: 'Grocery',
    subcategory: 'Rice',
    subNavbarCategory: 'Daily Needs',
    price: 1350,
    originalPrice: 1550,
    rating: 4.8,
    reviews: 290,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
    vendorName: 'BigBasket Wholesale',
    city: 'Bangalore',
    description: '100% aged raw Sona Masoori rice, cleaned and packed hygienically.'
  },
  {
    id: 'base-daily-2',
    name: 'Farm Fresh White Eggs (30 Pack)',
    category: 'Dairy & Eggs',
    subcategory: 'Eggs',
    subNavbarCategory: 'Daily Needs',
    price: 190,
    originalPrice: 220,
    rating: 4.7,
    reviews: 140,
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=60',
    vendorName: 'FarmFresh Supermarket',
    city: 'Bangalore',
    description: 'Antibiotic-free fresh table eggs sourced directly from farms.'
  },
  // JOBS
  {
    id: 'base-job-1',
    name: 'Senior Full Stack Developer',
    category: 'IT Jobs',
    subcategory: 'Software Engineering',
    subNavbarCategory: 'Jobs',
    tag: 'Jobs',
    price: 45000,
    originalPrice: 55000,
    rating: 4.8,
    reviews: 80,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60',
    vendorName: 'SK Technologies',
    city: 'Bangalore',
    description: 'Full-time position for Node.js & React developer with 3+ years experience.'
  },
  {
    id: 'base-job-2',
    name: 'hi Job - Full Stack Developer',
    category: 'Full Time',
    subcategory: 'IT Jobs',
    subNavbarCategory: 'Jobs',
    tag: 'Jobs',
    price: 50000,
    originalPrice: 65000,
    rating: 4.9,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=60',
    vendorName: 'SK Technologies',
    city: 'Bangalore',
    description: 'Full-time opening for MERN Stack Developer. Competitive salary & remote options.'
  },
  {
    id: 'base-job-3',
    name: 'Business Operations Manager',
    category: 'Management',
    subcategory: 'Operations',
    subNavbarCategory: 'Jobs',
    tag: 'Jobs',
    price: 60000,
    originalPrice: 75000,
    rating: 4.7,
    reviews: 64,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop&q=60',
    vendorName: 'Connect Corp',
    city: 'Bangalore',
    description: 'Lead operations and client service teams for local enterprise partnerships.'
  }
];

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
    const mergeWithBaseline = (fetchedList) => {
      const sanitizedFetched = Array.isArray(fetchedList) ? fetchedList.map(sanitizeProduct) : [];
      const fetchedNames = new Set(sanitizedFetched.map(p => (p.name || '').toLowerCase().trim()));
      
      const baselineToAdd = DEFAULT_BASELINE_PRODUCTS.filter(bp => !fetchedNames.has((bp.name || '').toLowerCase().trim()));
      return [...sanitizedFetched, ...baselineToAdd];
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
          return { success: true, products: merged };
        }
      }
    } catch (err) {
      console.warn("Failed to fetch products from vendor backend (using persistent local cache):", err);
    }

    const localCached = getLocalCache();
    if (localCached) {
      return { success: true, products: localCached };
    }

    return { success: true, products: mergeWithBaseline([]) };
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
