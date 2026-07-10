import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiFetch } from '../../services/api';
import { productService } from '../../services/productService';
import { socketService } from '../../services/socketService';
import useCustomer from '../../hooks/useCustomer';
import WalletPage from './Wallet';

// Fix leaflet marker default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { 
  Search, Star, SlidersHorizontal, ShoppingBag, Check, Plus, X, Zap,
  ChevronLeft, ChevronRight, Sparkles, Percent, Heart, ShieldCheck, 
  ShoppingCart, Truck, User, Info, RefreshCw, ChevronDown, ChevronUp,
  LayoutDashboard, CreditCard, Gift, BedDouble, Plane, Wallet, Receipt, Award, 
  LifeBuoy, LogOut, MapPin, Phone, Bell, Copy, Briefcase, Utensils, UserCheck, Settings,
  Activity, GraduationCap, Building2, Landmark, ShieldAlert, Sun, Moon,
  Gem, CheckCircle2
} from 'lucide-react';

import saree1 from '../../assets/images/saree_1.png';
import saree2 from '../../assets/images/saree_2.png';
import saree3 from '../../assets/images/saree_3.png';
import saree4 from '../../assets/images/saree_4.png';
import luxuryWatch from '../../assets/images/luxury_watch.png';
import logoImg from '../../assets/images/forge india logo.jpg';
import hotelActual from '../../assets/images/hotel_shubha_sai_actual.png';
import skMockup from '../../assets/images/sk_technologies_mockup.png';
import shoppingBannerCouple from '../../assets/images/shopping_banner_couple.png';

const initialProducts = [];

const getProductDescription = (product) => {
  if (!product) return '';
  if (product.description) return product.description;
  
  const name = product.name || '';
  const category = product.category || '';
  
  if (category === 'Smartphones') {
    return `The ${name} features a stunning display, advanced camera systems, and lightning-fast performance. Optimized for Connect App members with exclusive extended warranty and premium package treatment.`;
  }
  if (category === 'Television') {
    return `Enjoy an immersive theater experience with the ${name}. With true-to-life color reproduction, high-fidelity sound output, and smart connectivity, it is the perfect centerpiece for your living room.`;
  }
  if (category === 'Headphones') {
    return `Immerse yourself in pure sound with the ${name}. Featuring state-of-the-art active noise cancellation, heavy bass response, and ergonomic design for all-day comfort.`;
  }
  if (category === 'Laptops') {
    return `Power through your workday with the ${name}. Lightweight yet powerful, featuring robust security, massive memory, and battery life to keep you productive on the go.`;
  }
  if (category === 'Sarees') {
    return `Elegant and traditional, the ${name} is crafted from premium silk and detailed patterns. Perfect for festive occasions and celebrations, showcasing exquisite craftsmanship.`;
  }
  if (category === 'Shirts') {
    return `Tailored for style and premium comfort, this ${name} features high-quality breathable cotton, perfect for both corporate settings and casual outings.`;
  }
  if (category === 'Shoes') {
    return `Step up your performance with the ${name}. Designed with cushioned support, skid-resistant soles, and breathable fabric for maximum endurance and lightweight strides.`;
  }
  if (category === 'Beauty') {
    return `Enhance your daily care routine with ${name}. Formulated with organic ingredients, dermatologist-tested, and tailored for glowing, healthy results.`;
  }
  if (category === 'Bags') {
    return `Designed for the modern professional, the ${name} combines spacious compartments with elegant design, crafted from durable premium leather materials.`;
  }
  if (category === 'Watches') {
    return `A masterpiece of precision engineering, the ${name} combines heritage luxury design with modern durability. Water-resistant and perfect for any outfit.`;
  }
  if (category === 'Kurtis' || category === 'T-shirts') {
    return `Comfortable and fashionable, this ${name} is made from ultra-soft cotton. Durable colors and perfect fit for everyday wear.`;
  }
  if (category === 'Home Decor') {
    return `Transform your home aesthetics with the ${name}. Elevate your space with superior textures, elegant finishes, and curated styling options.`;
  }
  if (category === 'Stay') {
    return `Unwind in luxury at the ${name}. Featuring private dining options, premium room setups, and premium spa access exclusively for Connect members.`;
  }
  if (category === 'Services') {
    return `Boost your business efficiency with ${name}. Delivered by certified industry professionals with dedicated post-delivery support and milestones tracking.`;
  }
  if (category === 'Food') {
    return `Savor the gourmet tastes with our exclusive ${name}. Prepared by top-rated chefs using fresh, organic ingredients. Free delivery for active members.`;
  }
  if (category === 'Travel') {
    return `Unlock luxury travel options with the ${name}. Includes airport fast-track clearance, premium lounge amenities, and custom travel routing.`;
  }
  if (category === 'Daily Needs') {
    return `Stock up on fresh essentials with the ${name}. Locally sourced, handpicked for quality, and delivered straight to your door within hours.`;
  }
  return `${name} is a premium offering available exclusively to Connect App members. Enjoy member-only discounts, priority service, and seamless delivery. Add to cart to claim your exclusive member pricing and earn reward points on this purchase.`;
};

export default function CustomerDashboard({ currentUser, onLogOut, onJobsClick, onCategoryClick }) {
  const { walletBalance, membershipTier, updateTier, addTransaction } = useCustomer();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );
  
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadVendorProducts = async () => {
      try {
        const res = await productService.getProducts();
        if (res && res.success && Array.isArray(res.products)) {
          setProducts(res.products);
        }
      } catch (err) {
        console.warn("Failed to load vendor products dynamically:", err);
      }
    };
    loadVendorProducts();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };


  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    city: 'Bangalore',
    state: 'Karnataka',
    area: 'Koramangala, 5th Block'
  });
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [recentLocations, setRecentLocations] = useState([
    { city: 'Bangalore', state: 'Karnataka', area: 'Koramangala, 5th Block' },
    { city: 'Chennai', state: 'Tamil Nadu', area: 'Anna Nagar' },
    { city: 'Krishnagiri', state: 'Tamil Nadu', area: 'Krishnagiri Town' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [isSearchCategoryDropdownOpen, setIsSearchCategoryDropdownOpen] = useState(false);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);
  const [isArModalOpen, setIsArModalOpen] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [selectedSubNavbarCategory, setSelectedSubNavbarCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('Home'); // 'Home', 'Services', 'Products', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Offers'
  const [previewMembershipTier, setPreviewMembershipTier] = useState(membershipTier || 'Gold Elite');

  useEffect(() => {
    setPreviewMembershipTier(membershipTier || 'Gold Elite');
  }, [membershipTier]);

  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Category-specific Filter States
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([]);
  const [selectedLocTypes, setSelectedLocTypes] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedDistances, setSelectedDistances] = useState([]);
  const [selectedAccomTypes, setSelectedAccomTypes] = useState([]);
  const [selectedTravelTypes, setSelectedTravelTypes] = useState([]);
  const [selectedDailyNeedsTypes, setSelectedDailyNeedsTypes] = useState([]);
  const [selectedJobDepts, setSelectedJobDepts] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedJobSalaries, setSelectedJobSalaries] = useState([]);

  // Profile Modal State
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('orders'); // 'orders' | 'settings' | 'card' | 'edit'
  const [profileName, setProfileName] = useState(() => {
    const savedUser = localStorage.getItem('connect_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        return u.name || currentUser?.name || 'Dhanush Kumar';
      } catch (e) {}
    }
    return currentUser?.name || 'Dhanush Kumar';
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    const savedUser = localStorage.getItem('connect_current_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        return u.email || currentUser?.email || 'dhanush.kumar@gmail.com';
      } catch (e) {}
    }
    return currentUser?.email || 'dhanush.kumar@gmail.com';
  });
  const [profilePhone, setProfilePhone] = useState(() => {
    return localStorage.getItem('connect_profile_phone') || '+91 98765 43210';
  });
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [settingsNotify, setSettingsNotify] = useState(true);
  const [settingsSMS, setSettingsSMS] = useState(false);
  const [settingsSecurity, setSettingsSecurity] = useState(true);

  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('connect_customer_addresses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.warn("Failed to parse connect_customer_addresses from localStorage:", err);
      }
    }
    return [
      {
        id: 'addr1',
        name: 'Dhanush Kumar',
        phone: '9876543210',
        pincode: '560001',
        locality: 'Indiranagar',
        address: '123, 4th Cross, 10th Main Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        landmark: 'Near Metro Station',
        altPhone: '',
        type: 'Home'
      }
    ];
  });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    altPhone: '',
    type: 'Home'
  });

  useEffect(() => {
    localStorage.setItem('connect_customer_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    if (currentUser) {
      const savedUser = localStorage.getItem('connect_current_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setProfileName(u.name || currentUser.name);
          setProfileEmail(u.email || currentUser.email);
          return;
        } catch (e) {}
      }
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
    }
  }, [currentUser]);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Delivery Tracking State Variables
  const [customerOrders, setCustomerOrders] = useState([]);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [trackingTimeline, setTrackingTimeline] = useState([]);
  const [trackingPartner, setTrackingPartner] = useState(null);
  const [trackingCoords, setTrackingCoords] = useState(null);
  const [eta, setEta] = useState(null);
  const [distanceRemaining, setDistanceRemaining] = useState(null);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);

  // Map references
  const customerMapRef = useRef(null);
  const customerRiderMarkerRef = useRef(null);
  const customerRoutePolylineRef = useRef(null);


  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setSelectedProduct(null);
  }, [activeTab, selectedSubNavbarCategory]);

  const [activeProductImage, setActiveProductImage] = useState(null);
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);
  const [activeJobCategory, setActiveJobCategory] = useState('ALL');
  const [activeServiceCategory, setActiveServiceCategory] = useState('ALL');
  const [activeProductCategory, setActiveProductCategory] = useState('ALL');
  const [activeDailyNeedsCategory, setActiveDailyNeedsCategory] = useState('ALL');
  const [activeFoodCategory, setActiveFoodCategory] = useState('ALL');
  const [activeStayCategory, setActiveStayCategory] = useState('ALL');
  const [activeTravelCategory, setActiveTravelCategory] = useState('ALL');

  // --- DELIVERY TRACKING LOGIC & LIFECYCLES ---

  const loadCustomerOrders = async () => {
    try {
      const res = await apiFetch('/orders');
      if (res.status === 'success') {
        const name = profileName || currentUser?.name || 'Dhanush Kumar';
        const filtered = (res.data || []).filter(o => o.customer_name === name);
        setCustomerOrders(filtered);
      }
    } catch (err) {
      console.warn('Failed to load customer orders:', err);
    }
  };

  const refreshTrackingDetails = async (orderId) => {
    try {
      const res = await apiFetch(`/orders/${orderId}`);
      if (res.status === 'success') {
        const { order, timeline, partner, tracking } = res.data;
        setTrackingTimeline(timeline || []);
        setTrackingPartner(partner || null);
        if (tracking && tracking.latitude) {
          setTrackingCoords([tracking.latitude, tracking.longitude]);
        } else if (partner && partner.current_latitude) {
          setTrackingCoords([partner.current_latitude, partner.current_longitude]);
        }
      }
    } catch (e) {
      console.warn('Failed to load tracking details:', e);
    }
  };

  const submitRating = async (e) => {
    e.preventDefault();
    if (!ratingOrder) return;

    try {
      const partnerId = trackingPartner?.id || 'dp1';
      const res = await apiFetch(`/orders/${ratingOrder.id}/rate`, {
        method: 'POST',
        body: JSON.stringify({
          rating: ratingValue,
          comment: ratingComment,
          role: 'Customer',
          partnerId
        })
      });

      if (res.status === 'success') {
        setRatingSuccess(true);
        triggerNotification('Thank you for rating your delivery experience!');
        setTimeout(() => {
          setRatingSuccess(false);
          setRatingOrder(null);
          setTrackingOrder(null);
          setRatingComment('');
          setRatingValue(5);
          loadCustomerOrders();
        }, 2500);
      }
    } catch (e) {
      console.error('Failed to submit rating:', e);
    }
  };

  // Connect to Socket and bind updates
  useEffect(() => {
    const customerId = currentUser?.id || 'cust_dhanush';
    socketService.connect(customerId, 'customer');

    socketService.on('order_status_updated', (data) => {
      loadCustomerOrders();
      if (trackingOrder && trackingOrder.id === data.orderId) {
        setTrackingOrder(prev => prev ? { ...prev, status: data.status } : null);
        refreshTrackingDetails(trackingOrder.id);
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Listen for order history loads
  useEffect(() => {
    loadCustomerOrders();
  }, [profileName, currentUser]);

  useEffect(() => {
    if (isProfileModalOpen) {
      loadCustomerOrders();
    }
  }, [isProfileModalOpen]);

  // Subscribe to order channel when tracking starts
  useEffect(() => {
    if (trackingOrder) {
      socketService.joinOrder(trackingOrder.id);
      
      const handleLocationUpdate = (data) => {
        console.log('[Customer Socket]: Location update received:', data);
        if (data.orderId === trackingOrder.id) {
          setTrackingCoords([data.latitude, data.longitude]);
          if (data.speed) {
            setEta(Math.max(1, Math.round((10 / data.speed) * 30)));
          }
        }
      };

      socketService.on('partner_location_updated', handleLocationUpdate);
      refreshTrackingDetails(trackingOrder.id);

      return () => {
        socketService.leaveOrder(trackingOrder.id);
        socketService.off('partner_location_updated', handleLocationUpdate);
      };
    }
  }, [trackingOrder]);

  // Map updates when coordinates shift
  useEffect(() => {
    if (customerRiderMarkerRef.current && trackingCoords && customerMapRef.current) {
      customerRiderMarkerRef.current.setLatLng(trackingCoords);
      customerMapRef.current.panTo(trackingCoords);
    }
  }, [trackingCoords]);

  const initCustomerMap = async () => {
    if (customerMapRef.current || !trackingOrder) return;
    const mapEl = document.getElementById('customer-tracking-map');
    if (!mapEl) return;

    const vendorLat = 12.9348;
    const vendorLng = 77.6189;
    const custLat = trackingOrder.customer_latitude || (vendorLat + 0.015);
    const custLng = trackingOrder.customer_longitude || (vendorLng + 0.01);
    const riderLat = trackingCoords ? trackingCoords[0] : (trackingPartner?.current_latitude || vendorLat + 0.005);
    const riderLng = trackingCoords ? trackingCoords[1] : (trackingPartner?.current_longitude || vendorLng + 0.005);

    customerMapRef.current = L.map('customer-tracking-map', {
      zoomControl: true,
      attributionControl: false
    }).setView([riderLat, riderLng], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(customerMapRef.current);

    const vendorIcon = L.divIcon({
      className: 'vendor-marker',
      html: `<div class="w-8 h-8 rounded-full bg-violet-600 border-2 border-slate-900 flex items-center justify-center text-white font-bold shadow-lg">🏪</div>`,
      iconSize: [32, 32]
    });

    const customerIcon = L.divIcon({
      className: 'customer-marker',
      html: `<div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white font-bold shadow-lg">🏠</div>`,
      iconSize: [32, 32]
    });

    const riderIcon = L.divIcon({
      className: 'rider-marker',
      html: `<div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-bold shadow-lg animate-pulse">🚲</div>`,
      iconSize: [32, 32]
    });

    L.marker([vendorLat, vendorLng], { icon: vendorIcon }).addTo(customerMapRef.current).bindPopup('Vendor: ABC Electronics');
    L.marker([custLat, custLng], { icon: customerIcon }).addTo(customerMapRef.current).bindPopup('My Location');
    customerRiderMarkerRef.current = L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(customerMapRef.current);

    try {
      const res = await apiFetch('/maps/route', {
        method: 'POST',
        body: JSON.stringify({
          startLat: riderLat,
          startLng: riderLng,
          endLat: custLat,
          endLng: custLng
        })
      });

      if (res.status === 'success') {
        const { route, distance, duration } = res.data;
        setDistanceRemaining(distance);
        setEta(duration);

        customerRoutePolylineRef.current = L.polyline(route, {
          color: '#F4C400',
          weight: 4,
          opacity: 0.8,
          dashArray: '5, 10'
        }).addTo(customerMapRef.current);
      }
    } catch (e) {
      console.warn('Map route line failed:', e);
    }

    const bounds = L.latLngBounds([
      [vendorLat, vendorLng],
      [custLat, custLng],
      [riderLat, riderLng]
    ]);
    customerMapRef.current.fitBounds(bounds, { padding: [30, 30] });
  };

  useEffect(() => {
    if (trackingOrder && activeProfileTab === 'orders') {
      const timer = setTimeout(() => {
        initCustomerMap();
      }, 300);

      return () => {
        clearTimeout(timer);
        if (customerMapRef.current) {
          customerMapRef.current.remove();
          customerMapRef.current = null;
          customerRiderMarkerRef.current = null;
          customerRoutePolylineRef.current = null;
        }
      };
    }
  }, [trackingOrder, activeProfileTab]);


  // Sync active product image when a product is clicked
  useEffect(() => {
    if (selectedProduct) {
      setActiveProductImage(selectedProduct.image);
      setActiveThumbnailIndex(0);
      setTimeout(() => {
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  }, [selectedProduct]);

  // Membership Modals
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const currentMembershipTier = membershipTier;
  const setCurrentMembershipTier = updateTier;

  // Dynamic Notifications State
  const [unreadCount, setUnreadCount] = useState(3);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([
    { text: "Welcome to Connect App! Your Gold Elite membership is now active.", time: "2 hours ago" },
    { text: "Earn 2x reward points on your next purchase of Stay and Dining deals.", time: "1 day ago" },
    { text: "Security alert: Your profile details were updated successfully.", time: "2 days ago" }
  ]);

  // Hover Mega Menu State & Handlers
  const [hoveredLink, setHoveredLink] = useState(null);
  const leaveTimeoutRef = React.useRef(null);

  const handleMouseEnter = (linkName) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    setHoveredLink(linkName);
  };

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredLink(null);
    }, 150);
  };

  // Job Application States
  const [appliedJobId, setAppliedJobId] = useState(null);
  const [applicantName, setApplicantName] = useState(profileName || currentUser?.name || 'Dhanush Kumar');
  const [applicantEmail, setApplicantEmail] = useState(profileEmail || currentUser?.email || 'dhanush@connect.app');
  const [applicantResume, setApplicantResume] = useState('');
  const [isJobSubmitting, setIsJobSubmitting] = useState(false);
  const [jobSubmitSuccess, setJobSubmitSuccess] = useState(false);

  // Sync applicant name/email when profile updates
  useEffect(() => {
    if (profileName) setApplicantName(profileName);
    if (profileEmail) setApplicantEmail(profileEmail);
  }, [profileName, profileEmail]);

  const staticJobsList = [
    {
      id: 'job-1',
      vendorId: '3w8hhon38mqg7ni0u',
      title: 'Luxury Travel Concierge',
      department: 'Operations',
      location: 'Mumbai, India / Hybrid',
      salary: '₹12L - ₹18L L.P.A',
      type: 'Full-time',
      desc: 'Deliver elite, end-to-end bespoke travel management and high-touch VIP assistance to our premium tier members.'
    },
    {
      id: 'job-2',
      vendorId: '3w8hhon38mqg7ni0u',
      title: 'Partner Relations Lead',
      department: 'Business Development',
      location: 'Bangalore, India / Remote',
      salary: '₹15L - ₹22L L.P.A',
      type: 'Full-time',
      desc: 'Acquire, negotiate, and curate strategic alliances with five-star hospitality brands, luxury dining partners, and boutique hotels.'
    },
    {
      id: 'job-3',
      vendorId: '3w8hhon38mqg7ni0u',
      title: 'Senior Frontend Engineer',
      department: 'Technology',
      location: 'Remote (India)',
      salary: '₹24L - ₹32L L.P.A',
      type: 'Full-time',
      desc: 'Build highly performant, animation-rich, visual-first interfaces and client applications using React, TailwindCSS, and canvas APIs.'
    }
  ];

  const jobsList = [
    ...staticJobsList,
    ...products.filter(p => p.subNavbarCategory === 'Jobs').map(p => ({
      id: p.id,
      vendorId: p.vendorId,
      title: p.name,
      department: p.category || 'General',
      location: p.description?.split('\n')[0] || 'Remote (India)',
      salary: `₹${p.price.toLocaleString()} L.P.A`,
      type: 'Full-time',
      desc: p.description || `${p.name} position at ${p.vendorName || 'our partner organization'}.`
    }))
  ];

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setIsJobSubmitting(true);
    try {
      const selectedJob = jobsList.find(j => j.id === appliedJobId);
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          vendor_id: selectedJob?.vendorId || '3w8hhon38mqg7ni0u',
          customer_name: applicantName,
          customer_phone: profilePhone || currentUser?.phone || '+91 98765 43210',
          customer_address: selectedLocation.area || 'Koramangala, Bangalore',
          customer_latitude: 12.9498,
          customer_longitude: 77.6289,
          product_details: selectedJob?.title || 'Job Application',
          amount: 0,
          items: [{
            productId: selectedJob?.id,
            name: selectedJob?.title,
            price: 0,
            quantity: 1
          }],
          candidateEmail: applicantEmail,
          candidateResume: applicantResume
        })
      });

      if (res.status === 'success') {
        setJobSubmitSuccess(true);
      } else {
        console.error('Failed to submit job application:', res);
      }
    } catch (err) {
      console.error('Error placing job application:', err);
    } finally {
      setIsJobSubmitting(false);
    }
  };

  const handleBackToOpenings = () => {
    setAppliedJobId(null);
    setJobSubmitSuccess(false);
    setApplicantResume('');
  };

  // Membership Tier helper mapping
  const getMembershipTier = () => {
    const tierRaw = currentMembershipTier || 'Gold Elite';
    if (tierRaw.toLowerCase().includes('silver')) {
      return {
        name: 'Silver Member',
        colorClass: 'text-slate-400 dark:text-slate-300',
        bgClass: 'bg-slate-100 dark:bg-slate-800',
        badgeBg: 'bg-slate-400',
        badgeText: 'text-white',
        borderClass: 'border-slate-300 dark:border-slate-700',
        icon: Star,
        iconColor: 'text-slate-400 fill-slate-400'
      };
    }
    if (tierRaw.toLowerCase().includes('diamond')) {
      return {
        name: 'Diamond Member',
        colorClass: 'text-cyan-500 dark:text-cyan-400',
        bgClass: 'bg-cyan-50 dark:bg-cyan-950/40',
        badgeBg: 'bg-cyan-400',
        badgeText: 'text-cyan-950',
        borderClass: 'border-cyan-300 dark:border-cyan-800/40',
        icon: Gem,
        iconColor: 'text-cyan-400 fill-cyan-400'
      };
    }
    // Default Gold
    return {
      name: 'Gold Member',
      colorClass: 'text-amber-500 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40',
      badgeBg: 'bg-amber-400',
      badgeText: 'text-[#0b1e36]',
      borderClass: 'border-amber-300 dark:border-amber-900/40',
      icon: Sparkles,
      iconColor: 'text-amber-400 fill-amber-400'
    };
  };

  const tier = getMembershipTier();

  const getCardStyle = () => {
    const nameLower = tier.name.toLowerCase();
    if (nameLower.includes('silver')) {
      return {
        cardBg: 'bg-gradient-to-tr from-slate-400 via-slate-100 to-slate-400',
        cardText: 'text-slate-800',
        cardBorder: 'border-slate-300',
        badgeBg: 'bg-slate-500/20 text-slate-700 border border-slate-500/30',
        brandText: 'text-slate-800',
        subText: 'text-slate-500',
        accentText: 'text-slate-800'
      };
    }
    if (nameLower.includes('diamond')) {
      return {
        cardBg: 'bg-gradient-to-tr from-cyan-400 via-cyan-100 to-cyan-400',
        cardText: 'text-cyan-950',
        cardBorder: 'border-cyan-300',
        badgeBg: 'bg-cyan-500/20 text-cyan-800 border border-cyan-500/30',
        brandText: 'text-cyan-900',
        subText: 'text-cyan-600',
        accentText: 'text-cyan-950'
      };
    }
    // Gold
    return {
      cardBg: 'bg-gradient-to-tr from-[#eed48f] via-[#fff3d4] to-[#eed48f]',
      cardText: 'text-[#5c3e07]',
      cardBorder: 'border-amber-300',
      badgeBg: 'bg-amber-400/20 border border-amber-400/30 text-[#704f05]',
      brandText: 'text-[#704f05]',
      subText: 'text-[#916b14]',
      accentText: 'text-[#704f05]'
    };
  };
  const cardStyle = getCardStyle();

  const megaMenuLinks = ['Services', 'Products', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Jobs'];

  const jobMegaMenuData = {
    'Banking': [
      'Relationship Manager',
      'Sales Officer',
      'Branch Operations',
      'Customer Service Executive',
      'Credit Analyst',
      'Loan Officer',
      'CASA Executive',
      'Branch Manager',
      'Wealth Manager',
      'Commercial Banking'
    ],
    'IT': [
      'Software Developer',
      'Full Stack Developer',
      'Frontend Developer',
      'Backend Developer',
      'Mobile App Developer',
      'UI/UX Designer',
      'DevOps Engineer',
      'Cloud Engineer',
      'Data Analyst',
      'AI Engineer',
      'Cyber Security Analyst'
    ],
    'Non-IT': [
      'Admin Executive',
      'Office Assistant',
      'Data Entry Operator',
      'Operations Executive',
      'Coordinator',
      'Receptionist',
      'Back Office Executive'
    ],
    'BPO': [
      'Voice Process',
      'Non-Voice Process',
      'Customer Support',
      'Technical Support',
      'Chat Support',
      'International Process',
      'Domestic Process'
    ],
    'Sales & Marketing': [
      'Sales Executive',
      'Business Development Executive',
      'Marketing Executive',
      'Digital Marketing Executive',
      'Territory Sales Manager',
      'Area Sales Manager',
      'Brand Executive'
    ],
    'Manufacturing': [
      'Production Operator',
      'Machine Operator',
      'Quality Inspector',
      'Production Supervisor',
      'Plant Manager',
      'Maintenance Technician'
    ],
    'Automobile': [
      'Service Advisor',
      'Technician',
      'Sales Consultant',
      'Workshop Manager',
      'Spare Parts Executive'
    ],
    'Healthcare': [
      'Doctors',
      'Nurses',
      'Pharmacists',
      'Lab Technicians',
      'Medical Representatives',
      'Hospital Administrators'
    ],
    'Education': [
      'Teachers',
      'Professors',
      'Trainers',
      'Academic Counselors',
      'School Administrators',
      'Placement Officers'
    ],
    'Hospitality': [
      'Hotel Manager',
      'Front Office Executive',
      'Housekeeping Staff',
      'Chef',
      'Waiter',
      'Restaurant Manager'
    ],
    'Travel & Tourism': [
      'Travel Consultant',
      'Tour Coordinator',
      'Ticketing Executive',
      'Visa Consultant',
      'Travel Operations Executive'
    ],
    'Real Estate': [
      'Property Consultant',
      'Sales Executive',
      'Site Engineer',
      'CRM Executive',
      'Real Estate Manager'
    ],
    'Legal': [
      'Advocate',
      'Legal Associate',
      'Legal Advisor',
      'Documentation Executive'
    ],
    'Finance': [
      'Accountant',
      'Finance Executive',
      'Tax Consultant',
      'Auditor',
      'Chartered Accountant'
    ],
    'Logistics': [
      'Warehouse Executive',
      'Logistics Coordinator',
      'Supply Chain Analyst',
      'Delivery Executive'
    ],
    'Construction': [
      'Civil Engineer',
      'Site Supervisor',
      'Project Manager',
      'Architect',
      'Quantity Surveyor'
    ],
    'Creative': [
      'Graphic Designer',
      'Video Editor',
      'Animator',
      'Content Writer',
      'Social Media Manager'
    ],
    'Retail': [
      'Store Manager',
      'Cashier',
      'Retail Sales Executive',
      'Inventory Executive'
    ],
    'HR & Recruitment': [
      'HR Executive',
      'Recruiter',
      'Talent Acquisition Specialist',
      'HR Manager'
    ],
    'Government': [
      'State Government Jobs',
      'Central Government Jobs',
      'Railway Jobs',
      'Defense Jobs',
      'PSU Jobs'
    ],
    'International': [
      'Gulf Jobs',
      'Europe Jobs',
      'Singapore Jobs',
      'Malaysia Jobs',
      'Canada Jobs',
      'Australia Jobs'
    ],
    'Internships': [
      'IT Internship',
      'HR Internship',
      'Marketing Internship',
      'Banking Internship',
      'Finance Internship'
    ],
    'Freelance & Remote': [
      'Remote Developer',
      'Remote Designer',
      'Virtual Assistant',
      'Freelance Writer',
      'Online Tutor'
    ]
  };

  const productMegaMenuData = {
    'Electronics': {
      title: 'Electronics',
      items: ['Smartphones', 'Tablets', 'Laptops', 'Desktop Computers', 'Smart Watches', 'Headphones', 'Earbuds', 'Speakers', 'Cameras', 'Printers', 'Computer Accessories']
    },
    'IT & Office': {
      title: '🖥 IT & Office Equipment',
      items: ['Monitors', 'Keyboards', 'Mouse', 'Webcams', 'Routers', 'Networking Devices', 'Storage Devices', 'Office Printers', 'Projectors', 'UPS & Power Backup']
    },
    'Home Appliances': {
      title: '🏠 Home Appliances',
      items: ['Refrigerators', 'Washing Machines', 'Air Conditioners', 'Televisions', 'Microwave Ovens', 'Water Purifiers', 'Vacuum Cleaners', 'Air Coolers', 'Fans', 'Geysers']
    },
    'Furniture': {
      title: '🛋 Furniture',
      items: ['Sofas', 'Dining Tables', 'Beds', 'Mattresses', 'Wardrobes', 'Office Chairs', 'Office Tables', 'Study Tables', 'TV Units', 'Shoe Racks']
    },
    'Fashion': {
      title: '👔 Fashion & Lifestyle',
      items: ['Shirts', 'T-Shirts', 'Jeans', 'Watches', 'Accessories', 'Sarees', 'Kurtis', 'Dresses', 'Footwear', 'Handbags', 'Jewelry', 'Kids Clothing', 'School Accessories', 'Toys']
    },
    'Beauty': {
      title: '💄 Beauty & Personal Care',
      items: ['Skincare', 'Haircare', 'Cosmetics', 'Perfumes', 'Grooming Products', 'Wellness Products']
    },
    'Baby Care': {
      title: '🍼 Baby Products',
      items: ['Baby Food', 'Diapers', 'Baby Clothing', 'Baby Toys', 'Baby Care Products', 'Baby Accessories']
    },
    'Sports & Fitness': {
      title: '🏋 Sports & Fitness',
      items: ['Gym Equipment', 'Yoga Accessories', 'Sports Wear', 'Sports Equipment', 'Fitness Trackers', 'Cycling Accessories']
    },
    'Books': {
      title: '📚 Books & Stationery',
      items: ['Academic Books', 'Story Books', 'Notebooks', 'Office Stationery', 'Art Supplies', 'Educational Materials']
    },
    'Gaming': {
      title: '🎮 Gaming & Entertainment',
      items: ['Gaming Consoles', 'Gaming Accessories', 'VR Devices', 'Gaming Chairs', 'Gaming PCs']
    },
    'Automobile': {
      title: '🚗 Automobile Products',
      items: ['Car Accessories', 'Bike Accessories', 'Tyres', 'Vehicle Care Products', 'Safety Equipment', 'GPS Devices']
    },
    'Home & Kitchen': {
      title: '🏡 Home & Kitchen',
      items: ['Kitchen Appliances', 'Cookware', 'Storage Containers', 'Dining Sets', 'Home Decor', 'Lighting Products']
    },
    'Pet Care': {
      title: '🐶 Pet Products',
      items: ['Pet Food', 'Pet Toys', 'Pet Accessories', 'Pet Grooming Products', 'Pet Healthcare']
    },
    'Gardening': {
      title: '🌱 Gardening & Outdoor',
      items: ['Plants', 'Gardening Tools', 'Outdoor Furniture', 'Seeds', 'Fertilizers']
    },
    'Healthcare': {
      title: '🏥 Healthcare Products',
      items: ['Medical Equipment', 'Health Monitoring Devices', 'Wellness Products', 'Orthopedic Products', 'Personal Health Devices']
    },
    'Business Products': {
      title: '🛠 Industrial & Business Products',
      items: ['Safety Equipment', 'Tools & Machinery', 'Office Supplies', 'Packaging Materials', 'Business Equipment']
    }
  };

  const dailyNeedsMegaMenuData = {
    'Grocery': {
      title: '🥬 Grocery & Essentials',
      items: ['Rice', 'Wheat', 'Flour', 'Rava', 'Pulses', 'Dal', 'Sugar', 'Salt', 'Cooking Oil', 'Spices', 'Biscuits', 'Snacks', 'Noodles', 'Breakfast Cereals', 'Ready-to-Eat Foods', 'Dry Fruits']
    },
    'Fruits & Vegetables': {
      title: '🍎 Fruits & Vegetables',
      items: ['Fresh Fruits', 'Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pomegranate', 'Fresh Vegetables', 'Onion', 'Tomato', 'Potato', 'Carrot', 'Cabbage', 'Green Vegetables']
    },
    'Dairy': {
      title: '🥛 Dairy Products',
      items: ['Milk', 'Curd', 'Butter', 'Ghee', 'Cheese', 'Paneer', 'Yogurt', 'Ice Cream', 'Flavored Milk']
    },
    'Water & Beverages': {
      title: '💧 Water & Beverages',
      items: ['Drinking Water', 'Water Cans', 'Mineral Water', 'RO Water Delivery', 'Beverages', 'Tea', 'Coffee', 'Juices', 'Soft Drinks', 'Energy Drinks', 'Health Drinks']
    },
    'Household Essentials': {
      title: '🏠 Household Essentials',
      items: ['Cleaning Products', 'Floor Cleaner', 'Toilet Cleaner', 'Glass Cleaner', 'Disinfectants', 'Dishwash Liquid', 'Scrub Pads', 'Aluminum Foil', 'Storage Containers', 'Buckets', 'Mops', 'Dustbins', 'Cloth Drying Stands']
    },
    'Personal Care': {
      title: '🧼 Personal Care',
      items: ['Soap', 'Body Wash', 'Shampoo', 'Conditioner', 'Face Wash', 'Razor', 'Trimmer', 'Hair Oil', 'Deodorants', 'Perfumes', 'Toothpaste', 'Toothbrush', 'Mouthwash']
    },
    'Baby Care': {
      title: '👶 Baby Care',
      items: ['Baby Diapers', 'Baby Wipes', 'Baby Powder', 'Baby Soap', 'Baby Shampoo', 'Baby Food', 'Feeding Bottles']
    },
    'Pharmacy': {
      title: '🩺 Pharmacy & Healthcare',
      items: ['Medicines', 'OTC Medicines', 'Pain Relief Products', 'Cold & Cough Remedies', 'Thermometer', 'BP Monitor', 'Glucose Monitor', 'First Aid Kit', 'Sanitizers', 'Face Masks']
    },
    'Pet Care': {
      title: '🐶 Pet Care',
      items: ['Dog Food', 'Cat Food', 'Pet Shampoo', 'Pet Toys', 'Pet Accessories', 'Pet Medicines']
    },
    'Bakery': {
      title: '🍞 Bakery & Fresh Foods',
      items: ['Bread', 'Cakes', 'Buns', 'Cookies', 'Fresh Bakery Items']
    },
    'Organic Products': {
      title: '🌿 Organic Products',
      items: ['Organic Vegetables', 'Organic Fruits', 'Organic Rice', 'Organic Spices', 'Natural Health Products']
    },
    'Utility Products': {
      title: '🔋 Daily Utility Products',
      items: ['Batteries', 'Power Banks', 'Chargers', 'LED Bulbs', 'Extension Boards', 'Inverters']
    }
  };

  const foodMegaMenuData = {
    'Restaurants': {
      title: '🍽 Restaurants',
      items: ['Fine Dining', 'Family Restaurants', 'Casual Dining', 'Luxury Restaurants', 'Rooftop Restaurants', 'Buffet Restaurants', 'Theme Restaurants']
    },
    'Fast Food': {
      title: '🍕 Fast Food',
      items: ['Burgers', 'Pizza', 'Sandwiches', 'French Fries', 'Wraps', 'Hot Dogs', 'Fried Chicken']
    },
    'Cafes': {
      title: '☕ Cafes & Coffee Shops',
      items: ['Coffee Shops', 'Tea Cafes', 'Dessert Cafes', 'Co-working Cafes', 'Juice Cafes', 'Premium Lounges']
    },
    'South Indian': {
      title: '🍜 South Indian',
      items: ['Idli', 'Dosa', 'Uttapam', 'Pongal', 'Vada', 'Meals', 'Biryani']
    },
    'North Indian': {
      title: '🍛 North Indian',
      items: ['Roti', 'Naan', 'Paneer Dishes', 'Dal Varieties', 'Tandoori Items', 'Thali Meals']
    },
    'Biryani': {
      title: '🍚 Biryani & Rice',
      items: ['Chicken Biryani', 'Mutton Biryani', 'Veg Biryani', 'Dum Biryani', 'Fried Rice', 'Pulav']
    },
    'Healthy Food': {
      title: '🥗 Healthy Food',
      items: ['Salads', 'Diet Meals', 'Protein Meals', 'Organic Foods', 'Keto Foods', 'Vegan Foods']
    },
    'Bakery': {
      title: '🍰 Bakery & Desserts',
      items: ['Cakes', 'Pastries', 'Cookies', 'Donuts', 'Brownies', 'Chocolates', 'Ice Cream']
    },
    'Beverages': {
      title: '🍹 Beverages',
      items: ['Tea', 'Coffee', 'Fresh Juice', 'Smoothies', 'Milkshakes', 'Soft Drinks', 'Energy Drinks']
    },
    'International Cuisine': {
      title: '🌍 International Cuisine',
      items: ['Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Korean', 'Continental']
    },
    'Non-Veg Specials': {
      title: '🍗 Non-Veg Specials',
      items: ['Chicken', 'Mutton', 'Fish', 'Seafood', 'Grill Items', 'BBQ']
    },
    'Vegetarian Specials': {
      title: '🥦 Vegetarian Specials',
      items: ['Pure Veg Restaurants', 'Jain Food', 'Organic Food', 'Traditional Meals']
    },
    'Home Food': {
      title: '🏠 Home Food',
      items: ['Homemade Meals', 'Tiffin Services', 'Daily Lunch Plans', 'Healthy Home Food']
    },
    'Catering': {
      title: '🎉 Catering Services',
      items: ['Wedding Catering', 'Birthday Catering', 'Corporate Catering', 'Event Catering', 'Bulk Orders']
    },
    'Subscription Meals': {
      title: '🍱 Food Subscription',
      items: ['Daily Breakfast', 'Daily Lunch', 'Daily Dinner', 'Monthly Meal Plans', 'Office Meal Plans']
    },
    'Premium Dining': {
      title: '🏨 Premium Dining',
      items: ['5-Star Hotels', 'Luxury Dining', 'Chef Specials', 'Exclusive Member Restaurants']
    }
  };

  const stayMegaMenuData = {
    'Hotels': {
      title: '🏨 Hotels',
      items: ['Budget Hotels', 'Business Hotels', 'Premium Hotels', 'Luxury Hotels', '5-Star Hotels', 'Airport Hotels', 'Boutique Hotels']
    },
    'Resorts': {
      title: '🌴 Resorts',
      items: ['Beach Resorts', 'Hill Station Resorts', 'Family Resorts', 'Luxury Resorts', 'Wellness Resorts', 'Eco Resorts', 'Adventure Resorts']
    },
    'Homestays': {
      title: '🏡 Homestays',
      items: ['Family Homestays', 'Village Homestays', 'Luxury Homestays', 'Farm Stays', 'Heritage Homestays']
    },
    'Service Apartments': {
      title: '🏢 Service Apartments',
      items: ['Daily Rental', 'Weekly Rental', 'Monthly Rental', 'Corporate Apartments', 'Family Apartments']
    },
    'Vacation Rentals': {
      title: '🏠 Vacation Rentals',
      items: ['Villas', 'Holiday Homes', 'Farm Houses', 'Private Houses', 'Weekend Getaways']
    },
    'Student Accommodation': {
      title: '🏫 Student Accommodation',
      items: ['Boys Hostel', 'Girls Hostel', 'PG Accommodation', 'Student Apartments', 'College Hostels']
    },
    'Corporate Stay': {
      title: '👨‍💼 Corporate Stay',
      items: ['Business Hotels', 'Corporate Guest Houses', 'Executive Suites', 'Long-Term Business Stay']
    },
    'Camping & Adventure': {
      title: '🏕 Camping & Adventure Stay',
      items: ['Tent Camping', 'Glamping', 'Forest Stay', 'Mountain Camps', 'Adventure Camps']
    },
    'Heritage Stay': {
      title: '🏰 Heritage Stay',
      items: ['Palace Hotels', 'Heritage Resorts', 'Traditional Houses', 'Cultural Stays']
    },
    'Couple Stay': {
      title: '❤️ Couple & Honeymoon Stay',
      items: ['Honeymoon Resorts', 'Romantic Hotels', 'Luxury Villas', 'Private Pool Villas']
    },
    'Family Stay': {
      title: '👨‍👩‍👧‍👦 Family Stay',
      items: ['Family Hotels', 'Family Resorts', 'Kid-Friendly Resorts', 'Holiday Packages']
    },
    'Wellness Retreats': {
      title: '🧘 Wellness & Retreat Stay',
      items: ['Yoga Retreats', 'Meditation Centers', 'Ayurveda Resorts', 'Wellness Retreats', 'Spa Resorts']
    },
    'Medical Stay': {
      title: '🏥 Medical Stay',
      items: ['Hospital Guest Houses', 'Medical Tourism Stay', 'Patient Accommodation', 'Caregiver Accommodation']
    },
    'Religious Stay': {
      title: '🕌 Religious & Pilgrimage Stay',
      items: ['Temple Guest Houses', 'Pilgrimage Hotels', 'Spiritual Retreats', 'Religious Accommodation']
    },
    'Rental Accommodation': {
      title: '🏢 Rental Accommodation',
      items: ['Flats', 'Apartments', 'Independent Houses', 'Shared Accommodation', 'Rental Villas']
    },
    'International Stay': {
      title: '🌍 International Stay',
      items: ['International Hotels', 'Global Resorts', 'Holiday Packages', 'Travel Accommodation']
    }
  };

  const travelMegaMenuData = {
    'Flight Booking': {
      title: '✈ Flight Booking',
      items: ['Domestic Flights', 'International Flights', 'One-Way Flights', 'Round Trip Flights', 'Multi-City Flights', 'Business Class', 'First Class', 'Charter Flights']
    },
    'Train Booking': {
      title: '🚆 Train Booking',
      items: ['Express Trains', 'Superfast Trains', 'Premium Trains', 'Tatkal Booking', 'Tourist Trains', 'Luxury Trains']
    },
    'Bus Booking': {
      title: '🚌 Bus Booking',
      items: ['Government Buses', 'Private Buses', 'Sleeper Buses', 'AC Buses', 'Luxury Coaches', 'Volvo Services']
    },
    'Cab Services': {
      title: '🚖 Cab & Taxi Services',
      items: ['Local Taxi', 'Airport Transfer', 'Outstation Cabs', 'Luxury Cars', 'Chauffeur Services', 'Self-Drive Cars']
    },
    'Car Rental': {
      title: '🚗 Car Rental',
      items: ['Self Drive Cars', 'Monthly Rental', 'Luxury Car Rental', 'Corporate Rental', 'Tourist Vehicles']
    },
    'Bike Rental': {
      title: '🏍 Bike Rental',
      items: ['Scooters', 'Motorcycles', 'Premium Bikes', 'Adventure Bikes']
    },
    'Tour Packages': {
      title: '🌍 Tour Packages',
      items: ['Domestic Tours', 'International Tours', 'Weekend Trips', 'Family Packages', 'Group Tours', 'Couple Packages']
    },
    'Honeymoon Packages': {
      title: '❤️ Honeymoon Packages',
      items: ['Beach Destinations', 'Hill Stations', 'International Honeymoon', 'Luxury Honeymoon Resorts']
    },
    'Family Travel': {
      title: '👨‍👩‍👧 Family Travel',
      items: ['Family Holiday Packages', 'Theme Parks', 'Resorts', 'Family Adventures']
    },
    'Corporate Travel': {
      title: '🏢 Corporate Travel',
      items: ['Business Flights', 'Hotel Booking', 'Corporate Cab Services', 'Employee Travel Management']
    },
    'Adventure Travel': {
      title: '🎒 Adventure Travel',
      items: ['Trekking', 'Camping', 'Wildlife Safari', 'Mountain Climbing', 'Water Sports', 'Adventure Tours']
    },
    'Religious Travel': {
      title: '🕌 Religious & Pilgrimage Travel',
      items: ['Temple Tours', 'Pilgrimage Packages', 'Spiritual Retreats', 'Holy City Tours']
    },
    'Holiday Packages': {
      title: '🌴 Holiday Packages',
      items: ['Beach Holidays', 'Hill Station Holidays', 'Island Vacations', 'Cruise Vacations']
    },
    'Cruise Travel': {
      title: '🚢 Cruise Travel',
      items: ['Domestic Cruises', 'International Cruises', 'Luxury Cruises', 'Family Cruises']
    },
    'Visa Services': {
      title: '🛂 Visa Services',
      items: ['Tourist Visa', 'Business Visa', 'Student Visa', 'Work Visa', 'Visa Consultation']
    },
    'Passport Services': {
      title: '🛃 Passport Services',
      items: ['New Passport', 'Renewal', 'Tatkal Passport', 'Passport Assistance']
    },
    'International Travel': {
      title: '🌎 International Travel',
      items: ['International Flights', 'International Hotels', 'Global Packages', 'Travel Assistance']
    },
    'Travel Essentials': {
      title: '🧳 Travel Essentials',
      items: ['Travel Insurance', 'Forex Services', 'SIM Cards', 'Travel Accessories', 'Airport Lounge Access']
    },
    'Emergency Travel': {
      title: '🚑 Emergency Travel Assistance',
      items: ['Medical Emergency Travel', 'Emergency Ticket Booking', 'Travel Support', 'Insurance Claims']
    }
  };

  const serviceMegaMenuData = {
    'Healthcare': {
      title: 'Healthcare Services',
      items: ['Hospitals', 'Clinics', 'Diagnostic Centers', 'Pharmacies', 'Dental Care', 'Eye Care', 'Ambulance Services', 'Home Nursing', 'Health Checkups', 'Telemedicine', 'Physiotherapy', 'Medical Equipment']
    },
    'Education': {
      title: '🎓 Education Services',
      items: ['Schools', 'Colleges', 'Universities', 'Online Courses', 'Training Institutes', 'Skill Development', 'Computer Training', 'AI & IT Training', 'Language Classes', 'Competitive Exam Coaching', 'Certification Programs']
    },
    'Financial': {
      title: '🏦 Financial Services',
      items: ['Banking Services', 'Personal Loans', 'Home Loans', 'Business Loans', 'Credit Cards', 'Investment Plans', 'Mutual Funds', 'Financial Consulting', 'Tax Planning', 'Retirement Planning']
    },
    'Insurance': {
      title: '🛡 Insurance Services',
      items: ['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'Travel Insurance', 'Property Insurance', 'Business Insurance', 'Accident Insurance']
    },
    'Home Services': {
      title: '🏠 Home Services',
      items: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Interior Design', 'Home Cleaning', 'Pest Control', 'AC Repair', 'Appliance Repair', 'CCTV Installation', 'Smart Home Solutions']
    },
    'Legal': {
      title: '⚖ Legal Services',
      items: ['Legal Consultation', 'Property Registration', 'Agreement Drafting', 'Notary Services', 'Court Assistance', 'Company Registration', 'Trademark Registration', 'Legal Documentation']
    },
    'Digital': {
      title: '💻 Digital Services',
      items: ['Website Development', 'Mobile App Development', 'UI/UX Design', 'Digital Marketing', 'SEO Services', 'Social Media Marketing', 'Graphic Design', 'Video Editing', 'Cloud Solutions', 'Software Development']
    },
    'Business': {
      title: '🏢 Business Services',
      items: ['Company Formation', 'GST Registration', 'Payroll Management', 'HR Solutions', 'Recruitment Services', 'Business Consulting', 'Branding Services', 'Franchise Consulting', 'Startup Advisory']
    },
    'Automobile': {
      title: '🚗 Automobile Services',
      items: ['Car Service', 'Bike Service', 'Car Wash', 'Roadside Assistance', 'Vehicle Inspection', 'Vehicle Insurance', 'Driving School', 'Vehicle Rental']
    },
    'Bill & Recharge': {
      title: '📱 Bill & Recharge',
      items: ['Mobile Recharge', 'DTH Recharge', 'Broadband Services', 'Fiber Internet', 'SIM Activation', 'Business Connectivity', 'Electricity Bill Payment', 'Water Bill Payment', 'Gas Booking', 'Property Tax', 'Internet Bill Payment', 'Government Services']
    },
    'Family': {
      title: '👨‍👩‍👧 Family Services',
      items: ['Child Care', 'Day Care', 'Elder Care', 'Home Care', 'Family Counseling', 'Parenting Support']
    },
    'Fitness': {
      title: '🏋 Fitness & Wellness',
      items: ['Gym Membership', 'Yoga Classes', 'Personal Training', 'Nutrition Consultation', 'Wellness Centers', 'Spa Services', 'Mental Wellness']
    },
    'Events': {
      title: '🎉 Event Services',
      items: ['Wedding Planning', 'Birthday Events', 'Corporate Events', 'Photography', 'Videography', 'Catering Services', 'Decoration Services']
    },
    'Real Estate': {
      title: '🏡 Real Estate Services',
      items: ['Property Buying', 'Property Selling', 'Property Rental', 'Property Management', 'Interior Solutions', 'Home Loans']
    },
    'Security': {
      title: '🔒 Security Services',
      items: ['Security Guards', 'CCTV Monitoring', 'Cyber Security', 'Home Security', 'Office Security']
    }
  };

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);

  // Accordion Toggle States
  const [openFilters, setOpenFilters] = useState({
    category: true,
    gender: true,
    color: true,
    price: true,
    rating: true,
    serviceType: true,
    locationType: true,
    cuisine: true,
    distance: true,
    accommodationType: true,
    travelType: true,
    dailyNeedsType: true,
    department: true,
    jobType: true,
    salary: true
  });

  const IndianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ];

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      triggerNotification("Geolocation is not supported by your browser");
      return;
    }
    
    triggerNotification("Fetching your location...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'ConnectAppGeolocation/1.0'
              }
            }
          );
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const pincode = addr.postcode || '';
            const locality = addr.suburb || addr.neighbourhood || addr.village || addr.subdistrict || '';
            const city = addr.city || addr.town || addr.city_district || addr.county || '';
            const state = addr.state || '';

            // Find closest matching state in IndianStates list
            let matchedState = '';
            if (state) {
              const lowerState = state.toLowerCase();
              matchedState = IndianStates.find(s => s.toLowerCase() === lowerState || lowerState.includes(s.toLowerCase()) || s.toLowerCase().includes(lowerState)) || '';
            }

            setAddressForm(prev => ({
              ...prev,
              pincode,
              locality,
              city,
              state: matchedState,
              address: addr.road || addr.pedestrian || prev.address
            }));
            triggerNotification("Location fetched successfully!");
          } else {
            triggerNotification("Could not resolve location address.");
          }
        } catch (error) {
          console.error("OSM Geocoding Error:", error);
          triggerNotification("Failed to fetch address details.");
        }
      },
      (error) => {
        console.error("Geolocation Error:", error);
        triggerNotification("Location access denied or timed out.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveAddress = () => {
    if (!addressForm.name.trim()) {
      triggerNotification("Please enter a receiver name.");
      return;
    }
    if (!/^\d{10}$/.test(addressForm.phone.trim())) {
      triggerNotification("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^\d{6}$/.test(addressForm.pincode.trim())) {
      triggerNotification("Please enter a valid 6-digit Pincode.");
      return;
    }
    if (!addressForm.locality.trim()) {
      triggerNotification("Please enter the locality.");
      return;
    }
    if (!addressForm.address.trim()) {
      triggerNotification("Please enter the street address.");
      return;
    }
    if (!addressForm.city.trim()) {
      triggerNotification("Please enter the city.");
      return;
    }
    if (!addressForm.state) {
      triggerNotification("Please select a state.");
      return;
    }

    const newAddress = {
      ...addressForm,
      id: `addr_${Date.now()}`
    };

    setAddresses(prev => [...prev, newAddress]);
    setIsAddingAddress(false);
    triggerNotification("Address saved successfully!");
  };

  const handleDeleteAddress = (id) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    triggerNotification("Address deleted.");
  };

  const renderAddressBookSection = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Saved Addresses</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage your delivery and billing addresses</p>
          </div>
          {!isAddingAddress && (
            <button
              type="button"
              onClick={() => {
                setAddressForm({
                  name: profileName || '',
                  phone: profilePhone.replace('+91', '').trim() || '',
                  pincode: '',
                  locality: '',
                  address: '',
                  city: '',
                  state: '',
                  landmark: '',
                  altPhone: '',
                  type: 'Home'
                });
                setIsAddingAddress(true);
              }}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-[#0b1e36] font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add a New Address
            </button>
          )}
        </div>

        {isAddingAddress ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/40 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200">ADD A NEW ADDRESS</span>
              <button
                type="button"
                onClick={() => setIsAddingAddress(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-full text-slate-450 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Use my current location
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Receiver's Name"
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:border-amber-500 font-medium text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">10-digit mobile number</label>
                <input
                  type="text"
                  placeholder="Mobile Number"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:border-amber-500 font-medium text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pincode</label>
                <input
                  type="text"
                  placeholder="6-digit Pincode"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:border-amber-500 font-medium text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Locality</label>
                <input
                  type="text"
                  placeholder="Locality / Sector / Area"
                  value={addressForm.locality}
                  onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:border-amber-500 font-medium text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Address (Area and Street)</label>
                <textarea
                  placeholder="Flat, House no., Building, Company, Apartment, Street Sector"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  rows={2}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:border-amber-500 font-medium text-slate-855 dark:text-slate-100 resize-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">City/District/Town</label>
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:border-amber-500 font-medium text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">State</label>
                <select
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:border-amber-500 font-medium text-slate-850 dark:text-slate-100"
                >
                  <option value="">--Select State--</option>
                  {IndianStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Apollo Hospital"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:border-amber-500 font-medium text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Alternate Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="Alternate Contact Number"
                  value={addressForm.altPhone}
                  onChange={(e) => setAddressForm({ ...addressForm, altPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-lg p-2 focus:outline-none focus:border-amber-500 font-medium text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Address Type</label>
                <div className="flex gap-4 mt-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-200">
                    <input
                      type="radio"
                      name="addressType"
                      checked={addressForm.type === 'Home'}
                      onChange={() => setAddressForm({ ...addressForm, type: 'Home' })}
                      className="accent-[#0b1e36] w-4.5 h-4.5 cursor-pointer"
                    />
                    <span>Home</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-200">
                    <input
                      type="radio"
                      name="addressType"
                      checked={addressForm.type === 'Work'}
                      onChange={() => setAddressForm({ ...addressForm, type: 'Work' })}
                      className="accent-[#0b1e36] w-4.5 h-4.5 cursor-pointer"
                    />
                    <span>Work</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddingAddress(false)}
                className="px-4 py-2 border border-slate-250 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer text-slate-650 dark:text-slate-350"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAddress}
                className="px-5 py-2 bg-[#0b1e36] hover:bg-[#13325a] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {addresses.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                No saved addresses found. Add one to speed up delivery orders.
              </div>
            ) : (
              addresses.map(addr => (
                <div
                  key={addr.id}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-900/20 text-slate-800 dark:text-slate-200 flex flex-col justify-between"
                >
                  <div className="space-y-1.5 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-850 dark:text-white">{addr.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        addr.type === 'Home' 
                          ? 'bg-blue-500/10 text-blue-650 dark:text-blue-400 border border-blue-500/20' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}>
                        {addr.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {addr.address}, {addr.locality}, {addr.city}, {addr.state} - <span className="font-extrabold">{addr.pincode}</span>
                      {addr.landmark && <span className="block italic text-[10px] text-slate-400 mt-0.5">Landmark: {addr.landmark}</span>}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">
                      Phone: {addr.phone} {addr.altPhone && `| Alt: ${addr.altPhone}`}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-[10px] font-black text-red-500 hover:text-red-650 transition-colors uppercase tracking-wider cursor-pointer border-none bg-transparent"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPaymentsView = () => {
    return (
      <div className="space-y-4 animate-fade-in text-left">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Payment Logs</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Track your order transaction and payment statuses</p>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {customerOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs border border-slate-150 dark:border-slate-800/60 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
              No payment transactions found. Place an order to generate payments.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-bold">
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">Product Description</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map(ord => {
                    let statusColor = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                    let statusLabel = "Paid";
                    
                    if (ord.status === "Cancelled") {
                      statusColor = "bg-red-500/10 text-red-650 dark:text-red-400 border-red-500/20";
                      statusLabel = "Cancelled";
                    } else if (ord.status === "Refunded" || ord.is_refunded) {
                      statusColor = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
                      statusLabel = "Refunded";
                    } else if (ord.status?.toLowerCase().includes("refund")) {
                      statusColor = "bg-purple-500/10 text-purple-650 dark:text-purple-400 border-purple-500/20";
                      statusLabel = "Refunded";
                    }

                    return (
                      <tr key={ord.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/40 text-slate-800 dark:text-slate-100 transition-colors">
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">TXN_{ord.order_number || ord.id.slice(-6).toUpperCase()}</td>
                        <td className="py-3 px-3 max-w-[150px] truncate font-medium">{ord.product_details}</td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{new Date(ord.created_at || Date.now()).toLocaleDateString()}</td>
                        <td className="py-3 px-3 font-semibold text-slate-650 dark:text-slate-350">Connect Wallet</td>
                        <td className="py-3 px-3 font-extrabold text-[#f43397] text-right">₹{ord.amount}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    triggerNotification("Updated your wishlist!");
  };

  const addToCart = (product) => {
    if (cart.find(item => item.id === product.id)) {
      triggerNotification("Item is already in your cart!");
      return;
    }
    setCart(prev => [...prev, product]);
    triggerNotification(`Added "${product.name}" to cart!`);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const totalAmount = Math.max(0, cart.reduce((sum, item) => sum + item.price, 0) - 50);
    if (walletBalance < totalAmount) {
      triggerNotification("Insufficient wallet balance!");
      return;
    }

    setOrderSuccess(true);
    const productDetails = cart.map(item => `${item.name} (Qty: 1)`).join(', ');
    
    // Deduct order amount from wallet
    addTransaction(
      `Order Payment - ${productDetails.substring(0, 30)}${productDetails.length > 30 ? '...' : ''}`,
      -totalAmount,
      'Purchase'
    );

    try {
      const vendorId = cart[0]?.vendorId || 'v1';
      const itemsList = cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }));

      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          vendor_id: vendorId,
          customer_name: profileName || currentUser?.name || 'Dhanush Kumar',
          customer_phone: profilePhone || '+91 98765 43210',
          customer_address: selectedLocation.area || 'Koramangala, 5th Block, Bangalore',
          customer_latitude: 12.9498,
          customer_longitude: 77.6289,
          product_details: productDetails,
          amount: totalAmount,
          items: itemsList
        })
      });

      if (res.status === 'success') {
        loadCustomerOrders();
      }
    } catch (e) {
      console.error('Failed to place order:', e);
    }

    setCart([]);
    setTimeout(() => {
      setOrderSuccess(false);
      setIsCartOpen(false);
      triggerNotification("Order placed successfully! Thank you for shopping.");
    }, 3000);
  };


  const clearAllFilters = () => {
    setSelectedProduct(null);
    setSelectedCategories([]);
    setSelectedGenders([]);
    setSelectedColors([]);
    setSelectedPrices([]);
    setSelectedRating(null);
    setSearchQuery('');
    setSelectedSubNavbarCategory('All');
    setActiveTab('Home');
    setSelectedServiceTypes([]);
    setSelectedLocTypes([]);
    setSelectedCuisines([]);
    setSelectedDistances([]);
    setSelectedAccomTypes([]);
    setSelectedTravelTypes([]);
    setSelectedDailyNeedsTypes([]);
    setSelectedJobDepts([]);
    setSelectedJobTypes([]);
    setSelectedJobSalaries([]);
    triggerNotification("Cleared all filters!");
  };

  const toggleFilterSection = (section) => {
    setOpenFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Sub-navbar categories
  const subNavbarCategories = [
    'Home',
    'Services',
    'Products',
    'Daily Needs',
    'Food',
    'Stay',
    'Travel',
    'Jobs'
  ];

  // Filters logic
  const handleCheckboxChange = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  // Filtered & Sorted products list
  let filteredProducts = products.filter(product => {
    const matchesSearch = (searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (searchCategory === 'All' || product.subNavbarCategory === searchCategory);

    const matchesSubNavbar = selectedSubNavbarCategory === 'All' || 
      product.subNavbarCategory === selectedSubNavbarCategory;

    // Services Filter Checks
    if (activeTab === 'Services') {
      const matchesServiceType = selectedServiceTypes.length === 0 ||
        selectedServiceTypes.includes(product.category);

      const matchesLocType = selectedLocTypes.length === 0 ||
        selectedLocTypes.some(loc => product.locationType?.toLowerCase() === loc.toLowerCase());

      const matchesRatingFilter = selectedRating === null || 
        product.rating >= selectedRating;

      return matchesSearch && matchesSubNavbar && matchesServiceType && matchesLocType && matchesRatingFilter;
    }

    // Food Filter Checks
    if (activeTab === 'Food') {
      const matchesCuisine = selectedCuisines.length === 0 ||
        selectedCuisines.includes(product.category);

      let matchesDistance = true;
      if (selectedDistances.length > 0) {
        matchesDistance = selectedDistances.some(dist => {
          const num = parseFloat(product.distance || '2');
          if (dist === 'under-2km') return num < 2;
          if (dist === '2km-5km') return num >= 2 && num <= 5;
          if (dist === 'above-5km') return num > 5;
          return true;
        });
      }

      const matchesRatingFilter = selectedRating === null || 
        product.rating >= selectedRating;

      return matchesSearch && matchesSubNavbar && matchesCuisine && matchesDistance && matchesRatingFilter;
    }

    // Stay Filter Checks
    if (activeTab === 'Stay') {
      const matchesAccom = selectedAccomTypes.length === 0 ||
        selectedAccomTypes.includes(product.category);

      let matchesPrice = true;
      if (selectedPrices.length > 0) {
        matchesPrice = selectedPrices.some(range => {
          if (range === 'under-1000') return product.price < 1000;
          if (range === '1000-2000') return product.price >= 1000 && product.price <= 2000;
          if (range === '2000-5000') return product.price >= 2000 && product.price <= 5000;
          if (range === 'above-5000') return product.price > 5000;
          return true;
        });
      }

      const matchesRatingFilter = selectedRating === null || 
        product.rating >= selectedRating;

      return matchesSearch && matchesSubNavbar && matchesAccom && matchesPrice && matchesRatingFilter;
    }

    // Travel Filter Checks
    if (activeTab === 'Travel') {
      const matchesTravelType = selectedTravelTypes.length === 0 ||
        selectedTravelTypes.includes(product.category);

      let matchesPrice = true;
      if (selectedPrices.length > 0) {
        matchesPrice = selectedPrices.some(range => {
          if (range === 'under-500') return product.price < 500;
          if (range === '500-2000') return product.price >= 500 && product.price <= 2000;
          if (range === 'above-2000') return product.price > 2000;
          return true;
        });
      }

      const matchesRatingFilter = selectedRating === null || 
        product.rating >= selectedRating;

      return matchesSearch && matchesSubNavbar && matchesTravelType && matchesPrice && matchesRatingFilter;
    }

    // Daily Needs Filter Checks
    if (activeTab === 'Daily Needs') {
      const matchesDailyNeedsType = selectedDailyNeedsTypes.length === 0 ||
        selectedDailyNeedsTypes.some(type => product.tag?.toLowerCase().includes(type.toLowerCase()) || product.category?.toLowerCase().includes(type.toLowerCase()));

      let matchesPrice = true;
      if (selectedPrices.length > 0) {
        matchesPrice = selectedPrices.some(range => {
          if (range === 'under-100') return product.price < 100;
          if (range === '100-200') return product.price >= 100 && product.price <= 200;
          if (range === 'above-200') return product.price > 200;
          return true;
        });
      }

      const matchesRatingFilter = selectedRating === null || 
        product.rating >= selectedRating;

      return matchesSearch && matchesSubNavbar && matchesDailyNeedsType && matchesPrice && matchesRatingFilter;
    }

    // Default Products / Other tabs Filter Checks
    const matchesCategoryFilter = selectedCategories.length === 0 || 
      (activeTab === 'Home' 
        ? selectedCategories.includes(product.subNavbarCategory) 
        : selectedCategories.includes(product.category));

    const matchesGenderFilter = selectedGenders.length === 0 || 
      selectedGenders.includes(product.gender);

    const matchesColorFilter = selectedColors.length === 0 || 
      selectedColors.includes(product.color);

    let matchesPriceFilter = true;
    if (selectedPrices.length > 0) {
      matchesPriceFilter = selectedPrices.some(range => {
        if (range === 'under-199') return product.price < 199;
        if (range === '199-399') return product.price >= 199 && product.price <= 399;
        if (range === '399-599') return product.price >= 399 && product.price <= 599;
        if (range === 'above-599') return product.price > 599;
        return true;
      });
    }

    const matchesRatingFilter = selectedRating === null || 
      product.rating >= selectedRating;

    return matchesSearch && matchesSubNavbar && matchesCategoryFilter && 
           matchesGenderFilter && matchesColorFilter && matchesPriceFilter && matchesRatingFilter;
  });

  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating-desc') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  const wishlistProducts = products.filter(product => favorites.includes(product.id));

  // RENDER HELPERS
  const renderHeaderIcons = (isMobile = false) => {
    return (
      <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-3 md:gap-4'}`}>
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FFC107] text-[#0b1e36] text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsNotificationsOpen(false)} />
              <div className={`${isMobile ? 'fixed top-16 left-4 right-4' : 'absolute right-0 mt-2 w-80'} bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xl p-4 z-50 animate-scale-up text-slate-800 dark:text-slate-200 text-left`}>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-3">
                  <span className="text-xs font-black text-slate-900 dark:text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => {
                        setUnreadCount(0);
                        triggerNotification("All notifications marked as read");
                      }}
                      className="text-[10px] text-amber-500 hover:text-amber-600 font-bold hover:underline cursor-pointer border-none bg-transparent"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                  {unreadCount > 0 ? (
                    notificationsList.map((notif, idx) => (
                      <div key={idx} className="flex gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors text-left border-b border-slate-50 dark:border-slate-900 last:border-b-0">
                        <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <div className="leading-tight">
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{notif.text}</p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                      No unread notifications
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Wishlist */}
        <button 
          onClick={() => setIsWishlistOpen(true)}
          className="relative p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors"
          title="My Wishlist"
        >
          <Heart className="w-4.5 h-4.5" />
          {favorites.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FFC107] text-[#0b1e36] text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900">
              {favorites.length}
            </span>
          )}
        </button>

        {/* Cart */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer transition-colors"
          title="My Cart"
        >
          <ShoppingCart className="w-4.5 h-4.5" />
          {cart.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FFC107] text-[#0b1e36] text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900">
              {cart.length}
            </span>
          )}
        </button>

        {/* Profile Avatar / Badge */}
        <div 
          onClick={() => setIsProfileModalOpen(true)}
          className="flex items-center gap-2 cursor-pointer select-none pl-2 border-l border-slate-200 dark:border-slate-800/60"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/40 text-[#f43397] flex items-center justify-center font-bold text-sm border border-rose-200 dark:border-rose-900/40 shrink-0">
              {(currentUser?.name || profileName).charAt(0).toUpperCase() || 'D'}
            </div>
            {/* Membership Symbol Overlay badge */}
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 flex items-center justify-center ${tier.badgeBg} shadow-xs shrink-0`}>
              <tier.icon className={`w-2.5 h-2.5 ${tier.badgeText}`} />
            </div>
          </div>
          <div className="hidden sm:flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[80px]">
              {(currentUser?.name || profileName).split(' ')[0]}
            </span>
            <span className={`text-[8px] font-bold uppercase mt-0.5 ${tier.colorClass}`}>
              {tier.name}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardHeader = () => {
    return (
      <header className="bg-white dark:bg-[#0a192f] border-b border-slate-200 dark:border-slate-800/60 px-4 sm:px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-3.5 w-full text-slate-800 dark:text-slate-200 shadow-xs transition-colors">
        {/* Top Row: Logo & Mobile Icons */}
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* Logo */}
          <div className="flex items-center gap-2.5 select-none cursor-pointer" onClick={clearAllFilters}>
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-0.5 border border-slate-200 dark:border-slate-800/60">
              <img src={logoImg} alt="Connect App Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="text-sm font-black tracking-wide text-[#0b1e36] dark:text-white font-sans">Connect App</span>
            </div>
          </div>

          {/* Icons shown only on mobile */}
          <div className="flex md:hidden items-center">
            {renderHeaderIcons(true)}
          </div>
        </div>

        {/* Search Input in middle */}
        <div className="relative w-full md:max-w-xl flex items-center border border-slate-300 dark:border-slate-700 rounded-full bg-slate-50/50 dark:bg-slate-800/50 pl-4 py-1 pr-1.5 focus-within:border-amber-400 transition-all">
          <div 
            onClick={() => setIsSearchCategoryDropdownOpen(!isSearchCategoryDropdownOpen)}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 border-r border-slate-300 dark:border-slate-700 pr-3 mr-3 shrink-0 cursor-pointer select-none relative"
          >
            <span>{searchCategory}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            
            {isSearchCategoryDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-44 bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1 z-50 text-left">
                {['All', 'Products', 'Services', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Jobs'].map((cat) => (
                  <button
                    key={cat}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchCategory(cat);
                      setIsSearchCategoryDropdownOpen(false);
                      if (cat !== 'All') {
                        setActiveTab(cat);
                        setSelectedSubNavbarCategory(cat);
                      } else {
                        setActiveTab('Home');
                        setSelectedSubNavbarCategory('All');
                      }
                    }}
                    className={`w-full px-3 py-1.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-900/50 flex items-center justify-between transition-colors ${
                      searchCategory === cat ? 'text-amber-500 bg-amber-500/5' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{cat}</span>
                    {searchCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input 
            type="text"
            placeholder="Search for products, services, food, travel and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-1"
          />
          <button className="w-8.5 h-8.5 rounded-full bg-[#FFC107] hover:bg-amber-500 text-[#0b1e36] flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Location Selector & Desktop Icons */}
        <div className="flex items-center justify-between gap-5 w-full md:w-auto">
          {/* Location Selector Button & Dropdown */}
          <div className="relative shrink-0 w-full md:w-auto">
            <button 
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1 border border-slate-200 dark:border-slate-800/60 rounded-xl bg-slate-50/20 dark:bg-[#0a192f]/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none text-left transition-colors w-full md:w-auto"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="leading-tight pr-1 flex-grow">
                <div className="text-[10px] font-extrabold text-slate-800 dark:text-white">
                  {selectedLocation.city}, {selectedLocation.state}
                </div>
                <div className="text-[8px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 truncate max-w-[200px] md:max-w-[110px]">
                  {selectedLocation.area}
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLocationDropdownOpen && (
              <>
                {/* Overlay to close on click outside */}
                <div 
                  onClick={() => setIsLocationDropdownOpen(false)}
                  className="fixed inset-0 z-40 bg-transparent" 
                />
                
                {/* Dropdown Card */}
                <div className="absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-0 mt-2 w-full max-w-[320px] md:w-76 bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xl p-4 z-50 animate-scale-up text-slate-800 dark:text-slate-200">
                  {/* Search box */}
                  <div className="relative flex items-center border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-2.5 py-1.5 focus-within:border-amber-400">
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Search area, city or pincode..."
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && locationSearchQuery.trim() !== '') {
                          const query = locationSearchQuery.trim();
                          const updated = {
                            city: query,
                            state: 'Karnataka',
                            area: 'Custom Area'
                          };
                          setSelectedLocation(updated);
                          setRecentLocations(prev => [updated, ...prev.filter(item => item.city !== query)].slice(0, 3));
                          setIsLocationDropdownOpen(false);
                          setLocationSearchQuery('');
                          triggerNotification(`Switched location to ${query}`);
                        }
                      }}
                      className="w-full text-xs bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  {/* Detect Location Button */}
                  <button 
                    onClick={() => {
                      if (navigator.geolocation) {
                        triggerNotification("Detecting current location...");
                        navigator.geolocation.getCurrentPosition(
                          async (position) => {
                            const { latitude, longitude } = position.coords;
                            try {
                              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                              const data = await response.json();
                              if (data && data.address) {
                                const city = data.address.city || data.address.town || data.address.village || 'Bangalore';
                                const state = data.address.state || 'Karnataka';
                                const area = data.address.neighbourhood || data.address.suburb || data.address.road || 'HSR Layout, Sector 3';
                                const detected = { city, state, area };
                                setSelectedLocation(detected);
                                setRecentLocations(prev => [detected, ...prev.filter(item => item.area !== detected.area)].slice(0, 3));
                                setIsLocationDropdownOpen(false);
                                triggerNotification(`Located: ${area}, ${city}`);
                              } else {
                                throw new Error('No address found');
                              }
                            } catch (err) {
                              console.warn("Reverse geocoding failed, falling back:", err);
                              const detected = {
                                city: 'Bangalore',
                                state: 'Karnataka',
                                area: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
                              };
                              setSelectedLocation(detected);
                              setRecentLocations(prev => [detected, ...prev.filter(item => item.area !== detected.area)].slice(0, 3));
                              setIsLocationDropdownOpen(false);
                              triggerNotification("Located via GPS coordinates");
                            }
                          },
                          (error) => {
                            console.error("Geolocation failed:", error);
                            triggerNotification("Location permission denied or timeout.");
                          },
                          { enableHighAccuracy: true, timeout: 5000 }
                        );
                      } else {
                        triggerNotification("Geolocation not supported by browser.");
                      }
                    }}
                    className="mt-3 w-full flex items-center gap-2 py-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/30 transition-colors cursor-pointer text-left px-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-550/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
                      </svg>
                    </div>
                    <div className="text-left leading-none">
                      <span className="text-xs font-extrabold block">Use Current Location</span>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">Detect my current location</span>
                    </div>
                  </button>

                  {/* Recent Locations */}
                  {recentLocations.length > 0 && (
                    <div className="mt-3.5 text-left">
                      <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Recent Locations</h4>
                      <div className="space-y-2.5">
                        {recentLocations.map((loc, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between gap-3 group/item cursor-pointer"
                            onClick={() => {
                              setSelectedLocation(loc);
                              setIsLocationDropdownOpen(false);
                              triggerNotification(`Switched to ${loc.city}`);
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors" />
                              <div className="leading-tight text-left min-w-0">
                                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block truncate">{loc.city}, {loc.state}</span>
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold block truncate mt-0.5">{loc.area}</span>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setRecentLocations(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1 hover:text-red-500 text-slate-350 dark:text-slate-600 transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Cities */}
                  <div className="mt-3.5 text-left">
                    <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Popular Cities</h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { name: 'Bangalore', state: 'Karnataka', area: 'Koramangala, 5th Block' },
                        { name: 'Chennai', state: 'Tamil Nadu', area: 'Anna Nagar' },
                        { name: 'Hyderabad', state: 'Telangana', area: 'Gachibowli' },
                        { name: 'Coimbatore', state: 'Tamil Nadu', area: 'Gandhipuram' },
                        { name: 'Mumbai', state: 'Maharashtra', area: 'Bandra West' },
                        { name: 'Delhi', state: 'Delhi', area: 'Connaught Place' }
                      ].map((city) => (
                        <button
                          key={city.name}
                          onClick={() => {
                            setSelectedLocation({ city: city.name, state: city.state, area: city.area });
                            setRecentLocations(prev => [city, ...prev.filter(item => item.city !== city.name)].slice(0, 3));
                            setIsLocationDropdownOpen(false);
                            triggerNotification(`Switched location to ${city.name}`);
                          }}
                          className={`text-[9px] font-extrabold py-1 px-1.5 rounded-lg border transition-all cursor-pointer text-center truncate ${
                            selectedLocation.city === city.name 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          {city.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* View All Cities */}
                  <button 
                    onClick={() => triggerNotification("Opening city directory selector...")}
                    className="mt-3.5 w-full text-center text-[9px] font-black uppercase tracking-wider text-amber-500 hover:text-amber-600 hover:underline cursor-pointer"
                  >
                    View All Cities →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Icons shown only on desktop */}
          <div className="hidden md:flex items-center">
            {renderHeaderIcons(false)}
          </div>
        </div>
      </header>
    );
  };

  const renderSidebarMegaMenu = (activeCat, setActiveCat, dataDict, onItemClick) => {
    let items = [];
    let title = "";

    if (activeCat === 'ALL') {
      title = "All Items";
      Object.keys(dataDict).forEach((cat) => {
        const catData = dataDict[cat];
        const catItems = catData.items || catData;
        if (Array.isArray(catItems)) {
          items = [...items, ...catItems];
        }
      });
      items = Array.from(new Set(items));
    } else {
      const activeData = dataDict[activeCat];
      if (activeData) {
        items = activeData.items || activeData;
        title = activeData.title || `${activeCat} Jobs`;
      }
    }

    return (
      <div className="w-full flex flex-col md:flex-row gap-8">
        {/* Sidebar: main categories */}
        <div className="w-full md:w-1/4 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-4 md:pb-0 pr-0 md:pr-6 text-left shrink-0 max-h-[400px] overflow-y-auto scrollbar-thin">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block pl-2">
            Main Categories
          </span>
          {/* ALL Button */}
          <button
            onClick={() => setActiveCat('ALL')}
            className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-between group/cat shrink-0 ${
              activeCat === 'ALL'
                ? 'bg-[#0b1e36] text-white dark:bg-amber-400 dark:text-[#0b1e36] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>All</span>
            <svg className={`w-3.5 h-3.5 opacity-60 group-hover/cat:translate-x-0.5 transition-transform ${activeCat === 'ALL' ? 'text-amber-400 dark:text-[#0b1e36]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {Object.keys(dataDict).map((cat) => {
            const isActive = activeCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-between group/cat shrink-0 ${
                  isActive
                    ? 'bg-[#0b1e36] text-white dark:bg-amber-400 dark:text-[#0b1e36] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{cat}</span>
                <svg className={`w-3.5 h-3.5 opacity-60 group-hover/cat:translate-x-0.5 transition-transform ${isActive ? 'text-amber-400 dark:text-[#0b1e36]' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>

        {/* Details Area */}
        <div className="flex-grow pl-0 md:pl-6 text-left max-h-[400px] overflow-y-auto pr-2">
          <div className="flex justify-between items-baseline mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {title}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((subCat, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  if (onItemClick) {
                    onItemClick(subCat, e);
                  } else {
                    // Stay inside the dashboard — switch to the relevant tab and filter
                    const tabForLink = hoveredLink || title;
                    setHoveredLink(null);
                    if (tabForLink === 'Jobs') {
                      // Jobs handled separately via onItemClick
                    } else {
                      setActiveTab(tabForLink);
                      setSelectedSubNavbarCategory(tabForLink);
                      setSelectedCategories([subCat]);
                    }
                  }
                }}
                className="p-3 border border-slate-200/60 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-amber-400 dark:hover:border-amber-400 rounded-xl flex justify-between items-center group/item transition-all cursor-pointer hover:shadow-xs text-left w-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-gold-dark dark:hover:text-brand-gold"
              >
                <span>{subCat}</span>
                <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover/item:bg-amber-400 dark:group-hover/item:bg-amber-400 text-slate-400 group-hover/item:text-slate-900 transition-colors">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMembershipPrestigeView = () => {
    const details = {
      'Silver Tier': {
        name: 'Silver Tier',
        price: '₹4,000/year',
        discount: '10% OFF',
        badgeColor: 'bg-slate-400 text-white',
        benefits: [
          'Flat 10% Off on all Products and Daily Needs',
          'Standard priority order packaging & delivery',
          'Earn 1.2x reward points on all transactions',
          'Free standard shipping on orders over ₹499'
        ],
        cardBg: 'bg-gradient-to-tr from-slate-400 via-slate-100 to-slate-500',
        cardText: 'text-slate-900',
        brandText: 'text-slate-850',
        subText: 'text-slate-500',
        accentText: 'text-slate-900',
        borderClass: 'border-slate-300',
        glowColor: 'bg-slate-300/20',
        btnBg: 'bg-slate-400 hover:bg-slate-500 text-white'
      },
      'Gold Elite': {
        name: 'Gold Elite',
        price: '₹8,000/year',
        discount: '20% OFF',
        badgeColor: 'bg-amber-400 text-[#0b1e36]',
        benefits: [
          'Flat 15% discount on partner Stay bookings',
          'Flat 10% off restaurant bills & food vouchers',
          'Priority shipping & express package dispatch',
          'Earn 2.0x reward points on all transactions',
          'Access to dedicated Gold customer support hotline'
        ],
        cardBg: 'bg-gradient-to-tr from-[#eed48f] via-[#fff3d4] to-[#eed48f]',
        cardText: 'text-[#5c3e07]',
        brandText: 'text-[#704f05]',
        subText: 'text-[#916b14]',
        accentText: 'text-[#704f05]',
        borderClass: 'border-amber-300',
        glowColor: 'bg-yellow-400/20',
        btnBg: 'bg-amber-400 hover:bg-amber-500 text-[#0b1e36]'
      },
      'Diamond Prestige': {
        name: 'Diamond Prestige',
        price: '₹20,000/year',
        discount: '30% OFF',
        badgeColor: 'bg-cyan-400 text-cyan-950',
        benefits: [
          'Complimentary global airport VIP lounge access',
          'Flat 25% discount on stays and private pool villas',
          'Flat 20% off fine dining & Michelin-star partners',
          'Earn 3.0x reward points on all transactions',
          'Dedicated 24/7 personal banking concierge',
          'Unlimited next-day express deliveries'
        ],
        cardBg: 'bg-gradient-to-tr from-cyan-650 via-cyan-150 to-cyan-850',
        cardText: 'text-white',
        brandText: 'text-cyan-100',
        subText: 'text-cyan-200',
        accentText: 'text-white',
        borderClass: 'border-cyan-300',
        glowColor: 'bg-cyan-400/20',
        btnBg: 'bg-cyan-400 hover:bg-cyan-500 text-cyan-950'
      }
    }[previewMembershipTier] || {
      name: 'Gold Elite',
      price: '₹8,000/year',
      discount: '20% OFF',
      badgeColor: 'bg-amber-400 text-[#0b1e36]',
      benefits: [
        'Flat 15% discount on partner Stay bookings',
        'Flat 10% off restaurant bills & food vouchers',
        'Priority shipping & express package dispatch',
        'Earn 2.0x reward points on all transactions',
        'Access to dedicated Gold customer support hotline'
      ],
      cardBg: 'bg-gradient-to-tr from-[#eed48f] via-[#fff3d4] to-[#eed48f]',
      cardText: 'text-[#5c3e07]',
      brandText: 'text-[#704f05]',
      subText: 'text-[#916b14]',
      accentText: 'text-[#704f05]',
      borderClass: 'border-amber-300',
      glowColor: 'bg-yellow-400/20',
      btnBg: 'bg-amber-400 hover:bg-amber-500 text-[#0b1e36]'
    };

    const isActivePlan = (currentMembershipTier || 'Gold Elite').toLowerCase().includes((details?.name || 'Gold Elite').split(' ')[0].toLowerCase());

    return (
      <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl text-left text-slate-800 dark:text-white max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight uppercase">Choose Your Prestige</h2>
          <p className="text-xs font-semibold text-slate-450 dark:text-slate-400">Scroll down to explore tiers, or click the active card to view benefits.</p>
        </div>

        {/* Tab Buttons to quickly toggle prestige preview */}
        <div className="flex justify-center gap-3.5 border-b border-slate-200/50 dark:border-slate-800/80 pb-4">
          {['Silver Tier', 'Gold Elite', 'Diamond Prestige'].map((tierName) => {
            const isSelected = previewMembershipTier === tierName;
            return (
              <button
                key={tierName}
                type="button"
                onClick={() => {
                  setPreviewMembershipTier(tierName);
                  setIsCardFlipped(false);
                }}
                className={`px-4 py-2 text-xs font-black uppercase rounded-lg border tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0b1e36] text-white border-[#0b1e36] dark:bg-amber-400 dark:text-[#0b1e36] dark:border-amber-400 shadow-md'
                    : 'bg-slate-100 text-slate-550 border-slate-200 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                {tierName}
              </button>
            );
          })}
        </div>

        {/* Side-by-side Layout */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-stretch py-2">
          
          {/* Left: Info Card */}
          <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 flex flex-col justify-between text-left shadow-md w-full md:w-[340px] shrink-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest ${details.badgeColor}`}>
                  {details.name}
                </span>
                <span className="text-base font-black text-slate-800 dark:text-slate-100">{details.price}</span>
              </div>
              <div className="border-b border-slate-150 dark:border-slate-800 pb-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Membership Benefits</span>
              </div>
              <ul className="space-y-3">
                {details.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-350">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-150 dark:border-slate-800/50">
              {isActivePlan ? (
                <button
                  disabled
                  type="button"
                  className="w-full py-3 bg-slate-150 text-slate-450 dark:bg-slate-850 dark:text-slate-650 text-xs font-black uppercase tracking-wider rounded-xl cursor-not-allowed text-center border-none"
                >
                  Active Plan
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrentMembershipTier(details.name);
                    triggerNotification(`Congratulations! You have upgraded to ${details.name}!`);
                  }}
                  type="button"
                  className={`w-full py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer border-none text-center ${details.btnBg}`}
                >
                  Select {details.name.split(' ')[0]}
                </button>
              )}
            </div>
          </div>

          {/* Right: Privilege Card container */}
          <div className="flex flex-col items-center justify-center flex-grow gap-4 w-full">
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="relative w-full max-w-[340px] aspect-[1.58/1] rounded-2xl cursor-pointer select-none hover:scale-[1.02] transition-transform duration-300"
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
            >
              <div
                className="absolute inset-0 w-full h-full rounded-2xl transition-transform duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isCardFlipped ? 'rotateY(180deg)' : 'none'
                }}
              >
                {/* FRONT FACE */}
                <div
                  className={`absolute inset-0 w-full h-full rounded-2xl p-5 overflow-hidden border flex flex-col justify-between text-left shadow-xl ${details.cardBg} ${details.cardText} ${details.borderClass}`}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col leading-none">
                      <span className={`text-[13px] font-black uppercase tracking-widest font-serif ${details.brandText}`}>Connect</span>
                      <span className={`text-[7px] font-bold uppercase tracking-wider mt-0.5 ${details.subText}`}>Forge India Ecosystem</span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-white/20 bg-white/10 ${details.cardText}`}>
                        {details.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center flex-grow py-3">
                    <div className="flex items-center gap-2">
                      <Gem className={`w-8 h-8 fill-current ${details.cardText} animate-pulse`} />
                      <span className={`text-xl font-black uppercase tracking-widest font-serif ${details.brandText}`}>CONNECT</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end leading-none">
                    <div className="flex flex-col gap-1 text-left">
                      <span className={`text-[7px] font-bold uppercase tracking-wider ${details.subText}`}>CONN ID</span>
                      <span className="text-xs font-bold font-mono tracking-wider">CONN-8812-0495-2038</span>
                      <span className="text-[10px] font-bold uppercase mt-1.5">{profileName}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className={`text-[7px] font-bold uppercase tracking-wider ${details.subText}`}>EXP DATE</span>
                      <span className="text-xs font-bold font-mono">12/2028</span>
                    </div>
                  </div>

                  {/* Highlights and glares */}
                  <div className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full ${details.glowColor} blur-xl pointer-events-none`} />
                  <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                </div>

                {/* BACK FACE */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl p-5 overflow-hidden border bg-[#0a1120] text-slate-200 border-slate-800 flex flex-col justify-between text-left shadow-xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="space-y-4">
                    {/* Magnetic stripe */}
                    <div className="h-9 bg-slate-950 -mx-5 mt-1" />
                    
                    <div className="flex justify-between items-start gap-4">
                      {/* Hologram */}
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 opacity-60 flex items-center justify-center p-0.5">
                        <div className="w-full h-full border border-white/20 rounded bg-white/10" />
                      </div>
                      
                      {/* Signature block */}
                      <div className="flex-grow h-7 bg-white rounded-lg flex items-center justify-end px-3">
                        <span className="text-slate-800 font-mono text-[10px] font-bold">123</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[7px] text-slate-500 leading-normal">
                      This card is non-transferable and remains the property of Connect App. Use is subject to network terms and conditions. If found, please return to any Forge India checkpoint.
                    </p>
                    <div className="flex justify-between items-center border-t border-slate-900/60 pt-2 text-[8px] font-mono text-slate-400">
                      <span>WALLET COMPATIBLE ✓</span>
                      <span className="text-amber-500 font-bold">FORGE INDIA NODE v1.2.6</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse select-none">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tap card to flip</span>
            </span>
          </div>

        </div>
      </div>
    );
  };

  const renderSubNavbar = () => {
    return (
      <div 
        className="relative"
        onMouseLeave={handleMouseLeave}
      >
        <nav className="bg-white dark:bg-[#0a192f] border-b border-slate-200 dark:border-slate-800/60 px-6 py-3 flex items-center justify-start md:justify-center gap-6 overflow-x-auto no-scrollbar shadow-xs transition-colors w-full">
          {subNavbarCategories.map((cat) => {
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                onMouseEnter={() => handleMouseEnter(cat)}
                onClick={() => {
                  setSelectedProduct(null);
                  setActiveTab(cat);
                  setSelectedSubNavbarCategory(cat);
                  setSelectedCategories([]);
                  setHoveredLink(null);
                }}
                className={`relative group text-xs font-extrabold uppercase tracking-wider px-3.5 py-3 transition-all shrink-0 cursor-pointer ${
                  isActive 
                    ? 'text-amber-500 dark:text-amber-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400'
                }`}
              >
                <span>{cat}</span>
                <svg
                  className={`absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-2.5 h-1.5 text-amber-500 dark:text-amber-400 transition-all duration-200 ${
                    isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-50 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8l-6 6h12z" />
                </svg>
              </button>
            );
          })}
        </nav>

        {/* Floating Glassmorphic Mega Menu Dropdown */}
        {hoveredLink && megaMenuLinks.includes(hoveredLink) && (
          <div
            onMouseEnter={() => handleMouseEnter(hoveredLink)}
            onMouseLeave={handleMouseLeave}
            className="absolute top-[calc(100%+2px)] left-6 right-6 bg-white/95 dark:bg-[#0a192f]/95 backdrop-blur-md shadow-2xl border border-slate-200/80 dark:border-slate-800/60 rounded-2xl py-8 px-8 z-50 flex transition-all duration-300 ease-out text-slate-800 dark:text-slate-200"
          >
            {hoveredLink === 'Services' ? (
              renderSidebarMegaMenu(activeServiceCategory, setActiveServiceCategory, serviceMegaMenuData)
            ) : hoveredLink === 'Products' ? (
              renderSidebarMegaMenu(activeProductCategory, setActiveProductCategory, productMegaMenuData)
            ) : hoveredLink === 'Daily Needs' ? (
              renderSidebarMegaMenu(activeDailyNeedsCategory, setActiveDailyNeedsCategory, dailyNeedsMegaMenuData)
            ) : hoveredLink === 'Food' ? (
              renderSidebarMegaMenu(activeFoodCategory, setActiveFoodCategory, foodMegaMenuData)
            ) : hoveredLink === 'Stay' ? (
              renderSidebarMegaMenu(activeStayCategory, setActiveStayCategory, stayMegaMenuData)
            ) : hoveredLink === 'Travel' ? (
              renderSidebarMegaMenu(activeTravelCategory, setActiveTravelCategory, travelMegaMenuData)
            ) : hoveredLink === 'Jobs' ? (
              renderSidebarMegaMenu(activeJobCategory, setActiveJobCategory, jobMegaMenuData, (subCat) => {
                setActiveTab('Jobs');
                setSelectedSubNavbarCategory('Jobs');
                setSelectedCategories([]);
                setHoveredLink(null);
                const matchedJob = jobsList.find(j => 
                  j.title.toLowerCase().includes(subCat.toLowerCase()) || 
                  subCat.toLowerCase().includes(j.title.toLowerCase())
                );
                if (matchedJob) {
                  setAppliedJobId(matchedJob.id);
                } else {
                  setAppliedJobId(null);
                }
              })
            ) : null}
          </div>
        )}
      </div>
    );
  };

  // 1. WELCOME BANNER (LEFT)
  const renderWelcomeBanner = () => {
    return (
      <div className="bg-gradient-to-r from-[#051329] via-[#0a2246] to-[#051329] text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative shadow-md overflow-hidden text-left w-full select-none h-full">
        <div className="space-y-4 z-10 flex-grow">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">Welcome Back,</span>
            <h1 className="text-2xl md:text-3xl font-black text-white font-sans tracking-tight mt-1 flex items-center gap-1.5 leading-none">
              <span>{currentUser?.name || profileName}</span>
              <span className="animate-bounce">👋</span>
            </h1>
          </div>
          
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full uppercase tracking-wider text-[9px] font-extrabold ${
            tier.name.toLowerCase().includes('silver') ? 'bg-slate-400/20 border border-slate-400/30 text-slate-300' :
            tier.name.toLowerCase().includes('diamond') ? 'bg-cyan-400/20 border border-cyan-400/30 text-cyan-300' :
            'bg-amber-400/20 border border-amber-400/30 text-amber-400'
          }`}>
            <tier.icon className="w-2.5 h-2.5 fill-current animate-pulse" />
            <span>{tier.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-x-8 gap-y-1.5 text-xs text-slate-300 dark:text-slate-300 font-bold">
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => {
              navigator.clipboard.writeText('CON12345678');
              triggerNotification("Copied Member ID!");
            }}>
              <span>Member ID: CON12345678</span>
              <Copy className="w-3.5 h-3.5 opacity-60 hover:opacity-100 transition-opacity" />
            </div>
            <div>Valid Till : 31 Dec 2026</div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button 
              onClick={() => setShowBenefitsModal(true)}
              className="text-[10px] font-black uppercase tracking-wider border border-white/20 hover:border-amber-400 hover:text-amber-400 text-white px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              View Benefits
            </button>
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="text-[10px] font-black uppercase tracking-wider bg-transparent border border-white/20 hover:border-amber-400 hover:text-amber-400 text-white px-5 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Upgrade Membership</span>
            </button>
          </div>
        </div>

        {/* Mockup Card (Right) */}
        <div className={`shrink-0 relative w-64 aspect-[1.58/1] rounded-2xl p-4 overflow-hidden shadow-xl border z-10 flex flex-col justify-between ${cardStyle.cardBg} ${cardStyle.cardText} ${cardStyle.cardBorder}`}>
          <div className="flex justify-between items-start">
            <div className="flex flex-col leading-none">
              <span className={`text-xs font-black uppercase tracking-widest font-serif ${cardStyle.brandText}`}>Forge India</span>
              <span className={`text-[7px] font-bold uppercase tracking-wider mt-0.5 ${cardStyle.subText}`}>Ecosystem</span>
            </div>
            <div className={`text-[7px] font-extrabold px-2 py-0.5 rounded-full uppercase ${cardStyle.badgeBg}`}>
              {tier.name}
            </div>
          </div>

          <div className="flex justify-between items-end gap-2">
            <div className="space-y-1 text-left leading-none">
              <div className={`text-[7px] font-bold uppercase tracking-wider ${cardStyle.subText}`}>MEMBER PASS</div>
              <div className={`text-xs font-mono font-black ${cardStyle.accentText}`}>CONN-8812-0495</div>
            </div>
            <div className={`flex flex-col items-center gap-0.5 bg-white/40 p-1.5 rounded-lg border border-white/20`}>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=CON12345678" alt="QR" className="w-8 h-8 rounded bg-white p-0.5" />
              <span className={`text-[5px] font-black uppercase tracking-widest leading-none ${cardStyle.accentText}`}>Tap to View</span>
            </div>
          </div>
        </div>

        {/* Decorative backdrop blobs */}
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-blue-500/10 blur-xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />
      </div>
    );
  };

  // 2. EXCLUSIVE OFFERS (LEFT)
  const renderExclusiveOffers = () => {
    const offers = [
      { id: 'o1', brand: 'Zomato', discount: '25% OFF', desc: 'On Restaurant Bills', date: 'Valid till 30 May 2024', color: 'bg-red-500/10 text-red-600 border border-red-500/20', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=60' },
      { id: 'o2', brand: 'Marriott', discount: '20% OFF', desc: 'On Hotel Bookings', date: 'Valid till 28 May 2024', color: 'bg-slate-900/10 text-slate-800 border border-slate-900/20', image: hotelActual },
      { id: 'o3', brand: 'ixigo', discount: '15% OFF', desc: 'On Flight Bookings', date: 'Valid till 31 May 2024', color: 'bg-orange-500/10 text-orange-600 border border-orange-500/20', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=200&auto=format&fit=crop&q=60' },
      { id: 'o4', brand: 'Reliance Digital', discount: '10% OFF', desc: 'On Electronics', date: 'Valid till 31 May 2024', color: 'bg-blue-500/10 text-blue-600 border border-blue-500/20', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=60' },
    ];
    return (
      <div className="space-y-4 text-left w-full">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Exclusive Offers For You</h3>
          <button onClick={() => triggerNotification("Showing all offers...")} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 hover:underline cursor-pointer">View All →</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {offers.map(offer => (
            <div key={offer.id} className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 text-slate-800 dark:text-slate-200 rounded-2xl p-3 shadow-xs flex flex-col justify-between h-[230px] transition-all hover:shadow-md">
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center gap-1.5">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${offer.color}`}>{offer.discount}</span>
                  <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide truncate">{offer.brand}</span>
                </div>
                <div className="h-24 rounded-lg overflow-hidden relative border border-slate-100 bg-slate-50 flex items-center justify-center">
                  <img src={offer.image} alt={offer.brand} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/5" />
                </div>
                <div className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200 mt-1 line-clamp-1 leading-none">{offer.desc}</div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2.5 mt-2">
                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold">{offer.date}</span>
                <button onClick={() => triggerNotification(`${offer.brand} Coupon Claimed!`)} className="text-[9px] font-black uppercase bg-[#0b1e36] text-white hover:bg-amber-500 hover:text-[#0b1e36] px-2.5 py-1.5 rounded transition-all cursor-pointer">Claim</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 3. TOP SERVICES (LEFT)
  const renderTopServices = () => {
    const services = [
      { name: 'Healthcare', count: '120+ Partners', color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20', icon: Activity },
      { name: 'Home Services', count: '200+ Partners', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20', icon: ShieldCheck },
      { name: 'Education', count: '150+ Partners', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20', icon: GraduationCap },
      { name: 'Finance', count: '100+ Partners', color: 'bg-sky-500/10 text-sky-500 border border-sky-500/20', icon: Landmark },
      { name: 'Insurance', count: '80+ Partners', color: 'bg-purple-500/10 text-purple-500 border border-purple-500/20', icon: ShieldAlert },
      { name: 'Digital Services', count: '180+ Partners', color: 'bg-rose-500/10 text-rose-500 border border-rose-500/20', icon: Briefcase }
    ];
    return (
      <div className="space-y-4 text-left w-full">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Top Services</h3>
          <button onClick={() => triggerNotification("Viewing all services...")} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 hover:underline cursor-pointer">View All →</button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {services.map((service, idx) => {
            const IconComponent = service.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSubNavbarCategory('Services');
                  setActiveTab('Services');
                  setSelectedCategories([]);
                  triggerNotification(`Showing Services`);
                }}
                className="flex flex-col items-center bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 transition-all hover:shadow-md cursor-pointer group text-slate-800 dark:text-slate-200"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${service.color} shadow-xs group-hover:scale-105 transition-transform`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-black mt-2 text-slate-800 dark:text-slate-100 text-center leading-tight truncate w-full">{service.name}</span>
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{service.count}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 4. TRENDING PRODUCTS (LEFT)
  const renderTrendingProducts = () => {
    const trending = products.slice(0, 8);
    if (trending.length === 0) return null;
    return (
      <div className="space-y-4 text-left w-full">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Trending Products & Services</h3>
          <button onClick={() => { setSelectedSubNavbarCategory('Products'); setActiveTab('Products'); setSelectedCategories([]); }} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:underline cursor-pointer">View All →</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {trending.map(product => {
            const isFavorited = favorites.includes(product.id);
            return (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="group bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-350 flex flex-col justify-between text-slate-800 dark:text-slate-200 relative cursor-pointer hover:-translate-y-0.5">
                <div className="relative aspect-[0.95/1] bg-slate-50 overflow-hidden flex items-center justify-center select-none border-b border-slate-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                  <span className="absolute left-2.5 top-2.5 bg-slate-900/80 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">{product.tag}</span>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }} className="absolute right-2.5 top-2.5 w-7.5 h-7.5 rounded-full bg-white/95 text-slate-400 hover:text-red-500 flex items-center justify-center shadow-xs cursor-pointer border border-slate-200/60 transition-transform hover:scale-105">
                    <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>
                
                <div className="p-3.5 flex-grow flex flex-col justify-between text-left">
                  <div>
                    <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-amber-500 transition-colors">{product.name}</h4>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-xs font-black text-slate-800 dark:text-white">₹{product.price.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                      <span className="text-[9px] text-emerald-600 font-bold">{product.discount}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-800/60 mt-2.5 pt-2.5 flex items-center justify-between gap-1 w-full">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <span>{product.rating}</span>
                        <Star className="w-2 h-2 fill-emerald-600 text-emerald-600" />
                      </div>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold">({product.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          addToCart(product); 
                        }} 
                        className="inline-flex items-center gap-0.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-[8px] font-black px-2 py-1 rounded-lg transition-all cursor-pointer uppercase shadow-sm border border-amber-500/30 shrink-0"
                      >
                        <Plus className="w-2 h-2" />
                        <span>Add</span>
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (!cart.find(item => item.id === product.id)) {
                            addToCart(product);
                          }
                          setIsCartOpen(true);
                        }} 
                        className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] font-black px-2 py-1 rounded-lg transition-all cursor-pointer uppercase shadow-sm border border-emerald-750/30 shrink-0"
                      >
                        <span>Order Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 5. STAY BEST OFFERS (LEFT)
  const renderStayOffers = () => {
    const stays = products.filter(p => p.subNavbarCategory === 'Stay').slice(0, 4);
    if (stays.length === 0) return null;
    return (
      <div className="space-y-4 text-left w-full text-slate-800 dark:text-slate-200">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Stay Best Offers</h3>
          <button onClick={() => { setSelectedSubNavbarCategory('Stay'); setActiveTab('Stay'); setSelectedCategories([]); }} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 hover:underline cursor-pointer">View All →</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stays.map((stay, idx) => (
            <div key={idx} onClick={() => setSelectedProduct(stay)} className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-slate-800 dark:text-slate-200 cursor-pointer hover:-translate-y-0.5">
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden relative border-b border-slate-100 dark:border-slate-800/60">
                <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" />
                <span className="absolute left-1.5 top-1.5 bg-amber-400 text-slate-900 dark:text-slate-100 text-[6px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">15% SAVINGS</span>
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 dark:text-white line-clamp-1 leading-none">{stay.name}</h4>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold block truncate">{stay.location || 'Bengaluru, India'}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2 mt-2">
                  <div className="flex items-center gap-0.5 text-[8px] font-extrabold text-amber-600 dark:text-amber-400">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{stay.rating || 4.5}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-800 dark:text-white font-mono">₹{stay.price.toLocaleString()}</span>
                    <span className="text-[7px] text-slate-450 dark:text-slate-500 font-semibold block">/ Night</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 6. POPULAR RESTAURANTS (LEFT)
  const renderPopularRestaurants = () => {
    const restaurants = products.filter(p => p.subNavbarCategory === 'Food').slice(0, 4);
    if (restaurants.length === 0) return null;
    return (
      <div className="space-y-4 text-left w-full text-slate-800 dark:text-slate-805 dark:text-slate-200">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 dark:text-slate-450 uppercase tracking-widest">Popular Restaurants</h3>
          <button onClick={() => { setSelectedSubNavbarCategory('Food'); setActiveTab('Food'); setSelectedCategories([]); }} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 hover:underline cursor-pointer">View All →</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {restaurants.map((rest, idx) => (
            <div key={idx} onClick={() => setSelectedProduct(rest)} className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-slate-800 dark:text-slate-200 cursor-pointer hover:-translate-y-0.5">
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden relative border-b border-slate-100 dark:border-slate-800/60">
                <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" />
                <span className="absolute left-1.5 top-1.5 bg-rose-500 text-white text-[6px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">FLAT 20% OFF</span>
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 dark:text-white line-clamp-1 leading-none">{rest.name}</h4>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 font-bold block truncate">{rest.category || 'Gourmet Dining'}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2 mt-2 text-[8px] font-bold text-slate-500 dark:text-slate-450">
                  <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{rest.rating || 4.5}</span>
                  </div>
                  <div>₹{rest.price.toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };


  // 7. BALANCE CARDS GRID (RIGHT)
  const renderBalanceGrid = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Wallet */}
        <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between text-left shadow-xs transition-shadow hover:shadow-sm text-slate-800 dark:text-slate-200">
          <div className="w-8.5 h-8.5 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 shrink-0">
            <Wallet className="w-4.5 h-4.5" />
          </div>
          <div className="mt-4">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none">Wallet Balance</div>
            <div className="text-base font-black text-slate-800 dark:text-white mt-1.5 leading-none font-mono">₹{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <button onClick={() => { setIsProfileModalOpen(true); setActiveProfileTab('wallet'); }} className="text-[9px] font-bold text-blue-600 hover:text-blue-600 dark:text-blue-400 hover:underline mt-2 flex items-center gap-1 self-start cursor-pointer">
            <span>Add Money</span>
            <span>→</span>
          </button>
        </div>

        {/* Savings */}
        <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between text-left shadow-xs transition-shadow hover:shadow-sm text-slate-800 dark:text-slate-200 dark:text-slate-200">
          <div className="w-8.5 h-8.5 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Percent className="w-4.5 h-4.5" />
          </div>
          <div className="mt-4">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none">Total Savings</div>
            <div className="text-base font-black text-slate-800 dark:text-white mt-1.5 leading-none font-mono">₹12,450.00</div>
          </div>
          <button onClick={() => triggerNotification("Savings history loaded")} className="text-[9px] font-bold text-emerald-600 hover:text-emerald-555 hover:underline mt-2 flex items-center gap-1 self-start cursor-pointer">
            <span>View Savings</span>
            <span>→</span>
          </button>
        </div>

        {/* Points */}
        <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between text-left shadow-xs transition-shadow hover:shadow-sm text-slate-800 dark:text-slate-200 dark:text-slate-200">
          <div className="w-8.5 h-8.5 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Gift className="w-4.5 h-4.5" />
          </div>
          <div className="mt-4">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider leading-none">Reward Points</div>
            <div className="text-base font-black text-slate-800 dark:text-white mt-1.5 leading-none font-mono">2,540</div>
          </div>
          <button onClick={() => triggerNotification("Points store opened")} className="text-[9px] font-bold text-purple-600 hover:text-purple-600 dark:text-purple-400 hover:underline mt-2 flex items-center gap-1 self-start cursor-pointer">
            <span>Redeem Now</span>
            <span>→</span>
          </button>
        </div>

        {/* Dynamic Offer Box */}
        <div className="bg-gradient-to-br from-amber-400/10 to-orange-500/10 dark:from-amber-400/5 dark:to-orange-500/5 border border-dashed border-amber-400/40 dark:border-amber-400/30 rounded-2xl p-4 flex flex-col justify-between text-left shadow-xs transition-shadow hover:shadow-sm relative overflow-hidden group">
          {/* Decorative radial ambient flare */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-400/20 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          
          <div className="flex justify-between items-start">
            <div className="w-8.5 h-8.5 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
              <Percent className="w-4.5 h-4.5" />
            </div>
            <span className="text-[8px] font-extrabold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
              LTD TIME
            </span>
          </div>

          <div className="mt-3 space-y-1">
            <span className="text-[10px] text-amber-650 dark:text-amber-400 font-extrabold tracking-wider uppercase">Connect Special</span>
            <h4 className="text-[13px] font-black text-slate-800 dark:text-white leading-tight">Flat 50% OFF</h4>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold leading-tight">Use code <span className="font-mono font-black text-amber-650 dark:text-amber-400 bg-amber-400/15 px-1.5 py-0.5 rounded">CONNECT50</span></p>
          </div>

          <button 
            type="button"
            onClick={() => {
              navigator.clipboard.writeText("CONNECT50");
              triggerNotification("Coupon CONNECT50 copied to clipboard!");
            }} 
            className="text-[9px] font-black uppercase text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 hover:underline mt-2 flex items-center gap-1 self-start cursor-pointer border-none bg-transparent p-0"
          >
            <span>Copy Code</span>
            <span>→</span>
          </button>
        </div>
      </div>
    );
  };

  const renderShoppingPromoBanner = () => {
    return (
      <div className="w-full bg-[#7a1473] bg-gradient-to-br from-[#911f81] via-[#7a1473] to-[#510e4a] rounded-3xl overflow-hidden shadow-lg flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between p-6 relative min-h-[220px] text-white transition-all hover:shadow-xl border border-purple-500/20 h-full">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
        
        {/* Left Section: Couple and Arches */}
        <div className="flex-1 flex items-center justify-center sm:justify-start lg:justify-center xl:justify-start w-full relative h-[180px] sm:h-[210px] md:h-[210px] shrink-0 overflow-hidden">
          {/* Colorful arches backdrop */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 lg:left-1/2 lg:-translate-x-1/2 xl:left-4 xl:translate-x-0 w-36 h-36 sm:w-40 sm:h-40 rounded-t-full border-[10px] border-[#f43397]/40 pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 lg:left-1/2 lg:-translate-x-1/2 xl:left-8 xl:translate-x-0 w-28 h-28 sm:w-32 sm:h-32 rounded-t-full border-[10px] border-amber-400/40 pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 sm:left-12 sm:translate-x-0 lg:left-1/2 lg:-translate-x-1/2 xl:left-12 xl:translate-x-0 w-20 h-20 sm:w-24 sm:h-24 rounded-t-full border-[10px] border-cyan-400/40 pointer-events-none" />
          
          <img 
            src={shoppingBannerCouple} 
            alt="Promo Couple" 
            className="h-[180px] sm:h-[210px] object-contain z-10 select-none absolute -bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 lg:left-1/2 lg:-translate-x-1/2 xl:left-auto xl:translate-x-0"
          />
        </div>

        {/* Middle Section: QR Code and App promo */}
        <div className="flex flex-col items-center justify-center text-center p-3 z-10 space-y-2.5 sm:max-w-[200px] lg:max-w-none xl:max-w-[200px]">
          <div className="text-[10px] sm:text-[11px] font-black uppercase text-amber-300 tracking-wider">
            Upto <span className="text-white bg-red-500 px-1.5 py-0.5 rounded-sm font-extrabold">35% OFF</span> on your first order
            <span className="block text-[8px] text-slate-200 mt-0.5 font-bold normal-case">*Only on App</span>
          </div>
          
          <div className="bg-white p-2 rounded-xl shadow-md inline-block">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=100&data=https://connect.app" 
              alt="QR Code" 
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>
          
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-200 block">
            Scan now to install
          </span>
        </div>

        {/* Right Section: Smart Shopping Brand & Shop Now */}
        <div className="flex-1 flex flex-col items-center sm:items-end lg:items-center xl:items-end justify-center text-center sm:text-right lg:text-center xl:text-right p-4 z-10 space-y-3.5 w-full">
          <h3 className="text-base sm:text-lg lg:text-base xl:text-lg font-black tracking-tight leading-tight max-w-[200px] sm:max-w-[180px] lg:max-w-[200px] xl:max-w-[180px]">
            Smart Shopping Trusted by Millions
          </h3>
          <button 
            type="button"
            onClick={() => {
              setActiveTab('Products');
              setSelectedSubNavbarCategory('Products');
              triggerNotification("Welcome to Smart Shopping!");
            }}
            className="bg-white hover:bg-slate-100 text-[#7a1473] font-bold text-[10px] px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Shop Now
          </button>
        </div>
      </div>
    );
  };

  // 8. REFER FRIENDS & EARN (RIGHT)
  const renderReferFriends = () => {
    return (
      <div className="bg-[#f0f5ff] dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4.5 flex items-center justify-between shadow-xs text-left text-slate-800 dark:text-slate-200 relative overflow-hidden w-full h-full">
        <div className="space-y-3.5 z-10 max-w-[60%]">
          <div>
            <h4 className="text-[13px] font-black text-[#0b1e36] leading-none">Refer Friends & Earn</h4>
            <p className="text-[10px] text-slate-500 font-semibold mt-1">Earn ₹250 for each successful referral</p>
          </div>
          <button onClick={() => triggerNotification("Referral link copied to clipboard!")} className="text-[9px] font-black uppercase tracking-wider bg-[#0b1e36] text-white hover:bg-amber-500 hover:text-[#0b1e36] px-3.5 py-2 rounded shadow transition-colors cursor-pointer">
            Refer Now
          </button>
        </div>
        <div className="w-16 h-16 shrink-0 relative z-10 opacity-80">
          <img src="https://img.icons8.com/isometric/100/gift.png" alt="Gift Envelope" className="w-full h-full object-contain" />
        </div>
      </div>
    );
  };


  // 10. REWARDS & CASHBACK (RIGHT)
  const renderRewardsCashback = () => {
    return (
      <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4.5 shadow-xs text-left w-full text-slate-800 dark:text-slate-200 h-full">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-5 flex-wrap items-center">
            {/* Cashback Available */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="text-left leading-none">
                <span className="text-[8px] text-slate-400 dark:text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider block">Cashback Available</span>
                <span className="text-xs font-black text-emerald-650 dark:text-emerald-400 dark:text-emerald-400 block mt-1 font-mono">₹1,250.00</span>
              </div>
            </div>

            {/* Referral Earnings */}
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800/60 pl-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div className="text-left leading-none">
                <span className="text-[8px] text-slate-400 dark:text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider block">Referral Earnings</span>
                <span className="text-xs font-black text-slate-800 dark:text-white block mt-1 font-mono">₹500.00</span>
              </div>
            </div>

            {/* Loyalty Level */}
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800/60 pl-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <div className="text-left leading-none">
                <span className="text-[8px] text-slate-400 dark:text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider block">Loyalty Level</span>
                <span className="text-[10px] font-black text-purple-700 dark:text-purple-400 block mt-1 uppercase tracking-wide">Gold Tier</span>
              </div>
            </div>
          </div>

          <button onClick={() => triggerNotification("Redeeming reward cashback...")} className="text-[9px] font-black uppercase tracking-wider bg-[#0b1e36] dark:bg-amber-400 dark:text-[#0b1e36] text-white hover:bg-amber-500 hover:text-[#0b1e36] px-4 py-2 rounded shadow-xs cursor-pointer ml-auto shrink-0 transition-colors">Redeem Rewards</button>
        </div>
      </div>
    );
  };

  // 11. RECENT TRANSACTIONS (RIGHT)
  const renderRecentTransactions = () => {
    return (
      <div className="space-y-4 text-left w-full text-slate-800 dark:text-slate-200">
        <div className="flex justify-between items-baseline">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Recent Transactions</h3>
          <button onClick={() => { setIsProfileModalOpen(true); setActiveProfileTab('orders'); }} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 hover:underline cursor-pointer">View All →</button>
        </div>

        <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4.5 shadow-xs space-y-3.5 w-full text-slate-800 dark:text-slate-200">
          {[
            { name: 'The Rameshwaram Cafe', cat: 'Restaurant', price: 1200, discount: 300, date: '02 May 2024', color: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30', icon: Utensils },
            { name: 'Hotel Royal Orchid', cat: 'Hotel Booking', price: 4500, discount: 900, date: '01 May 2024', color: 'bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30', icon: BedDouble },
            { name: 'IndiGo Airlines', cat: 'Flight Booking', price: 3250, discount: 650, date: '30 Apr 2024', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30', icon: Plane },
            { name: 'BigBasket', cat: 'Daily Needs', price: 850, discount: 120, date: '29 Apr 2024', color: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30', icon: Truck }
          ].map((tx, idx) => {
            const TxIcon = tx.icon;
            return (
              <div key={idx} className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0 text-left">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.color} shrink-0`}>
                    <TxIcon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-white truncate leading-none">{tx.name}</h4>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block mt-1">{tx.cat} • {tx.date}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <div className="text-xs font-black text-slate-800 dark:text-white">₹{tx.price}</div>
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">-₹{tx.discount}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 12. CATALOG SECTION
  const renderCatalogSection = () => {
    const filteredJobs = jobsList.filter(job => {
      const matchesSearch = searchQuery === '' || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedJobDepts.length === 0 || 
        selectedJobDepts.includes(job.department);

      const matchesType = selectedJobTypes.length === 0 || 
        selectedJobTypes.includes(job.type) || 
        (selectedJobTypes.includes('Hybrid') && job.location.includes('Hybrid')) ||
        (selectedJobTypes.includes('Remote') && job.location.includes('Remote'));

      let matchesSalary = true;
      if (selectedJobSalaries.length > 0) {
        matchesSalary = selectedJobSalaries.some(sal => {
          if (sal === 'under-15l') return job.id === 'job-1';
          if (sal === '15l-25l') return job.id === 'job-2' || job.id === 'job-1';
          if (sal === 'above-25l') return job.id === 'job-3';
          return true;
        });
      }
      return matchesSearch && matchesDept && matchesType && matchesSalary;
    });

    return (
      <div id="products-section" className="scroll-mt-6 border-t border-slate-200 dark:border-slate-800/60 pt-10 text-slate-800 dark:text-slate-200">
        {/* Section title */}
        <div className="text-left mb-6">
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {activeTab === 'Jobs' ? 'Careers' : 'Connect Marketplace Catalog'}
          </h3>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white font-sans tracking-tight mt-1">
            {activeTab === 'Jobs' ? 'Join the Connect Circle' : (activeTab === 'Home' ? 'Select & Order Pillar Deals' : activeTab)}
          </h2>
          {activeTab === 'Jobs' && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-xl">
              Help us build India's most premium luxury and everyday convenience ecosystem.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6 w-full items-stretch">
          {/* Horizontal Filters Bar */}
          <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3.5">
              <div className="flex items-center gap-1.5 text-slate-850 dark:text-white font-black text-xs mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                <span>FILTERS</span>
              </div>

              {/* Home Tab Filters */}
              {activeTab === 'Home' && (
                <>
                  <select
                    value={selectedCategories[0] || ""}
                    onChange={(e) => setSelectedCategories(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {['Products', 'Services', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Jobs'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={selectedPrices[0] || ""}
                    onChange={(e) => setSelectedPrices(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Prices</option>
                    <option value="under-199">Under ₹199</option>
                    <option value="199-399">₹199 - ₹399</option>
                    <option value="399-599">₹399 - ₹599</option>
                    <option value="above-599">Above ₹599</option>
                  </select>
                </>
              )}

              {/* Products Tab Filters */}
              {activeTab === 'Products' && (
                <>
                  <select
                    value={selectedCategories[0] || ""}
                    onChange={(e) => setSelectedCategories(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {[...new Set(products.filter(p => p.subNavbarCategory === 'Products').map(p => p.category).filter(Boolean))].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={selectedGenders[0] || ""}
                    onChange={(e) => setSelectedGenders(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Genders</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                  <select
                    value={selectedColors[0] || ""}
                    onChange={(e) => setSelectedColors(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Colors</option>
                    {['Black', 'White', 'Blue', 'Green', 'Pink', 'Gold', 'Red'].map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <select
                    value={selectedPrices[0] || ""}
                    onChange={(e) => setSelectedPrices(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Prices</option>
                    <option value="under-199">Under ₹199</option>
                    <option value="199-399">₹199 - ₹399</option>
                    <option value="399-599">₹399 - ₹599</option>
                    <option value="above-599">Above ₹599</option>
                  </select>
                </>
              )}

              {/* Services Tab Filters */}
              {activeTab === 'Services' && (
                <>
                  <select
                    value={selectedServiceTypes[0] || ""}
                    onChange={(e) => setSelectedServiceTypes(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Service Types</option>
                    {[...new Set(products.filter(p => p.subNavbarCategory === 'Services').map(p => p.category).filter(Boolean))].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    value={selectedLocTypes[0] || ""}
                    onChange={(e) => setSelectedLocTypes(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Locations</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </>
              )}

              {/* Daily Needs Tab Filters */}
              {activeTab === 'Daily Needs' && (
                <>
                  <select
                    value={selectedDailyNeedsTypes[0] || ""}
                    onChange={(e) => setSelectedDailyNeedsTypes(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {[...new Set(products.filter(p => p.subNavbarCategory === 'Daily Needs').map(p => p.category).filter(Boolean))].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    value={selectedPrices[0] || ""}
                    onChange={(e) => setSelectedPrices(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Prices</option>
                    <option value="under-100">Under ₹100</option>
                    <option value="100-200">₹100 - ₹200</option>
                    <option value="above-200">Above ₹200</option>
                  </select>
                </>
              )}

              {/* Food Tab Filters */}
              {activeTab === 'Food' && (
                <>
                  <select
                    value={selectedCuisines[0] || ""}
                    onChange={(e) => setSelectedCuisines(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Cuisines</option>
                    {[...new Set(products.filter(p => p.subNavbarCategory === 'Food').map(p => p.category).filter(Boolean))].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <select
                    value={selectedDistances[0] || ""}
                    onChange={(e) => setSelectedDistances(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Distances</option>
                    <option value="under-2km">Under 2 km</option>
                    <option value="2km-5km">2 km - 5 km</option>
                    <option value="above-5km">Above 5 km</option>
                  </select>
                </>
              )}

              {/* Stay Tab Filters */}
              {activeTab === 'Stay' && (
                <>
                  <select
                    value={selectedAccomTypes[0] || ""}
                    onChange={(e) => setSelectedAccomTypes(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Accommodations</option>
                    {[...new Set(products.filter(p => p.subNavbarCategory === 'Stay').map(p => p.category).filter(Boolean))].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    value={selectedPrices[0] || ""}
                    onChange={(e) => setSelectedPrices(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Prices</option>
                    <option value="under-1000">Under ₹1,000</option>
                    <option value="1000-2000">₹1,000 - ₹2,000</option>
                    <option value="2000-5000">₹2,000 - ₹5,000</option>
                    <option value="above-5000">Above ₹5,000</option>
                  </select>
                </>
              )}

              {/* Travel Tab Filters */}
              {activeTab === 'Travel' && (
                <>
                  <select
                    value={selectedTravelTypes[0] || ""}
                    onChange={(e) => setSelectedTravelTypes(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Options</option>
                    {[...new Set(products.filter(p => p.subNavbarCategory === 'Travel').map(p => p.category).filter(Boolean))].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    value={selectedPrices[0] || ""}
                    onChange={(e) => setSelectedPrices(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Prices</option>
                    <option value="under-500">Under ₹500</option>
                    <option value="500-2000">₹500 - ₹2,000</option>
                    <option value="above-2000">Above ₹2,000</option>
                  </select>
                </>
              )}

              {/* Jobs Tab Filters */}
              {activeTab === 'Jobs' && (
                <>
                  <select
                    value={selectedJobDepts[0] || ""}
                    onChange={(e) => setSelectedJobDepts(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Departments</option>
                    {['Operations', 'Business Development', 'Technology'].map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <select
                    value={selectedJobTypes[0] || ""}
                    onChange={(e) => setSelectedJobTypes(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Job Types</option>
                    {['Full-time', 'Remote', 'Hybrid'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    value={selectedJobSalaries[0] || ""}
                    onChange={(e) => setSelectedJobSalaries(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Salaries</option>
                    <option value="under-15l">Under ₹15L L.P.A</option>
                    <option value="15l-25l">₹15L - ₹25L L.P.A</option>
                    <option value="above-25l">Above ₹25L L.P.A</option>
                  </select>
                </>
              )}

              {/* Rating Filter for non-jobs */}
              {activeTab !== 'Jobs' && (
                <select
                  value={selectedRating === null ? "" : selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value ? parseFloat(e.target.value) : null)}
                  className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                >
                  <option value="">All Ratings</option>
                  <option value="4.0">4.0 ★ & Above</option>
                  <option value="4.5">4.5 ★ & Above</option>
                  <option value="4.8">4.8 ★ & Above</option>
                </select>
              )}

              {/* Reset Filters button */}
              <button 
                onClick={clearAllFilters} 
                className="text-xs font-black text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
            
            {/* Right Part: Sorting */}
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Sort By:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="bg-slate-50 dark:bg-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 text-slate-750 cursor-pointer font-extrabold"
              >
                <option value="default">Relevance / Popularity</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Catalog grid or Jobs Board (spanning full width!) */}
          <div className="w-full space-y-6">
            {activeTab === 'Jobs' ? (
              appliedJobId ? (
                /* ================= JOB APPLICATION FORM ================= */
                <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-xs max-w-2xl mx-auto space-y-6 relative overflow-hidden text-slate-800 dark:text-slate-200">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/60 text-left flex-grow">
                      <span className="text-[9px] font-bold text-slate-405 dark:text-slate-500 uppercase tracking-wider block">Applying For</span>
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-1">
                        {jobsList.find(j => j.id === appliedJobId)?.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold">
                        <span className="flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{jobsList.find(j => j.id === appliedJobId)?.department}</span>
                        <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{jobsList.find(j => j.id === appliedJobId)?.location}</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleBackToOpenings}
                      className="ml-4 px-3 py-1.5 border border-slate-200 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {jobSubmitSuccess ? (
                    <div className="text-center py-8 px-4 flex flex-col items-center animate-scale-up">
                      <div className="w-16 h-16 bg-[#10b981]/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-5 border border-emerald-100 dark:border-emerald-900">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">Application Submitted!</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                        Thank you for applying to the Connect App. Our talent acquisition team will review your application and reach out shortly.
                      </p>
                      <button
                        onClick={handleBackToOpenings}
                        className="mt-6 px-6 py-2.5 bg-[#0b1e36] hover:bg-[#13325a] text-white dark:bg-white dark:text-[#0b1e36] dark:hover:bg-slate-100 font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md"
                      >
                        View Other Positions
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleJobSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left font-medium">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                          <input
                            type="text"
                            required
                            value={applicantName}
                            onChange={(e) => setApplicantName(e.target.value)}
                            placeholder="e.g. Dhanush An"
                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                          <input
                            type="email"
                            required
                            value={applicantEmail}
                            onChange={(e) => setApplicantEmail(e.target.value)}
                            placeholder="e.g. dhanush@connect.app"
                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium"
                          />
                        </div>
                      </div>

                      <div className="text-left font-medium">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tell Us About Yourself / Resume Link</label>
                        <textarea
                          required
                          value={applicantResume}
                          onChange={(e) => setApplicantResume(e.target.value)}
                          placeholder="Share your experience, portfolio links, or resume details..."
                          rows={5}
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 resize-none leading-relaxed font-medium"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isJobSubmitting}
                          className="w-full md:w-auto px-8 py-3 bg-[#0b1e36] dark:bg-amber-400 dark:text-[#0b1e36] hover:bg-amber-500 hover:text-[#0b1e36] dark:hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {isJobSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <span>Submit Application</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* ================= JOBS LISTING BOARD ================= */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl px-4 py-3 shadow-xs text-slate-800 dark:text-slate-200">
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">
                      Open Positions <span className="text-xs font-medium text-slate-400 dark:text-slate-500">({filteredJobs.length} items found)</span>
                    </h2>
                  </div>

                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xs text-slate-800 dark:text-slate-300">
                      <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Jobs Match Your Filters</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">Try resetting your filter parameters or search query.</p>
                      <button onClick={clearAllFilters} className="mt-6 text-xs font-bold text-white bg-amber-400 hover:bg-amber-500 px-5 py-2.5 rounded-md transition-all shadow cursor-pointer">Reset All Filters</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredJobs.map((job) => (
                        <div 
                          key={job.id} 
                          className="p-5 bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-xs hover:shadow-md hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between gap-5 group/job text-left text-slate-800 dark:text-slate-200"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2.5 flex-wrap">
                              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {job.type}
                              </span>
                              <span className="text-[10px] text-amber-500 dark:text-amber-400 font-extrabold flex items-center">
                                {job.salary}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 group-hover/job:text-amber-500 transition-colors leading-tight font-sans">
                                {job.title}
                              </h3>
                              <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 uppercase tracking-wide">
                                <span>{job.department}</span>
                                <span>•</span>
                                <span>{job.location}</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1 line-clamp-3 font-medium">
                              {job.desc}
                            </p>
                          </div>
                          
                          <button 
                            onClick={() => setAppliedJobId(job.id)}
                            className="w-full text-center bg-[#0b1e36] dark:bg-amber-400 hover:bg-amber-500 dark:hover:bg-amber-500 text-white dark:text-[#0b1e36] font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center space-x-1"
                          >
                            <span>Apply Now</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            ) : activeTab === 'Membership' ? (
              renderMembershipPrestigeView()
            ) : (
              /* ================= STANDARD PRODUCTS/SERVICES/ETC GRID ================= */
              <>
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xs text-slate-800 dark:text-slate-350">
                    <SlidersHorizontal className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Items Match Your Filters</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">Try resetting your filter parameters or search query.</p>
                    <button onClick={clearAllFilters} className="mt-6 text-xs font-bold text-white bg-amber-400 hover:bg-amber-500 px-5 py-2.5 rounded-md transition-all shadow cursor-pointer">Reset All Filters</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filteredProducts.map((product) => {
                      const isFavorited = favorites.includes(product.id);
                      return (
                        <div key={product.id} onClick={() => setSelectedProduct(product)} className="group bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between text-slate-800 dark:text-slate-200 cursor-pointer hover:-translate-y-0.5">
                          <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center select-none border-b border-slate-100 dark:border-slate-800/60">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                            <span className="absolute left-1.5 top-1.5 bg-slate-900/80 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">{product.tag}</span>
                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }} className="absolute right-1.5 top-1.5 w-6 h-6 rounded-full bg-white/95 text-slate-400 hover:text-red-500 flex items-center justify-center shadow-xs cursor-pointer border border-slate-200/60 transition-transform hover:scale-105">
                              <Heart className={`w-3 h-3 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                          </div>
                          
                          <div className="p-2.5 flex-grow flex flex-col justify-between text-left">
                            <div>
                              <h4 className="text-[10px] font-extrabold text-slate-800 dark:text-slate-100 line-clamp-1 leading-tight group-hover:text-amber-500 transition-colors">{product.name}</h4>
                              <div className="flex items-baseline gap-1 mt-1.5">
                                <span className="text-[11px] font-black text-slate-800 dark:text-white">₹{product.price.toLocaleString()}</span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                <span className="text-[8px] text-[#f43397] font-bold">{product.discount}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-400 dark:text-slate-500 font-semibold"><Truck className="w-3 h-3 text-slate-400" /><span>{product.delivery}</span></div>
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-800/60 mt-2 pt-2 flex items-center justify-between gap-1 w-full">
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-900/30 text-[7px] font-extrabold px-1 py-0.5 rounded flex items-center gap-0.5">
                                  <span>{product.rating}</span>
                                  <Star className="w-2 h-2 fill-emerald-600 text-emerald-600" />
                                </div>
                                <span className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold">({product.reviews})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    addToCart(product); 
                                    triggerNotification(`${product.name} added to cart!`); 
                                  }} 
                                  className="inline-flex items-center gap-0.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-[8px] font-black px-2 py-1 rounded-md transition-all cursor-pointer uppercase shadow-sm border border-amber-500/30"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add</span>
                                </button>
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (!cart.find(item => item.id === product.id)) {
                                      addToCart(product);
                                    }
                                    setIsCartOpen(true);
                                  }} 
                                  className="inline-flex items-center bg-[#10b981] hover:bg-emerald-700 text-white text-[8px] font-black px-2 py-1 rounded-md transition-all cursor-pointer uppercase shadow-sm border border-emerald-750/30"
                                >
                                  <span>Order Now</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 12. DETAILED PRODUCT DESCRIPTION PAGE VIEW
  const renderProductDetailsPage = () => {
    if (!selectedProduct) return null;

    // Price tier calculations
    const pGold = selectedProduct.price;
    const pRegular = selectedProduct.originalPrice || Math.round(selectedProduct.price * 1.25);
    const pDiamond = Math.round(selectedProduct.price * 0.92);
    const saveGold = pRegular - pGold;
    const saveDiamond = pRegular - pDiamond;

    // Gallery images
    const thumbnails = [
      selectedProduct.image,
      selectedProduct.image,
      selectedProduct.image,
      selectedProduct.image,
      selectedProduct.image
    ];

    // Dynamic highlights based on category
    const getProductHighlights = (product) => {
      if (product.category === 'Smartphones') {
        return [
          "6.1-inch Super Retina XDR display",
          "A16 Bionic chip with 5-core GPU",
          "48MP Main camera with 2x Telephoto",
          "12MP TrueDepth front camera with autofocus",
          "USB-C connector with USB 2 support",
          "Up to 20 hours video playback for long days",
          "iOS 17 - More expressive and personal styling"
        ];
      }
      if (product.category === 'Sarees') {
        return [
          "Premium Quality Pure Silk fabric blend",
          "Exquisite Zari embroidered border detailing",
          "Length: 5.5 meters including running blouse",
          "Dry clean only to preserve texture and luster",
          "Handcrafted by local weaver cooperative societies",
          "Ideal for wedding events and ethnic festivals"
        ];
      }
      if (product.category === 'Television') {
        return [
          "4K Ultra HD resolution with active HDR10+",
          "Smart TV platform with pre-installed apps",
          "20W Dolby Atmos high fidelity sound output",
          "3 HDMI ports, 2 USB ports for multi-device hookup",
          "Ultra-slim bezel-less premium aesthetic design",
          "Voice Assistant enabled smart remote controller"
        ];
      }
      if (product.category === 'Headphones') {
        return [
          "Industry-leading active noise cancellation (ANC)",
          "Up to 30 hours battery life with quick charge support",
          "Smart touch control pads for volume and track skipping",
          "Dual beamforming microphones for clear voice calls",
          "Multipoint bluetooth connection support",
          "Foldable design with protective hard carry case"
        ];
      }
      if (product.category === 'Laptops') {
        return [
          "Latest Intel Core i5 processor for fast processing",
          "14-inch Full HD anti-glare display panel",
          "8GB RAM paired with 512GB SSD storage space",
          "Pre-installed Windows 11 with lifetime license",
          "Backlit keyboard for low-light work sessions",
          "Lightweight design weighing only 1.4 kg"
        ];
      }
      return [
        "Exclusive deal verified by Connect App inspectors",
        "Qualifies for extra 5% member cashback rewards",
        "Secure tamper-proof sealed package transit",
        "7-Day hassle-free customer return policy active",
        "Backed by official brand manufacturer warranty",
        "Delivered with priority express shipping privileges"
      ];
    };

    // Recommended products list: same category or fallback to other smartphones/products
    const related = products
      .filter(p => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.category === 'Smartphones'))
      .slice(0, 5);

    return (
      <div className="space-y-8 pb-16 text-slate-800 dark:text-slate-200">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl px-5 py-3 shadow-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => { setSelectedProduct(null); setActiveTab('Home'); setSelectedSubNavbarCategory('All'); }} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none">Home</button>
            <span>&gt;</span>
            <button onClick={() => { 
              const mainCat = selectedProduct.subNavbarCategory || 'Products';
              setSelectedProduct(null); 
              setActiveTab(mainCat); 
              setSelectedSubNavbarCategory(mainCat); 
            }} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none">
              {selectedProduct.subNavbarCategory || 'Products'}
            </button>
            <span>&gt;</span>
            <span className="hover:text-amber-500 transition-colors">{selectedProduct.category}</span>
            <span>&gt;</span>
            <span className="text-slate-800 dark:text-white font-extrabold truncate max-w-[200px]">{selectedProduct.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => triggerNotification("Product link copied to clipboard!")} className="flex items-center gap-1.5 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none">
              <svg className="w-4 h-4 text-slate-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.636-2.318m0 7.152l-4.636-2.318M21 12a3 3 0 11-6 0 3 3 0 016 0zm-12 6a3 3 0 11-6 0 3 3 0 016 0zm0-12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>Share</span>
            </button>
            <span className="text-slate-200 dark:text-slate-800">|</span>
            <button onClick={() => triggerNotification("Added to comparison drawer!")} className="flex items-center gap-1.5 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none">
              <svg className="w-4 h-4 text-slate-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span>Compare</span>
            </button>
          </div>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-xs">
          
          {/* Left Column: Gallery */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="flex gap-4">
              {/* Thumbnails list */}
              <div className="flex flex-col gap-2.5 shrink-0 select-none">
                {thumbnails.map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveProductImage(thumb); setActiveThumbnailIndex(idx); }}
                    className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-all cursor-pointer ${
                      activeThumbnailIndex === idx 
                        ? 'border-amber-400 shadow-md scale-102' 
                        : 'border-slate-200/60 dark:border-slate-800/60 hover:border-slate-350'
                    }`}
                  >
                    <img 
                      src={thumb} 
                      alt="" 
                      className={`w-full h-full object-cover ${
                        idx === 1 ? 'contrast-125 saturate-125' :
                        idx === 2 ? 'hue-rotate-15' :
                        idx === 3 ? 'brightness-90' :
                        idx === 4 ? 'sepia-10' : ''
                      }`} 
                    />
                  </button>
                ))}
                <div onClick={() => setIsGalleryModalOpen(true)} className="w-14 h-14 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                  <span>+3</span>
                  <span>More</span>
                </div>
              </div>

              {/* Main Large Display */}
              <div className="relative flex-grow aspect-square bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 overflow-hidden flex items-center justify-center p-4">
                <img 
                  src={activeProductImage || selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className={`w-full h-full object-contain max-h-[420px] transition-all duration-300 ${
                    activeThumbnailIndex === 1 ? 'contrast-125 saturate-125' :
                    activeThumbnailIndex === 2 ? 'hue-rotate-15' :
                    activeThumbnailIndex === 3 ? 'brightness-90' :
                    activeThumbnailIndex === 4 ? 'sepia-10' : ''
                  }`}
                />
                
                {/* Heart wishlist button */}
                <button 
                  onClick={() => toggleFavorite(selectedProduct.id)} 
                  className="absolute right-4 top-4 w-9.5 h-9.5 rounded-full bg-white/95 dark:bg-[#0a192f] text-slate-450 hover:text-red-500 flex items-center justify-center shadow-md cursor-pointer border border-slate-200/60 dark:border-slate-800/60 transition-transform hover:scale-105"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Media helpers underneath */}
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={() => setIs360ModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all shadow-3xs border border-slate-200/50 dark:border-slate-800/50 cursor-pointer">
                <svg className="w-4 h-4 text-slate-455" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" /></svg>
                <span>View in 360°</span>
              </button>
              <button onClick={() => setIsArModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all shadow-3xs border border-slate-200/50 dark:border-slate-800/50 cursor-pointer">
                <svg className="w-4 h-4 text-slate-455" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>AR View</span>
              </button>
            </div>
          </div>

          {/* Right Column: Specifications, Price Card & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between text-left">
            <div>
              <span className="inline-block bg-[#0b1e36] dark:bg-amber-400/10 text-white dark:text-amber-400 text-[8px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider mb-3">
                {selectedProduct.tag || 'BEST SELLER'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                {selectedProduct.name}
              </h1>
              
              {/* Ratings and Verification */}
              <div className="flex items-center gap-2.5 mb-5 flex-wrap">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4.5 h-4.5 fill-amber-400" />
                  <Star className="w-4.5 h-4.5 fill-amber-400" />
                  <Star className="w-4.5 h-4.5 fill-amber-400" />
                  <Star className="w-4.5 h-4.5 fill-amber-400" />
                  <Star className="w-4.5 h-4.5 fill-amber-405" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {selectedProduct.rating} ({selectedProduct.reviews || 1420} Reviews)
                </span>
                <span className="text-slate-200 dark:text-slate-800">|</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-455 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-2.5 py-0.5 rounded-full">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Verified Purchase
                </span>
              </div>

              {/* Clean Price Display */}
              <div className="flex items-baseline gap-3 mb-5 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{pGold.toLocaleString()}
                </span>
                {pRegular > pGold && (
                  <>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{pRegular.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-sm">
                      {selectedProduct.discount || `${Math.round((1 - pGold/pRegular) * 100)}% off`}
                    </span>
                  </>
                )}
              </div>

              {/* Product Specifications / Highlights (Swapped from bottom) */}
              <div className="bg-slate-50 dark:bg-slate-950/35 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 space-y-3.5">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                  Product Specifications
                </h4>
                <div className="space-y-3 pt-1">
                  {getProductHighlights(selectedProduct).map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-350">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* EMI trigger info */}
              <div className="text-[10px] font-bold text-slate-455 dark:text-slate-500 text-left flex items-center gap-1.5 pl-1.5 mt-4">
                <span>EMI starts from ₹{Math.round(pGold / 20).toLocaleString()}/month</span>
                <span>•</span>
                <button onClick={() => triggerNotification("Opening EMI payment plans options...")} className="text-blue-500 hover:underline bg-transparent border-none cursor-pointer">View EMI Plans</button>
              </div>
            </div>

            {/* Description & Action buttons */}
            <div className="space-y-4 mt-6">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {getProductDescription(selectedProduct)}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    triggerNotification(`${selectedProduct.name} added to cart!`);
                  }}
                  className="flex-1 py-3.5 bg-[#0b1e36] dark:bg-slate-800 hover:bg-[#13325a] dark:hover:bg-slate-700 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-750/30"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span>Add to Cart</span>
                </button>
                <button
                  onClick={() => {
                    if (!cart.find(item => item.id === selectedProduct.id)) {
                      setCart(prev => [...prev, selectedProduct]);
                    }
                    setIsCartOpen(true);
                    triggerNotification(`Proceeding to checkout...`);
                  }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/25 active:scale-98 border-none"
                >
                  <Zap className="w-4.5 h-4.5" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-[#0b1e36] text-white text-center py-2.5 px-4 rounded-xl text-xs font-black tracking-wide shadow-xs">
            Benefits You Unlock With This Purchase
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { title: "500", sub: "Reward Points", detail: "On This Purchase", icon: Award, bg: "bg-amber-50/50 dark:bg-amber-450/5", iconCol: "text-amber-500" },
              { title: "₹2,000", sub: "Travel Voucher", detail: "On Next Booking", icon: Plane, bg: "bg-blue-50/50 dark:bg-blue-450/5", iconCol: "text-blue-500" },
              { title: "₹500", sub: "Food Coupon", detail: "Instant Discount", icon: Utensils, bg: "bg-red-50/50 dark:bg-red-450/5", iconCol: "text-red-500" },
              { title: "1 Year", sub: "Extended Warranty", detail: "By Connect", icon: ShieldCheck, bg: "bg-emerald-50/50 dark:bg-emerald-450/5", iconCol: "text-emerald-500" },
              { title: "Priority", sub: "Customer Support", detail: "24/7 VIP Support", icon: LifeBuoy, bg: "bg-cyan-50/50 dark:bg-cyan-450/5", iconCol: "text-cyan-500" },
              { title: "Free", sub: "Express Delivery", detail: "2-3 Days Delivery", icon: Truck, bg: "bg-indigo-50/50 dark:bg-indigo-450/5", iconCol: "text-indigo-500" },
            ].map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className={`${b.bg} border border-slate-200/40 dark:border-slate-800/40 rounded-2xl p-4.5 text-center flex flex-col items-center justify-center transition-all hover:scale-103 shadow-3xs`}>
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-3xs flex items-center justify-center mb-3">
                    <Icon className={`w-5 h-5 ${b.iconCol}`} />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-white block leading-tight">{b.title}</span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 block mt-0.5 leading-tight">{b.sub}</span>
                  <span className="text-[8px] font-bold text-slate-500 dark:text-slate-300 block mt-1.5 uppercase tracking-wider">{b.detail}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Partner Benefits */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline text-left">
            <h3 className="text-sm font-black text-slate-850 dark:text-white tracking-tight">Partner Benefits You Get</h3>
            <button onClick={() => triggerNotification("Showing partner details and terms...")} className="text-xs font-bold text-blue-500 hover:underline bg-transparent border-none cursor-pointer">View All Partners</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { name: "zomato", disc: "10% OFF", cap: "Up to ₹100", app: "On All Orders", logoCol: "text-[#E23744]", logoBg: "bg-red-50/20", border: "border-red-100 dark:border-red-950/20" },
              { name: "MARRIOTT BONVOY", disc: "15% OFF", cap: "Up to ₹2,000", app: "On Hotel Bookings", logoCol: "text-slate-800 dark:text-slate-200 font-serif tracking-widest text-[9px] uppercase", logoBg: "bg-slate-50/20", border: "border-slate-200 dark:border-slate-800" },
              { name: "make my trip", disc: "5% OFF", cap: "Up to ₹1,500", app: "On Flight Bookings", logoCol: "text-[#008ECF] italic font-black", logoBg: "bg-blue-50/20", border: "border-blue-100 dark:border-blue-950/20" },
              { name: "bb bigbasket", disc: "10% OFF", cap: "Up to ₹500", app: "On Groceries", logoCol: "text-[#84c225] font-black tracking-tighter", logoBg: "bg-green-50/20", border: "border-green-100 dark:border-green-950/20" },
              { name: "TRENDS", disc: "10% OFF", cap: "Up to ₹700", app: "On Fashion", logoCol: "text-slate-800 dark:text-slate-200 font-extrabold tracking-widest", logoBg: "bg-slate-50/20", border: "border-slate-200 dark:border-slate-800" },
              { name: "netmeds", disc: "15% OFF", cap: "Up to ₹300", app: "On Medicines", logoCol: "text-[#00A4A6] font-black", logoBg: "bg-cyan-50/20", border: "border-cyan-100 dark:border-cyan-950/20" }
            ].map((p, idx) => (
              <div key={idx} className={`bg-white dark:bg-[#0a192f] border ${p.border} rounded-2xl p-4 text-center flex flex-col justify-between transition-all hover:-translate-y-0.5 shadow-2xs`}>
                <div className={`h-8 flex items-center justify-center rounded-lg ${p.logoBg} mb-3.5 font-black text-xs px-2`}>
                  {idx === 2 ? (
                    <span className={p.logoCol}>
                      <span className="text-red-500">make</span><span className="text-blue-500">my</span><span className="text-red-500">trip</span>
                    </span>
                  ) : idx === 3 ? (
                    <span className={p.logoCol}>
                      <span className="text-red-500 text-[10px]">bb </span>bigbasket
                    </span>
                  ) : (
                    <span className={p.logoCol}>{p.name}</span>
                  )}
                </div>
                <div className="space-y-0.5 text-center">
                  <span className="text-sm font-black text-slate-850 dark:text-white block">{p.disc}</span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">{p.cap}</span>
                  <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider mt-1.5">{p.app}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ecosystem promotion */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-850 dark:text-white tracking-tight text-left">More Savings Across Connect Ecosystem</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { name: "Food", desc: "Save More on 1000+ Restaurants", icon: Utensils, bg: "from-amber-400/10 to-orange-500/10 hover:border-amber-400", activeTab: "Food" },
              { name: "Stay", desc: "Save More on 5000+ Hotels", icon: BedDouble, bg: "from-blue-400/10 to-indigo-500/10 hover:border-blue-400", activeTab: "Stay" },
              { name: "Travel", desc: "Save More on Flights, Buses & Cabs", icon: Plane, bg: "from-cyan-400/10 to-teal-500/10 hover:border-cyan-400", activeTab: "Travel" },
              { name: "Services", desc: "Save More on 100+ Services", icon: Sparkles, bg: "from-purple-400/10 to-pink-500/10 hover:border-purple-400", activeTab: "Services" },
              { name: "Daily Needs", desc: "Save More on Groceries & Essentials", icon: ShoppingBag, bg: "from-emerald-400/10 to-teal-500/10 hover:border-emerald-400", activeTab: "Daily Needs" }
            ].map((e, idx) => {
              const Icon = e.icon;
              return (
                <div key={idx} className={`bg-gradient-to-br ${e.bg} border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4.5 flex flex-col justify-between items-start text-left group transition-all hover:scale-102 cursor-pointer shadow-3xs`}
                  onClick={() => {
                    setSelectedProduct(null);
                    setActiveTab(e.activeTab);
                    setSelectedSubNavbarCategory(e.activeTab === 'Daily Needs' || e.activeTab === 'Food' || e.activeTab === 'Stay' || e.activeTab === 'Travel' ? e.activeTab : e.activeTab);
                  }}
                >
                  <div>
                    <div className="w-8.5 h-8.5 rounded-full bg-white dark:bg-slate-900 shadow-3xs flex items-center justify-center mb-3.5">
                      <Icon className="w-4 h-4 text-slate-700 dark:text-slate-350 group-hover:scale-110 transition-transform" />
                    </div>
                    <h4 className="text-xs font-black text-slate-850 dark:text-white tracking-wide">{e.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 leading-normal line-clamp-2">{e.desc}</p>
                  </div>
                  <button className="text-[9px] font-black uppercase text-amber-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 mt-4.5 flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer">
                    Explore Offers →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rewards summary widget */}
        <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex-1 space-y-4 text-left w-full">
            <h3 className="text-sm font-black text-slate-850 dark:text-white tracking-tight">Connect Rewards</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {[
                { label: "Total Reward Points", val: "2,540", icon: Award, color: "text-amber-500" },
                { label: "Cashback Earned", val: "₹12,450", icon: Wallet, color: "text-emerald-500" },
                { label: "Referral Earnings", val: "₹1,250", icon: UserCheck, color: "text-blue-500" },
                { label: "Total Savings Till Now", val: "₹25,600", icon: Gift, color: "text-rose-500" }
              ].map((r, idx) => {
                const Icon = r.icon;
                return (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl p-4 flex items-center gap-3 shadow-3xs">
                    <div className={`w-9.5 h-9.5 rounded-full bg-white dark:bg-slate-900 shadow-3xs flex items-center justify-center shrink-0 ${r.color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="leading-tight">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">{r.label}</span>
                      <span className="text-xs font-black text-slate-850 dark:text-white block mt-1">{r.val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start pt-5 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-150 dark:border-slate-800 lg:pl-6">
            <div className="text-left leading-tight hidden md:block">
              <span className="text-xs font-black text-slate-850 dark:text-white block">Unlock Platinum Tiers</span>
              <span className="text-[10px] text-slate-455 dark:text-slate-500 block mt-1.5 max-w-[150px]">Double your savings by getting a Platinum upgrade today.</span>
            </div>
            <button onClick={() => { setIsProfileModalOpen(true); setActiveProfileTab('card'); }} className="bg-[#0b1e36] hover:bg-[#13325a] text-white text-xs font-black uppercase tracking-wider px-5 py-3.5 rounded-xl transition-all shadow cursor-pointer border-none shrink-0 w-full lg:w-auto text-center">
              View Rewards Dashboard
            </button>
          </div>
        </div>

        {/* Why Buy from Connect Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-855 dark:text-white tracking-tight uppercase text-left">Why Buy From Connect App?</h3>
          <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-5 shadow-3xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: "100% Original", detail: "Genuine Products direct from certified brands", icon: ShieldCheck, color: "text-emerald-500" },
              { title: "Secure Payment", detail: "100% Safe, encrypted gateway transaction", icon: "Lock", color: "text-blue-500" },
              { title: "7 Days Return", detail: "Easy, hassle-free reverse pick-up policy", icon: RefreshCw, color: "text-amber-500" },
              { title: "Best Price", detail: "Guaranteed price match to major retailers", icon: Award, color: "text-rose-500" },
              { title: "Priority Support", detail: "24/7 dedicated member helpline access", icon: LifeBuoy, color: "text-cyan-500" }
            ].map((item, idx) => {
              const Icon = item.icon === "Lock" ? ({ className }) => (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              ) : item.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5 text-left">
                  <div className={`w-8.5 h-8.5 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-black text-slate-855 dark:text-white block">{item.title}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{item.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended products carousel */}
        {related.length > 0 && (
          <div className="space-y-4 text-left">
            <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-tight">Customers Also Bought</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
              {related.map((prod) => {
                const isFavorited = favorites.includes(prod.id);
                return (
                  <div 
                    key={prod.id} 
                    onClick={() => {
                      setSelectedProduct(prod);
                    }} 
                    className="group bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-3xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[0.95/1] bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800/60 select-none">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                      {prod.tag && <span className="absolute left-2.5 top-2.5 bg-slate-900/80 text-white text-[7px] font-black px-2 py-0.5 rounded uppercase">{prod.tag}</span>}
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(prod.id); }} 
                        className="absolute right-2.5 top-2.5 w-7.5 h-7.5 rounded-full bg-white/95 dark:bg-[#0a192f] text-slate-450 hover:text-red-500 flex items-center justify-center shadow-3xs cursor-pointer border border-slate-200/60"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>
                    <div className="p-3.5 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-amber-500 transition-colors">{prod.name}</h4>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-xs font-black text-slate-800 dark:text-white">₹{prod.price.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through">₹{prod.originalPrice.toLocaleString()}</span>
                          <span className="text-[9px] text-[#f43397] font-black">{prod.discount}</span>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800/60 mt-3 pt-2.5 flex items-center justify-between gap-1 w-full">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600 animate-pulse" />
                          <span className="text-[8px] font-bold text-slate-700 dark:text-slate-350">{prod.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              addToCart(prod); 
                            }} 
                            className="bg-amber-400 hover:bg-amber-500 text-slate-955 text-[8px] font-black px-2 py-1.5 rounded-lg transition-colors uppercase cursor-pointer shadow-sm border border-amber-500/20 shrink-0"
                          >
                            + Add
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (!cart.find(item => item.id === prod.id)) {
                                addToCart(prod);
                              }
                              setIsCartOpen(true);
                            }} 
                            className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white text-[8px] font-black px-2 py-1.5 rounded-lg transition-all cursor-pointer uppercase shadow-sm border border-emerald-750/30 shrink-0"
                          >
                            Order Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // CHECK SEARCH STATES
  const isMarketplaceView = activeTab !== 'Home' || searchQuery !== '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans antialiased flex flex-col transition-colors duration-300">
      {/* -------------------- NOTIFICATION TOAST -------------------- */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-55 bg-[#0b1e36] text-white border border-white/10 px-5 py-3 rounded-full text-xs font-black shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4.5 h-4.5 text-[#FFC107] animate-pulse" />
          <span>{notification}</span>
        </div>
      )}

      {/* -------------------- HEADER NAVIGATION -------------------- */}
      {renderDashboardHeader()}

      {/* -------------------- CATEGORIES ROW SUB-NAVBAR -------------------- */}
      {renderSubNavbar()}

      {/* -------------------- MAIN SCROLLABLE WRAPPER -------------------- */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto no-scrollbar w-full">
        {selectedProduct ? (
          renderProductDetailsPage()
        ) : isMarketplaceView ? (
          /* SEARCH / CATEGORY DIRECT CATALOG VIEW */
          renderCatalogSection()
        ) : (
          /* MOCKUP MATCHING HOMEPAGE ADAPTIVE DASHBOARD VIEW */
          <div className="space-y-8 w-full text-slate-800 dark:text-slate-200 animate-fade-in">
            {/* Top Row: Welcome Banner & Shopping Promo Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
              <div className="lg:col-span-7 w-full flex">
                {renderWelcomeBanner()}
              </div>
              <div className="lg:col-span-5 w-full flex">
                {renderShoppingPromoBanner()}
              </div>
            </div>

            {/* Second Row: Rewards & Cashbacks & Referral Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
              <div className="lg:col-span-7 w-full flex">
                {renderRewardsCashback()}
              </div>
              <div className="lg:col-span-5 w-full flex">
                {renderReferFriends()}
              </div>
            </div>

            {/* Third Row: Exclusive Member Offers */}
            <div className="w-full">
              {renderExclusiveOffers()}
            </div>

            {/* Fourth Row: Catalog Sections */}
            <div className="w-full space-y-8">
              {renderTopServices()}
              {renderTrendingProducts()}
              {renderStayOffers()}
              {renderPopularRestaurants()}
            </div>
          </div>
        )}
      </main>

      {/* -------------------- 6. CART SIDE DRAWER PANEL -------------------- */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          onClick={() => { if (!orderSuccess) setIsCartOpen(false); }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
        />

        <div 
          className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[#0a192f] border-l border-slate-200 dark:border-slate-800/60 shadow-2xl p-6 md:p-8 flex flex-col justify-between transition-transform duration-500 ease-out z-10 text-slate-800 dark:text-slate-200`}
        >
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#f43397]" />
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">My Shop Cart</h3>
            </div>
            <button 
              disabled={orderSuccess}
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto py-5 space-y-4 no-scrollbar">
            {orderSuccess ? (
              <div className="text-center py-12 animate-scale-up space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
                  <Check className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="text-lg font-bold text-slate-800">Order Placed Successfully!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your payment has been authorized, and items are now routing to shipping. Flat ₹50 discounts applied!
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Your Cart is Empty</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">Add stylish clothing or luxury goods from the marketplace to check out.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-850 relative animate-fade-in text-slate-800 dark:text-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border border-slate-200 bg-white" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-extrabold text-[#f43397]">₹{item.price.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 hover:text-red-500 text-slate-400 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && !orderSuccess && (
            <div className="border-t border-slate-200 pt-6">
              <div className="space-y-2.5 mb-4 text-xs font-semibold">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800">₹{cart.reduce((sum, item) => sum + item.price, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee:</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>1st Order Coupon:</span>
                  <span className="text-emerald-600 font-bold">-₹50</span>
                </div>
                <div className="border-t border-slate-100 pt-2.5 flex justify-between items-baseline text-slate-800">
                  <span className="text-sm font-bold">Estimated Total:</span>
                  <span className="text-xl font-extrabold text-[#f43397]">
                    ₹{Math.max(0, cart.reduce((sum, item) => sum + item.price, 0) - 50).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full py-3 bg-[#0b1e36] hover:bg-[#13325a] text-white font-bold text-xs uppercase tracking-widest rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 animate-pulse"
              >
                <span>Proceed to Place Order</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* -------------------- 8. WISHLIST SIDE DRAWER PANEL -------------------- */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isWishlistOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          onClick={() => setIsWishlistOpen(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
        />

        <div 
          className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[#0a192f] border-l border-slate-200 dark:border-slate-800/60 shadow-2xl p-6 md:p-8 flex flex-col justify-between transition-transform duration-500 ease-out z-10 text-slate-800 dark:text-slate-200`}
        >
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#f43397] fill-[#f43397]" />
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">My Wishlist</h3>
            </div>
            <button 
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto py-5 space-y-4 no-scrollbar">
            {wishlistProducts.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">Your Wishlist is Empty</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">Save items you like here to purchase them later.</p>
              </div>
            ) : (
              wishlistProducts.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-850 relative animate-fade-in gap-3 text-slate-800 dark:text-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border border-slate-200 shrink-0 bg-white" />
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">₹{item.price.toLocaleString()}</span>
                        <span className="text-[10px] text-[#f43397] font-semibold">{item.discount}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>★ {item.rating}</span>
                        <span>•</span>
                        <span>{item.delivery}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button 
                      onClick={() => addToCart(item)}
                      className="bg-[#0b1e36] hover:bg-amber-500 hover:text-[#0b1e36] text-white text-[9px] font-bold px-2 py-1.5 rounded shadow-xs transition-colors cursor-pointer uppercase flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                    <button 
                      onClick={() => toggleFavorite(item.id)}
                      className="text-[9px] font-bold border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 py-1 rounded cursor-pointer transition-colors text-center"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {wishlistProducts.length > 0 && (
            <div className="border-t border-slate-200 pt-6">
              <button 
                onClick={() => {
                  wishlistProducts.forEach(item => addToCart(item));
                  setIsWishlistOpen(false);
                  setIsCartOpen(true);
                  triggerNotification("Added all wishlist items to cart!");
                }}
                className="w-full py-3 bg-[#0b1e36] hover:bg-[#13325a] text-white font-bold text-xs uppercase tracking-widest rounded shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add All to Cart</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* -------------------- 7. PROFILE DETAILS MODAL POP-UP -------------------- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#0a192f] w-screen h-screen flex flex-col md:flex-row overflow-hidden animate-fade-in text-slate-800 dark:text-slate-200">
            {/* Modal Left Navigation Sidebar */}
            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/60 p-5 flex flex-col justify-between shrink-0 text-slate-800 dark:text-slate-200">
              <div className="space-y-6 text-left">
                <div className="flex flex-col items-center text-center gap-3 pb-5 border-b border-slate-200 w-full">
                  <div className="w-16 h-16 rounded-full bg-rose-100 text-[#f43397] flex items-center justify-center font-bold text-2xl border border-rose-200 shadow-xs shrink-0">
                    {(currentUser?.name || profileName).charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div className="w-full overflow-hidden">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 break-all leading-tight">
                      {currentUser?.name || profileName}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider block mt-1.5">Customer Member</span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                    { id: 'wallet', label: 'Connect Wallet', icon: Wallet },
                    { id: 'payments', label: 'Payments', icon: CreditCard },
                    { id: 'card', label: 'Membership Card', icon: Sparkles },
                    { id: 'edit', label: 'Edit Profile', icon: User },
                    { id: 'settings', label: 'Settings', icon: Info }
                  ].map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeProfileTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveProfileTab(tab.id)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all w-full text-left whitespace-nowrap cursor-pointer ${
                          isActive 
                            ? 'bg-[#0b1e36] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white'
                        }`}
                      >
                        <TabIcon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={() => {
                  setIsProfileModalOpen(false);
                  onLogOut();
                }}
                className="mt-6 w-full py-2.5 bg-rose-50 text-red-600 border border-rose-100 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Logout Session</span>
              </button>
            </div>

            {/* Modal Right Content Panel */}
            <div className="flex-grow p-6 md:p-8 overflow-y-auto flex flex-col justify-between bg-white dark:bg-[#0a192f] text-slate-800 dark:text-slate-200">
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute right-5 top-5 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-grow">
                {/* 1. MY ORDERS TAB */}
                {activeProfileTab === 'orders' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    {trackingOrder ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
                          <button
                            onClick={() => {
                              setTrackingOrder(null);
                              setTrackingTimeline([]);
                              setTrackingPartner(null);
                              setTrackingCoords(null);
                            }}
                            className="text-xs text-slate-500 hover:text-[#0b1e36] dark:hover:text-amber-400 flex items-center gap-1 cursor-pointer border-none bg-transparent"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back to Order History</span>
                          </button>
                          <span className="text-[10px] bg-amber-400/10 text-amber-500 border border-amber-400/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            Live Tracking
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-2 text-xs text-slate-800 dark:text-slate-200">
                            <h4 className="font-bold">Order #{trackingOrder.order_number}</h4>
                            <p className="text-slate-500 dark:text-slate-400">Address: <strong>{trackingOrder.customer_address}</strong></p>
                            <p className="text-slate-500 dark:text-slate-400">Items: <strong>{trackingOrder.product_details}</strong></p>
                            <p className="text-slate-500 dark:text-slate-400">Total Amount: <strong className="text-[#f43397] font-extrabold">₹{trackingOrder.amount}</strong></p>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col justify-center text-center space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Estimated Arrival</span>
                            {eta ? (
                              <span className="text-xl font-black text-amber-500">{eta} mins remaining</span>
                            ) : (
                              <span className="text-xs font-bold text-slate-400">Calculating ETA...</span>
                            )}
                            {distanceRemaining !== null && (
                              <span className="text-[10px] text-slate-500">{distanceRemaining.toFixed(2)} km away</span>
                            )}
                          </div>
                        </div>

                        {/* Live Leaflet Map container */}
                        <div className="bg-slate-50 dark:bg-slate-950/40 p-2 border border-slate-150 dark:border-slate-800 rounded-2xl">
                          <div id="customer-tracking-map" className="h-[240px] rounded-xl bg-slate-950 relative overflow-hidden flex items-center justify-center border border-slate-900">
                            <span className="text-xs text-slate-500 animate-pulse font-bold">Initializing live GPS map...</span>
                          </div>
                        </div>

                        {/* Animated Timeline */}
                        <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl text-center">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-left">Delivery Progress Timeline</h4>
                          <div className="flex justify-between items-center relative w-full px-2">
                            {/* Connector Line */}
                            <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10" />
                            
                            {['Order Placed', 'Preparing', 'Ready For Pickup', 'Delivery Partner Accepted', 'Out For Delivery', 'Delivered'].map((step, idx) => {
                              const statusMap = {
                                'Order Received': 0,
                                'Preparing': 1,
                                'Ready For Pickup': 2,
                                'Assigned To Delivery Partner': 2,
                                'Delivery Partner Accepted': 3,
                                'Picked Up': 3,
                                'Out For Delivery': 4,
                                'Near Customer': 4,
                                'Delivered': 5,
                                'Completed': 5
                              };
                              const currentIdx = statusMap[trackingOrder.status] || 0;
                              const isCompleted = idx <= currentIdx;
                              const isActive = idx === currentIdx;
                              
                              return (
                                <div key={idx} className="flex flex-col items-center gap-1.5 z-10">
                                  <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center border font-bold text-[10px] transition-all duration-300 ${
                                    isCompleted 
                                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_8px_#10B981]' 
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                                  }`}>
                                    {isCompleted ? '✓' : idx + 1}
                                  </div>
                                  <span className={`text-[8px] font-bold uppercase transition-colors duration-350 ${
                                    isActive ? 'text-[#f43397]' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                                  }`}>
                                    {step.replace('Delivery Partner ', '')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Delivery Partner Details / Action Panel */}
                        {trackingPartner ? (
                          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={trackingPartner.photo} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 bg-white" />
                              <div className="text-left">
                                <h4 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">{trackingPartner.name}</h4>
                                <span className="text-[10px] text-slate-500 block mt-0.5">{trackingPartner.vehicle_type} • {trackingPartner.vehicle_number}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <a href={`tel:${trackingPartner.mobile}`} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-450 rounded-full border border-slate-250 dark:border-slate-800 transition-colors flex items-center justify-center">
                                <Phone className="w-4 h-4" />
                              </a>
                              
                              {/* OTP Verification code display */}
                              {!['Delivered', 'Completed', 'Cancelled'].includes(trackingOrder.status) && (
                                <div className="bg-amber-400/10 border border-amber-400/30 text-amber-600 dark:text-amber-450 rounded-xl px-3.5 py-1 text-center shrink-0 flex flex-col justify-center">
                                  <span className="text-[8px] uppercase font-bold tracking-wider leading-none">Share Delivery OTP</span>
                                  <span className="text-xs font-black tracking-widest mt-0.5">{trackingOrder.id.replace(/[^\d]/g, '').slice(-4) || '1234'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-xs text-amber-600 dark:text-amber-400 font-bold">
                            Waiting for a delivery partner to accept your order...
                          </div>
                        )}

                        {/* Rating Sub-panel when order status is Delivered */}
                        {['Delivered', 'Completed'].includes(trackingOrder.status) && (
                          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-3 mt-4 text-center">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider text-left">Rate your Delivery Experience</h4>
                            
                            {ratingSuccess ? (
                              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-500 font-bold text-xs flex items-center justify-center gap-1.5 animate-scale-up">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Review submitted! Thank you for your feedback.</span>
                              </div>
                            ) : (
                              <form onSubmit={submitRating} className="space-y-3 text-left">
                                <div className="flex items-center gap-1.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setRatingValue(star)}
                                      className="p-1 cursor-pointer transition-transform hover:scale-110 border-none bg-transparent"
                                    >
                                      <Star className={`w-5 h-5 ${star <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-slate-350'}`} />
                                    </button>
                                  ))}
                                  <span className="text-[10px] font-bold text-slate-500 ml-2">({ratingValue} Stars)</span>
                                </div>
                                
                                <textarea
                                  rows={2}
                                  value={ratingComment}
                                  onChange={(e) => setRatingComment(e.target.value)}
                                  placeholder="Add comments about delivery speed, politeness, safety..."
                                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-white placeholder-slate-700 resize-none focus:outline-none focus:border-amber-400"
                                />
                                
                                <button
                                  type="submit"
                                  onClick={() => setRatingOrder(trackingOrder)}
                                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border-none shadow animate-pulse"
                                >
                                  Submit Delivery Review
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Recent Orders</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Track your shopping orders and deliveries</p>
                        </div>

                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                          {customerOrders.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 text-xs border border-slate-150 dark:border-slate-800/60 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                              You haven't placed any orders yet. Place some deals to start tracking!
                            </div>
                          ) : (
                            customerOrders.map(ord => (
                              <div key={ord.id} className="border border-slate-200 dark:border-slate-800/60 rounded-xl p-4 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20 text-slate-800 dark:text-white">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/20 flex items-center justify-center text-amber-500 text-xs">
                                    🛍️
                                  </div>
                                  <div className="text-left">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{ord.product_details}</h4>
                                    <span className="text-[9px] text-slate-400 block mt-0.5">Order No: #{ord.order_number}</span>
                                    <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(ord.created_at || Date.now()).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                                  <span className="text-xs font-extrabold text-slate-850 dark:text-white">₹{ord.amount}</span>
                                  <div className="flex gap-2 items-center">
                                    {!['Delivered', 'Cancelled'].includes(ord.status) && (
                                      <button
                                        onClick={() => setTrackingOrder(ord)}
                                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 text-[9px] font-black uppercase rounded-lg border-none cursor-pointer"
                                      >
                                        Track Live 🛰️
                                      </button>
                                    )}
                                    {['Delivered'].includes(ord.status) && (
                                      <button
                                        onClick={() => {
                                          setTrackingOrder(ord);
                                        }}
                                        className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[9px] font-black uppercase rounded-lg border border-emerald-500/30 cursor-pointer"
                                      >
                                        Rate Partner ★
                                      </button>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                      ord.status === 'Delivered'
                                        ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                                        : ord.status === 'Cancelled'
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                    }`}>
                                      {ord.status.replace('Delivery Partner ', '')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}


                {/* CONNECT WALLET TAB */}
                {activeProfileTab === 'wallet' && (
                  <div className="animate-fade-in text-left">
                    <WalletPage />
                  </div>
                )}

                {/* PAYMENTS HISTORY TAB */}
                {activeProfileTab === 'payments' && renderPaymentsView()}

                {/* 2. MEMBERSHIP CARD TAB */}
                {activeProfileTab === 'card' && renderMembershipPrestigeView()}

                {/* 3. EDIT PROFILE TAB */}
                {activeProfileTab === 'edit' && (
                  <div className="space-y-6 animate-fade-in text-left">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        
                        // Password change validation
                        if (profilePassword || profileConfirmPassword) {
                          if (profilePassword !== profileConfirmPassword) {
                            triggerNotification("Passwords do not match!");
                            return;
                          }
                          if (profilePassword.length < 6) {
                            triggerNotification("Password must be at least 6 characters long!");
                            return;
                          }
                          localStorage.setItem('connect_profile_password', profilePassword);
                          setProfilePassword('');
                          setProfileConfirmPassword('');
                        }

                        // Persist contact options
                        localStorage.setItem('connect_profile_phone', profilePhone);
                        
                        const savedUserStr = localStorage.getItem('connect_current_user');
                        if (savedUserStr) {
                          try {
                            const u = JSON.parse(savedUserStr);
                            u.name = profileName;
                            u.email = profileEmail;
                            localStorage.setItem('connect_current_user', JSON.stringify(u));
                          } catch (err) {}
                        }

                        triggerNotification("Profile details saved successfully!");
                      }}
                      className="space-y-4 text-left"
                    >
                      <div>
                        <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Edit Profile</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Manage your personal contact details and security credentials</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium text-slate-800 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium text-slate-800 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Contact Phone</label>
                          <input 
                            type="text" 
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium text-slate-800 dark:text-slate-100"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Password</label>
                            <input 
                              type="password" 
                              placeholder="Leave empty to keep unchanged"
                              value={profilePassword}
                              onChange={(e) => setProfilePassword(e.target.value)}
                              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Confirm Password</label>
                            <input 
                              type="password" 
                              placeholder="Leave empty to keep unchanged"
                              value={profileConfirmPassword}
                              onChange={(e) => setProfileConfirmPassword(e.target.value)}
                              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-amber-500 font-medium text-slate-800 dark:text-slate-100"
                            />
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="mt-2 w-full py-2.5 bg-[#0b1e36] hover:bg-amber-500 hover:text-[#0b1e36] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Save Profile Updates
                      </button>
                    </form>

                    <hr className="border-slate-200 dark:border-slate-800" />

                    {renderAddressBookSection()}
                  </div>
                )}

                {/* 4. SETTINGS TAB */}
                {activeProfileTab === 'settings' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">System Settings</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">Control notification alerts and security options</p>
                    </div>

                    <div className="space-y-3.5 pt-2">
                      <label className="flex items-center justify-between cursor-pointer border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Email Notifications</h4>
                          <span className="text-[10px] text-slate-400">Receive order invoices and coupon updates</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settingsNotify}
                          onChange={() => setSettingsNotify(!settingsNotify)}
                          className="accent-[#0b1e36] w-4.5 h-4.5 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">SMS Tracking Alerts</h4>
                          <span className="text-[10px] text-slate-400">Get courier delivery status via phone message</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settingsSMS}
                          onChange={() => setSettingsSMS(!settingsSMS)}
                          className="accent-[#0b1e36] w-4.5 h-4.5 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer pb-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">Two-Factor Authentication</h4>
                          <span className="text-[10px] text-slate-400">Enforce extra layer of password code security</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={settingsSecurity}
                          onChange={() => setSettingsSecurity(!settingsSecurity)}
                          className="accent-[#0b1e36] w-4.5 h-4.5 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 text-[10px] text-center text-slate-400 font-semibold leading-none">
                Connect Wallet Client v1.2.6 • Forge India Secure Node
              </div>
            </div>
        </div>
      )}

      {/* ==================== MEMBERSHIP BENEFITS MODAL ==================== */}
      {showBenefitsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in text-slate-800">
          <div onClick={() => setShowBenefitsModal(false)} className="absolute inset-0" />
          
          <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] z-10 text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-500 flex items-center justify-center border border-amber-400/20">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">Membership Privileges</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Unlocked by your active {tier.name} tier</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBenefitsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-6 text-left">
              {/* Card visual showcase */}
              <div className={`relative w-full max-w-sm aspect-[1.58/1] rounded-2xl p-5 overflow-hidden shadow-lg border mx-auto select-none ${cardStyle.cardBg} ${cardStyle.cardText} ${cardStyle.cardBorder}`}>
                <div className="flex justify-between items-start">
                  <div className="flex flex-col leading-none">
                    <span className={`text-xs font-black uppercase tracking-widest font-serif ${cardStyle.brandText}`}>Connect App</span>
                    <span className={`text-[7px] font-bold uppercase tracking-wider mt-0.5 ${cardStyle.subText}`}>Active Privilege Pass</span>
                  </div>
                  <div className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${cardStyle.badgeBg}`}>
                    {tier.name}
                  </div>
                </div>
                <div className="mt-8 flex flex-col justify-between h-18">
                  <span className={`text-sm md:text-base font-bold tracking-widest font-mono ${cardStyle.accentText}`}>
                    CONN - 8812 - 0495 - 2038
                  </span>
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col leading-none">
                      <span className={`text-[7px] font-bold uppercase tracking-wider ${cardStyle.subText}`}>MEMBER NAME</span>
                      <span className={`text-xs font-extrabold tracking-wide uppercase mt-1 ${cardStyle.accentText}`}>
                        {profileName}
                      </span>
                    </div>
                    <div className="flex flex-col leading-none text-right">
                      <span className={`text-[7px] font-bold uppercase tracking-wider ${cardStyle.subText}`}>EXP DATE</span>
                      <span className={`text-xs font-extrabold tracking-wide mt-1 ${cardStyle.accentText}`}>12 / 2028</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits list section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-150 dark:border-slate-800 pb-2">
                  Tier Privileges Summary
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className={`border rounded-2xl p-4 flex gap-3 text-left ${tier.name.toLowerCase().includes('silver') ? 'bg-slate-50/50 dark:bg-slate-800/10 border-slate-300 dark:border-slate-700/60' : 'opacity-60 border-slate-100 dark:border-slate-900 bg-transparent'}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-400/15 flex items-center justify-center shrink-0 border border-slate-400/20 text-slate-405">
                      <Star className="w-4 h-4 fill-current text-slate-400" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Silver Member Perks</h5>
                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 space-y-1.5 list-disc pl-3">
                        <li>Flat 5% Off on all Products and Daily Needs</li>
                        <li>Standard priority order packaging & delivery</li>
                        <li>Earn 1.2x reward points on all transactions</li>
                        <li>Free standard shipping on orders over ₹499</li>
                      </ul>
                    </div>
                  </div>

                  <div className={`border rounded-2xl p-4 flex gap-3 text-left ${tier.name.toLowerCase().includes('gold') ? 'bg-amber-500/5 dark:bg-amber-400/5 border-amber-300 dark:border-amber-900/40' : 'opacity-60 border-slate-100 dark:border-slate-900 bg-transparent'}`}>
                    <div className="w-8 h-8 rounded-full bg-amber-400/15 flex items-center justify-center shrink-0 border border-amber-400/20 text-amber-500">
                      <Sparkles className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-850 dark:text-amber-400">Gold Member Perks</h5>
                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 space-y-1.5 list-disc pl-3">
                        <li>Flat 15% discount on partner Stay bookings</li>
                        <li>Flat 10% off restaurant bills & food vouchers</li>
                        <li>Priority shipping & express package dispatch</li>
                        <li>Earn 2.0x reward points on all transactions</li>
                        <li>Access to dedicated Gold customer support hotline</li>
                      </ul>
                    </div>
                  </div>

                  <div className={`border rounded-2xl p-4 flex gap-3 text-left md:col-span-2 ${tier.name.toLowerCase().includes('diamond') ? 'bg-cyan-500/5 dark:bg-cyan-400/5 border-cyan-300 dark:border-cyan-900/40' : 'opacity-60 border-slate-100 dark:border-slate-900 bg-transparent'}`}>
                    <div className="w-8 h-8 rounded-full bg-cyan-400/15 flex items-center justify-center shrink-0 border border-cyan-400/20 text-cyan-555">
                      <Gem className="w-4 h-4 fill-current text-cyan-500" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-855 dark:text-cyan-400">Diamond Member Perks</h5>
                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 list-disc pl-3">
                        <li>Complimentary global airport executive lounge access</li>
                        <li>Flat 25% discount on stays and private pool villas</li>
                        <li>Flat 20% off fine dining & Michelin-star dining partners</li>
                        <li>Earn 3.0x reward points on all transactions</li>
                        <li>Dedicated 24/7 personal banking lifestyle concierge</li>
                        <li>Unlimited free next-day express delivery nationwide</li>
                        <li>Exclusive invites to VIP product launch events</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800/60 text-center">
              <button 
                onClick={() => { setShowBenefitsModal(false); setShowUpgradeModal(true); }}
                className="py-2.5 px-6 bg-[#0b1e36] dark:bg-amber-400 dark:text-[#0b1e36] text-white hover:bg-amber-500 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Upgrade Plan Options
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MEMBERSHIP UPGRADE MODAL ==================== */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in text-slate-800">
          <div onClick={() => setShowUpgradeModal(false)} className="absolute inset-0" />
          
          <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800/60 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-full bg-amber-400/10 text-amber-500 flex items-center justify-center border border-amber-400/20">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">Elevate Your Membership</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Choose a premium tier to unlock high-fidelity rewards</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card grid options */}
            <div className="p-6 overflow-y-auto no-scrollbar space-y-6 text-slate-800 dark:text-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. SILVER PLAN - Show only if current tier is Silver */}
                {(currentMembershipTier || '').toLowerCase().includes('silver') && (
                  <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 rounded-2xl p-5 flex flex-col justify-between text-left min-h-[360px]">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 rounded-full bg-slate-400/10 text-slate-500 flex items-center justify-center border border-slate-400/20">
                          <Star className="w-4 h-4 fill-slate-400 text-slate-400" />
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-550 border border-slate-200 font-black px-2 py-0.5 rounded">Silver Tier</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Silver Membership</h4>
                        <span className="text-lg font-black text-slate-800 dark:text-slate-300 font-mono mt-1 block">₹4,000<span className="text-[10px] font-bold text-slate-400">/year</span></span>
                      </div>
                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-3 leading-relaxed">
                        <li>5% off on products</li>
                        <li>Standard shipping and support</li>
                        <li>1.2x Reward Multiplier</li>
                      </ul>
                    </div>
                    <button 
                      disabled 
                      className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-black uppercase rounded-lg border border-slate-200 dark:border-slate-700 cursor-not-allowed text-center"
                    >
                      Current Plan
                    </button>
                  </div>
                )}

                {/* 2. GOLD PLAN - Show if current tier is Silver or Gold */}
                {((currentMembershipTier || '').toLowerCase().includes('silver') || (currentMembershipTier || '').toLowerCase().includes('gold')) && (
                  <div className={`border ${
                    (currentMembershipTier || '').toLowerCase().includes('gold') ? 'border-amber-400 ring-2 ring-amber-400/10 bg-amber-500/5' : 'border-slate-200 dark:border-slate-800'
                  } rounded-2xl p-5 flex flex-col justify-between text-left min-h-[360px] relative`}>
                    {(currentMembershipTier || '').toLowerCase().includes('gold') && (
                      <span className="absolute top-3 right-3 bg-amber-400 text-[#0b1e36] text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                    )}
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="w-8 h-8 rounded-full bg-amber-400/10 text-amber-500 flex items-center justify-center border border-amber-400/20">
                          <Sparkles className="w-4 h-4 fill-amber-400 text-amber-400" />
                        </div>
                        <span className="text-[9px] bg-amber-400/15 text-amber-600 dark:text-amber-400 border border-amber-450/20 font-black px-2 py-0.5 rounded">Gold Elite</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">Gold Membership</h4>
                        <span className="text-lg font-black text-slate-800 dark:text-slate-300 font-mono mt-1 block">₹8,000<span className="text-[10px] font-bold text-slate-400">/year</span></span>
                      </div>
                      <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-3 leading-relaxed">
                        <li>15% off Stays & 10% off Dining</li>
                        <li>Priority express dispatch</li>
                        <li>2.0x Reward Multiplier</li>
                        <li>Dedicated helpdesk support</li>
                      </ul>
                    </div>
                    {(currentMembershipTier || '').toLowerCase().includes('gold') ? (
                      <button 
                        disabled 
                        className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-black uppercase rounded-lg border border-slate-200 dark:border-slate-700 cursor-not-allowed text-center"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setCurrentMembershipTier('Gold Elite');
                          setShowUpgradeModal(false);
                          triggerNotification("Congratulations! You have upgraded to Gold Membership!");
                        }}
                        className="mt-6 w-full py-2 bg-amber-400 hover:bg-amber-500 text-[#0b1e36] text-xs font-black uppercase rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Upgrade to Gold
                      </button>
                    )}
                  </div>
                )}

                {/* 3. DIAMOND PLAN - Always show */}
                <div className={`border ${
                  (currentMembershipTier || '').toLowerCase().includes('diamond') ? 'border-cyan-400 ring-2 ring-cyan-400/10 bg-cyan-500/5' : 'border-slate-200 dark:border-slate-800/80 hover:border-cyan-450/40'
                } rounded-2xl p-5 flex flex-col justify-between text-left min-h-[360px] relative`}>
                  {(currentMembershipTier || '').toLowerCase().includes('diamond') && (
                    <span className="absolute top-3 right-3 bg-cyan-400 text-cyan-950 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                  )}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 rounded-full bg-cyan-400/10 text-cyan-500 flex items-center justify-center border border-cyan-400/20">
                        <Gem className="w-4 h-4 fill-cyan-450 text-cyan-450" />
                      </div>
                      <span className="text-[9px] bg-cyan-400/15 text-cyan-600 dark:text-cyan-400 border border-cyan-450/20 font-black px-2 py-0.5 rounded">Diamond Prestige</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">Diamond Membership</h4>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-300 font-mono mt-1 block">₹20,000<span className="text-[10px] font-bold text-slate-400">/year</span></span>
                    </div>
                    <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-3 leading-relaxed">
                      <li>Complimentary global airport VIP lounges</li>
                      <li>25% off luxury Villas & 20% off Fine Dining</li>
                      <li>3.0x Reward Multiplier</li>
                      <li>24/7 dedicated lifestyle concierge manager</li>
                      <li>Unlimited next-day express deliveries</li>
                    </ul>
                  </div>
                  {(currentMembershipTier || '').toLowerCase().includes('diamond') ? (
                    <button 
                      disabled 
                      className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 text-xs font-black uppercase rounded-lg border border-slate-200 dark:border-slate-700 cursor-not-allowed text-center"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setCurrentMembershipTier('Diamond Prestige');
                        setShowUpgradeModal(false);
                        triggerNotification("Congratulations! You have upgraded to Diamond Membership!");
                      }}
                      className="mt-6 w-full py-2 bg-cyan-400 hover:bg-cyan-500 text-cyan-955 text-xs font-black uppercase rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Upgrade to Diamond
                    </button>
                  )}
                </div>

              </div>

              {/* Special instructions */}
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400">
                <Info className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                <span className="font-medium">Notice: Membership fees are billed annually. Current members receive a pro-rated refund on their remaining time when choosing to upgrade.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
