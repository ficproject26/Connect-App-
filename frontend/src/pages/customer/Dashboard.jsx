import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { apiFetch } from '../../services/api';
import { getAdminBackendUrl } from '../../services/apiSetup';
import { productService } from '../../services/productService';
import { socketService } from '../../services/socketService';
import useCustomer from '../../hooks/useCustomer';
import WalletPage from './Wallet';
import Offers from './Offers';

const LiveClock = React.memo(({ prefix = '' }) => {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span>{prefix}{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>;
});

// Fix leaflet marker default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

import { 
  Search, Star, SlidersHorizontal, ShoppingBag, Check, Minus, Plus, X, Zap,
  ChevronLeft, ChevronRight, Sparkles, Percent, Heart, ShieldCheck, 
  ShoppingCart, Truck, User, Info, RefreshCw, ChevronDown, ChevronUp,
  LayoutDashboard, CreditCard, Gift, BedDouble, Plane, Wallet, Receipt, Award, 
  LifeBuoy, LogOut, MapPin, Phone, Bell, Copy, Briefcase, Utensils, UserCheck, Settings, Wind,
  Activity, GraduationCap, Building2, Landmark, ShieldAlert, Sun, Moon,
  Gem, CheckCircle2, Home, ArrowRight, Tag, Clock, Trash2, Users, ThumbsUp, Calendar
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
import phoneMockupDashboard from '../../assets/images/phone_mockup_dashboard.png';

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

const getModalTerms = (item) => {
  if (!item) return {
    title: "",
    label: "",
    category: "",
    type1: "",
    type2: "",
    feeLabel: "",
    durationText: "",
    summaryLabel: ""
  };
  
  const catLower = (item.category || '').toLowerCase();
  const subNavLower = (item.subNavbarCategory || '').toLowerCase();
  const tagLower = (item.tag || '').toLowerCase();
  const nameLower = (item.name || '').toLowerCase();

  const isTravel = subNavLower === 'travel' || tagLower === 'travel' || 
    catLower.includes('travel') || catLower.includes('bus') || catLower.includes('flight') || catLower.includes('tour') ||
    nameLower.includes('travel') || nameLower.includes('bus');
  
  const isStay = !isTravel && (subNavLower === 'stay' || tagLower === 'stay' || catLower.includes('hotel') || catLower.includes('resort') || catLower.includes('stay'));
  
  if (isStay) {
    return {
      title: 'Select Room & Dates',
      label: "Host",
      category: item.category || "Hotel",
      type1: "Deluxe Suite",
      type2: "Standard Room",
      feeLabel: "Stay Fee",
      durationText: "Check-in: 12:00 PM | Checkout: 11:00 AM",
      summaryLabel: "Hotel Stay"
    };
  }
  if (isTravel) {
    return {
      title: 'Select Travel Ticket & Date',
      label: "Agent",
      category: item.category || "Travel Tour",
      type1: "AC Sleeper",
      type2: "Seater",
      feeLabel: "Travel Ticket Fee",
      durationText: "Departure details sent after booking approval",
      summaryLabel: "Travel Ticket"
    };
  }
  // Default: Services/Hospitals
  return {
    title: 'Schedule Appointment',
    label: "Doctor",
    category: item.category || "Specialist",
    type1: "Video Consultation",
    type2: "In-clinic Visit",
    feeLabel: "Consultation Fee",
    durationText: "Consultation duration: 30 mins | Please arrive 10 mins early",
    summaryLabel: "Doctor"
  };
};

const isPreviousDate = (year, month, day) => {
  const date = new Date(year, month, day);
  date.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date.getTime() < today.getTime();
};

const isDateAlreadyBooked = (year, month, day) => {
  // Lock July 22nd and July 27th, 2026
  if (year === 2026 && month === 6 && (day === 22 || day === 27)) {
    return true;
  }
  // Also block 22nd and 27th of the current calendar month for easier demonstration
  const today = new Date();
  if (year === today.getFullYear() && month === today.getMonth() && (day === 22 || day === 27)) {
    return true;
  }
  return false;
};

const getGuestsCount = (product) => {
  if (!product) return null;
  const val = product.guests !== undefined ? product.guests : (product.maxGuests !== undefined ? product.maxGuests : product.capacity);
  if (val === undefined || val === null) return null;
  if (typeof val === 'object') {
    if (Array.isArray(val)) return val.length;
    if (val.count !== undefined) return val.count;
    if (val.value !== undefined) return val.value;
    return null;
  }
  return val;
};

export default function CustomerDashboard({ currentUser, onLogOut, onJobsClick, onCategoryClick }) {
  const { walletBalance, membershipTier, updateTier, addTransaction } = useCustomer();
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );
  
  const [products, setProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState('Red');
  const [selectedSize, setSelectedSize] = useState('8');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [selectedBusType, setSelectedBusType] = useState('');
  const [selectedBusClass, setSelectedBusClass] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [checkInTime, setCheckInTime] = useState('12:00 PM');
  const [checkOutTime, setCheckOutTime] = useState('11:00 AM');
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);

  useEffect(() => {
    const loadVendorProducts = async () => {
      try {
        const res = await productService.getProducts();
        if (res && res.success && Array.isArray(res.products)) {
          const patched = res.products.map(p => {
            const updated = { ...p };
            // Correct Eggs category
            if (p.name && p.name.toLowerCase().includes('egg') && p.category === 'Rice') {
              updated.category = 'Eggs';
            }
            // Correct doctor images
            if (p.subNavbarCategory === 'Services' && (!p.image || p.image.includes('unsplash.com/photo-1523275335684-37898b6baf30'))) {
              if (p.name && p.name.toLowerCase().includes('robert')) {
                updated.image = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=60';
              } else if (p.name && p.name.toLowerCase().includes('james')) {
                updated.image = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=60';
              } else if (p.name && p.name.toLowerCase().includes('emily')) {
                updated.image = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=60';
              } else {
                updated.image = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=60';
              }
            }
            // Assign foodType (Veg / Non-Veg) for Food items
            if (p.subNavbarCategory === 'Food' || p.category === 'Fine Dining' || p.category === 'Biryani') {
              const nameLower = (p.name || '').toLowerCase();
              const descLower = (p.description || '').toLowerCase();
              const catLower = (p.category || '').toLowerCase();
              if (
                nameLower.includes('chicken') || 
                nameLower.includes('mutton') || 
                nameLower.includes('egg') || 
                nameLower.includes('fish') || 
                nameLower.includes('meat') || 
                nameLower.includes('non-veg') ||
                nameLower.includes('non veg') ||
                catLower.includes('non-veg') ||
                catLower.includes('non veg') ||
                descLower.includes('chicken') ||
                descLower.includes('mutton')
              ) {
                updated.foodType = 'Non-Veg';
              } else {
                // If it's a biryani but not explicitly veg, let's make it Non-Veg to have variety
                if (nameLower.includes('biryani') && !nameLower.includes('veg')) {
                  updated.foodType = 'Non-Veg';
                } else {
                  updated.foodType = 'Veg';
                }
              }
            }
            // Patch Travel (Bus) items with fromCity, toCity, busType, busClass
            if (p.subNavbarCategory === 'Travel') {
              updated.fromCity = p.fromCity || 'Bangalore';
              updated.toCity = p.toCity || 'Chennai';
              updated.busType = (p.description?.toLowerCase().includes('non-ac') || p.name?.toLowerCase().includes('non-ac')) ? 'Non-AC' : 'AC';
              updated.busClass = (p.description?.toLowerCase().includes('seater') || p.name?.toLowerCase().includes('seater')) ? 'Seater' : 'Sleeper';
            }
            return updated;
          });
          setProducts(patched);
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
  const [activeScheduleModalItem, setActiveScheduleModalItem] = useState(null);
  const [activeBookNowModalItem, setActiveBookNowModalItem] = useState(null);

  useEffect(() => {
    if (activeScheduleModalItem || activeBookNowModalItem) {
      setCheckInTime('12:00 PM');
      setCheckOutTime('11:00 AM');
      setAdultCount(1);
      setChildCount(0);
      setCustomTimeInput('');
      setActiveDateTab('checkIn');
    }
  }, [activeScheduleModalItem, activeBookNowModalItem]);
  const formatDateYYYYMMDD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getFormattedModalDate = (date) => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const todayObj = new Date();
  const tomorrowObj = new Date();
  tomorrowObj.setDate(todayObj.getDate() + 1);

  const [selectedModalDate, setSelectedModalDate] = useState(() => getFormattedModalDate(todayObj));
  const [selectedModalTime, setSelectedModalTime] = useState('11:00 AM');
  const [selectedModalType, setSelectedModalType] = useState('Video Consultation');
  const [selectedTimeOfDayTab, setSelectedTimeOfDayTab] = useState('Morning');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(todayObj.getMonth());
  const [currentYear, setCurrentYear] = useState(todayObj.getFullYear());
  const [selectedModalDay, setSelectedModalDay] = useState(todayObj.getDate());
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [stayCheckInDate, setStayCheckInDate] = useState(() => formatDateYYYYMMDD(todayObj));
  const [stayCheckOutDate, setStayCheckOutDate] = useState(() => formatDateYYYYMMDD(tomorrowObj));
  const [activeDateTab, setActiveDateTab] = useState('checkIn'); // 'checkIn' | 'checkOut'

  const formatDateFromYYYYMMDD = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const checkInTimeSlots = [
    { time: '09:00 AM', status: 'Available' },
    { time: '10:00 AM', status: 'Available' },
    { time: '11:00 AM', status: 'Available' },
    { time: '12:00 PM', status: 'Available' },
    { time: '01:00 PM', status: 'Not Available' },
    { time: '02:00 PM', status: 'Available' },
    { time: '03:00 PM', status: 'Available' },
    { time: '04:00 PM', status: 'Available' },
    { time: '05:00 PM', status: 'Not Available' },
    { time: '06:00 PM', status: 'Available' }
  ];

  const checkOutTimeSlots = [
    { time: '09:00 AM', status: 'Available' },
    { time: '10:00 AM', status: 'Available' },
    { time: '11:00 AM', status: 'Available' },
    { time: '12:00 PM', status: 'Available' },
    { time: '01:00 PM', status: 'Available' },
    { time: '02:00 PM', status: 'Not Available' },
    { time: '03:00 PM', status: 'Available' },
    { time: '04:00 PM', status: 'Available' }
  ];

  const generateUpcomingDates = (startDateStr, count = 14) => {
    const dates = [];
    let base = new Date();
    if (startDateStr && !isNaN(new Date(startDateStr + 'T00:00:00').getTime())) {
      base = new Date(startDateStr + 'T00:00:00');
    }
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < count; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateStr = formatDateYYYYMMDD(d);
      const isAvailable = (i % 5 !== 3);
      dates.push({
        dateStr,
        dayNumber: d.getDate(),
        dayName: weekdays[d.getDay()],
        monthName: months[d.getMonth()],
        formatted: `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`,
        isAvailable
      });
    }
    return dates;
  };

  const [stayRoomsCount, setStayRoomsCount] = useState(1);
  const [stayGuestsCount, setStayGuestsCount] = useState(2);
  const [travelDetailsTab, setTravelDetailsTab] = useState('Overview');
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('Home'); // 'Home', 'Services', 'Products', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Offers'
  const [previewMembershipTier, setPreviewMembershipTier] = useState(membershipTier || 'Gold Elite');

  useEffect(() => {
    setPreviewMembershipTier(membershipTier || 'Gold Elite');
  }, [membershipTier]);

  const [dbBanners, setDbBanners] = useState([]);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isHeroBannerHovered, setIsHeroBannerHovered] = useState(false);

  useEffect(() => {
    if (isHeroBannerHovered) return;
    const total = (dbBanners?.length || 0) + 4;
    const timer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [dbBanners, isHeroBannerHovered]);

  // Category-specific Filter States
  const [selectedServiceTypes, setSelectedServiceTypes] = useState([]);
  const [selectedLocTypes, setSelectedLocTypes] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedDistances, setSelectedDistances] = useState([]);
  const [selectedFoodType, setSelectedFoodType] = useState('All');
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
        return u.name || currentUser?.name || 'Dhanush Tamilarasan';
      } catch (e) {}
    }
    return currentUser?.name || 'Dhanush Tamilarasan';
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
        name: 'Dhanush Tamilarasan',
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

  const [selectedOrdersTab, setSelectedOrdersTab] = useState('All Orders');
  // Derived filtered orders based on selected orders tab
  const filteredCustomerOrders = useMemo(() => {
    if (selectedOrdersTab === 'All Orders') return customerOrders;
    return customerOrders.filter(o => {
      const status = (o.status || '').toLowerCase();
      const tab = selectedOrdersTab.toLowerCase();
      if (tab === 'processing') return ['order received', 'preparing', 'ready for pickup'].includes(status);
      if (tab === 'in transit') return ['out for delivery', 'delivery partner accepted', 'picked up', 'near customer', 'assigned to delivery partner'].includes(status);
      if (tab === 'delivered') return ['delivered', 'completed'].includes(status);
      if (tab === 'cancelled') return status === 'cancelled';
      if (tab === 'returned') return status === 'returned';
      return true;
    });
  }, [customerOrders, selectedOrdersTab]);

  // Map references
  const customerMapRef = useRef(null);
  const customerRiderMarkerRef = useRef(null);
  const customerRoutePolylineRef = useRef(null);


  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const mainScrollRef = useRef(null);

  useEffect(() => {
    setSelectedProduct(null);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [activeTab, selectedSubNavbarCategory]);

  const [activeProductImage, setActiveProductImage] = useState(null);
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);

  // Synchronize selectedProduct gallery details and scroll position on change
  useEffect(() => {
    setActiveProductImage(null);
    setActiveThumbnailIndex(0);
    setSelectedColor('Red');
    setSelectedSize('8');
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
  }, [selectedProduct]);

  // Keep track of the last pushed product ID to avoid duplicate pushState calls on popstate
  const lastPushedProductIdRef = useRef(null);

  useEffect(() => {
    const currentId = selectedProduct ? selectedProduct.id : null;
    if (currentId !== lastPushedProductIdRef.current) {
      if (selectedProduct) {
        window.history.pushState({ productId: selectedProduct.id }, '');
      } else {
        if (lastPushedProductIdRef.current !== null) {
          window.history.pushState(null, '');
        }
      }
      lastPushedProductIdRef.current = currentId;
    }
  }, [selectedProduct]);

  useEffect(() => {
    const handlePopState = (event) => {
      const stateId = event.state && event.state.productId ? event.state.productId : null;
      lastPushedProductIdRef.current = stateId;
      
      if (stateId) {
        const prod = products.find(p => p.id === stateId || String(p.id) === String(stateId));
        if (prod) {
          setSelectedProduct(prod);
          return;
        }
      }
      setSelectedProduct(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  const [activeJobCategory, setActiveJobCategory] = useState('ALL');
  const [activeServiceCategory, setActiveServiceCategory] = useState('ALL');
  const [activeProductCategory, setActiveProductCategory] = useState('ALL');
  const [activeDailyNeedsCategory, setActiveDailyNeedsCategory] = useState('ALL');
  const [activeFoodCategory, setActiveFoodCategory] = useState('ALL');
  const [activeStayCategory, setActiveStayCategory] = useState('ALL');
  const [activeTravelCategory, setActiveTravelCategory] = useState('ALL');

  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    const fetchDbCategories = async () => {
      try {
        let res = await fetch(`${getAdminBackendUrl()}/api/admin/categories`);
        if (!res.ok) {
          res = await fetch('http://localhost:8001/api/admin/categories');
        }
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDbCategories(data);
          }
        }
      } catch (err) {
        try {
          const res = await fetch('http://localhost:8001/api/admin/categories');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) setDbCategories(data);
          }
        } catch (e) {
          console.warn("Failed to fetch dynamic categories in customer dashboard", err);
        }
      }
    };

    const fetchDbBanners = async () => {
      try {
        let res = await fetch(`${getAdminBackendUrl()}/api/admin/public/banners`);
        if (!res.ok) {
          res = await fetch('http://localhost:8001/api/admin/public/banners');
        }
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDbBanners(data);
          }
        }
      } catch (err) {
        try {
          const res = await fetch('http://localhost:8001/api/admin/public/banners');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) setDbBanners(data);
          }
        } catch (e) {
          console.warn("Failed to fetch dynamic banners in customer dashboard", err);
        }
      }
    };

    fetchDbCategories();
    fetchDbBanners();
  }, []);

  // --- DELIVERY TRACKING LOGIC & LIFECYCLES ---

  const loadCustomerOrders = async () => {
    try {
      const res = await apiFetch('/orders');
      if (res.status === 'success') {
        const name = profileName || currentUser?.name || 'Dhanush Tamilarasan';
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
      html: `<div class="w-8 h-8 rounded-full bg-violet-600 border-2 border-slate-900 flex items-center justify-center text-white font-bold shadow-lg"></div>`,
      iconSize: [32, 32]
    });

    const customerIcon = L.divIcon({
      className: 'customer-marker',
      html: `<div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white font-bold shadow-lg"></div>`,
      iconSize: [32, 32]
    });

    const riderIcon = L.divIcon({
      className: 'rider-marker',
      html: `<div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-bold shadow-lg animate-pulse"></div>`,
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
          mainEl.scrollTop = 0;
        }
        window.scrollTo(0, 0);
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
  const enterTimeoutRef = React.useRef(null);
  const leaveTimeoutRef = React.useRef(null);

  const handleMouseEnter = (linkName) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    
    enterTimeoutRef.current = setTimeout(() => {
      setHoveredLink(linkName);
    }, 500); // 500ms delay: show only if cursor stops/pauses on the tab
  };

  const handleMouseLeave = () => {
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    
    leaveTimeoutRef.current = setTimeout(() => {
      setHoveredLink(null);
    }, 150);
  };

  // Job Application States
  const [appliedJobId, setAppliedJobId] = useState(null);
  const [applicantName, setApplicantName] = useState(profileName || currentUser?.name || 'Dhanush Tamilarasan');
  const [applicantEmail, setApplicantEmail] = useState(profileEmail || currentUser?.email || 'dhanush@connect.app');
  const [applicantResume, setApplicantResume] = useState('');
  const [isJobSubmitting, setIsJobSubmitting] = useState(false);
  const [jobSubmitSuccess, setJobSubmitSuccess] = useState(false);

  // Additional job application & orders tab state variables
  const [applicantPhone, setApplicantPhone] = useState('+91 98765 43210');
  const [applicantLocation, setApplicantLocation] = useState('Bangalore, Karnataka');
  const [applicantLinkedIn, setApplicantLinkedIn] = useState('https://linkedin.com/in/username');
  const [applicantPortfolio, setApplicantPortfolio] = useState('https://yourportfolio.com');
  const [applicantExperience, setApplicantExperience] = useState('Fresher');
  const [applicantCurrentCompany, setApplicantCurrentCompany] = useState('');
  const [applicantNoticePeriod, setApplicantNoticePeriod] = useState('Immediate');
  const [resumeFile, setResumeFile] = useState(() => {
    const name = currentUser?.name || profileName || 'Dhanush Tamilarasan';
    const formattedName = name.replace(/\s+/g, '_') + '_Resume.pdf';
    return { name: formattedName, size: '450 KB' };
  });
  const [applicantCoverLetter, setApplicantCoverLetter] = useState('');

  // Sync applicant name/email when profile updates
  useEffect(() => {
    if (profileName) setApplicantName(profileName);
    if (profileEmail) setApplicantEmail(profileEmail);
  }, [profileName, profileEmail]);

  const staticJobsList = [];

  const jobsList = [
    ...staticJobsList,
    ...products.filter(p => p.subNavbarCategory === 'Jobs').map(p => ({
      id: p.id,
      vendorId: p.vendorId,
      title: p.name,
      department: p.category || 'General',
      location: p.description?.split('\n')[0] || 'Remote (India)',
      salary: p.price ? `₹${(p.price || 0).toLocaleString()} L.P.A` : 'Competitive Salary',
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
          candidateResume: applicantResume,
          type: 'Job'
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
      title: 'IT & Office Equipment',
      items: ['Monitors', 'Keyboards', 'Mouse', 'Webcams', 'Routers', 'Networking Devices', 'Storage Devices', 'Office Printers', 'Projectors', 'UPS & Power Backup']
    },
    'Home Appliances': {
      title: 'Home Appliances',
      items: ['Refrigerators', 'Washing Machines', 'Air Conditioners', 'Televisions', 'Microwave Ovens', 'Water Purifiers', 'Vacuum Cleaners', 'Air Coolers', 'Fans', 'Geysers']
    },
    'Furniture': {
      title: 'Furniture',
      items: ['Sofas', 'Dining Tables', 'Beds', 'Mattresses', 'Wardrobes', 'Office Chairs', 'Office Tables', 'Study Tables', 'TV Units', 'Shoe Racks']
    },
    'Fashion': {
      title: 'Fashion & Lifestyle',
      items: ['Shirts', 'T-Shirts', 'Jeans', 'Watches', 'Accessories', 'Sarees', 'Kurtis', 'Dresses', 'Footwear', 'Handbags', 'Jewelry', 'Kids Clothing', 'School Accessories', 'Toys']
    },
    'Beauty': {
      title: 'Beauty & Personal Care',
      items: ['Skincare', 'Haircare', 'Cosmetics', 'Perfumes', 'Grooming Products', 'Wellness Products']
    },
    'Baby Care': {
      title: 'Baby Products',
      items: ['Baby Food', 'Diapers', 'Baby Clothing', 'Baby Toys', 'Baby Care Products', 'Baby Accessories']
    },
    'Sports & Fitness': {
      title: 'Sports & Fitness',
      items: ['Gym Equipment', 'Yoga Accessories', 'Sports Wear', 'Sports Equipment', 'Fitness Trackers', 'Cycling Accessories']
    },
    'Books': {
      title: 'Books & Stationery',
      items: ['Academic Books', 'Story Books', 'Notebooks', 'Office Stationery', 'Art Supplies', 'Educational Materials']
    },
    'Gaming': {
      title: 'Gaming & Entertainment',
      items: ['Gaming Consoles', 'Gaming Accessories', 'VR Devices', 'Gaming Chairs', 'Gaming PCs']
    },
    'Automobile': {
      title: 'Automobile Products',
      items: ['Car Accessories', 'Bike Accessories', 'Tyres', 'Vehicle Care Products', 'Safety Equipment', 'GPS Devices']
    },
    'Home & Kitchen': {
      title: 'Home & Kitchen',
      items: ['Kitchen Appliances', 'Cookware', 'Storage Containers', 'Dining Sets', 'Home Decor', 'Lighting Products']
    },
    'Pet Care': {
      title: 'Pet Products',
      items: ['Pet Food', 'Pet Toys', 'Pet Accessories', 'Pet Grooming Products', 'Pet Healthcare']
    },
    'Gardening': {
      title: 'Gardening & Outdoor',
      items: ['Plants', 'Gardening Tools', 'Outdoor Furniture', 'Seeds', 'Fertilizers']
    },
    'Healthcare': {
      title: 'Healthcare Products',
      items: ['Medical Equipment', 'Health Monitoring Devices', 'Wellness Products', 'Orthopedic Products', 'Personal Health Devices']
    },
    'Business Products': {
      title: 'Industrial & Business Products',
      items: ['Safety Equipment', 'Tools & Machinery', 'Office Supplies', 'Packaging Materials', 'Business Equipment']
    }
  };

  const dailyNeedsMegaMenuData = {
    'Grocery': {
      title: 'Grocery & Essentials',
      items: ['Rice', 'Wheat', 'Flour', 'Rava', 'Pulses', 'Dal', 'Sugar', 'Salt', 'Cooking Oil', 'Spices', 'Biscuits', 'Snacks', 'Noodles', 'Breakfast Cereals', 'Ready-to-Eat Foods', 'Dry Fruits']
    },
    'Fruits & Vegetables': {
      title: 'Fruits & Vegetables',
      items: ['Fresh Fruits', 'Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pomegranate', 'Fresh Vegetables', 'Onion', 'Tomato', 'Potato', 'Carrot', 'Cabbage', 'Green Vegetables']
    },
    'Dairy': {
      title: 'Dairy Products',
      items: ['Milk', 'Curd', 'Butter', 'Ghee', 'Cheese', 'Paneer', 'Yogurt', 'Ice Cream', 'Flavored Milk']
    },
    'Water & Beverages': {
      title: 'Water & Beverages',
      items: ['Drinking Water', 'Water Cans', 'Mineral Water', 'RO Water Delivery', 'Beverages', 'Tea', 'Coffee', 'Juices', 'Soft Drinks', 'Energy Drinks', 'Health Drinks']
    },
    'Household Essentials': {
      title: 'Household Essentials',
      items: ['Cleaning Products', 'Floor Cleaner', 'Toilet Cleaner', 'Glass Cleaner', 'Disinfectants', 'Dishwash Liquid', 'Scrub Pads', 'Aluminum Foil', 'Storage Containers', 'Buckets', 'Mops', 'Dustbins', 'Cloth Drying Stands']
    },
    'Personal Care': {
      title: 'Personal Care',
      items: ['Soap', 'Body Wash', 'Shampoo', 'Conditioner', 'Face Wash', 'Razor', 'Trimmer', 'Hair Oil', 'Deodorants', 'Perfumes', 'Toothpaste', 'Toothbrush', 'Mouthwash']
    },
    'Baby Care': {
      title: 'Baby Care',
      items: ['Baby Diapers', 'Baby Wipes', 'Baby Powder', 'Baby Soap', 'Baby Shampoo', 'Baby Food', 'Feeding Bottles']
    },
    'Pharmacy': {
      title: 'Pharmacy & Healthcare',
      items: ['Medicines', 'OTC Medicines', 'Pain Relief Products', 'Cold & Cough Remedies', 'Thermometer', 'BP Monitor', 'Glucose Monitor', 'First Aid Kit', 'Sanitizers', 'Face Masks']
    },
    'Pet Care': {
      title: 'Pet Care',
      items: ['Dog Food', 'Cat Food', 'Pet Shampoo', 'Pet Toys', 'Pet Accessories', 'Pet Medicines']
    },
    'Bakery': {
      title: 'Bakery & Fresh Foods',
      items: ['Bread', 'Cakes', 'Buns', 'Cookies', 'Fresh Bakery Items']
    },
    'Organic Products': {
      title: 'Organic Products',
      items: ['Organic Vegetables', 'Organic Fruits', 'Organic Rice', 'Organic Spices', 'Natural Health Products']
    },
    'Utility Products': {
      title: 'Daily Utility Products',
      items: ['Batteries', 'Power Banks', 'Chargers', 'LED Bulbs', 'Extension Boards', 'Inverters']
    }
  };

  const foodMegaMenuData = {
    'Restaurants': {
      title: 'Restaurants',
      items: ['Fine Dining', 'Family Restaurants', 'Casual Dining', 'Luxury Restaurants', 'Rooftop Restaurants', 'Buffet Restaurants', 'Theme Restaurants']
    },
    'Fast Food': {
      title: 'Fast Food',
      items: ['Burgers', 'Pizza', 'Sandwiches', 'French Fries', 'Wraps', 'Hot Dogs', 'Fried Chicken']
    },
    'Cafes': {
      title: 'Cafes & Coffee Shops',
      items: ['Coffee Shops', 'Tea Cafes', 'Dessert Cafes', 'Co-working Cafes', 'Juice Cafes', 'Premium Lounges']
    },
    'South Indian': {
      title: 'South Indian',
      items: ['Idli', 'Dosa', 'Uttapam', 'Pongal', 'Vada', 'Meals', 'Biryani']
    },
    'North Indian': {
      title: 'North Indian',
      items: ['Roti', 'Naan', 'Paneer Dishes', 'Dal Varieties', 'Tandoori Items', 'Thali Meals']
    },
    'Biryani': {
      title: 'Biryani & Rice',
      items: ['Chicken Biryani', 'Mutton Biryani', 'Veg Biryani', 'Dum Biryani', 'Fried Rice', 'Pulav']
    },
    'Healthy Food': {
      title: 'Healthy Food',
      items: ['Salads', 'Diet Meals', 'Protein Meals', 'Organic Foods', 'Keto Foods', 'Vegan Foods']
    },
    'Bakery': {
      title: 'Bakery & Desserts',
      items: ['Cakes', 'Pastries', 'Cookies', 'Donuts', 'Brownies', 'Chocolates', 'Ice Cream']
    },
    'Beverages': {
      title: 'Beverages',
      items: ['Tea', 'Coffee', 'Fresh Juice', 'Smoothies', 'Milkshakes', 'Soft Drinks', 'Energy Drinks']
    },
    'International Cuisine': {
      title: 'International Cuisine',
      items: ['Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Korean', 'Continental']
    },
    'Non-Veg Specials': {
      title: 'Non-Veg Specials',
      items: ['Chicken', 'Mutton', 'Fish', 'Seafood', 'Grill Items', 'BBQ']
    },
    'Vegetarian Specials': {
      title: 'Vegetarian Specials',
      items: ['Pure Veg Restaurants', 'Jain Food', 'Organic Food', 'Traditional Meals']
    },
    'Home Food': {
      title: 'Home Food',
      items: ['Homemade Meals', 'Tiffin Services', 'Daily Lunch Plans', 'Healthy Home Food']
    },
    'Catering': {
      title: 'Catering Services',
      items: ['Wedding Catering', 'Birthday Catering', 'Corporate Catering', 'Event Catering', 'Bulk Orders']
    },
    'Subscription Meals': {
      title: 'Food Subscription',
      items: ['Daily Breakfast', 'Daily Lunch', 'Daily Dinner', 'Monthly Meal Plans', 'Office Meal Plans']
    },
    'Premium Dining': {
      title: 'Premium Dining',
      items: ['5-Star Hotels', 'Luxury Dining', 'Chef Specials', 'Exclusive Member Restaurants']
    }
  };

  const stayMegaMenuData = {
    'Hotels': {
      title: 'Hotels',
      items: ['Budget Hotels', 'Business Hotels', 'Premium Hotels', 'Luxury Hotels', '5-Star Hotels', 'Airport Hotels', 'Boutique Hotels']
    },
    'Resorts': {
      title: 'Resorts',
      items: ['Beach Resorts', 'Hill Station Resorts', 'Family Resorts', 'Luxury Resorts', 'Wellness Resorts', 'Eco Resorts', 'Adventure Resorts']
    },
    'Homestays': {
      title: 'Homestays',
      items: ['Family Homestays', 'Village Homestays', 'Luxury Homestays', 'Farm Stays', 'Heritage Homestays']
    },
    'Service Apartments': {
      title: 'Service Apartments',
      items: ['Daily Rental', 'Weekly Rental', 'Monthly Rental', 'Corporate Apartments', 'Family Apartments']
    },
    'Vacation Rentals': {
      title: 'Vacation Rentals',
      items: ['Villas', 'Holiday Homes', 'Farm Houses', 'Private Houses', 'Weekend Getaways']
    },
    'Student Accommodation': {
      title: 'Student Accommodation',
      items: ['Boys Hostel', 'Girls Hostel', 'PG Accommodation', 'Student Apartments', 'College Hostels']
    },
    'Corporate Stay': {
      title: 'Corporate Stay',
      items: ['Business Hotels', 'Corporate Guest Houses', 'Executive Suites', 'Long-Term Business Stay']
    },
    'Camping & Adventure': {
      title: 'Camping & Adventure Stay',
      items: ['Tent Camping', 'Glamping', 'Forest Stay', 'Mountain Camps', 'Adventure Camps']
    },
    'Heritage Stay': {
      title: 'Heritage Stay',
      items: ['Palace Hotels', 'Heritage Resorts', 'Traditional Houses', 'Cultural Stays']
    },
    'Couple Stay': {
      title: 'Couple & Honeymoon Stay',
      items: ['Honeymoon Resorts', 'Romantic Hotels', 'Luxury Villas', 'Private Pool Villas']
    },
    'Family Stay': {
      title: 'Family Stay',
      items: ['Family Hotels', 'Family Resorts', 'Kid-Friendly Resorts', 'Holiday Packages']
    },
    'Wellness Retreats': {
      title: 'Wellness & Retreat Stay',
      items: ['Yoga Retreats', 'Meditation Centers', 'Ayurveda Resorts', 'Wellness Retreats', 'Spa Resorts']
    },
    'Medical Stay': {
      title: 'Medical Stay',
      items: ['Hospital Guest Houses', 'Medical Tourism Stay', 'Patient Accommodation', 'Caregiver Accommodation']
    },
    'Religious Stay': {
      title: 'Religious & Pilgrimage Stay',
      items: ['Temple Guest Houses', 'Pilgrimage Hotels', 'Spiritual Retreats', 'Religious Accommodation']
    },
    'Rental Accommodation': {
      title: 'Rental Accommodation',
      items: ['Flats', 'Apartments', 'Independent Houses', 'Shared Accommodation', 'Rental Villas']
    },
    'International Stay': {
      title: 'International Stay',
      items: ['International Hotels', 'Global Resorts', 'Holiday Packages', 'Travel Accommodation']
    }
  };

  const travelMegaMenuData = {
    'Flight Booking': {
      title: 'Flight Booking',
      items: ['Domestic Flights', 'International Flights', 'One-Way Flights', 'Round Trip Flights', 'Multi-City Flights', 'Business Class', 'First Class', 'Charter Flights']
    },
    'Train Booking': {
      title: 'Train Booking',
      items: ['Express Trains', 'Superfast Trains', 'Premium Trains', 'Tatkal Booking', 'Tourist Trains', 'Luxury Trains']
    },
    'Bus Booking': {
      title: 'Bus Booking',
      items: ['Government Buses', 'Private Buses', 'Sleeper Buses', 'AC Buses', 'Luxury Coaches', 'Volvo Services']
    },
    'Cab Services': {
      title: 'Cab & Taxi Services',
      items: ['Local Taxi', 'Airport Transfer', 'Outstation Cabs', 'Luxury Cars', 'Chauffeur Services', 'Self-Drive Cars']
    },
    'Car Rental': {
      title: 'Car Rental',
      items: ['Self Drive Cars', 'Monthly Rental', 'Luxury Car Rental', 'Corporate Rental', 'Tourist Vehicles']
    },
    'Bike Rental': {
      title: 'Bike Rental',
      items: ['Scooters', 'Motorcycles', 'Premium Bikes', 'Adventure Bikes']
    },
    'Tour Packages': {
      title: 'Tour Packages',
      items: ['Domestic Tours', 'International Tours', 'Weekend Trips', 'Family Packages', 'Group Tours', 'Couple Packages']
    },
    'Honeymoon Packages': {
      title: 'Honeymoon Packages',
      items: ['Beach Destinations', 'Hill Stations', 'International Honeymoon', 'Luxury Honeymoon Resorts']
    },
    'Family Travel': {
      title: 'Family Travel',
      items: ['Family Holiday Packages', 'Theme Parks', 'Resorts', 'Family Adventures']
    },
    'Corporate Travel': {
      title: 'Corporate Travel',
      items: ['Business Flights', 'Hotel Booking', 'Corporate Cab Services', 'Employee Travel Management']
    },
    'Adventure Travel': {
      title: 'Adventure Travel',
      items: ['Trekking', 'Camping', 'Wildlife Safari', 'Mountain Climbing', 'Water Sports', 'Adventure Tours']
    },
    'Religious Travel': {
      title: 'Religious & Pilgrimage Travel',
      items: ['Temple Tours', 'Pilgrimage Packages', 'Spiritual Retreats', 'Holy City Tours']
    },
    'Holiday Packages': {
      title: 'Holiday Packages',
      items: ['Beach Holidays', 'Hill Station Holidays', 'Island Vacations', 'Cruise Vacations']
    },
    'Cruise Travel': {
      title: 'Cruise Travel',
      items: ['Domestic Cruises', 'International Cruises', 'Luxury Cruises', 'Family Cruises']
    },
    'Visa Services': {
      title: 'Visa Services',
      items: ['Tourist Visa', 'Business Visa', 'Student Visa', 'Work Visa', 'Visa Consultation']
    },
    'Passport Services': {
      title: 'Passport Services',
      items: ['New Passport', 'Renewal', 'Tatkal Passport', 'Passport Assistance']
    },
    'International Travel': {
      title: 'International Travel',
      items: ['International Flights', 'International Hotels', 'Global Packages', 'Travel Assistance']
    },
    'Travel Essentials': {
      title: 'Travel Essentials',
      items: ['Travel Insurance', 'Forex Services', 'SIM Cards', 'Travel Accessories', 'Airport Lounge Access']
    },
    'Emergency Travel': {
      title: 'Emergency Travel Assistance',
      items: ['Medical Emergency Travel', 'Emergency Ticket Booking', 'Travel Support', 'Insurance Claims']
    }
  };

  const serviceMegaMenuData = {
    'Healthcare': {
      title: 'Healthcare Services',
      items: ['Hospitals', 'Clinics', 'Diagnostic Centers', 'Pharmacies', 'Dental Care', 'Eye Care', 'Ambulance Services', 'Home Nursing', 'Health Checkups', 'Telemedicine', 'Physiotherapy', 'Medical Equipment']
    },
    'Education': {
      title: 'Education Services',
      items: ['Schools', 'Colleges', 'Universities', 'Online Courses', 'Training Institutes', 'Skill Development', 'Computer Training', 'AI & IT Training', 'Language Classes', 'Competitive Exam Coaching', 'Certification Programs']
    },
    'Financial': {
      title: 'Financial Services',
      items: ['Banking Services', 'Personal Loans', 'Home Loans', 'Business Loans', 'Credit Cards', 'Investment Plans', 'Mutual Funds', 'Financial Consulting', 'Tax Planning', 'Retirement Planning']
    },
    'Insurance': {
      title: 'Insurance Services',
      items: ['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'Travel Insurance', 'Property Insurance', 'Business Insurance', 'Accident Insurance']
    },
    'Home Services': {
      title: 'Home Services',
      items: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Interior Design', 'Home Cleaning', 'Pest Control', 'AC Repair', 'Appliance Repair', 'CCTV Installation', 'Smart Home Solutions']
    },
    'Legal': {
      title: 'Legal Services',
      items: ['Legal Consultation', 'Property Registration', 'Agreement Drafting', 'Notary Services', 'Court Assistance', 'Company Registration', 'Trademark Registration', 'Legal Documentation']
    },
    'Digital': {
      title: 'Digital Services',
      items: ['Website Development', 'Mobile App Development', 'UI/UX Design', 'Digital Marketing', 'SEO Services', 'Social Media Marketing', 'Graphic Design', 'Video Editing', 'Cloud Solutions', 'Software Development']
    },
    'Business': {
      title: 'Business Services',
      items: ['Company Formation', 'GST Registration', 'Payroll Management', 'HR Solutions', 'Recruitment Services', 'Business Consulting', 'Branding Services', 'Franchise Consulting', 'Startup Advisory']
    },
    'Automobile': {
      title: 'Automobile Services',
      items: ['Car Service', 'Bike Service', 'Car Wash', 'Roadside Assistance', 'Vehicle Inspection', 'Vehicle Insurance', 'Driving School', 'Vehicle Rental']
    },
    'Bill & Recharge': {
      title: 'Bill & Recharge',
      items: ['Mobile Recharge', 'DTH Recharge', 'Broadband Services', 'Fiber Internet', 'SIM Activation', 'Business Connectivity', 'Electricity Bill Payment', 'Water Bill Payment', 'Gas Booking', 'Property Tax', 'Internet Bill Payment', 'Government Services']
    },
    'Family': {
      title: 'Family Services',
      items: ['Child Care', 'Day Care', 'Elder Care', 'Home Care', 'Family Counseling', 'Parenting Support']
    },
    'Fitness': {
      title: 'Fitness & Wellness',
      items: ['Gym Membership', 'Yoga Classes', 'Personal Training', 'Nutrition Consultation', 'Wellness Centers', 'Spa Services', 'Mental Wellness']
    },
    'Events': {
      title: 'Event Services',
      items: ['Wedding Planning', 'Birthday Events', 'Corporate Events', 'Photography', 'Videography', 'Catering Services', 'Decoration Services']
    },
    'Real Estate': {
      title: 'Real Estate Services',
      items: ['Property Buying', 'Property Selling', 'Property Rental', 'Property Management', 'Interior Solutions', 'Home Loans']
    },
    'Security': {
      title: 'Security Services',
      items: ['Security Guards', 'CCTV Monitoring', 'Cyber Security', 'Home Security', 'Office Security']
    }
  };

  const mergeDbCategories = (staticData, mainCategoryName) => {
    const merged = JSON.parse(JSON.stringify(staticData));
    const activeDbCats = dbCategories.filter(c => 
      c &&
      c.isActive !== false && 
      !c.isDeleted && 
      c.description !== 'DELETED_HIERARCHY_MARKER' &&
      ((c.name || '').toLowerCase() === mainCategoryName.toLowerCase() ||
       (mainCategoryName.toLowerCase() === 'products' && (!c.name || (c.name || '').toLowerCase() === 'products')))
    );

    activeDbCats.forEach(c => {
      // 1. When record has subcategory field
      if (c.subcategory) {
        const subName = c.subcategory;
        if (!merged[subName]) {
          merged[subName] = {
            title: subName,
            items: []
          };
        }
        if (c.subSubcategory) {
          const childName = c.subSubcategory;
          if (!merged[subName].items.includes(childName)) {
            merged[subName].items.push(childName);
          }
        }
      }
      // 2. When record has name as subcategory and subSubcategory as child
      else if (c.name && c.name.toLowerCase() !== mainCategoryName.toLowerCase()) {
        const subName = c.name;
        if (!merged[subName]) {
          merged[subName] = {
            title: subName,
            items: []
          };
        }
        if (c.subSubcategory && !merged[subName].items.includes(c.subSubcategory)) {
          merged[subName].items.push(c.subSubcategory);
        }
      }
    });
    return merged;
  };

  const serviceMegaMenu = useMemo(() => mergeDbCategories(serviceMegaMenuData, 'Services'), [dbCategories]);
  const productMegaMenu = useMemo(() => mergeDbCategories(productMegaMenuData, 'Products'), [dbCategories]);
  const dailyNeedsMegaMenu = useMemo(() => mergeDbCategories(dailyNeedsMegaMenuData, 'Daily Needs'), [dbCategories]);
  const foodMegaMenu = useMemo(() => mergeDbCategories(foodMegaMenuData, 'Food'), [dbCategories]);
  const stayMegaMenu = useMemo(() => mergeDbCategories(stayMegaMenuData, 'Stay'), [dbCategories]);
  const travelMegaMenu = useMemo(() => mergeDbCategories(travelMegaMenuData, 'Travel'), [dbCategories]);
  const jobMegaMenu = useMemo(() => mergeDbCategories(jobMegaMenuData, 'Jobs'), [dbCategories]);

  const getCategoriesForTab = (tabName) => {
    const prodCats = products
      .filter(p => p.subNavbarCategory === tabName || tabName === 'Products')
      .map(p => p.category)
      .filter(Boolean);

    const dbCats = [];
    dbCategories.forEach(c => {
      if (!c || c.isDeleted || c.isActive === false || c.description === 'DELETED_HIERARCHY_MARKER') return;
      const mainMatch = (c.name || '').toLowerCase() === tabName.toLowerCase() ||
                        (tabName.toLowerCase() === 'products' && (!c.name || (c.name || '').toLowerCase() === 'products'));
      if (mainMatch) {
        if (c.subcategory) dbCats.push(c.subcategory);
        if (c.subSubcategory) dbCats.push(c.subSubcategory);
      }
      if (c.name && c.name.toLowerCase() !== tabName.toLowerCase()) {
        dbCats.push(c.name);
      }
    });

    return [...new Set([...prodCats, ...dbCats])].sort();
  };


  // Filters State
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);

  // Accordion Toggle States
  const [openFilters, setOpenFilters] = useState({
    category: true,
    brand: true,
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
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' 
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
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">TXN_{ord.order_number || String(ord.id || '').slice(-6).toUpperCase()}</td>
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
    if (!product) return;
    const prodId = product.id || `prod-${Date.now()}`;
    const prodName = product.name || 'Selected Item';
    const prodPrice = product.price || product.fee || 0;
    const prodImg = product.image || product.img || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600';

    setCart(prev => {
      const existing = prev.find(item => item && item.id === prodId);
      if (existing) {
        return prev.map(item =>
          item && item.id === prodId
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, id: prodId, name: prodName, price: prodPrice, image: prodImg, quantity: product.quantity || 1 }];
    });
    triggerNotification(`Added "${prodName}" to cart!`);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id, delta) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === id) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const getCartCheckoutButtonText = () => {
    if (cart.length === 0) return "Proceed to Place Order";
    
    // Check if any item in cart is a job
    const hasJob = cart.some(item => item.subNavbarCategory === 'Jobs' || item.tag === 'Jobs');
    if (hasJob) return "Apply Now";
    
    // Check if any item is a booking item (Services, Stay, Travel)
    const hasBooking = cart.some(item => 
      ['Services', 'Stay', 'Travel'].includes(item.subNavbarCategory) || 
      ['Services', 'Stay', 'Travel'].includes(item.tag)
    );
    if (hasBooking) return "Book Now";
    
    // Default/Products/Food/Daily Needs
    return "Buy Now";
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const totalAmount = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    if (walletBalance < totalAmount) {
      triggerNotification("Insufficient wallet balance!");
      return;
    }

    const hasJob = cart.some(item => item.subNavbarCategory === 'Jobs' || item.tag === 'Jobs');
    const hasBooking = cart.some(item => 
      ['Services', 'Stay', 'Travel'].includes(item.subNavbarCategory) || 
      ['Services', 'Stay', 'Travel'].includes(item.tag)
    );

    setOrderSuccess(true);
    const productDetails = cart.map(item => `${item.name} (Qty: ${item.quantity || 1})`).join(', ');
    
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
        quantity: item.quantity || 1
      }));

      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          vendor_id: vendorId,
          customer_name: profileName || currentUser?.name || 'Dhanush Tamilarasan',
          customer_phone: profilePhone || '+91 98765 43210',
          customer_address: selectedLocation.area || 'Koramangala, 5th Block, Bangalore',
          customer_latitude: 12.9498,
          customer_longitude: 77.6289,
          product_details: productDetails,
          amount: totalAmount,
          items: itemsList,
          type: hasJob ? 'Job' : (hasBooking ? 'Booking' : 'Order')
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
      if (hasJob) {
        triggerNotification("Application submitted successfully!");
      } else if (hasBooking) {
        triggerNotification("Booking completed successfully!");
      } else {
        triggerNotification("Order placed successfully! Thank you for shopping.");
      }
    }, 3000);
  };


  const clearAllFilters = () => {
    setSelectedProduct(null);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedPrices([]);
    setSelectedRating(null);
    setSearchQuery('');
    setSelectedFoodType('All');
    // Preserve current tab and current subNavbarCategory context
    if (activeTab === 'Home') {
      setSelectedSubNavbarCategory('All');
      setActiveTab('Home');
    }
    setSelectedServiceTypes([]);
    setSelectedLocTypes([]);
    setSelectedCuisines([]);
    setSelectedDistances([]);
    setSelectedAccomTypes([]);
    setSelectedTravelTypes([]);
    setSelectedBusType('');
    setSelectedBusClass('');
    setFromLocation('');
    setToLocation('');
    setSelectedDailyNeedsTypes([]);
    setSelectedJobDepts([]);
    setSelectedJobTypes([]);
    setSelectedJobSalaries([]);
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all products and services from the database? This action cannot be undone.")) {
      try {
        const res = await productService.deleteAllProducts();
        if (res && res.success) {
          triggerNotification("All products and services deleted successfully!");
          setProducts([]);
        } else {
          triggerNotification(res?.message || "Failed to delete products");
        }
      } catch (err) {
        console.warn("Delete all error:", err);
        triggerNotification("Error deleting products");
      }
    }
  };

  const toggleFilterSection = (section) => {
    setOpenFilters(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Sub-navbar categories
  const subNavbarCategories = [
    'Home',
    'Products',
    'Services',
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

  // Filtered & Sorted products list (memoized to prevent heavy re-filtering on every render)
  const filteredProducts = useMemo(() => {
    const normalizeCity = (city) => {
      if (!city) return 'bangalore';
      const c = city.toLowerCase();
      if (c === 'bengaluru' || c === 'bangalore') return 'bangalore';
      return c;
    };

    let result = products.filter(product => {
      const matchesLocation = !selectedLocation?.city || 
        normalizeCity(product.vendorCity) === normalizeCity(selectedLocation.city);

      const matchesSearch = (searchQuery === '' || 
        (product.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
        (product.category || '').toLowerCase().includes((searchQuery || '').toLowerCase())) &&
        (searchCategory === 'All' || product.subNavbarCategory === searchCategory);

      const matchesSubNavbar = selectedSubNavbarCategory === 'All' || 
        product.subNavbarCategory === selectedSubNavbarCategory;

      // Services Filter Checks
      if (activeTab === 'Services') {
        const matchesServiceType = selectedServiceTypes.length === 0 ||
          selectedServiceTypes.includes(product.category);

        const matchesLocType = selectedLocTypes.length === 0 ||
          selectedLocTypes.some(loc => (product.city || product.vendorCity || product.locationType)?.toLowerCase() === loc.toLowerCase());

        const matchesRatingFilter = selectedRating === null || 
          product.rating >= selectedRating;

        return matchesSearch && matchesSubNavbar && matchesLocation && matchesServiceType && matchesLocType && matchesRatingFilter;
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

        const matchesFoodType = selectedFoodType === 'All' ||
          product.foodType === selectedFoodType;

        return matchesSearch && matchesSubNavbar && matchesLocation && matchesCuisine && matchesDistance && matchesRatingFilter && matchesFoodType;
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

        return matchesSearch && matchesSubNavbar && matchesLocation && matchesAccom && matchesPrice && matchesRatingFilter;
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

        const matchesFrom = !fromLocation || 
          (product.fromCity && product.fromCity.toLowerCase() === (fromLocation || '').toLowerCase());
        
        const matchesTo = !toLocation || 
          (product.toCity && product.toCity.toLowerCase() === (toLocation || '').toLowerCase());
        
        const matchesBusType = !selectedBusType || 
          (product.busType && product.busType.toLowerCase() === (selectedBusType || '').toLowerCase());

        const matchesBusClass = !selectedBusClass || 
          (product.busClass && product.busClass.toLowerCase() === (selectedBusClass || '').toLowerCase());

        return matchesSearch && matchesSubNavbar && matchesLocation && matchesTravelType && matchesPrice && matchesRatingFilter && matchesFrom && matchesTo && matchesBusType && matchesBusClass;
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

        return matchesSearch && matchesSubNavbar && matchesLocation && matchesDailyNeedsType && matchesPrice && matchesRatingFilter;
      }

      // Default Products / Other tabs Filter Checks
      const matchesCategoryFilter = selectedCategories.length === 0 || 
        (activeTab === 'Home' 
          ? selectedCategories.includes(product.subNavbarCategory) 
          : selectedCategories.some(cat => 
              (product.category || '').toLowerCase().includes(cat.toLowerCase()) ||
              (product.subSubcategory || '').toLowerCase().includes(cat.toLowerCase()) ||
              (product.subcategory || '').toLowerCase().includes(cat.toLowerCase()) ||
              (product.name || '').toLowerCase().includes(cat.toLowerCase())
            ));

      const matchesBrandFilter = selectedBrands.length === 0 || 
        selectedBrands.includes(product.vendorName);

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

      return matchesSearch && matchesSubNavbar && matchesLocation && matchesCategoryFilter && 
             matchesBrandFilter && matchesColorFilter && matchesPriceFilter && matchesRatingFilter;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'rating-desc') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [
    products, selectedLocation, searchQuery, searchCategory, selectedSubNavbarCategory, activeTab,
    selectedServiceTypes, selectedLocTypes, selectedRating, selectedCuisines, selectedDistances,
    selectedFoodType, selectedAccomTypes, selectedPrices, selectedTravelTypes, fromLocation,
    toLocation, selectedBusType, selectedBusClass, selectedDailyNeedsTypes, selectedCategories,
    selectedBrands, selectedColors, sortBy
  ]);

  const wishlistProducts = useMemo(() => {
    const allItems = Array.isArray(products) ? products : [];
    const map = new Map();
    allItems.forEach(item => {
      if (item && item.id != null && favorites.includes(item.id)) {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  }, [products, favorites]);

  // RENDER HELPERS
  const renderHeaderIcons = (isMobile = false) => {
    return (
      <div className={`flex items-center ${isMobile ? 'gap-3' : 'gap-5 lg:gap-6'}`}>
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="flex flex-col items-center gap-1 p-1 hover:text-amber-500 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          {!isMobile && <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-75">Theme</span>}
        </button>

        {/* Offers */}
        <button 
          onClick={() => {
            setSelectedProduct(null);
            setActiveTab('Offers');
            setSelectedSubNavbarCategory('Offers');
            setSelectedCategories([]);
            setHoveredLink(null);
          }}
          className="relative flex flex-col items-center gap-1 p-1 hover:text-amber-500 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          title="Exclusive Offers"
        >
          <div className="relative">
            <Tag className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900">
              3
            </span>
          </div>
          {!isMobile && <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-75">Offers</span>}
        </button>

        {/* Wishlist */}
        <button 
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center gap-1 p-1 hover:text-amber-500 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          title="My Wishlist"
        >
          <div className="relative">
            <Heart className={`w-5 h-5 text-slate-700 dark:text-slate-300 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                {favorites.length}
              </span>
            )}
          </div>
          {!isMobile && <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-75">Wishlist</span>}
        </button>

        {/* Cart */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 p-1 hover:text-amber-500 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
          title="My Cart"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900 animate-pulse">
                {cart.length}
              </span>
            )}
          </div>
          {!isMobile && <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-75">Cart</span>}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex flex-col items-center gap-1 p-1 hover:text-amber-500 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            title="Notifications"
          >
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white dark:border-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            {!isMobile && <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-75">Notifications</span>}
          </button>

          {isNotificationsOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsNotificationsOpen(false)} />
              <div className={`${isMobile ? 'fixed top-16 left-4 right-4' : 'absolute right-0 mt-2 w-80'} bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xl p-4 z-50 animate-scale-up text-slate-800 dark:text-slate-200 text-left`}>
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
      </div>
    );
  };

  const renderDashboardHeader = () => {
    return (
      <header className="bg-white dark:bg-[#0b1329] border-b border-slate-200 dark:border-slate-800/60 px-4 sm:px-6 py-2.5 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 w-full text-slate-800 dark:text-slate-200 shadow-xs transition-colors sticky top-0 z-40">
        {/* Row 1 for Mobile / Left Section for Desktop */}
        <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 select-none cursor-pointer" onClick={clearAllFilters}>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 border border-slate-200 dark:border-slate-800/60">
              <img src={logoImg} alt="Connect App Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="text-sm font-black tracking-wide text-slate-900 dark:text-white font-sans whitespace-nowrap">Connect App</span>
          </div>

          {/* Location Selector (now fully responsive!) */}
          <div className="relative shrink-0">
            <button 
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800/60 rounded-full bg-slate-50/20 dark:bg-[#0b1329]/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate max-w-[80px]">{selectedLocation.city}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLocationDropdownOpen && (
              <>
                <div 
                  onClick={() => setIsLocationDropdownOpen(false)}
                  className="fixed inset-0 z-40 bg-transparent" 
                />
                <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xl p-4 z-50 text-slate-800 dark:text-slate-200">
                  <div className="relative flex items-center border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl px-2.5 py-1.5 focus-within:border-[#FFC107]">
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Search area or city..."
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && locationSearchQuery.trim() !== '') {
                          const query = locationSearchQuery.trim();
                          const updated = { city: query, state: 'Karnataka', area: 'Custom Area' };
                          setSelectedLocation(updated);
                          setIsLocationDropdownOpen(false);
                          setLocationSearchQuery('');
                          triggerNotification(`Switched location to ${query}`);
                        }
                      }}
                      className="w-full text-xs bg-transparent focus:outline-none text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if (navigator.geolocation) {
                        triggerNotification("Fetching your location...");
                        navigator.geolocation.getCurrentPosition(
                          async (pos) => {
                            const { latitude, longitude } = pos.coords;
                            try {
                              const response = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                                { headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'ConnectAppGeolocation/1.0' } }
                              );
                              const data = await response.json();
                              if (data && data.address) {
                                const addr = data.address;
                                const city = addr.city || addr.town || addr.city_district || addr.county || 'Unknown';
                                const state = addr.state || 'India';
                                const area = addr.suburb || addr.neighbourhood || addr.village || 'City Center';
                                setSelectedLocation({ city, state, area });
                                setIsLocationDropdownOpen(false);
                                triggerNotification(`Located: ${city}, ${state}`);
                              } else {
                                triggerNotification("Could not resolve location.");
                              }
                            } catch (err) {
                              console.error('Geocoding error:', err);
                              triggerNotification("Failed to fetch location details.");
                            }
                          },
                          (err) => {
                            console.error('Geolocation error:', err);
                            triggerNotification("Location access denied or timed out.");
                          },
                          { enableHighAccuracy: true, timeout: 10000 }
                        );
                      } else {
                        triggerNotification("Geolocation is not supported by your browser.");
                      }
                    }}
                    className="mt-3 w-full flex items-center gap-2 py-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100/50 transition-colors cursor-pointer px-3"
                  >
                    <span className="text-xs font-bold">Use Current Location</span>
                  </button>

                  <div className="mt-3.5 text-left">
                    <h4 className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Popular Cities</h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Bangalore', 'Chennai', 'Hyderabad', 'Mumbai', 'Delhi', 'Coimbatore'].map((cityName) => (
                        <button
                          key={cityName}
                          onClick={() => {
                            setSelectedLocation({ city: cityName, state: 'India', area: 'City Center' });
                            setIsLocationDropdownOpen(false);
                            triggerNotification(`Switched location to ${cityName}`);
                          }}
                          className={`text-[9px] font-extrabold py-1 px-1.5 rounded-lg border transition-all cursor-pointer ${
                            selectedLocation.city === cityName 
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-600'
                          }`}
                        >
                          {cityName}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Icons & Mini Profile shown inline on mobile */}
          <div className="flex md:hidden items-center gap-2">
            {renderHeaderIcons(true)}
            <div onClick={() => setIsProfileModalOpen(true)} className="cursor-pointer ml-1">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" 
                alt="Profile" 
                className="w-7.5 h-7.5 rounded-full object-cover border border-slate-200 dark:border-slate-800/60 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Row 2 for Mobile / Middle Section for Desktop (Search) */}
        <div className="relative w-full md:max-w-xl flex items-center border border-slate-200 dark:border-slate-800 rounded-full bg-slate-50/50 dark:bg-slate-900/50 pl-4 py-1 pr-1 focus-within:border-[#FFC107] focus-within:ring-1 focus-within:ring-[#FFC107]/20 transition-all">
          <input 
            type="text"
            placeholder="Search products, services, food, hotels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-1"
          />
          <button className="w-7 h-7 rounded-full bg-[#FFC107] hover:bg-amber-500 text-slate-955 flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-xs">
            <Search className="w-3 h-3" />
          </button>
        </div>

        {/* Desktop Only Right Section (Icons & Profile) */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {renderHeaderIcons(false)}
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer select-none pl-4 border-l border-slate-200 dark:border-slate-800/60"
          >
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" 
              alt="User Profile" 
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-800/60 shadow-xs"
            />
            <div className="flex flex-col text-left leading-tight">
              <span className="text-xs font-black text-slate-800 dark:text-white">
                Hi, {(currentUser?.name || profileName).split(' ')[0]}
              </span>
              <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider">
                Welcome
              </span>
            </div>
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
                      
                      // Reset other filter arrays
                      setSelectedCategories([]);
                      setSelectedServiceTypes([]);
                      setSelectedCuisines([]);
                      setSelectedAccomTypes([]);
                      setSelectedTravelTypes([]);
                      setSelectedDailyNeedsTypes([]);

                      // Set tab-specific subcategory filter array
                      if (tabForLink === 'Services') {
                        setSelectedServiceTypes([subCat]);
                      } else if (tabForLink === 'Food') {
                        setSelectedCuisines([subCat]);
                      } else if (tabForLink === 'Stay') {
                        setSelectedAccomTypes([subCat]);
                      } else if (tabForLink === 'Travel') {
                        setSelectedTravelTypes([subCat]);
                      } else if (tabForLink === 'Daily Needs') {
                        setSelectedDailyNeedsTypes([subCat]);
                      } else {
                        // Products / defaults
                        setSelectedCategories([subCat]);
                      }
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
    const icons = {
      'Home': Home,
      'Products': ShoppingBag,
      'Services': Settings,
      'Daily Needs': Truck,
      'Food': Utensils,
      'Stay': BedDouble,
      'Travel': Plane,
      'Jobs': Briefcase,
      'Membership': Award
    };

    return (
      <div 
        className="relative"
        onMouseLeave={handleMouseLeave}
      >
        <nav className="bg-white dark:bg-[#0b1329] border-b border-slate-200 dark:border-slate-800/60 px-8 py-2.5 flex items-center justify-start md:justify-center gap-10 sm:gap-12 overflow-x-auto no-scrollbar shadow-xs transition-colors w-full">
          {subNavbarCategories.map((cat) => {
            const isActive = activeTab === cat;
            const Icon = icons[cat] || ShoppingBag;
            return (
              <button
                key={cat}
                onMouseEnter={() => handleMouseEnter(cat)}
                onClick={() => {
                  if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
                  if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
                  setSelectedProduct(null);
                  setActiveTab(cat);
                  setSelectedSubNavbarCategory(cat);
                  setSelectedCategories([]);
                  setSearchQuery('');
                  setHoveredLink(null);
                }}
                className={`relative group text-xs font-bold uppercase tracking-wider px-2 py-3 transition-all shrink-0 cursor-pointer flex items-center gap-2 border-b-2 ${
                  isActive 
                    ? 'text-amber-500 dark:text-amber-400 border-amber-500 dark:border-amber-400' 
                    : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-amber-500 dark:hover:text-amber-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-amber-500'}`} />
                <span>{cat}</span>
              </button>
            );
          })}
        </nav>

        {/* Floating Glassmorphic Mega Menu Dropdown */}
        {hoveredLink && megaMenuLinks.includes(hoveredLink) && (
          <div
            onMouseEnter={() => handleMouseEnter(hoveredLink)}
            onMouseLeave={handleMouseLeave}
            className="absolute top-[calc(100%+2px)] left-6 right-6 bg-white/95 dark:bg-[#0b1329]/95 backdrop-blur-md shadow-2xl border border-slate-200/80 dark:border-slate-800/60 rounded-2xl py-8 px-8 z-50 flex transition-all duration-300 ease-out text-slate-800 dark:text-slate-200"
          >
            {hoveredLink === 'Services' ? (
              renderSidebarMegaMenu(activeServiceCategory, setActiveServiceCategory, serviceMegaMenu)
            ) : hoveredLink === 'Products' ? (
              renderSidebarMegaMenu(activeProductCategory, setActiveProductCategory, productMegaMenu)
            ) : hoveredLink === 'Daily Needs' ? (
              renderSidebarMegaMenu(activeDailyNeedsCategory, setActiveDailyNeedsCategory, dailyNeedsMegaMenu)
            ) : hoveredLink === 'Food' ? (
              renderSidebarMegaMenu(activeFoodCategory, setActiveFoodCategory, foodMegaMenu)
            ) : hoveredLink === 'Stay' ? (
              renderSidebarMegaMenu(activeStayCategory, setActiveStayCategory, stayMegaMenu)
            ) : hoveredLink === 'Travel' ? (
              renderSidebarMegaMenu(activeTravelCategory, setActiveTravelCategory, travelMegaMenu)
            ) : hoveredLink === 'Jobs' ? (
              renderSidebarMegaMenu(activeJobCategory, setActiveJobCategory, jobMegaMenu, (subCat) => {
                setActiveTab('Jobs');
                setSelectedSubNavbarCategory('Jobs');
                setSelectedCategories([]);
                setHoveredLink(null);
                const matchedJob = jobsList.find(j => 
                  (j.title || '').toLowerCase().includes((subCat || '').toLowerCase()) || 
                  (subCat || '').toLowerCase().includes((j.title || '').toLowerCase())
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

  const renderHeroBanner = () => {
    const slides = [
      ...dbBanners.map((banner, index) => ({
        id: `db-banner-${banner._id || index}`,
        isDb: true,
        title: banner.title,
        imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
        redirectLink: banner.redirectLink || '/promotions',
        targetAudience: banner.targetAudience || 'all',
        description: 'Special Promotion Offer'
      })),
      { id: 'static-0', isDb: false, idx: 0 },
      { id: 'static-1', isDb: false, idx: 1 },
      { id: 'static-2', isDb: false, idx: 2 },
      { id: 'static-3', isDb: false, idx: 3 }
    ];

    const totalSlides = slides.length;
    const currentSlideIdx = activeHeroSlide % totalSlides;
    const activeSlideObj = slides[currentSlideIdx];

    const nextSlide = (e) => {
      if (e) e.stopPropagation();
      setActiveHeroSlide((prev) => (prev + 1) % totalSlides);
    };

    const prevSlide = (e) => {
      if (e) e.stopPropagation();
      setActiveHeroSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const handleBannerAction = (slide) => {
      if (!slide) return;
      if (slide.isDb) {
        const link = (slide.redirectLink || '').toLowerCase();
        if (link.includes('food')) {
          setActiveTab('Food');
          setSelectedSubNavbarCategory('Food');
        } else if (link.includes('service')) {
          setActiveTab('Services');
          setSelectedSubNavbarCategory('Services');
        } else if (link.includes('stay')) {
          setActiveTab('Stay');
          setSelectedSubNavbarCategory('Stay');
        } else if (link.includes('travel')) {
          setActiveTab('Travel');
          setSelectedSubNavbarCategory('Travel');
        } else {
          setActiveTab('Products');
          setSelectedSubNavbarCategory('Products');
        }
        triggerNotification(`Exploring: ${slide.title}`);
      } else {
        if (slide.idx === 0) {
          setActiveTab('Food');
          setSelectedSubNavbarCategory('Food');
          triggerNotification("Welcome to Domino's! Explore our pizza catalog.");
        } else if (slide.idx === 1) {
          setActiveTab('Stay');
          setSelectedSubNavbarCategory('Stay');
          triggerNotification("Explore partner hotels and luxury stays.");
        } else if (slide.idx === 2) {
          setActiveTab('Travel');
          setSelectedSubNavbarCategory('Travel');
          triggerNotification("Search and book flights at member rates.");
        } else if (slide.idx === 3) {
          setActiveTab('Services');
          setSelectedSubNavbarCategory('Services');
          triggerNotification("Book cleaning, salon, plumbing services.");
        }
      }
    };

    return (
      <div className="w-full bg-gradient-to-r from-rose-100 via-indigo-100 to-sky-100 text-slate-900 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8 relative shadow-xs overflow-hidden text-left select-none min-h-[300px] border border-slate-200/40">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-200/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-rose-200/30 rounded-full blur-[70px] pointer-events-none" />

        {/* Left Side text content */}
        <div className="space-y-5 z-10 flex-grow max-w-xl">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#AA7C11] block">
            Everything You Need,
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#0b132b] leading-tight font-sans">
            All in <span className="text-indigo-600">One Place.</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 font-semibold leading-relaxed max-w-md">
            Shop, Book, Eat, Stay, Travel and much more.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => {
                setActiveTab('Services');
                setSelectedSubNavbarCategory('Services');
                triggerNotification("Explore our premium services catalog!");
              }}
              className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-955 bg-[#FFC107] hover:bg-amber-500 px-6 py-3.5 rounded-full transition-all shadow-sm hover:shadow-md hover:scale-[1.02] duration-300 cursor-pointer border-none"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-755 bg-white hover:bg-slate-50 px-6 py-3.5 rounded-full transition-all border border-slate-350 shadow-2xs hover:scale-[1.02] duration-300 cursor-pointer"
            >
              <span>Become a Member</span>
              <Award className="w-4 h-4 text-amber-500 fill-current ml-1" />
            </button>
          </div>
        </div>

        {/* Right Side Graphics: Slider Carousel with Hover Pause & Prev/Next Overlay */}
        <div 
          onMouseEnter={() => setIsHeroBannerHovered(true)}
          onMouseLeave={() => setIsHeroBannerHovered(false)}
          className="flex-grow flex flex-col items-center justify-center relative w-full max-w-[550px] h-[340px] shrink-0 mt-6 md:mt-0 select-none group/slider"
        >
          {/* Previous Slide Button */}
          <button 
            type="button"
            onClick={prevSlide}
            className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover/slider:opacity-100 cursor-pointer border border-white/20 shadow-md hover:scale-110"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Next Slide Button */}
          <button 
            type="button"
            onClick={nextSlide}
            className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-0 group-hover/slider:opacity-100 cursor-pointer border border-white/20 shadow-md hover:scale-110"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Card Frame Wrapper */}
          <div 
            onClick={() => handleBannerAction(activeSlideObj)}
            className="w-full max-w-[480px] aspect-[1.58/1] relative z-10 transition-transform duration-500 hover:scale-[1.02] rounded-2xl overflow-hidden bg-transparent cursor-pointer shadow-lg"
          >
            {/* Dynamic DB Banners */}
            {activeSlideObj?.isDb && (
              <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0e0717] text-white flex flex-row items-stretch animate-fade-in relative">
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 z-20 shadow-sm border border-rose-500/20">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Limited Time</span>
                </div>

                <div className="w-[58%] p-5 flex flex-col justify-between z-10 text-left">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                      <Sparkles className="w-4.5 h-4.5 text-[#FFC107] shrink-0 animate-pulse" />
                      <span className="font-extrabold text-[14px] tracking-wide text-white uppercase font-sans">Special Promotion</span>
                    </div>

                    <div className="inline-block text-[9.5px] font-black uppercase tracking-widest text-[#FFC107] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md mt-2">
                      ★ Connect Deal
                    </div>

                    <div className="pt-2 leading-tight">
                      <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                        {activeSlideObj.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-300 mt-1.5">{activeSlideObj.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2.5 flex flex-col gap-1.5 text-[10px] font-bold text-slate-400 leading-none">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#FFC107] shrink-0" />
                      <span>Exclusive member privileges</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Check className="w-4 h-4 text-[#FFC107] shrink-0" />
                      <span>Verified products & services</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBannerAction(activeSlideObj);
                    }}
                    className="flex items-center gap-1.5 bg-[#FFC107] hover:bg-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-wider px-4.5 py-2 rounded-full transition-all border-none mt-2 cursor-pointer self-start shadow-xs hover:scale-105"
                  >
                    <span>Explore Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-[42%] relative overflow-hidden rounded-r-2xl flex items-center justify-center shrink-0 bg-[#0e0717]">
                  <img 
                    src={activeSlideObj.imageUrl} 
                    alt={activeSlideObj.title} 
                    className="w-full h-full object-cover rounded-r-2xl transition-transform duration-700 hover:scale-110" 
                  />
                </div>
              </div>
            )}

            {/* Slide 0: Domino's Pizza Offer */}
            {!activeSlideObj?.isDb && activeSlideObj?.idx === 0 && (
              <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0e0e0e] text-white flex flex-row items-stretch animate-fade-in relative">
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 z-20 shadow-sm border border-rose-500/20">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Limited Time</span>
                </div>

                <div className="w-[58%] p-5 flex flex-col justify-between z-10 text-left">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold tracking-tight text-white font-sans text-xs">
                      <div className="flex gap-[1px] rotate-[-20deg] scale-90 origin-center shrink-0">
                        <div className="w-4 h-4 bg-red-600 rounded-sm relative flex items-center justify-center shadow-xs">
                          <div className="w-1 h-1 bg-white rounded-full absolute top-1 left-1" />
                          <div className="w-1 h-1 bg-white rounded-full absolute bottom-1 right-1" />
                        </div>
                        <div className="w-4 h-4 bg-blue-600 rounded-sm relative flex items-center justify-center shadow-xs">
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                      </div>
                      <span className="font-extrabold text-[14px] tracking-wide text-white uppercase font-sans">Domino's</span>
                    </div>

                    <div className="inline-block text-[9.5px] font-black uppercase tracking-widest text-[#FFC107] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md mt-2">
                      ★ Exclusive Offer
                    </div>

                    <div className="pt-2 leading-tight">
                      <h3 className="text-base sm:text-lg font-black text-white leading-none">
                        Flat <span className="text-[#FFC107]">50% OFF</span>
                      </h3>
                      <p className="text-xs font-bold text-slate-300 mt-1.5">On all Pizza Orders</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2.5 flex flex-col gap-1.5 text-[10px] font-bold text-slate-400 leading-none">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#FFC107] shrink-0" />
                      <span>Free Delivery</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <ShoppingBag className="w-4 h-4 text-[#FFC107] shrink-0" />
                      <span>No Minimum Order</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBannerAction(activeSlideObj);
                    }}
                    className="flex items-center gap-1.5 bg-[#FFC107] hover:bg-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-wider px-4.5 py-2 rounded-full transition-all border-none mt-2 cursor-pointer self-start shadow-xs hover:scale-105"
                  >
                    <span>Order Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-[42%] relative overflow-hidden rounded-r-2xl flex items-center justify-center shrink-0 bg-[#0e0e0e]">
                  <img 
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80" 
                    alt="Pizza Special Offer" 
                    className="w-full h-full object-cover rounded-r-2xl transition-transform duration-700 hover:scale-110" 
                  />
                </div>
              </div>
            )}

            {/* Slide 1: Radisson Blu Hotel Stay */}
            {!activeSlideObj?.isDb && activeSlideObj?.idx === 1 && (
              <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#07111e] text-white flex flex-row items-stretch animate-fade-in relative">
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 z-20 shadow-sm border border-rose-500/20">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Limited Time</span>
                </div>

                <div className="w-[58%] p-5 flex flex-col justify-between z-10 text-left">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                      <BedDouble className="w-4.5 h-4.5 text-[#FFC107] shrink-0" />
                      <span className="font-extrabold text-[14px] tracking-wide text-white uppercase font-sans">Radisson Blu</span>
                    </div>

                    <div className="inline-block text-[9.5px] font-black uppercase tracking-widest text-[#FFC107] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md mt-2">
                      ★ Member Privilege
                    </div>

                    <div className="pt-2 leading-tight">
                      <h3 className="text-base sm:text-lg font-black text-white leading-none">
                        Extra <span className="text-[#FFC107]">30% OFF</span>
                      </h3>
                      <p className="text-xs font-bold text-slate-300 mt-1.5">On Luxury Suites & Stays</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2.5 flex flex-col gap-1.5 text-[10px] font-bold text-slate-400 leading-none">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#FFC107] shrink-0" />
                      <span>Free Welcome Drinks</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Check className="w-4 h-4 text-[#FFC107] shrink-0" />
                      <span>Complimentary Breakfast</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBannerAction(activeSlideObj);
                    }}
                    className="flex items-center gap-1.5 bg-[#FFC107] hover:bg-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-wider px-4.5 py-2 rounded-full transition-all border-none mt-2 cursor-pointer self-start shadow-xs hover:scale-105"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-[42%] relative overflow-hidden rounded-r-2xl flex items-center justify-center shrink-0 bg-[#07111e]">
                  <img 
                    src={hotelActual} 
                    alt="Radisson Suite Stay" 
                    className="w-full h-full object-cover rounded-r-2xl transition-transform duration-700 hover:scale-110" 
                  />
                </div>
              </div>
            )}

            {/* Slide 2: Air India Travels */}
            {!activeSlideObj?.isDb && activeSlideObj?.idx === 2 && (
              <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#160608] text-white flex flex-row items-stretch animate-fade-in relative">
                <div className="w-[58%] p-5 flex flex-col justify-between z-10 text-left">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                      <Plane className="w-4.5 h-4.5 text-[#FFC107] shrink-0 animate-pulse" />
                      <span className="font-extrabold text-[14px] tracking-wide text-white uppercase font-sans">Air India</span>
                    </div>

                    <div className="inline-block text-[9.5px] font-black uppercase tracking-widest text-[#FFC107] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md mt-2">
                      ★ Flight Special
                    </div>

                    <div className="pt-2 leading-tight">
                      <h3 className="text-base sm:text-lg font-black text-white leading-none">
                        Save <span className="text-[#FFC107]">₹2,000</span>
                      </h3>
                      <p className="text-xs font-bold text-slate-300 mt-1.5">On International Bookings</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2.5 flex flex-col gap-1.5 text-[10px] font-bold text-slate-400 leading-none">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#FFC107] shrink-0" />
                      <span>Extra Baggage Allowance</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Check className="w-4 h-4 text-[#FFC107] shrink-0" />
                      <span>Free Preferred Seat Select</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBannerAction(activeSlideObj);
                    }}
                    className="flex items-center gap-1.5 bg-[#FFC107] hover:bg-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-wider px-4.5 py-2 rounded-full transition-all border-none mt-2 cursor-pointer self-start shadow-xs hover:scale-105"
                  >
                    <span>Claim Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-[42%] relative overflow-hidden rounded-r-2xl flex items-center justify-center shrink-0 bg-[#160608]">
                  <img 
                    src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&auto=format&fit=crop&q=80" 
                    alt="Flight Travel Offer" 
                    className="w-full h-full object-cover rounded-r-2xl transition-transform duration-700 hover:scale-110" 
                  />
                </div>
              </div>
            )}

            {/* Slide 3: Urban Connect Services */}
            {!activeSlideObj?.isDb && activeSlideObj?.idx === 3 && (
              <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-800 bg-[#0e0717] text-white flex flex-row items-stretch animate-fade-in relative">
                <div className="absolute top-3 right-3 bg-rose-600 text-white text-[8px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 z-20 shadow-sm border border-rose-500/20">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Limited Time</span>
                </div>

                <div className="w-[58%] p-5 flex flex-col justify-between z-10 text-left">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                      <Settings className="w-4.5 h-4.5 text-[#FFC107] shrink-0" />
                      <span className="font-extrabold text-[14px] tracking-wide text-white uppercase font-sans">Urban Connect</span>
                    </div>

                    <div className="inline-block text-[9.5px] font-black uppercase tracking-widest text-[#FFC107] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md mt-2">
                      ★ Partner Deal
                    </div>

                    <div className="pt-2 leading-tight">
                      <h3 className="text-base sm:text-lg font-black text-white leading-none">
                        Flat <span className="text-[#FFC107]">25% OFF</span>
                      </h3>
                      <p className="text-xs font-bold text-slate-300 mt-1.5">On all Home Services</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2.5 flex flex-col gap-1.5 text-[10px] font-bold text-slate-400 leading-none">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#FFC107] shrink-0" />
                      <span>Verified Industry Experts</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Check className="w-4 h-4 text-[#FFC107] shrink-0" />
                      <span>100% Insured Deliveries</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBannerAction(activeSlideObj);
                    }}
                    className="flex items-center gap-1.5 bg-[#FFC107] hover:bg-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-wider px-4.5 py-2 rounded-full transition-all border-none mt-2 cursor-pointer self-start shadow-xs hover:scale-105"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-[42%] relative overflow-hidden rounded-r-2xl flex items-center justify-center shrink-0 bg-[#0e0717]">
                  <img 
                    src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80" 
                    alt="Home Services Special" 
                    className="w-full h-full object-cover rounded-r-2xl transition-transform duration-700 hover:scale-110" 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Slider Dots indicators */}
          <div className="flex gap-2 justify-center mt-3 z-20 relative">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveHeroSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer border-none p-0 ${
                  currentSlideIdx === idx 
                    ? 'bg-blue-600 dark:bg-blue-500 w-5' 
                    : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-650'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };


  const renderTopCategoriesGrid = () => {
    const categories = [
      { id: 'Products', title: 'Products', count: '3,200+ Items', icon: ShoppingBag, color: 'text-red-500 bg-red-50 border-red-150' },
      { id: 'Services', title: 'Services', count: '1,200+ Services', icon: Settings, color: 'text-blue-500 bg-blue-50 border-blue-150' },
      { id: 'Daily Needs', title: 'Daily Needs', count: '1,800+ Items', icon: Truck, color: 'text-emerald-500 bg-emerald-50 border-emerald-150' },
      { id: 'Food', title: 'Food', count: '2,500+ Options', icon: Utensils, color: 'text-orange-500 bg-orange-50 border-orange-150' },
      { id: 'Stay', title: 'Stay', count: '800+ Hotels', icon: BedDouble, color: 'text-purple-500 bg-purple-50 border-purple-150' },
      { id: 'Travel', title: 'Travel', count: '1,000+ Trips', icon: Plane, color: 'text-sky-500 bg-sky-50 border-sky-150' },
      { id: 'Jobs', title: 'Jobs', count: '2,000+ Jobs', icon: Briefcase, color: 'text-amber-500 bg-amber-50 border-amber-150' }
    ];

    return (
      <div className="space-y-4 text-left w-full">
        <div className="flex justify-between items-baseline">
          <h3 className="text-sm font-black text-slate-850 dark:text-white tracking-tight uppercase">Top Categories</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.id} 
                onClick={() => {
                  if (cat.id === 'More') {
                    setActiveTab('Services');
                    setSelectedSubNavbarCategory('Services');
                  } else {
                    setActiveTab(cat.id);
                    setSelectedSubNavbarCategory(cat.id);
                  }
                  triggerNotification(`Loading ${cat.title} Category...`);
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-3xl p-4 text-center flex flex-col items-center justify-center transition-all duration-300 shadow-3xs hover:shadow-md hover:-translate-y-1 cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${cat.color.split(' ').slice(1).join(' ')}`}>
                  <Icon className={`w-5.5 h-5.5 ${cat.color.split(' ')[0]}`} />
                </div>
                <span className="text-xs font-black text-slate-850 dark:text-white block leading-tight">{cat.title}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mt-1 leading-none">{cat.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderExclusiveOffers = () => {
    const offers = [
      { 
        id: 'o1', 
        brand: 'Food', 
        discount: 'FLAT 20% OFF', 
        desc: 'On all food orders', 
        code: 'FOOD20', 
        bg: 'bg-rose-50/70 dark:bg-[#1a0914] border-rose-100 dark:border-[#3e1422]/50', 
        tagColor: 'bg-rose-500 text-white', 
        btnColor: 'bg-rose-500 hover:bg-rose-600 text-white',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=250&auto=format&fit=crop&q=80' 
      },
      { 
        id: 'o2', 
        brand: 'Services', 
        discount: '15% OFF', 
        desc: 'On all services', 
        code: 'SERV15', 
        bg: 'bg-blue-50/70 dark:bg-[#06122c] border-blue-100 dark:border-[#11244d]/50', 
        tagColor: 'bg-blue-500 text-white', 
        btnColor: 'bg-blue-500 hover:bg-blue-600 text-white',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=250&auto=format&fit=crop&q=80' 
      },
      { 
        id: 'o3', 
        brand: 'Stay', 
        discount: 'UP TO 30% OFF', 
        desc: 'On hotel bookings', 
        code: 'STAY30', 
        bg: 'bg-emerald-50/70 dark:bg-[#041c12] border-emerald-100 dark:border-[#0e3a24]/50', 
        tagColor: 'bg-emerald-500 text-white', 
        btnColor: 'bg-emerald-500 hover:bg-emerald-600 text-white',
        image: hotelActual 
      },
      { 
        id: 'o4', 
        brand: 'Travel', 
        discount: 'EXTRA 10% OFF', 
        desc: 'On travel bookings', 
        code: 'TRAVEL10', 
        bg: 'bg-indigo-50/70 dark:bg-[#160824] border-indigo-100 dark:border-[#2f114d]/50', 
        tagColor: 'bg-indigo-500 text-white', 
        btnColor: 'bg-indigo-500 hover:bg-indigo-600 text-white',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=250&auto=format&fit=crop&0=80' 
      },
    ];

    return (
      <div className="space-y-4 text-left w-full">
        <div className="flex justify-between items-baseline">
          <h3 className="text-sm font-black text-slate-850 dark:text-white tracking-tight uppercase">Exclusive Offers for You</h3>
          <button 
            onClick={() => {
              setSelectedProduct(null);
              setActiveTab('Offers');
              setSelectedSubNavbarCategory('Offers');
              setSelectedCategories([]);
              setHoveredLink(null);
            }} 
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer bg-transparent border-none"
          >
            View All Offers &gt;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map(offer => (
            <div 
              key={offer.id} 
              className={`border rounded-3xl overflow-hidden shadow-xs flex justify-between p-4 h-[150px] transition-all duration-300 hover:shadow-md ${offer.bg}`}
            >
              <div className="flex flex-col justify-between items-start text-left max-w-[60%] h-full">
                <div className="space-y-1.5">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${offer.tagColor}`}>
                    {offer.discount}
                  </span>
                  <p className="text-xs font-black text-slate-850 dark:text-white leading-tight mt-1">
                    {offer.desc}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase dark:text-slate-500">Code:</span>
                  <span className="text-[10px] font-black font-mono border-dashed border border-slate-350 dark:border-slate-700 px-2 py-0.5 rounded bg-white/60 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200">
                    {offer.code}
                  </span>
                </div>
              </div>

              <div className="w-[100px] h-full rounded-2xl overflow-hidden relative shadow-3xs shrink-0 bg-slate-100 flex items-center justify-center">
                <img src={offer.image} alt={offer.brand} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendedForYou = () => {
    if (products.length === 0) return null;
    const recommendedItems = [
      {
        id: 'rec-1',
        name: 'iPhone 15 (128GB)',
        category: 'Mobiles',
        price: 79900,
        originalPrice: 90800,
        discount: '12% OFF',
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&auto=format&fit=crop&q=80',
        tag: 'Products'
      },
      {
        id: 'rec-2',
        name: 'AC Repair Service',
        category: 'Home Services',
        price: 499,
        originalPrice: 899,
        discount: '44% OFF',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300&auto=format&fit=crop&q=80',
        tag: 'Services'
      },
      {
        id: 'rec-3',
        name: "Domino's Pizza",
        category: 'Food',
        price: 249,
        originalPrice: 310,
        discount: '20% OFF',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
        tag: 'Food'
      },
      {
        id: 'rec-4',
        name: 'Radisson Blu Hotel',
        category: 'Hotels',
        price: 4999,
        originalPrice: 7500,
        discount: '33% OFF',
        rating: 4.6,
        image: hotelActual,
        tag: 'Stay'
      },
      {
        id: 'rec-5',
        name: 'Goa Trip Package',
        category: 'Travel',
        price: 8999,
        originalPrice: 12500,
        discount: '28% OFF',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
        tag: 'Travel'
      },
      {
        id: 'rec-6',
        name: 'UI/UX Designer',
        category: 'Full Time',
        price: 35000,
        originalPrice: 45000,
        discount: 'Salary',
        rating: 4.4,
        image: skMockup,
        tag: 'Jobs'
      }
    ];

    return (
      <div className="space-y-4 text-left w-full">
        <div className="flex justify-between items-baseline">
          <h3 className="text-sm font-black text-slate-850 dark:text-white tracking-tight uppercase">Recommended for You</h3>
          <button 
            onClick={() => {
              setSelectedProduct(null);
              setActiveTab('Products');
              setSelectedSubNavbarCategory('Products');
              setSelectedCategories([]);
              setHoveredLink(null);
            }} 
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer bg-transparent border-none"
          >
            View All &gt;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {recommendedItems.map(item => {
            const isFavorited = favorites.includes(item.id);
            return (
              <div 
                key={item.id} 
                onClick={() => {
                  const navigableTabs = ['Services', 'Food', 'Stay', 'Travel', 'Jobs'];
                  if (navigableTabs.includes(item.tag)) {
                    setSelectedProduct(null);
                    setActiveTab(item.tag);
                    setSelectedSubNavbarCategory(item.tag);
                    setSelectedCategories([]);
                    setSearchQuery('');
                    triggerNotification(`Switching to ${item.tag}...`);
                  } else {
                    const p = products.find(prod => prod.name === item.name) || {
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      originalPrice: item.originalPrice,
                      image: item.image,
                      rating: item.rating,
                      tag: item.tag,
                      category: item.category,
                      discount: item.discount,
                      reviews: 148,
                      subNavbarCategory: item.tag
                    };
                    setSelectedProduct(p);
                    triggerNotification(`Loading details for ${item.name}...`);
                  }
                }}
                className="group bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between text-slate-800 dark:text-slate-200 relative cursor-pointer hover:-translate-y-1 animate-fade-in"
              >
                <div className="relative aspect-[1.1/1] bg-slate-50 overflow-hidden flex items-center justify-center select-none border-b border-slate-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                  
                  {/* Rating star on left top */}
                  <div className="absolute left-2.5 top-2.5 bg-white/90 backdrop-blur-xs text-slate-900 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-0.5 shadow-3xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                  </div>

                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toggleFavorite(item.id); 
                    }} 
                    className="absolute right-2.5 top-2.5 w-7 h-7 rounded-full bg-white/90 text-slate-400 hover:text-red-500 flex items-center justify-center shadow-3xs cursor-pointer border border-slate-200/60 transition-transform hover:scale-105"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>
                
                <div className="p-3 flex-grow flex flex-col justify-between text-left">
                  <div>
                    <h4 className="text-[11px] font-black text-slate-850 dark:text-slate-100 line-clamp-1 leading-tight group-hover:text-indigo-500 transition-colors">{item.name}</h4>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mt-1 leading-none">{item.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 mt-2.5 pt-2.5 w-full">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-slate-850 dark:text-white">
                        ₹{(item.price || 0).toLocaleString()}
                        {item.tag === 'Stay' && <span className="text-[9.5px] font-bold text-slate-400">/night</span>}
                        {item.tag === 'Jobs' && <span className="text-[9.5px] font-bold text-slate-400">/month</span>}
                      </span>
                    </div>
                    {item.discount && (
                      <span className="text-[9px] text-emerald-600 font-black tracking-wide shrink-0">
                        {item.discount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTrustBadges = () => {
    const badges = [
      { title: '100% Secure', subtitle: 'Payments', icon: ShieldCheck, color: 'text-emerald-500' },
      { title: 'Best Prices', subtitle: 'Guaranteed', icon: Percent, color: 'text-amber-500' },
      { title: 'Wide Selection', subtitle: 'Of Products', icon: ShoppingBag, color: 'text-blue-500' },
      { title: '24/7 Support', subtitle: 'Customer Service', icon: LifeBuoy, color: 'text-cyan-500' },
      { title: 'Easy Returns', subtitle: 'Hassle Free', icon: RefreshCw, color: 'text-purple-500' },
      { title: 'Fast Delivery', subtitle: 'On Time', icon: Truck, color: 'text-indigo-500' }
    ];

    return (
      <div className="w-full bg-white dark:bg-[#0b1329] border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-4 shadow-3xs mt-6 transition-all duration-300">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-center">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex items-center gap-3 justify-center text-left">
                <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                  <Icon className={`w-4.5 h-4.5 ${b.color}`} />
                </div>
                <div className="leading-tight">
                  <span className="text-[10px] font-black text-slate-850 dark:text-white block">{b.title}</span>
                  <span className="text-[8px] font-bold text-slate-450 dark:text-slate-500 block mt-0.5 uppercase tracking-wider">{b.subtitle}</span>
                </div>
              </div>
            );
          })}
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
                className="flex flex-col items-center bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 transition-all hover:shadow-md cursor-pointer group text-slate-800 dark:text-slate-200"
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
          <h3 className="text-xs font-black text-slate-500 dark:text-slate-350 uppercase tracking-widest">Trending Products & Services</h3>
          <button onClick={() => { setSelectedSubNavbarCategory('Products'); setActiveTab('Products'); setSelectedCategories([]); }} className="text-[10px] font-bold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 hover:underline cursor-pointer">View All →</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {trending.map(product => {
            const isFavorited = favorites.includes(product.id);
            return (
              <div key={product.id} onClick={() => setSelectedProduct(product)} className="group bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-350 flex flex-col justify-between text-slate-800 dark:text-slate-200 relative cursor-pointer hover:-translate-y-0.5">
                <div className="relative aspect-[0.95/1] bg-slate-50 overflow-hidden flex items-center justify-center select-none border-b border-slate-100">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                  <span className="absolute left-2.5 top-2.5 bg-slate-900/80 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">{product.tag}</span>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }} className="absolute right-2.5 top-2.5 w-7.5 h-7.5 rounded-full bg-white/95 text-slate-400 hover:text-red-500 flex items-center justify-center shadow-xs cursor-pointer border border-slate-200/60 transition-transform hover:scale-105">
                    <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>
                
                <div className="p-3.5 flex-grow flex flex-col justify-between text-left">
                  <div>
                    <h4 className="text-[12px] md:text-[13px] font-black text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-amber-500 transition-colors">{product.name}</h4>
                    <div className="flex items-baseline gap-1.5 mt-2">
                      <span className="text-[12.5px] font-black text-slate-800 dark:text-white">₹{(product.price || 0).toLocaleString()}</span>
                      <span className="text-[10.5px] text-slate-400 dark:text-slate-500 line-through">₹{(product.originalPrice || product.price || 0).toLocaleString()}</span>
                      <span className="text-[9.5px] text-emerald-600 font-bold">{product.discount}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-800/60 mt-2.5 pt-2.5 flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-1 select-none">
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <span>{product.rating}</span>
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">({product.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1.5 w-full">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          addToCart(product); 
                        }} 
                        className="flex-1 inline-flex items-center justify-center gap-0.5 bg-amber-400 hover:bg-amber-500 text-slate-900 text-[10px] font-black py-2 rounded-lg transition-all cursor-pointer uppercase shadow-sm border border-amber-500/30"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          addToCart(product);
                          setIsCartOpen(true);
                        }} 
                        className="flex-1 inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-2 rounded-lg transition-all cursor-pointer uppercase shadow-sm border border-emerald-750/30"
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
            <div key={idx} onClick={() => setSelectedProduct(stay)} className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-slate-800 dark:text-slate-200 cursor-pointer hover:-translate-y-0.5">
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
                    <span className="text-[10px] font-black text-slate-800 dark:text-white font-mono">₹{(stay.price || 0).toLocaleString()}</span>
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
            <div key={idx} onClick={() => setSelectedProduct(rest)} className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-slate-800 dark:text-slate-200 cursor-pointer hover:-translate-y-0.5">
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
                  <div>₹{(rest.price || 0).toLocaleString()}</div>
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
        <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between text-left shadow-xs transition-shadow hover:shadow-sm text-slate-800 dark:text-slate-200">
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
        <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between text-left shadow-xs transition-shadow hover:shadow-sm text-slate-800 dark:text-slate-200 dark:text-slate-200">
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
        <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col justify-between text-left shadow-xs transition-shadow hover:shadow-sm text-slate-800 dark:text-slate-200 dark:text-slate-200">
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
      <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4.5 shadow-xs text-left w-full text-slate-800 dark:text-slate-200 h-full">
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

        <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4.5 shadow-xs space-y-3.5 w-full text-slate-800 dark:text-slate-200">
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
        (job.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
        (job.desc || '').toLowerCase().includes((searchQuery || '').toLowerCase());

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
      <div id="products-section" className="scroll-mt-6 border-t border-slate-200 dark:border-slate-800/60 pt-6 text-slate-800 dark:text-slate-200">
        <div className="flex flex-col gap-6 w-full items-stretch">
          {/* Horizontal Filters Bar */}
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl p-4.5 shadow-xs flex flex-wrap items-center justify-between gap-4">
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
                    {['Products', 'Services'].map(cat => (
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
                    {getCategoriesForTab('Products').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <select
                    value={selectedBrands[0] || ""}
                    onChange={(e) => setSelectedBrands(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Brands</option>
                    {[...new Set(products.filter(p => p.subNavbarCategory === 'Products').map(p => p.vendorName).filter(Boolean))].map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
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
                    {getCategoriesForTab('Services').map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <select
                    value={selectedLocTypes[0] || ""}
                    onChange={(e) => setSelectedLocTypes(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Locations</option>
                    {(() => {
                      const dbCities = products.filter(p => p.subNavbarCategory === 'Services').map(p => p.city || p.vendorCity).filter(Boolean);
                      const cities = [...new Set([...dbCities, 'Bangalore', 'Delhi', 'Mumbai', 'Chennai', 'Hyderabad'])];
                      return cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ));
                    })()}
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
                    {getCategoriesForTab('Daily Needs').map(type => (
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
                  <select
                    value={selectedFoodType}
                    onChange={(e) => setSelectedFoodType(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="All">All Food Types</option>
                    <option value="Veg">Veg Only</option>
                    <option value="Non-Veg">Non-Veg Only</option>
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
                    {getCategoriesForTab('Stay').map(type => (
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
                  {/* From Location */}
                  <select
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">From (Select City)</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Kochi">Kochi</option>
                  </select>

                  {/* To Location */}
                  <select
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">To (Select City)</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Kochi">Kochi</option>
                  </select>

                  {/* Bus Type */}
                  <select
                    value={selectedBusType}
                    onChange={(e) => setSelectedBusType(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Bus Types</option>
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                  </select>

                  {/* Seating Class */}
                  <select
                    value={selectedBusClass}
                    onChange={(e) => setSelectedBusClass(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Seating Classes</option>
                    <option value="Sleeper">Sleeper</option>
                    <option value="Seater">Seater</option>
                  </select>

                  <select
                    value={selectedTravelTypes[0] || ""}
                    onChange={(e) => setSelectedTravelTypes(e.target.value ? [e.target.value] : [])}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">All Categories</option>
                    {getCategoriesForTab('Travel').map(type => (
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
                <option value="price-asc">{activeTab === 'Jobs' ? 'Salary: Low to High' : 'Price: Low to High'}</option>
                <option value="price-desc">{activeTab === 'Jobs' ? 'Salary: High to Low' : 'Price: High to Low'}</option>
                <option value="rating-desc">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Catalog grid or Jobs Board (spanning full width!) */}
          <div className="w-full space-y-6">
            {activeTab === 'Jobs' ? (
              appliedJobId ? (
                /* ================= JOB APPLICATION FORM ================= */
                <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-xs max-w-2xl mx-auto space-y-6 relative overflow-hidden text-slate-800 dark:text-slate-200">
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
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl px-4 py-3 shadow-xs text-slate-800 dark:text-slate-200">
                    <h2 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">
                      Open Positions <span className="text-xs font-medium text-slate-400 dark:text-slate-500">({filteredJobs.length} items found)</span>
                    </h2>
                  </div>

                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl shadow-xs text-slate-800 dark:text-slate-300">
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
                          className="p-5 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-xs hover:shadow-md hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between gap-5 group/job text-left text-slate-800 dark:text-slate-200"
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
                  <div className="w-full text-center py-16 px-6 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-3xl shadow-xs text-slate-800 dark:text-slate-200 space-y-4">
                    <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-400/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                      <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <span className="inline-block text-[9.5px] font-black uppercase tracking-widest text-[#FFC107] bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-md mb-2">
                        ★ Active 3-Tier Category
                      </span>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {selectedCategories[0] ? `${selectedCategories[0]} Category` : 'No Matching Items Found'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed font-medium">
                        {selectedCategories[0] 
                          ? `The "${selectedCategories[0]}" category is active. New products and vendor listings will appear here soon.`
                          : 'Try resetting your filter parameters or search query.'}
                      </p>
                    </div>
                    <div className="flex justify-center gap-3 pt-2">
                      <button 
                        onClick={clearAllFilters} 
                        className="text-xs font-black uppercase tracking-wider text-slate-950 bg-[#FFC107] hover:bg-amber-500 px-6 py-3 rounded-full transition-all shadow cursor-pointer border-none"
                      >
                        Explore All Categories
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                    {filteredProducts.map((product) => {
                      const isFavorited = favorites.includes(product.id);
                      return (
                        <div key={product.id} onClick={() => setSelectedProduct(product)} className="group bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between text-slate-800 dark:text-slate-200 cursor-pointer hover:-translate-y-0.5">
                          <div className="relative aspect-[1.4/1] bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center select-none border-b border-slate-100 dark:border-slate-800/60">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                            {product.subNavbarCategory === 'Food' && (
                              <div className="absolute top-0 left-0 z-10 w-16 h-16 overflow-hidden pointer-events-none">
                                <div className={`absolute top-3 -left-6.5 w-20 py-0.5 text-[7px] font-black text-center uppercase tracking-widest rotate-[-45deg] text-white shadow-xs ${
                                  product.foodType === 'Non-Veg'
                                    ? 'bg-rose-600 border border-rose-700'
                                    : 'bg-emerald-600 border border-emerald-700'
                                }`}>
                                  {product.foodType}
                                </div>
                              </div>
                            )}
                            <span className={`absolute left-2.5 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm transition-all ${
                              product.subNavbarCategory === 'Food' ? 'top-8.5' : 'top-2.5'
                            }`}>
                              {product.tag}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }} className="absolute right-2.5 top-2.5 w-7.5 h-7.5 rounded-full bg-white text-slate-400 hover:text-red-500 flex items-center justify-center shadow-md cursor-pointer border border-slate-100 transition-transform hover:scale-105">
                              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>
                          </div>
                          
                          <div className="p-4 flex-grow flex flex-col justify-between text-left">
                            <div>
                              <h4 className="text-[14px] sm:text-[15px] font-black text-slate-850 dark:text-slate-100 line-clamp-1 leading-tight group-hover:text-blue-600 transition-colors">{product.name}</h4>
                              <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1 font-medium">
                                {product.description || `All types of ${(product.category || '').toLowerCase()} services`}
                              </p>
                              
                              {/* Rating & Duration Row */}
                              <div className="flex items-center gap-3.5 mt-2.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1 font-bold">
                                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                  <span className="font-extrabold">{product.rating || '4.5'}</span>
                                  <span className="text-slate-400 font-semibold">({product.reviews || '120'})</span>
                                </div>
                                {product.duration && (
                                  <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{product.duration}</span>
                                  </div>
                                )}
                                {(() => {
                                  const guestsCount = getGuestsCount(product);
                                  if (!guestsCount) return null;
                                  return (
                                    <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3">
                                      <User className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{guestsCount} {Number(guestsCount) === 1 ? 'Person' : 'People'}</span>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Price Section */}
                              <div className="mt-3.5 space-y-1">
                                <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-none">Starting from</span>
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-[15px] sm:text-[16px] font-black text-slate-850 dark:text-white">₹{(product.price || 0).toLocaleString()}</span>
                                  <span className="text-[11px] sm:text-[12px] text-slate-400 dark:text-slate-500 line-through">₹{(product.originalPrice || product.price || 0).toLocaleString()}</span>
                                  <span className="text-[10px] sm:text-[11px] text-emerald-600 font-extrabold">{product.discount || '20% off'}</span>
                                </div>
                              </div>

                              {/* Member Tag */}
                              <div className="mt-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-2xs">
                                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-[9.5px] font-extrabold text-emerald-700 dark:text-emerald-400 leading-none">
                                  Extra 5% Member Reward
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons based on category type */}
                            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-850/60 w-full flex items-center gap-2">
                              {(() => {
                                const category = activeTab === 'Home' ? product.subNavbarCategory : activeTab;
                                if (category === 'Products' || category === 'Daily Needs' || category === 'Food') {
                                  return (
                                    <>
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          addToCart(product); 
                                          triggerNotification(`${product.name} added to cart!`); 
                                        }} 
                                        className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-0.5 border border-slate-200/40 dark:border-slate-750/30 leading-none h-9"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Cart</span>
                                      </button>
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          addToCart(product);
                                          setIsCartOpen(true);
                                        }} 
                                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center border-none leading-none h-9"
                                      >
                                        <span>Order Now</span>
                                      </button>
                                    </>
                                  );
                                } else if (category === 'Services' || category === 'Stay' || category === 'Travel') {
                                  return (
                                    <>
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setActiveScheduleModalItem(product);
                                          setSelectedModalDate('Wed, 21 May 2025');
                                          setSelectedModalTime('11:00 AM');
                                          setSelectedModalType(product.subNavbarCategory === 'Stay' ? 'Standard Room' : (product.subNavbarCategory === 'Travel' ? 'Private Tour' : 'Video Consultation'));
                                        }} 
                                        className="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1 border border-amber-500/30 leading-none h-9"
                                      >
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Schedule</span>
                                      </button>
                                      <button 
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          setActiveBookNowModalItem(product);
                                          setSelectedModalDate('Wednesday, 21 May 2025');
                                          setSelectedModalTime('11:00 AM');
                                          setSelectedModalType(product.subNavbarCategory === 'Stay' ? 'Standard Room' : (product.subNavbarCategory === 'Travel' ? 'Private Tour' : 'Video Consultation'));
                                          setSelectedTimeOfDayTab('Morning');
                                        }} 
                                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center border-none leading-none h-9"
                                      >
                                        <span>Book Now</span>
                                      </button>
                                    </>
                                  );
                                } else {
                                  // Jobs
                                  return (
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        triggerNotification(`Applying for ${product.name}...`);
                                      }} 
                                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center border-none leading-none h-9"
                                    >
                                      <span>Apply Now</span>
                                    </button>
                                  );
                                }
                              })()}
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
  const renderStayDetailsPage = () => {
    if (!selectedProduct) return null;
    const thumbnails = selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image];
    const isFavorited = favorites.includes(selectedProduct.id);
    const formatDate = (dateStr) => { if (!dateStr) return ''; const d = new Date(dateStr); if (isNaN(d.getTime())) return dateStr; const wd = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; const mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${wd[d.getDay()]}, ${d.getDate()} ${mn[d.getMonth()]} ${d.getFullYear()}`; };
    const getNightsCount = () => { const s = new Date(stayCheckInDate), e = new Date(stayCheckOutDate); if (isNaN(s.getTime()) || isNaN(e.getTime())) return 1; const diff = Math.ceil((e - s) / 86400000); return diff > 0 ? diff : 1; };
    const nights = getNightsCount();
    const basePrice = selectedProduct.price || 20000;
    const roomTypes = [
      { id:'standard', name:'Standard Room', guests: selectedProduct.guests || 2, bed:'1 Queen Bed', area:'180 sq.ft', amenities:['Free Wi-Fi','Air Conditioning','TV'], extra:'+2 more', price: basePrice, originalPrice: selectedProduct.originalPrice || Math.round(basePrice*1.25) },
      { id:'deluxe', name:'Deluxe Room', guests: selectedProduct.guests || 2, bed:'1 King Bed', area:'250 sq.ft', amenities:['Free Wi-Fi','Air Conditioning','TV'], extra:'+3 more', price: Math.round(basePrice*1.4), originalPrice: Math.round(basePrice*1.75) },
      { id:'suite', name:'Suite Room', guests: (selectedProduct.guests || 2) + 2, bed:'1 King Bed', area:'450 sq.ft', amenities:['Free Wi-Fi','Air Conditioning','TV'], extra:'+5 more', price: Math.round(basePrice*2), originalPrice: Math.round(basePrice*2.5) }
    ];
    const selectedRoom = roomTypes[0];
    const totalPrice = selectedRoom.price * nights;
    const taxes = Math.round(totalPrice * 0.15);
    const memberDiscount = Math.round(totalPrice * 0.15);

    return (
      <div className="space-y-6 pb-16 text-slate-800 dark:text-slate-200 animate-fade-in">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl px-5 py-3 shadow-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => { setSelectedProduct(null); setActiveTab('Home'); setSelectedSubNavbarCategory('All'); }} className="hover:text-amber-500 transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Home</button>
            <span>&gt;</span><button onClick={() => { setSelectedProduct(null); setActiveTab('Stay'); setSelectedSubNavbarCategory('Stay'); }} className="hover:text-amber-500 transition-colors cursor-pointer bg-transparent border-none">Stays</button>
            <span>&gt;</span><span>{selectedProduct.category || 'Luxury Hotels'}</span><span>&gt;</span>
            <span className="text-slate-800 dark:text-white font-extrabold truncate max-w-[200px]">Hotel {selectedProduct.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => triggerNotification("Link copied!")} className="flex items-center gap-1.5 hover:text-amber-500 transition-colors cursor-pointer bg-transparent border-none text-xs font-bold"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.636-2.318m0 7.152l-4.636-2.318M21 12a3 3 0 11-6 0 3 3 0 016 0zm-12 6a3 3 0 11-6 0 3 3 0 016 0zm0-12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Share</button>
            <button onClick={() => toggleFavorite(selectedProduct.id)} className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none text-xs font-bold"><Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} /> Save for later</button>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Gallery + About Property */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img src={activeProductImage || selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <button onClick={() => toggleFavorite(selectedProduct.id)} className="absolute right-3 top-3 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center shadow-md cursor-pointer border-none"><Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} /></button>
              <span className="absolute bottom-3 left-3 bg-black/60 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">{activeThumbnailIndex + 1} / {thumbnails.length}</span>
              <button onClick={() => { const p = activeThumbnailIndex === 0 ? thumbnails.length - 1 : activeThumbnailIndex - 1; setActiveProductImage(thumbnails[p]); setActiveThumbnailIndex(p); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center cursor-pointer border-none shadow"><ChevronLeft className="w-4 h-4 text-slate-700" /></button>
              <button onClick={() => { const n = activeThumbnailIndex === thumbnails.length - 1 ? 0 : activeThumbnailIndex + 1; setActiveProductImage(thumbnails[n]); setActiveThumbnailIndex(n); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center cursor-pointer border-none shadow"><ChevronRight className="w-4 h-4 text-slate-700" /></button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">{thumbnails.slice(0, 8).map((t, i) => (<button key={i} onClick={() => { setActiveProductImage(t); setActiveThumbnailIndex(i); }} className={`w-14 h-10 rounded-lg border-2 overflow-hidden shrink-0 cursor-pointer ${activeThumbnailIndex === i ? 'border-amber-400 shadow-md' : 'border-slate-200 dark:border-slate-800'}`}><img src={t} alt="" className="w-full h-full object-cover" /></button>))}</div>
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">About Property</span>
              <div className="flex gap-3 items-center"><div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0"><Building2 className="w-5 h-5" /></div><div><h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">Hotel {selectedProduct.name} <CheckCircle2 className="w-4 h-4 text-white dark:text-white fill-blue-500 shrink-0" /></h3><span className="text-[11px] text-slate-450 font-bold">{selectedProduct.category || 'Luxury Hotels'}</span></div></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{selectedProduct.description || 'Experience luxury and comfort like never before. Spacious rooms, excellent amenities and top-notch hospitality await you.'}</p>
              <div className="grid grid-cols-3 gap-3 pt-2">{[{l:'Elite Property',i:<ShieldCheck className="w-4 h-4"/>},{l:'24/7 Reception',i:<Clock className="w-4 h-4"/>},{l:'Free Wi-Fi',i:<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01"/></svg>},{l:'Restaurant',i:<Utensils className="w-4 h-4"/>},{l:'Swimming Pool',i:<Activity className="w-4 h-4"/>},{l:'Free Parking',i:<MapPin className="w-4 h-4"/>}].map((f, fi) => (<div key={fi} className="flex flex-col items-center text-center gap-1.5 py-2"><span className="text-slate-500 dark:text-slate-400">{f.i}</span><span className="text-[8px] font-bold text-slate-500 uppercase leading-tight">{f.l}</span></div>))}</div>
            </div>
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-6 text-left">
              <div className="text-center shrink-0"><div className="flex items-center gap-1 text-amber-500 font-black text-lg"><Star className="w-5 h-5 fill-amber-500" /> {selectedProduct.rating || '4.5'}</div><span className="text-[10px] text-slate-400 font-bold">/5</span><span className="text-[9px] text-slate-400 font-bold block">({selectedProduct.reviews || 120} Reviews)</span></div>
              <div className="border-l border-slate-200 dark:border-slate-800 pl-5 flex items-center gap-2"><span className="text-emerald-500 font-black text-lg"></span><div><span className="text-xs font-extrabold text-slate-800 dark:text-white block">Guests love</span><span className="text-[10px] text-slate-450 font-bold">cleanliness & service</span></div></div>
            </div>
          </div>

          {/* CENTER: Hotel Info + Room Types + Amenities */}
          <div className="lg:col-span-5 flex flex-col gap-5 text-left">
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2"><span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider"><ShieldCheck className="w-3.5 h-3.5" /> Verified Property</span><span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 border border-blue-100 dark:border-blue-900/30 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Best Price Guaranteed</span></div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">{selectedProduct.name}</h1>
              <span className="text-xs font-bold text-slate-450">{selectedProduct.category || 'Luxury Hotels'}</span>
              <div className="flex items-center gap-2 flex-wrap"><div className="flex text-amber-400">{[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />)}</div><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedProduct.rating || '4.5'} ({selectedProduct.reviews || 120} Reviews)</span><span className="text-slate-300">|</span><span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-2.5 py-0.5 rounded-full">Verified Purchase</span></div>
            </div>
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="grid grid-cols-3 gap-3">
                <div onClick={() => setActiveBookNowModalItem(selectedProduct)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 cursor-pointer hover:border-blue-400 transition-colors">
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider block">Check-in</span>
                  <span className="text-[12px] font-black text-slate-800 dark:text-white mt-1 block">{formatDate(stayCheckInDate)}</span>
                </div>
                <div onClick={() => setActiveBookNowModalItem(selectedProduct)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 cursor-pointer hover:border-emerald-400 transition-colors">
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">Check-out</span>
                  <span className="text-[12px] font-black text-slate-800 dark:text-white mt-1 block">{formatDate(stayCheckOutDate)}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Nights</span>
                  <span className="text-[12px] font-black text-slate-800 dark:text-white mt-1 block">{nights} {nights===1?'Night':'Nights'}</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Amenities</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {(selectedProduct.amenities && selectedProduct.amenities.length > 0 
                  ? selectedProduct.amenities 
                  : ['Wi-Fi','Room Service','AC','Gym','Spa','Laundry','24/7 Security','Restaurant','Parking','Power Backup']
                ).map((a, ai) => (
                  <div key={ai} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Booking Summary */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 sticky top-4 text-left">
              <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">Booking Summary</h3>
              <div className="space-y-2.5 text-xs"><div className="flex justify-between"><span className="text-slate-450 font-bold">Hotel</span><span className="font-extrabold text-slate-800 dark:text-white text-right">{selectedProduct.name}</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">Check-in</span><span className="font-extrabold text-slate-800 dark:text-white">{formatDate(stayCheckInDate)}</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">Check-out</span><span className="font-extrabold text-slate-800 dark:text-white">{formatDate(stayCheckOutDate)}</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">Nights</span><span className="font-extrabold text-slate-800 dark:text-white">{nights} {nights===1?'Night':'Nights'}</span></div></div>
              <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2 text-xs"><div className="flex justify-between"><span className="text-slate-450 font-bold">Price per night</span><span className="font-extrabold text-slate-800 dark:text-white">₹{selectedRoom.price.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">Taxes & Fees</span><span className="font-extrabold text-slate-800 dark:text-white">₹{taxes.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">Membership Discount</span><span className="font-extrabold text-emerald-600">- ₹{memberDiscount.toLocaleString()}</span></div></div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline"><div><span className="text-sm font-black text-slate-900 dark:text-white block">Total Amount</span><span className="text-[9px] text-slate-400 font-bold">Incl. all taxes</span></div><span className="text-xl font-black text-slate-900 dark:text-white">₹{totalPrice.toLocaleString()}</span></div>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl px-3 py-2.5 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><div><span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 block">Free Cancellation</span><span className="text-[9px] text-emerald-600/70 font-bold">Cancel up to 24 hrs before check-in for full refund.</span></div></div>
              <button onClick={() => { setActiveBookNowModalItem(selectedProduct); setSelectedModalDate(formatDate(stayCheckInDate)); setSelectedModalTime('12:00 PM'); setSelectedModalType('Standard Room'); setSelectedTimeOfDayTab('Morning'); }} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer border-none flex items-center justify-center gap-2">Continue to Payment <ArrowRight className="w-4 h-4" /></button>
              <button onClick={() => triggerNotification("Pay at Hotel option selected!")} className="w-full py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all border border-slate-200 dark:border-slate-800 cursor-pointer">Pay at Hotel</button>
              <div className="flex items-center gap-2 justify-center pt-1"><span className="text-[9px] text-slate-400 font-bold">We accept</span>{['VISA','MasterCard','RuPay','UPI'].map((p, pi) => <span key={pi} className="text-[8px] font-black text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded">{p}</span>)}</div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          {[{icon:<ShieldCheck className="w-5 h-5 text-emerald-500"/>,title: 'Safe & Secure Booking',desc:"Your booking is protected by ConnectApp's secure system."},{icon:<Tag className="w-5 h-5 text-blue-500"/>,title: 'Best Price Guarantee',desc:"Found a lower price? We'll match it."},{icon:<LifeBuoy className="w-5 h-5 text-amber-500"/>,title: '24/7 Customer Support',desc:"We're here to help, anytime."}].map((b, bi) => (
            <div key={bi} className="flex items-center gap-3">{b.icon}<div><span className="text-xs font-extrabold text-slate-800 dark:text-white block">{b.title}</span><span className="text-[10px] text-slate-450 font-bold">{b.desc}</span></div></div>
          ))}
        </div>
      </div>
    );
  };

  // SERVICE/GYM DETAILS PAGE
  const renderServiceDetailsPage = () => {
    if (!selectedProduct) return null;
    const thumbnails = selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image];
    const isFavorited = favorites.includes(selectedProduct.id);
    const basePrice = selectedProduct.price || 2499;
    const plans = [
      { id:'1month', name:'1 Month Plan', price: basePrice, perLabel:'/month', validity:'Valid for 30 Days', originalPrice: null, save: null, best: false },
      { id:'3month', name:'3 Month Plan', price: Math.round(basePrice * 2.8), perLabel:'/3 months', validity:'Valid for 90 Days', originalPrice: Math.round(basePrice * 3), save: Math.round(basePrice * 0.2), best: false },
      { id:'12month', name:'12 Month Plan', price: Math.round(basePrice * 8), perLabel:'/year', validity:'Valid for 365 Days', originalPrice: Math.round(basePrice * 12), save: Math.round(basePrice * 4), best: true }
    ];
    const timings = [{name:'Morning',time:'5:00 AM - 9:00 AM'},{name:'Afternoon',time:'12:00 PM - 4:00 PM'},{name:'Evening',time:'5:00 PM - 10:00 PM'},{name:'Night',time:'10:00 PM - 12:00 AM'}];
    const selectedPlan = plans[0];
    const selectedTiming = timings[0];
    const gst = Math.round(selectedPlan.price * 0.18);
    const convFee = 50;
    const totalAmount = selectedPlan.price + gst + convFee;

    return (
      <div className="space-y-6 pb-16 text-slate-800 dark:text-slate-200 animate-fade-in">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl px-5 py-3 shadow-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => { setSelectedProduct(null); setActiveTab('Home'); setSelectedSubNavbarCategory('All'); }} className="hover:text-amber-500 transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Home</button>
            <span>&gt;</span><button onClick={() => { setSelectedProduct(null); setActiveTab('Services'); setSelectedSubNavbarCategory('Services'); }} className="hover:text-amber-500 transition-colors cursor-pointer bg-transparent border-none">Services</button>
            <span>&gt;</span><span>{selectedProduct.category || 'Fitness & Wellness'}</span><span>&gt;</span>
            <span className="text-slate-800 dark:text-white font-extrabold truncate max-w-[200px]">{selectedProduct.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => triggerNotification("Link copied!")} className="flex items-center gap-1.5 hover:text-amber-500 transition-colors cursor-pointer bg-transparent border-none text-xs font-bold"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742l4.636-2.318m0 7.152l-4.636-2.318M21 12a3 3 0 11-6 0 3 3 0 016 0zm-12 6a3 3 0 11-6 0 3 3 0 016 0zm0-12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Share</button>
            <button onClick={() => toggleFavorite(selectedProduct.id)} className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none text-xs font-bold"><Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} /> Save for later</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Gallery + About + Ratings */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img src={activeProductImage || selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              <button onClick={() => toggleFavorite(selectedProduct.id)} className="absolute right-3 top-3 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center shadow-md cursor-pointer border-none"><Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} /></button>
              <span className="absolute bottom-3 left-3 bg-black/60 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full">{activeThumbnailIndex + 1} / {thumbnails.length}</span>
              <button onClick={() => { const p = activeThumbnailIndex === 0 ? thumbnails.length - 1 : activeThumbnailIndex - 1; setActiveProductImage(thumbnails[p]); setActiveThumbnailIndex(p); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center cursor-pointer border-none shadow"><ChevronLeft className="w-4 h-4 text-slate-700" /></button>
              <button onClick={() => { const n = activeThumbnailIndex === thumbnails.length - 1 ? 0 : activeThumbnailIndex + 1; setActiveProductImage(thumbnails[n]); setActiveThumbnailIndex(n); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center cursor-pointer border-none shadow"><ChevronRight className="w-4 h-4 text-slate-700" /></button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">{thumbnails.slice(0, 8).map((t, i) => (<button key={i} onClick={() => { setActiveProductImage(t); setActiveThumbnailIndex(i); }} className={`w-14 h-10 rounded-lg border-2 overflow-hidden shrink-0 cursor-pointer ${activeThumbnailIndex === i ? 'border-amber-400 shadow-md' : 'border-slate-200 dark:border-slate-800'}`}><img src={t} alt="" className="w-full h-full object-cover" /></button>))}</div>

            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">About {selectedProduct.name}</span>
              <div className="flex gap-3 items-center"><div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white font-black text-[9px] shrink-0 uppercase tracking-wider">{(selectedProduct.name || 'GYM').substring(0, 4)}</div><div><h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">{selectedProduct.name} <CheckCircle2 className="w-4 h-4 text-white dark:text-white fill-blue-500 shrink-0" /></h3><span className="text-[11px] text-slate-450 font-bold">{selectedProduct.category || 'Premium Gym & Fitness Center'}</span></div></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{selectedProduct.description || 'A group workout and fitness center with state-of-the-art equipment, expert trainers and world-class facilities to help you achieve your fitness goals.'}</p>
              <div className="grid grid-cols-3 gap-3 pt-2">{[{l:'Certified Trainers',i:<UserCheck className="w-4 h-4"/>},{l:'Modern Equipment',i:<Activity className="w-4 h-4"/>},{l:'Hygienic Environment',i:<ShieldCheck className="w-4 h-4"/>},{l:'Personal Training',i:<Briefcase className="w-4 h-4"/>},{l:'Diet & Nutrition',i:<Utensils className="w-4 h-4"/>},{l:'Flexible Hours',i:<Clock className="w-4 h-4"/>}].map((f, fi) => (<div key={fi} className="flex flex-col items-center text-center gap-1.5 py-2"><span className="text-slate-500 dark:text-slate-400">{f.i}</span><span className="text-[8px] font-bold text-slate-500 uppercase leading-tight">{f.l}</span></div>))}</div>
            </div>

            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ratings & Reviews</span>
              <div className="flex items-start gap-5">
                <div className="text-center shrink-0"><span className="text-2xl font-black text-slate-900 dark:text-white block">{selectedProduct.rating || '4.5'}</span><span className="text-[10px] text-slate-400 font-bold">/5</span><div className="flex text-amber-400 mt-1 justify-center">{[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400" />)}</div><span className="text-[9px] text-slate-400 font-bold block mt-1">({selectedProduct.reviews || '2,450'} Reviews)</span></div>
                <div className="flex-grow space-y-1">{[{s:5,p:70},{s:4,p:20},{s:3,p:6},{s:2,p:2},{s:1,p:2}].map(r => (<div key={r.s} className="flex items-center gap-2"><span className="text-[9px] font-bold text-slate-500 w-3">{r.s}</span><Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /><div className="flex-grow h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden"><div className={`h-full rounded-full ${r.s >= 4 ? 'bg-emerald-500' : r.s === 3 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${r.p}%` }}></div></div><span className="text-[8px] font-bold text-slate-400 w-6 text-right">{r.p}%</span></div>))}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">{[{v:'2,450+',l:'Happy Members',i:<Users className="w-4 h-4 text-blue-500"/>},{v:'98%',l:'Satisfaction',i:<ThumbsUp className="w-4 h-4 text-emerald-500"/>},{v:'5+ Years',l:'In Your City',i:<MapPin className="w-4 h-4 text-amber-500"/>}].map((s, si) => (<div key={si} className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center"><span className="text-slate-500 block mb-1.5">{s.i}</span><span className="text-sm font-black text-slate-900 dark:text-white block">{s.v}</span><span className="text-[8px] text-slate-400 font-bold uppercase">{s.l}</span></div>))}</div>
          </div>

          {/* CENTER: Plans + Timing + Benefits + Facilities + Trainers */}
          <div className="lg:col-span-5 flex flex-col gap-5 text-left">
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-100 dark:border-emerald-900/30 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider"><ShieldCheck className="w-3.5 h-3.5" /> Verified Partner</span>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">{selectedProduct.name} <CheckCircle2 className="w-5 h-5 text-white dark:text-white fill-blue-500 shrink-0" /></h1>
              <span className="text-xs font-bold text-slate-450">{selectedProduct.category || 'Gym Membership'}</span>
              <div className="flex items-center gap-2 flex-wrap"><div className="flex text-amber-400">{[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400" />)}</div><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedProduct.rating || '4.5'} ({selectedProduct.reviews || '2,450'} Reviews)</span><span className="text-slate-300">|</span><span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-2.5 py-0.5 rounded-full">Verified Partner</span></div>
            </div>
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Membership Plans</h3>
              <div className="grid grid-cols-3 gap-3">{plans.map(plan => (<div key={plan.id} className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all ${plan.id === '1month' ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>{plan.best && <span className="absolute -top-2 right-2 bg-amber-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Best Value</span>}<span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 block">{plan.name}</span><span className="text-lg font-black text-slate-900 dark:text-white block mt-1">₹{plan.price.toLocaleString()}</span><span className="text-[9px] text-slate-400 font-bold">{plan.perLabel}</span>{plan.originalPrice && <><br/><span className="text-[9px] text-slate-400 line-through">₹{plan.originalPrice.toLocaleString()}</span> <span className="text-[9px] font-black text-emerald-600">Save ₹{plan.save.toLocaleString()}</span></>}<span className="text-[8px] text-slate-400 font-bold block mt-1.5">{plan.validity}</span></div>))}</div>
            </div>
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Select Gym Timing</h3>
              <div className="grid grid-cols-4 gap-2">{timings.map(t => (<button key={t.name} className={`p-2.5 rounded-xl border-2 text-center cursor-pointer transition-all ${t.name === 'Morning' ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'} bg-transparent`}><span className="text-[10px] font-black text-slate-800 dark:text-white block">{t.name}</span><span className="text-[8px] text-slate-400 font-bold">{t.time}</span></button>))}</div>
            </div>
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Membership Benefits</h3>
              <div className="grid grid-cols-2 gap-2">{['Access to all Gym equipment','Body Composition Analysis','Group Classes (HIIT, Yoga, Zumba & more)','Locker & Shower Facility','Personal Training (1 session/month)','Free BuildFIT App Access','Diet & Nutrition Guidance','Exclusive Member Events'].map((b, bi) => (<div key={bi} className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /><span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{b}</span></div>))}</div>
            </div>
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Facilities</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">{[{l:'Cardio Area',i:<Activity className="w-4 h-4"/>},{l:'Strength Training',i:<Zap className="w-4 h-4"/>},{l:'Group Classes',i:<Users className="w-4 h-4"/>},{l:'CrossFit Zone',i:<Sparkles className="w-4 h-4"/>},{l:'Yoga Studio',i:<Heart className="w-4 h-4"/>},{l:'Steam & Shower',i:<Wind className="w-4 h-4"/>},{l:'Locker Facility',i:<ShieldCheck className="w-4 h-4"/>},{l:'Water Station',i:<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>},{l:'Parking',i:<MapPin className="w-4 h-4"/>},{l:'Wi-Fi Access',i:<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01"/></svg>}].map((f, fi) => (<div key={fi} className="flex flex-col items-center text-center gap-1.5 py-2"><span className="text-slate-500 dark:text-slate-400">{f.i}</span><span className="text-[8px] font-bold text-slate-500 uppercase leading-tight">{f.l}</span></div>))}</div>
            </div>
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Trainers</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">{[{name:'Rohit Sharma',role:'Strength Coach',exp:'5 Years'},{name:'Anjali Mehta',role:'Yoga Instructor',exp:'4 Years'},{name:'Karan Verma',role:'HIIT Coach',exp:'6 Years'},{name:'Pooja Iyer',role:'Nutrition Expert',exp:'5 Years'}].map((t, ti) => (<div key={ti} className="flex flex-col items-center shrink-0"><div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500"><UserCheck className="w-5 h-5" /></div><span className="text-[10px] font-extrabold text-slate-800 dark:text-white mt-1.5 block text-center">{t.name}</span><span className="text-[8px] text-slate-450 font-bold text-center">{t.role}</span><span className="text-[8px] text-slate-400 font-bold">{t.exp} Exp.</span></div>))}</div>
            </div>
          </div>

          {/* RIGHT: Booking Summary */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 sticky top-4 text-left">
              <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">Booking Summary</h3>
              <div className="space-y-2.5 text-xs"><div className="flex justify-between"><span className="text-slate-450 font-bold">Service</span><span className="font-extrabold text-slate-800 dark:text-white text-right">Gym Membership</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">Gym</span><span className="font-extrabold text-slate-800 dark:text-white text-right">{selectedProduct.name}</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">Membership Plan</span><span className="font-extrabold text-slate-800 dark:text-white">{selectedPlan.name}</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">Timing</span><span className="font-extrabold text-slate-800 dark:text-white text-right">{selectedTiming.name} ({selectedTiming.time})</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">Start Date</span><span className="font-extrabold text-slate-800 dark:text-white">Wed, 21 May 2025</span></div></div>
              <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2 text-xs"><div className="flex justify-between"><span className="text-slate-450 font-bold">Plan Amount</span><span className="font-extrabold text-slate-800 dark:text-white">₹{selectedPlan.price.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">GST (18%)</span><span className="font-extrabold text-slate-800 dark:text-white">₹{gst.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-slate-450 font-bold">Convenience Fee</span><span className="font-extrabold text-slate-800 dark:text-white">₹{convFee}</span></div></div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline"><span className="text-sm font-black text-slate-900 dark:text-white">Total Amount</span><span className="text-xl font-black text-slate-900 dark:text-white">₹{totalAmount.toLocaleString()}</span></div>
              <div className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-900/20 rounded-xl px-3 py-2.5"><div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /><div><span className="text-[10px] font-black text-amber-700 dark:text-amber-400 block">Members get up to 15% OFF</span><span className="text-[8px] text-amber-600/70 font-bold">Join Silver / Gold / Diamond membership to save more.</span></div></div><button onClick={() => triggerNotification("Opening membership plans...")} className="text-[9px] text-blue-600 font-extrabold hover:underline bg-transparent border-none cursor-pointer mt-1">Explore Memberships →</button></div>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl px-3 py-2.5 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><div><span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 block">Free Cancellation</span><span className="text-[9px] text-emerald-600/70 font-bold">Cancel up to 2 hrs before start time</span></div></div>
              <button onClick={() => { setActiveBookNowModalItem(selectedProduct); setSelectedModalDate('Wednesday, 21 May 2025'); setSelectedModalTime(selectedTiming.time); setSelectedModalType(selectedPlan.name); setSelectedTimeOfDayTab('Morning'); }} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer border-none flex items-center justify-center gap-2">Book Membership <ArrowRight className="w-4 h-4" /></button>
              <button onClick={() => triggerNotification("1 Day Free Trial request submitted!")} className="w-full py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all border border-slate-200 dark:border-slate-800 cursor-pointer">Book Free Trial</button>
              <span className="text-[9px] text-slate-400 font-bold text-center block">1 Day Free Trial for New Users</span>
              <div className="flex items-center justify-center gap-4 pt-1">{[{l:'Secure Payment',i:<ShieldCheck className="w-3 h-3"/>},{l:'Instant Confirmation',i:<CheckCircle2 className="w-3 h-3"/>},{l:'24/7 Support',i:<LifeBuoy className="w-3 h-3"/>}].map((t, ti) => (<div key={ti} className="flex items-center gap-1 text-[8px] font-bold text-slate-400"><span className="text-slate-400">{t.i}</span>{t.l}</div>))}</div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          {[{icon:<ShieldCheck className="w-5 h-5 text-emerald-500"/>,title: 'Trusted & Verified Professionals',desc:'All service providers are verified and trusted.'},{icon:<Tag className="w-5 h-5 text-blue-500"/>,title: 'Safe & Secure Payments',desc:"Your payments are 100% safe with ConnectApp."},{icon:<LifeBuoy className="w-5 h-5 text-amber-500"/>,title: '24/7 Customer Support',desc:"We're here to help, anytime."}].map((b, bi) => (
            <div key={bi} className="flex items-center gap-3">{b.icon}<div><span className="text-xs font-extrabold text-slate-800 dark:text-white block">{b.title}</span><span className="text-[10px] text-slate-450 font-bold">{b.desc}</span></div></div>
          ))}
        </div>
      </div>
    );
  };

  // 12. DETAILED PRODUCT DESCRIPTION PAGE VIEW
  const renderTravelDetailsPage = () => {
    if (!selectedProduct) return null;

    const thumbnails = selectedProduct.images && selectedProduct.images.length > 0
      ? selectedProduct.images
      : [selectedProduct.image];

    const isFavorited = favorites.includes(selectedProduct.id);

    return (
      <div className="space-y-8 pb-16 text-slate-800 dark:text-slate-200">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl px-5 py-3 shadow-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => { setSelectedProduct(null); setActiveTab('Home'); setSelectedSubNavbarCategory('All'); }} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none">Home</button>
            <span>&gt;</span>
            <button onClick={() => { 
              setSelectedProduct(null); 
              setActiveTab('Travel'); 
              setSelectedSubNavbarCategory('Travel'); 
            }} className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none">Travel</button>
            <span>&gt;</span>
            <span className="hover:text-amber-505 transition-colors">{selectedProduct.category}</span>
            <span>&gt;</span>
            <span className="text-slate-800 dark:text-white font-extrabold truncate max-w-[200px]">{selectedProduct.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => triggerNotification("Travel link copied to clipboard!")} className="flex items-center gap-1.5 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none">
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

        {/* Main Travel Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-xs">
          
          {/* Left Column: Gallery & About Operator */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex gap-4">
              {/* Thumbnails list */}
              <div className="flex flex-col gap-2.5 shrink-0 select-none">
                {thumbnails.slice(0, 5).map((thumb, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveProductImage(thumb); setActiveThumbnailIndex(idx); }}
                    className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-all cursor-pointer ${
                      activeThumbnailIndex === idx 
                        ? 'border-amber-400 shadow-md scale-102' 
                        : 'border-slate-200/60 dark:border-slate-800/60 hover:border-slate-350'
                    }`}
                  >
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {thumbnails.length > 5 && (
                  <div onClick={() => setIsGalleryModalOpen(true)} className="w-14 h-14 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <span>+{thumbnails.length - 5}</span>
                    <span>More</span>
                  </div>
                )}
              </div>

              {/* Main Large Display with Page indicator and nav arrows */}
              <div className="relative flex-grow aspect-[4/3] bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 overflow-hidden flex items-center justify-center">
                <img 
                  src={activeProductImage || selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />

                {/* Left/Right nav arrows */}
                <button 
                  onClick={() => {
                    const prevIdx = activeThumbnailIndex === 0 ? thumbnails.length - 1 : activeThumbnailIndex - 1;
                    setActiveProductImage(thumbnails[prevIdx]);
                    setActiveThumbnailIndex(prevIdx);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer border-none"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button 
                  onClick={() => {
                    const nextIdx = activeThumbnailIndex === thumbnails.length - 1 ? 0 : activeThumbnailIndex + 1;
                    setActiveProductImage(thumbnails[nextIdx]);
                    setActiveThumbnailIndex(nextIdx);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer border-none"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>

                {/* Image counter index */}
                <span className="absolute bottom-3.5 left-3.5 bg-black/60 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full select-none">
                  {activeThumbnailIndex + 1} / {thumbnails.length}
                </span>
                
                {/* Heart wishlist button */}
                <button 
                  onClick={() => toggleFavorite(selectedProduct.id)} 
                  className="absolute right-4 top-4 w-9.5 h-9.5 rounded-full bg-white/95 dark:bg-[#0b1329] text-slate-455 hover:text-red-500 flex items-center justify-center shadow-md cursor-pointer border border-slate-200/60 dark:border-slate-800/60 transition-transform hover:scale-105"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* About Operator Details Container */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 text-left">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-white text-white font-black text-sm tracking-wide">
                  {selectedProduct.name?.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block leading-none">About Operator</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-1.5">
                    {selectedProduct.name}
                    <CheckCircle2 className="w-4 h-4 text-white dark:text-white fill-blue-500 shrink-0" />
                  </h3>
                  <span className="text-[11px] text-slate-450 dark:text-slate-500 font-bold block mt-0.5">
                    Operated by {selectedProduct.name} Tours & Travels Pvt. Ltd.
                  </span>
                </div>
              </div>

              {/* Rating summary */}
              <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-850 py-3 mt-1.5">
                <div className="text-left">
                  <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-505" />
                    <span>{selectedProduct.rating || 4.5}</span>
                  </div>
                  <span className="text-[9.5px] text-slate-450 dark:text-slate-500 font-bold block mt-0.5">({selectedProduct.reviews || 12520} Ratings)</span>
                </div>
                <div className="text-left border-l border-slate-100 dark:border-slate-850 pl-4">
                  <span className="text-emerald-600 dark:text-emerald-450 font-black text-sm">98%</span>
                  <span className="text-[9.5px] text-slate-450 dark:text-slate-500 font-bold block mt-0.5">On-time Performance</span>
                </div>
              </div>

              {/* Service Metrics counter row */}
              <div className="grid grid-cols-3 gap-2 text-center mt-1">
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-white block">25+</span>
                  <span className="text-[8px] font-bold text-slate-450 dark:text-slate-500 uppercase block mt-0.5 leading-none">Years Service</span>
                </div>
                <div className="border-x border-slate-100 dark:border-slate-850">
                  <span className="text-xs font-black text-slate-800 dark:text-white block">850+</span>
                  <span className="text-[8px] font-bold text-slate-450 dark:text-slate-500 uppercase block mt-0.5 leading-none">Buses</span>
                </div>
                <div>
                  <span className="text-xs font-black text-slate-800 dark:text-white block">10M+</span>
                  <span className="text-[8px] font-bold text-slate-450 dark:text-slate-500 uppercase block mt-0.5 leading-none">Happy Customers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Route Details, Amenities, Seat Grid, and Tabs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            {/* Operator Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 text-[8px] sm:text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider leading-none">
                  VERIFIED OPERATOR
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[8px] sm:text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider leading-none">
                  Verified
                </span>
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {selectedProduct.name}
              </h2>
              <p className="text-xs text-slate-455 dark:text-slate-500 font-bold block mt-1.5">
                {selectedProduct.description || 'AC Sleeper (2+1)'} | ★ {selectedProduct.rating || 4.5} ({selectedProduct.reviews || 12520} Reviews)
              </p>
            </div>

            {/* Route Ticket Details Card */}
            <div className="bg-slate-50/50 dark:bg-slate-900/25 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Source */}
                <div className="flex-1 text-center md:text-left w-full">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">From</span>
                  <span className="text-sm font-black text-slate-850 dark:text-white block mt-1">{selectedProduct.fromCity || 'Bangalore'}</span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium block mt-0.5">Kempegowda Bus Stand</span>
                </div>

                {/* Duration & Bus separator graphic */}
                <div className="flex flex-col items-center justify-center shrink-0 select-none min-w-[120px]">
                  <span className="text-[10px] font-bold text-slate-455 mb-1 block">8h 30m</span>
                  <div className="relative w-28 flex items-center justify-center">
                    <span className="w-full h-0.5 bg-slate-200 dark:bg-slate-800 block" />
                    <span className="absolute w-2 h-2 rounded-full bg-slate-400 left-0" />
                    <span className="absolute w-2 h-2 rounded-full bg-slate-400 right-0" />
                  </div>
                </div>

                {/* Destination */}
                <div className="flex-1 text-center md:text-right w-full">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">To</span>
                  <span className="text-sm font-black text-slate-850 dark:text-white block mt-1">{selectedProduct.toCity || 'Chennai'}</span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium block mt-0.5">Koyambedu Bus Stand</span>
                </div>
              </div>

              {/* Sub Route Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 dark:border-slate-850/60 pt-4 mt-1">
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase font-bold block">Departure</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white block mt-0.5">09:00 PM</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase font-bold block">Arrival</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white block mt-0.5">05:30 AM</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase font-bold block">Date</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white block mt-0.5">21 May 2025, Wed</span>
                </div>
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase font-bold block">Distance</span>
                  <span className="text-xs font-black text-slate-800 dark:text-white block mt-0.5">350 km</span>
                </div>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-slate-50/20 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h4 className="text-[10.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-4 text-left">
                Amenities
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {(() => {
                  const defaultTravelAmenities = ['Wi-Fi', 'Sleeper Berth', 'Blanket & Pillow', 'Charging Point', 'Water Bottle', 'CCTV', 'GPS Tracking', 'AC', 'Gym', 'Spa', 'Laundry', '24/7 Security', 'Restaurant', 'Parking', 'Power Backup'];
                  const travelAmenities = selectedProduct.amenities && selectedProduct.amenities.length > 0
                    ? selectedProduct.amenities
                    : defaultTravelAmenities;

                  const getIcon = (amenity) => {
                    const normalized = (amenity || '').toLowerCase();
                    if (normalized.includes('wi-fi') || normalized.includes('wifi')) {
                      return (cn) => <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.9 9.9 0 0114.142 0M2.05 9.05a15.6 15.6 0 0122.25 0" /></svg>;
                    }
                    if (normalized.includes('sleeper')) {
                      return (cn) => <BedDouble className={cn} />;
                    }
                    if (normalized.includes('blanket') || normalized.includes('pillow')) {
                      return (cn) => <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" /></svg>;
                    }
                    if (normalized.includes('charge') || normalized.includes('charging')) {
                      return (cn) => <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
                    }
                    if (normalized.includes('water') || normalized.includes('bottle')) {
                      return (cn) => <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1H9L8 4z" /></svg>;
                    }
                    if (normalized.includes('cctv')) {
                      return (cn) => <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
                    }
                    if (normalized.includes('gps') || normalized.includes('track')) {
                      return (cn) => <MapPin className={cn} />;
                    }
                    if (normalized.includes('ac') || normalized.includes('air conditioning')) {
                      return (cn) => <Wind className={cn} />;
                    }
                    if (normalized.includes('gym')) {
                      return (cn) => <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.065M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                    }
                    if (normalized.includes('spa')) {
                      return (cn) => <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
                    }
                    if (normalized.includes('laundry')) {
                      return (cn) => <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h18a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
                    }
                    if (normalized.includes('security') || normalized.includes('24/7')) {
                      return (cn) => <ShieldCheck className={cn} />;
                    }
                    if (normalized.includes('restatarnt') || normalized.includes('restaurant') || normalized.includes('food') || normalized.includes('dining')) {
                      return (cn) => <Utensils className={cn} />;
                    }
                    if (normalized.includes('parking')) {
                      return (cn) => <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm0 0h6m-6 0a6 6 0 016-6H9m6 6a2 2 0 11-4 0 2 2 0 014 0zm0 0V9" /></svg>;
                    }
                    if (normalized.includes('power') || normalized.includes('backup')) {
                      return (cn) => <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
                    }
                    return (cn) => <CheckCircle2 className={cn} />;
                  };

                  return travelAmenities.map((amenity, idx) => {
                    const getIconComponent = getIcon(amenity);
                    return (
                      <div key={idx} className="flex flex-col items-center justify-center p-2.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl text-center shadow-3xs hover:border-slate-350 transition-colors">
                        {getIconComponent("w-4.5 h-4.5 text-slate-655 dark:text-slate-350 mb-1")}
                        <span className="text-[8.5px] font-black text-slate-700 dark:text-slate-400 leading-tight block mt-1">{amenity}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            {/* Seat Availability Section */}
            <div className="bg-slate-50/20 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <h4 className="text-[10.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-4 text-left">
                Seat Availability
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-center items-start shadow-3xs">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Seats Left</span>
                  <span className="text-[15px] font-black text-slate-850 dark:text-white mt-1 leading-none">12</span>
                  <span className="text-[8.5px] text-slate-450 font-bold block mt-1 leading-none">Total Seats: 36</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-center items-start shadow-3xs">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Window Seats</span>
                  <span className="text-[15px] font-black text-slate-850 dark:text-white mt-1 leading-none">5</span>
                  <span className="text-[8.5px] text-emerald-600 font-bold block mt-1 leading-none">Available</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-center items-start shadow-3xs">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Lower Berths</span>
                  <span className="text-[15px] font-black text-slate-850 dark:text-white mt-1 leading-none">3</span>
                  <span className="text-[8.5px] text-emerald-600 font-bold block mt-1 leading-none">Available</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-center items-start shadow-3xs">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Female Seats</span>
                  <span className="text-[15px] font-black text-slate-850 dark:text-white mt-1 leading-none">2</span>
                  <span className="text-[8.5px] text-emerald-650 font-bold block mt-1 leading-none">Available</span>
                </div>
              </div>
            </div>

            {/* Tabbed Info Panel */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/10 dark:bg-slate-900/5 overflow-hidden">
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-x-auto no-scrollbar">
                {['Overview', 'Boarding Points', 'Dropping Points', 'Stops', 'Ratings & Reviews', 'Policies'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTravelDetailsTab(tab)}
                    className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer bg-transparent border-none shrink-0 ${
                      travelDetailsTab === tab
                        ? 'border-blue-600 text-blue-600 font-black'
                        : 'border-transparent text-slate-450 hover:text-slate-705 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5 text-left text-xs sm:text-sm leading-relaxed font-medium">
                {travelDetailsTab === 'Overview' && (
                  <div className="space-y-4">
                    <p className="text-slate-605 dark:text-slate-355 font-medium leading-relaxed">
                      {selectedProduct.name} is one of the most trusted operators in the region. Enjoy a comfortable journey with premium service, clean layouts, and top class amenities.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {[
                        'Well maintained vehicles / buses',
                        'Clean & hygienic environment',
                        'Experienced & professional staff',
                        'Safe & reliable travel'
                      ].map((item, iIdx) => (
                        <div key={iIdx} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-355">
                          <CheckCircle2 className="w-4 h-4 text-emerald-555 fill-emerald-555/10 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {travelDetailsTab === 'Boarding Points' && (
                  <div className="space-y-3 font-semibold text-slate-700 dark:text-slate-355 text-xs">
                    <div>• Kempegowda Bus Stand (Majestic) - 09:00 PM</div>
                    <div>• Madiwala (Near police station) - 09:30 PM</div>
                    <div>• Electronic City (Toll Gate) - 09:50 PM</div>
                  </div>
                )}
                {travelDetailsTab === 'Dropping Points' && (
                  <div className="space-y-3 font-semibold text-slate-700 dark:text-slate-355 text-xs">
                    <div>• Koyambedu Bus Stand - 05:30 AM</div>
                    <div>• Poonamallee Bypass - 05:00 AM</div>
                    <div>• Guindy (Near metro) - 05:45 AM</div>
                  </div>
                )}
                {travelDetailsTab === 'Stops' && (
                  <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-355 text-left">
                    <div className="relative pl-6 border-l-2 border-blue-500 dark:border-blue-700 space-y-5">
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-blue-500 border-4 border-white dark:border-[#030712] flex items-center justify-center shrink-0" />
                        <div>
                          <div className="font-extrabold text-slate-850 dark:text-white text-xs">Bengaluru Majestic (Source)</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Departure at 09:00 PM</div>
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-slate-350 dark:bg-slate-700 border-4 border-white dark:border-[#030712] flex items-center justify-center shrink-0" />
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-300 text-xs">Hosur Stop</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Arrival 10:00 PM | 5 mins stop</div>
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-slate-355 dark:bg-slate-700 border-4 border-white dark:border-[#030712] flex items-center justify-center shrink-0" />
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-300 text-xs">Krishnagiri Toll Plaza</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Arrival 11:15 PM | 10 mins dinner break</div>
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-slate-355 dark:bg-slate-700 border-4 border-white dark:border-[#030712] flex items-center justify-center shrink-0" />
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-slate-300 text-xs">Vellore Bypass</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Arrival 02:00 AM | 5 mins stop</div>
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-blue-500 border-4 border-white dark:border-[#030712] flex items-center justify-center shrink-0" />
                        <div>
                          <div className="font-extrabold text-slate-850 dark:text-white text-xs">{selectedProduct.toCity || 'Chennai'} Koyambedu (Destination)</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Arrival at 05:30 AM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {travelDetailsTab === 'Ratings & Reviews' && (
                  <div className="space-y-3 text-xs">
                    <div className="font-black text-slate-850 dark:text-white">Customer Feedback (★ 4.5/5 based on 12,520 reviews)</div>
                    <div className="border-t border-slate-105 dark:border-slate-850/60 pt-3 mt-2">
                      <div className="flex justify-between font-extrabold text-[11px]">
                        <span className="text-slate-850 dark:text-white">Suresh K.</span>
                        <span className="text-amber-500">★ 5.0</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">Excellent travel experience. On time departure and very comfortable sleeper berth. Clean blankets were provided.</p>
                    </div>
                  </div>
                )}
                {travelDetailsTab === 'Policies' && (
                  <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-355">
                    <div>• Cancellation Policy: Free cancellation up to 24 hours before departure.</div>
                    <div>• Baggage Policy: 15kg checked luggage and 5kg hand baggage allowed.</div>
                    <div>• Child Policy: Children above 3 years require a separate ticket.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Price and Book Ticket actions panel */}
            <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-row items-center justify-between gap-4 mt-2">
              <div className="text-left w-full md:w-auto">
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block leading-none">Ticket Price</span>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">₹{(selectedProduct.price || 1200).toLocaleString()}</span>
                  <span className="text-xs text-slate-400 line-through">₹{(selectedProduct.originalPrice || Math.round((selectedProduct.price || 1200) * 1.25)).toLocaleString()}</span>
                </div>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-450 mt-1 block leading-none">
                  {selectedProduct.discount || '20% OFF Member Special'}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => triggerNotification("Initiating chat with travel desk agent...")}
                  className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-black uppercase transition-all bg-transparent h-12 cursor-pointer"
                >
                  Chat Agent
                </button>
                <button
                  onClick={() => {
                    setActiveBookNowModalItem(selectedProduct);
                    setSelectedModalDate('Wednesday, 21 May 2025');
                    setSelectedModalTime('09:00 PM');
                    setSelectedModalType('AC Sleeper (2+1)');
                    setSelectedTimeOfDayTab('Evening');
                  }}
                  className="flex-1 md:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-98 border-none h-12 cursor-pointer"
                >
                  Book Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getProductOptions = (product) => {
    if (!product) return null;
    const cat = (product.category || '').toLowerCase();
    const subCat = (product.subNavbarCategory || '').toLowerCase();
    const name = (product.name || '').toLowerCase();

    const isFootwear = cat.includes('footwear') || cat.includes('shoes') || name.includes('shoes') || name.includes('nike');
    const isApparel = cat.includes('shirts') || cat.includes('kurtis') || cat.includes('sarees') || cat.includes('apparel') || cat.includes('clothing') || cat.includes('t-shirts') || cat.includes('ethnic');
    const isElectronics = cat.includes('smartphones') || cat.includes('laptops') || cat.includes('television') || cat.includes('headphones');

    if (isFootwear) {
      return {
        type: 'footwear',
        colors: [
          { name: 'Red', class: 'bg-red-600 border-red-500' },
          { name: 'Black', class: 'bg-slate-950 border-slate-900' },
          { name: 'Blue', class: 'bg-blue-600 border-blue-500' },
          { name: 'White', class: 'bg-white border-slate-350' }
        ],
        sizes: ['6', '7', '8', '9', '10', '11'],
        sizeLabel: 'Size (UK/India)',
        showSizeGuide: true
      };
    } else if (isApparel) {
      return {
        type: 'apparel',
        colors: [
          { name: 'Red', class: 'bg-red-500 border-red-400' },
          { name: 'Blue', class: 'bg-blue-500 border-blue-400' },
          { name: 'Green', class: 'bg-emerald-500 border-emerald-400' },
          { name: 'Yellow', class: 'bg-yellow-500 border-yellow-400' },
          { name: 'Black', class: 'bg-slate-900 border-slate-950' }
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        sizeLabel: 'Size',
        showSizeGuide: true
      };
    } else if (isElectronics) {
      return {
        type: 'electronics',
        colors: [
          { name: 'Space Grey', class: 'bg-slate-650 border-slate-600' },
          { name: 'Silver', class: 'bg-slate-200 border-slate-300' },
          { name: 'Midnight', class: 'bg-slate-900 border-slate-950' }
        ],
        sizes: cat.includes('laptop') || cat.includes('smartphone') ? ['128GB', '256GB', '512GB'] : ['Standard'],
        sizeLabel: 'Storage / Capacity',
        showSizeGuide: false
      };
    }
    return null;
  };

  // 12. DETAILED PRODUCT DESCRIPTION PAGE VIEW
  const renderProductDetailsPage = () => {
    if (!selectedProduct) return null;

    if (selectedProduct.subNavbarCategory === 'Stay' || selectedProduct.tag === 'Stay') {
      return renderStayDetailsPage();
    }
    if (selectedProduct.subNavbarCategory === 'Travel' || selectedProduct.tag === 'Travel') {
      return renderTravelDetailsPage();
    }
    if (
      selectedProduct.category === 'Gym Membership' ||
      selectedProduct.category === 'Gyms' ||
      selectedProduct.category === 'Gym' ||
      selectedProduct.tag === 'Gym' ||
      (selectedProduct.name && selectedProduct.name.toLowerCase().includes('gym')) ||
      (selectedProduct.name && selectedProduct.name.toLowerCase().includes('cult fitness'))
    ) {
      return renderServiceDetailsPage();
    }

    // Price tier calculations
    const pGold = selectedProduct.price;
    const pRegular = selectedProduct.originalPrice || Math.round(selectedProduct.price * 1.25);
    const pDiamond = Math.round(selectedProduct.price * 0.92);
    const saveGold = pRegular - pGold;
    const saveDiamond = pRegular - pDiamond;

    // Gallery images
    const thumbnails = selectedProduct.images && selectedProduct.images.length > 0
      ? selectedProduct.images
      : [selectedProduct.image];

    // Helper to get stats badges dynamically
    const getStatsBadges = (product) => {
      const subCat = product.subNavbarCategory;
      const cat = product.category;
      
      if (subCat === 'Services' || cat === 'Hospitals' || cat === 'Hospital') {
        return [
          { value: "12+", label: "Years Exp.", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>, color: "text-blue-500" },
          { value: "2500+", label: "Patients", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, color: "text-indigo-500" },
          { value: "98%", label: "Positive Rate", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>, color: "text-emerald-500" },
          { value: String(product.rating || '4.5'), label: "Rating", isStar: true, color: "text-amber-500" }
        ];
      } else if (subCat === 'Stay' || subCat === 'Travel') {
        return [
          { value: "Elite", label: "Tier Verified", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>, color: "text-blue-500" },
          { value: "5K+", label: "Bookings", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, color: "text-indigo-500" },
          { value: "Free", label: "Cancellation", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, color: "text-emerald-500" },
          { value: String(product.rating || '4.5'), label: "Rating", isStar: true, color: "text-amber-500" }
        ];
      } else if (subCat === 'Jobs') {
        return [
          { value: "Verified", label: "Employer", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, color: "text-blue-500" },
          { value: "Immediate", label: "Joiners Only", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, color: "text-indigo-500" },
          { value: "10+", label: "Openings", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, color: "text-emerald-500" },
          { value: "Full-Time", label: "Job Type", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, color: "text-amber-500" }
        ];
      } else {
        // Products / Daily Needs / Food
        const isFoodOrNeeds = subCat === 'Daily Needs' || subCat === 'Food';
        return [
          { value: "100%", label: "Genuine", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>, color: "text-blue-500" },
          { value: "Brand", label: "Certified", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, color: "text-indigo-500" },
          { value: isFoodOrNeeds ? "Same Day" : "2-3 Days", label: "Delivery", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, color: "text-emerald-500" },
          { value: String(product.rating || '4.5'), label: "Rating", isStar: true, color: "text-amber-500" }
        ];
      }
    };

    // Helper to get key details dynamically
    const getKeyDetails = (product) => {
      const subCat = product.subNavbarCategory;
      const cat = product.category;
      
      if (subCat === 'Services' || cat === 'Hospitals' || cat === 'Hospital') {
        return [
          { title: 'Video Consultation', val: "Available", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>, bg: "bg-blue-50 dark:bg-blue-950/35", color: "text-blue-500" },
          { title: 'In-clinic Visit', val: "Available", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, bg: "bg-indigo-50 dark:bg-indigo-950/35", color: "text-indigo-500" },
          { title: 'Response Time', val: "30 mins", icon: (className) => <Clock className={className} />, bg: "bg-emerald-50 dark:bg-emerald-950/35", color: "text-emerald-500" },
          { title: 'Languages', val: "English, Hindi", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5c-.313 1.565-.953 3.051-1.894 4.387" /></svg>, bg: "bg-teal-50 dark:bg-teal-950/35", color: "text-teal-500" }
        ];
      } else if (subCat === 'Stay') {
        return [
          { title: 'Wi-Fi Access', val: "High Speed", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.9 9.9 0 0114.142 0M2.05 9.05a15.6 15.6 0 0122.25 0" /></svg>, bg: "bg-blue-50 dark:bg-blue-950/35", color: "text-blue-500" },
          { title: 'Free Breakfast', val: "Included", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, bg: "bg-indigo-50 dark:bg-indigo-950/35", color: "text-indigo-500" },
          { title: 'Check-in Time', val: "12:00 PM", icon: (className) => <Clock className={className} />, bg: "bg-emerald-50 dark:bg-emerald-950/35", color: "text-emerald-500" },
          { title: 'Room Service', val: "24/7 Available", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>, bg: "bg-teal-50 dark:bg-teal-950/35", color: "text-teal-500" }
        ];
      } else if (subCat === 'Travel') {
        return [
          { title: 'Luggage Limit', val: "15kg Included", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>, bg: "bg-blue-50 dark:bg-blue-950/35", color: "text-blue-500" },
          { title: 'Meal Options', val: "Veg & Non-Veg", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14 12a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, bg: "bg-indigo-50 dark:bg-indigo-950/35", color: "text-indigo-500" },
          { title: 'Departure', val: "Guaranteed On-time", icon: (className) => <Clock className={className} />, bg: "bg-emerald-50 dark:bg-emerald-950/35", color: "text-emerald-500" },
          { title: 'Support', val: "24/7 Helpline", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>, bg: "bg-teal-50 dark:bg-teal-950/35", color: "text-teal-500" }
        ];
      } else if (subCat === 'Jobs') {
        return [
          { title: 'Work Model', val: "In-office / Remote", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, bg: "bg-blue-50 dark:bg-blue-950/35", color: "text-blue-500" },
          { title: 'Experience Req.', val: "1-3 Years", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, bg: "bg-indigo-50 dark:bg-indigo-950/35", color: "text-indigo-500" },
          { title: 'Min. Qualification', val: "Graduate / Equivalent", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>, bg: "bg-emerald-50 dark:bg-emerald-950/35", color: "text-emerald-500" },
          { title: 'Job Location', val: "Bengaluru, IN", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, bg: "bg-teal-50 dark:bg-teal-950/35", color: "text-teal-500" }
        ];
      } else {
        // Products / Daily Needs / Food
        return [
          { title: 'Brand Warranty', val: "1 Year Covered", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, bg: "bg-blue-50 dark:bg-blue-950/35", color: "text-blue-500" },
          { title: 'Return Policy', val: "7 Days Replacement", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" /></svg>, bg: "bg-indigo-50 dark:bg-indigo-950/35", color: "text-indigo-500" },
          { title: 'Delivery Speed', val: "Express Shipping", icon: (className) => <Clock className={className} />, bg: "bg-emerald-50 dark:bg-emerald-950/35", color: "text-emerald-500" },
          { title: 'Package Security', val: "Secure Transit", icon: (className) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>, bg: "bg-teal-50 dark:bg-teal-950/35", color: "text-teal-500" }
        ];
      }
    };

    // Helper to get partner badge text dynamically
    const getPartnerBadgeText = (product) => {
      const subCat = product.subNavbarCategory;
      if (subCat === 'Services' || product.category === 'Hospitals') return 'VERIFIED PARTNER';
      if (subCat === 'Stay' || subCat === 'Travel') return 'VERIFIED HOST';
      if (subCat === 'Jobs') return 'VERIFIED EMPLOYER';
      return 'VERIFIED SELLER';
    };

    // Helper to get action buttons dynamically
    const getActionButtons = (product) => {
      const subCat = product.subNavbarCategory;
      const cat = product.category;
      
      if (subCat === 'Services' || cat === 'Hospitals' || cat === 'Hospital') {
        return {
          chatText: "Chat with Doctor",
          actionText: "ADD TO CART",
          bookingText: "BOOK APPOINTMENT",
          showBooking: true
        };
      } else if (subCat === 'Stay') {
        return {
          chatText: "Chat with Host",
          actionText: "ADD TO CART",
          bookingText: "BOOK STAY",
          showBooking: true
        };
      } else if (subCat === 'Travel') {
        return {
          chatText: "Chat with Agent",
          actionText: "ADD TO CART",
          bookingText: "BOOK TICKET",
          showBooking: true
        };
      } else if (subCat === 'Jobs') {
        return {
          chatText: "Chat with HR",
          actionText: "APPLY NOW",
          bookingText: "",
          showBooking: false
        };
      } else {
        // Products / Daily Needs / Food
        return {
          chatText: "Chat with Seller",
          actionText: "ADD TO CART",
          bookingText: "ORDER NOW",
          showBooking: true
        };
      }
    };

    // Dynamic highlights based on category
    const getProductHighlights = (product) => {
      if (product.description) {
        const lines = product.description
          .split('\n')
          .map(line => line.trim().replace(/^[\s\-\*\u2022\u25E6\u2023\u2043\u25CB\u25C9\u25A0\u25A1\u2714\u2713]+/g, '').trim())
          .filter(Boolean);
        if (lines.length > 0) {
          return lines;
        }
      }
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

    // Recommended products list: same category or fallback to other subNavbarCategory/products
    let related = products
      .filter(p => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.category === 'Smartphones'))
      .slice(0, 5);

    if (related.length === 0) {
      related = products
        .filter(p => p.id !== selectedProduct.id && (p.subNavbarCategory === selectedProduct.subNavbarCategory || p.subNavbarCategory === 'Products'))
        .slice(0, 4);
    }

    if (related.length === 0) {
      related = products
        .filter(p => p.id !== selectedProduct.id)
        .slice(0, 4);
    }

    return (
      <div className="space-y-8 pb-16 text-slate-800 dark:text-slate-200">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl px-5 py-3 shadow-xs">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-xs">
          
          {/* Left Column: Gallery */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="flex gap-4">
              {/* Thumbnails list */}
              <div className="flex flex-col gap-2.5 shrink-0 select-none">
                {thumbnails.slice(0, 5).map((thumb, idx) => (
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
                {thumbnails.length > 5 && (
                  <div onClick={() => setIsGalleryModalOpen(true)} className="w-14 h-14 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <span>+{thumbnails.length - 5}</span>
                    <span>More</span>
                  </div>
                )}
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
                  className="absolute right-4 top-4 w-9.5 h-9.5 rounded-full bg-white/95 dark:bg-[#0b1329] text-slate-455 hover:text-red-500 flex items-center justify-center shadow-md cursor-pointer border border-slate-200/60 dark:border-slate-800/60 transition-transform hover:scale-105"
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Media helpers underneath */}
            <div className="flex justify-center gap-4 mt-6">
              <button onClick={() => setIs360ModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all shadow-3xs border border-slate-200/50 dark:border-slate-800/50 cursor-pointer">
                <svg className="w-4.5 h-4.5 text-slate-455" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" /></svg>
                <span>View in 360°</span>
              </button>
              <button onClick={() => setIsArModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black transition-all shadow-3xs border border-slate-200/50 dark:border-slate-800/50 cursor-pointer">
                <svg className="w-4.5 h-4.5 text-slate-455" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>AR View</span>
              </button>
            </div>

            {/* Stats Row underneath */}
            <div className="grid grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              {getStatsBadges(selectedProduct).map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="bg-slate-50/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center shadow-3xs">
                    {badge.isStar ? (
                      <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-500 mb-1" />
                    ) : (
                      Icon("w-4.5 h-4.5 mb-1 " + badge.color)
                    )}
                    <span className="text-[12.5px] font-black text-slate-800 dark:text-white block leading-none">{badge.value}</span>
                    <span className="text-[8.5px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5 leading-none">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Specifications, Price Card & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center mb-3">
                <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 text-[8px] sm:text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider leading-none">
                  <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  {getPartnerBadgeText(selectedProduct)}
                </span>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2 flex items-center gap-1.5">
                {selectedProduct.name}
                <CheckCircle2 className="w-5 h-5 text-white dark:text-white fill-blue-500 shrink-0" />
              </h1>

              <div className="text-left space-y-0.5 mb-3.5">
                <div className="text-[14px] font-extrabold text-slate-800 dark:text-slate-200">
                  {selectedProduct.category === 'Smartphones' ? 'Smartphone & Mobiles' : 
                   selectedProduct.category === 'Hospital' || selectedProduct.category === 'Services' ? 'Cardiologist' :
                   selectedProduct.category}
                </div>
                <div className="text-[11.5px] text-slate-500 dark:text-slate-400 font-semibold">
                  {selectedProduct.category === 'Smartphones' ? '128GB ROM, 8GB RAM' : 
                   selectedProduct.category === 'Hospital' || selectedProduct.category === 'Services' ? 'MBBS, MD - Cardiology' :
                   'Verified Premium Tier'}
                </div>
              </div>
              
              {/* Ratings and Verification Block */}
              <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                    <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                    <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                    <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                    <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-extrabold">
                    {selectedProduct.rating || '4.5'} ({selectedProduct.reviews || 120} Reviews)
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 px-2.5 py-0.5 rounded-full">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Verified Purchase
                  </span>
                </div>
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

              {/* Product Options: Colors & Sizes */}
              {getProductOptions(selectedProduct) && (() => {
                const opts = getProductOptions(selectedProduct);
                return (
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4.5 mb-5 text-left space-y-4 shadow-3xs">
                    {/* Color Selector */}
                    <div>
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                        Select Color: <span className="text-slate-800 dark:text-white font-extrabold">{selectedColor}</span>
                      </span>
                      <div className="flex gap-2.5">
                        {opts.colors.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => setSelectedColor(c.name)}
                            className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all hover:scale-105 ${c.class} ${
                              selectedColor === c.name 
                                ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 border-transparent shadow-md' 
                                : 'border-slate-200/50 dark:border-slate-700'
                            }`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Size Selector & Size Guide */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          {opts.sizeLabel}: <span className="text-slate-800 dark:text-white font-extrabold">{selectedSize}</span>
                        </span>
                        {opts.showSizeGuide && (
                          <button
                            onClick={() => setIsSizeGuideOpen(true)}
                            className="text-[9.5px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none"
                          >
                            Size Guide
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {opts.sizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(s)}
                            className={`px-3 py-1.5 rounded-lg border-2 text-[10.5px] font-black uppercase cursor-pointer transition-all hover:border-slate-400 ${
                              selectedSize === s
                                ? 'bg-amber-400 border-amber-400 text-slate-950 font-black shadow-xs'
                                : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Return Policy Quick Info */}
                    <div className="border-t border-slate-150 dark:border-slate-800/80 pt-3 mt-1 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-normal font-medium">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3" />
                      </svg>
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-white block text-[11px] leading-tight">Return Policy</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-normal">
                          7-Day Hassle-Free Replacement / Refund. Product must be in its original, unworn condition with tags intact.
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* About Box */}
              <div className="bg-blue-50/20 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4.5 mb-5 text-left">
                <div className="flex items-center gap-2 mb-2.5 text-blue-600 dark:text-blue-400">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-[12px] font-black uppercase tracking-wider leading-none">
                    {selectedProduct.subNavbarCategory === 'Services' ? 'About Doctor' : 
                     selectedProduct.subNavbarCategory === 'Stay' ? 'About Stay' :
                     selectedProduct.subNavbarCategory === 'Travel' ? 'About Travel' :
                     selectedProduct.subNavbarCategory === 'Jobs' ? 'About Job' : 'About Product'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedProduct.description || `Experienced specialist offering comprehensive premium ${(selectedProduct.category || '').toLowerCase()} consultations and personalized diagnostic treatment plans.`}
                </p>
              </div>

              {/* Key Details Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 w-full">
                {getKeyDetails(selectedProduct).map((detail, idx) => {
                  const Icon = detail.icon;
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-3 flex items-center gap-2.5 shadow-3xs">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${detail.bg}`}>
                        {Icon("w-4.5 h-4.5 " + detail.color)}
                      </div>
                      <div className="text-left">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold block leading-none">{detail.title}</span>
                        <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 mt-1 block">{detail.val}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Highlights Section */}
              <div className="bg-slate-50 dark:bg-slate-950/35 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-5 mb-6">
                <h4 className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-3.5">
                  Highlights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {getProductHighlights(selectedProduct).map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-505" />
                      </div>
                      <span className="font-medium text-left">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description & Action buttons */}
            <div className="space-y-4 mt-6">
              {/* Action Buttons Row */}
              <div className="flex items-center gap-4 pt-2 w-full">
                <button
                  onClick={() => triggerNotification("Initiating chat session...")}
                  className="px-5 py-3.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 bg-transparent h-12"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <span>{getActionButtons(selectedProduct).chatText}</span>
                </button>
                
                {getActionButtons(selectedProduct).showBooking ? (
                  <>
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        triggerNotification(`${selectedProduct.name} added to cart!`);
                      }}
                      className="flex-1 py-3.5 bg-[#0b1e36] dark:bg-slate-800 hover:bg-[#13325a] dark:hover:bg-slate-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-750/30 h-12"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{getActionButtons(selectedProduct).actionText}</span>
                    </button>
                    <button
                      onClick={() => {
                        const isBooking = ['Services', 'Stay', 'Travel'].includes(selectedProduct.subNavbarCategory) || ['Services', 'Stay', 'Travel'].includes(selectedProduct.tag);
                        if (isBooking) {
                          setActiveBookNowModalItem(selectedProduct);
                          setSelectedModalDate('Wednesday, 21 May 2025');
                          setSelectedModalTime('11:00 AM');
                          setSelectedModalType(selectedProduct.subNavbarCategory === 'Stay' ? 'Standard Room' : (selectedProduct.subNavbarCategory === 'Travel' ? 'Private Tour' : 'Video Consultation'));
                          setSelectedTimeOfDayTab('Morning');
                        } else {
                          addToCart(selectedProduct);
                          setIsCartOpen(true);
                          triggerNotification(`Proceeding to checkout...`);
                        }
                      }}
                      className="flex-1 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-98 border-none h-12"
                    >
                      {selectedProduct.subNavbarCategory === 'Services' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      ) : (
                        <Zap className="w-4 h-4 text-white" />
                      )}
                      <span>{getActionButtons(selectedProduct).bookingText}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      triggerNotification(`Applying for ${selectedProduct.name}...`);
                    }}
                    className="flex-1 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-98 border-none h-12"
                  >
                    <span>{getActionButtons(selectedProduct).actionText}</span>
                  </button>
                )}
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
              { title: '500', sub: "Reward Points", detail: "On This Purchase", icon: Award, bg: "bg-amber-50/50 dark:bg-amber-450/5", iconCol: "text-amber-500" },
              { title: '2,000', sub: "Travel Voucher", detail: "On Next Booking", icon: Plane, bg: "bg-blue-50/50 dark:bg-blue-450/5", iconCol: "text-blue-500" },
              { title: '500', sub: "Food Coupon", detail: "Instant Discount", icon: Utensils, bg: "bg-red-50/50 dark:bg-red-450/5", iconCol: "text-red-500" },
              { title: '1 Year', sub: "Extended Warranty", detail: "By Connect", icon: ShieldCheck, bg: "bg-emerald-50/50 dark:bg-emerald-450/5", iconCol: "text-emerald-500" },
              { title: 'Priority', sub: "Customer Support", detail: "24/7 VIP Support", icon: LifeBuoy, bg: "bg-cyan-50/50 dark:bg-cyan-450/5", iconCol: "text-cyan-500" },
              { title: 'Free', sub: "Express Delivery", detail: "2-3 Days Delivery", icon: Truck, bg: "bg-indigo-50/50 dark:bg-indigo-450/5", iconCol: "text-indigo-500" },
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
              <div key={idx} className={`bg-white dark:bg-[#0b1329] border ${p.border} rounded-2xl p-4 text-center flex flex-col justify-between transition-all hover:-translate-y-0.5 shadow-2xs`}>
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
              { name: "Products", desc: "Save More on 3200+ Products", icon: ShoppingBag, bg: "from-rose-400/10 to-pink-500/10 hover:border-rose-400", activeTab: "Products" },
              { name: "Services", desc: "Save More on 100+ Services", icon: Sparkles, bg: "from-purple-400/10 to-pink-500/10 hover:border-purple-400", activeTab: "Services" },
              { name: "Food", desc: "Save More on 1000+ Restaurants", icon: Utensils, bg: "from-amber-400/10 to-orange-500/10 hover:border-amber-400", activeTab: "Food" },
              { name: "Stay", desc: "Save More on 5000+ Hotels", icon: BedDouble, bg: "from-blue-400/10 to-indigo-500/10 hover:border-blue-400", activeTab: "Stay" },
              { name: "Travel", desc: "Save More on Flights, Buses & Cabs", icon: Plane, bg: "from-cyan-400/10 to-teal-500/10 hover:border-cyan-400", activeTab: "Travel" },
              { name: "Daily Needs", desc: "Save More on Groceries & Essentials", icon: ShoppingBag, bg: "from-emerald-400/10 to-teal-500/10 hover:border-emerald-400", activeTab: "Daily Needs" }
            ].filter(item => item.activeTab !== activeTab).slice(0, 5).map((e, idx) => {
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
        <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row justify-between items-center gap-6">
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
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-5 shadow-3xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: '100% Original', detail: "Genuine Products direct from certified brands", icon: ShieldCheck, color: "text-emerald-500" },
              { title: 'Secure Payment', detail: "100% Safe, encrypted gateway transaction", icon: "Lock", color: "text-blue-500" },
              { title: '7 Days Return', detail: "Easy, hassle-free reverse pick-up policy", icon: RefreshCw, color: "text-amber-500" },
              { title: 'Best Price', detail: "Guaranteed price match to major retailers", icon: Award, color: "text-rose-500" },
              { title: 'Priority Support', detail: "24/7 dedicated member helpline access", icon: LifeBuoy, color: "text-cyan-500" }
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {related.map((prod) => {
                const isFavorited = favorites.includes(prod.id);
                return (
                  <div 
                    key={prod.id} 
                    onClick={() => {
                      setSelectedProduct(prod);
                    }} 
                    className="group bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-3xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[0.95/1] bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800/60 select-none">
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300" />
                      {prod.tag && <span className="absolute left-2.5 top-2.5 bg-slate-900/80 text-white text-[7px] font-black px-2 py-0.5 rounded uppercase">{prod.tag}</span>}
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(prod.id); }} 
                        className="absolute right-2.5 top-2.5 w-7.5 h-7.5 rounded-full bg-white/95 dark:bg-[#0b1329] text-slate-450 hover:text-red-500 flex items-center justify-center shadow-3xs cursor-pointer border border-slate-200/60"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>
                    <div className="p-3.5 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="text-[12px] md:text-[13px] font-black text-slate-800 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-amber-500 transition-colors">{prod.name}</h4>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-[12.5px] font-black text-slate-800 dark:text-white">₹{(prod.price || 0).toLocaleString()}</span>
                          <span className="text-[10.5px] text-slate-400 dark:text-slate-500 line-through">₹{(prod.originalPrice || prod.price || 0).toLocaleString()}</span>
                          <span className="text-[9.5px] text-[#f43397] font-black">{prod.discount}</span>
                        </div>
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800/60 mt-3 pt-2.5 flex items-center justify-between gap-1 w-full">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600 animate-pulse" />
                          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-355">{prod.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              addToCart(prod); 
                            }} 
                            className="bg-amber-400 hover:bg-amber-500 text-slate-955 text-[9.5px] font-black px-3 py-1.5 rounded-lg transition-colors uppercase cursor-pointer shadow-sm border border-amber-500/20 shrink-0"
                          >
                            + Add
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              addToCart(prod);
                              setIsCartOpen(true);
                            }} 
                            className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer uppercase shadow-sm border border-emerald-750/30 shrink-0"
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

        {/* Size Guide Modal */}
        {isSizeGuideOpen && (() => {
          const opts = getProductOptions(selectedProduct);
          const isApparel = opts?.type === 'apparel';
          
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-fade-in text-left">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Size Guide Chart</h3>
                  <button onClick={() => setIsSizeGuideOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-semibold leading-normal">
                  {isApparel 
                    ? "Measure your chest and waist sizes to find the perfect fit. Standard sizes are listed below."
                    : "Measure your feet length from heel to toe to find your perfect fit. Standard UK / India conversions are listed below."
                  }
                </p>

                {/* Dynamic Table based on product category */}
                <div className="overflow-hidden border border-slate-150 dark:border-slate-800 rounded-xl">
                  {isApparel ? (
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-black border-b border-slate-150 dark:border-slate-800">
                          <th className="p-2.5">Size</th>
                          <th className="p-2.5 font-bold">Chest (inches)</th>
                          <th className="p-2.5 font-bold">Waist (inches)</th>
                          <th className="p-2.5 font-bold">Length (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-705 dark:text-slate-300 font-semibold divide-y divide-slate-100 dark:divide-slate-800/50">
                        <tr>
                          <td className="p-2.5 font-bold">S</td>
                          <td className="p-2.5">36 - 38</td>
                          <td className="p-2.5">30 - 32</td>
                          <td className="p-2.5">68</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">M</td>
                          <td className="p-2.5">38 - 40</td>
                          <td className="p-2.5">32 - 34</td>
                          <td className="p-2.5">70</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">L</td>
                          <td className="p-2.5">40 - 42</td>
                          <td className="p-2.5">34 - 36</td>
                          <td className="p-2.5">72</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">XL</td>
                          <td className="p-2.5">42 - 44</td>
                          <td className="p-2.5">36 - 38</td>
                          <td className="p-2.5">74</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">XXL</td>
                          <td className="p-2.5">44 - 46</td>
                          <td className="p-2.5">38 - 40</td>
                          <td className="p-2.5">76</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-black border-b border-slate-150 dark:border-slate-800">
                          <th className="p-2.5 font-bold">UK/India</th>
                          <th className="p-2.5 font-bold">US Size</th>
                          <th className="p-2.5 font-bold">EU Size</th>
                          <th className="p-2.5 font-bold">Foot Length</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-705 dark:text-slate-300 font-semibold divide-y divide-slate-100 dark:divide-slate-800/50">
                        <tr>
                          <td className="p-2.5 font-bold">6</td>
                          <td className="p-2.5">7</td>
                          <td className="p-2.5">40</td>
                          <td className="p-2.5">25.0 cm</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">7</td>
                          <td className="p-2.5">8</td>
                          <td className="p-2.5">41</td>
                          <td className="p-2.5">25.4 cm</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">8</td>
                          <td className="p-2.5">9</td>
                          <td className="p-2.5">42</td>
                          <td className="p-2.5">26.3 cm</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">9</td>
                          <td className="p-2.5">10</td>
                          <td className="p-2.5">43</td>
                          <td className="p-2.5">27.2 cm</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">10</td>
                          <td className="p-2.5">11</td>
                          <td className="p-2.5">44.5</td>
                          <td className="p-2.5">28.0 cm</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold">11</td>
                          <td className="p-2.5">12</td>
                          <td className="p-2.5">46</td>
                          <td className="p-2.5">28.9 cm</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>

                <button 
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="mt-5 w-full py-3 bg-[#0b1e36] dark:bg-slate-850 hover:bg-[#13325a] dark:hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer border-none shadow-xs active:scale-98 transition-all"
                >
                  Close Chart
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // CHECK SEARCH STATES
  const isMarketplaceView = activeTab !== 'Home' || searchQuery !== '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-800 dark:text-slate-200 font-sans antialiased flex flex-col transition-colors duration-300">
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
      <main ref={mainScrollRef} className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto no-scrollbar w-full">
        {selectedProduct ? (
          renderProductDetailsPage()
        ) : activeTab === 'Offers' ? (
          <Offers />
        ) : isMarketplaceView ? (
          /* SEARCH / CATEGORY DIRECT CATALOG VIEW */
          renderCatalogSection()
        ) : (
          /* MOCKUP MATCHING HOMEPAGE ADAPTIVE DASHBOARD VIEW */
          <div className="space-y-8 w-full text-slate-800 dark:text-slate-200 animate-fade-in">
            {/* 1. Combined Hero Banner */}
            {renderHeroBanner()}

            {/* 2. Top Categories Grid */}
            {renderTopCategoriesGrid()}

            {/* 3. Exclusive Offers for You */}
            {renderExclusiveOffers()}

            {/* 4. Recommended for You */}
            {renderRecommendedForYou()}

            {/* 5. All Products & Services */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800/60">
              <div className="mb-6 text-left">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Connect Catalog</span>
                <h3 className="text-lg font-black text-slate-850 dark:text-white tracking-tight uppercase mt-1">
                  Explore All Products & Services
                </h3>
              </div>
              {renderCatalogSection()}
            </div>

            {/* 6. Trust Badges */}
            {renderTrustBadges()}
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
          className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[#0b1329] border-l border-slate-200 dark:border-slate-800/60 shadow-2xl p-6 md:p-8 flex flex-col justify-between transition-transform duration-500 ease-out z-10 text-slate-800 dark:text-slate-200`}
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
                <h4 className="text-lg font-bold text-slate-800 dark:text-white">Order Placed Successfully!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Your payment has been authorized, and items are now routing to shipping.
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Your Cart is Empty</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">Add stylish clothing or luxury goods from the marketplace to check out.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-850 relative animate-fade-in text-slate-800 dark:text-slate-200 gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0" />
                    <div className="text-left overflow-hidden">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-extrabold text-[#f43397]">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 line-through">₹{((item.originalPrice || item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Add / Decrease Item Quantity Buttons */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-3xs">
                      <button 
                        type="button"
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-black text-xs cursor-pointer border-none transition-all"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-5 text-center text-xs font-black text-slate-900 dark:text-white">
                        {item.quantity || 1}
                      </span>

                      <button 
                        type="button"
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#FFC107] hover:bg-amber-500 text-slate-950 font-black text-xs cursor-pointer border-none transition-all shadow-3xs"
                        title="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-slate-400 cursor-pointer transition-colors"
                      title="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && !orderSuccess && (
            <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6">
              <div className="space-y-2.5 mb-4 text-xs font-semibold">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">₹{cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Shipping Fee:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">FREE</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-900 dark:text-white">Estimated Total:</span>
                  <span className="text-xl font-extrabold text-[#f43397]">
                    ₹{cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full py-3 bg-[#0b1e36] hover:bg-[#13325a] dark:bg-amber-400 dark:hover:bg-amber-500 text-white dark:text-[#0b1e36] font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 animate-pulse"
              >
                <span>{getCartCheckoutButtonText()}</span>
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
          className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-[#0b1329] border-l border-slate-200 dark:border-slate-800/60 shadow-2xl p-6 md:p-8 flex flex-col justify-between transition-transform duration-500 ease-out z-10 text-slate-800 dark:text-slate-200`}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-pink-50 dark:bg-pink-950/40 flex items-center justify-center border border-pink-100 dark:border-pink-900/30">
                <Heart className="w-4 h-4 text-[#f43397] fill-[#f43397]" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">My Wishlist</h3>
              {wishlistProducts.length > 0 && (
                <span className="text-[10px] font-black text-[#f43397] bg-pink-50 dark:bg-pink-950/40 px-2.5 py-0.5 rounded-full border border-pink-200/50 dark:border-pink-900/40">
                  {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'}
                </span>
              )}
            </div>
            <button 
              onClick={() => setIsWishlistOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer border-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body List */}
          <div className="flex-grow overflow-y-auto py-5 space-y-3.5 no-scrollbar">
            {wishlistProducts.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900/80 flex items-center justify-center mx-auto border border-slate-200/60 dark:border-slate-800">
                  <Heart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Your Wishlist is Empty</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                    Save items you like while browsing to easily view and purchase them later.
                  </p>
                </div>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer border-none active:scale-95"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              wishlistProducts.map((item) => {
                const itemImg = item.image || item.img || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400';
                const itemPrice = item.price || item.fee || item.originalPrice || 0;
                const itemCategory = item.category || item.type || 'Product';
                return (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-850 relative animate-fade-in gap-3 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-750 transition-all shadow-3xs"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img 
                        src={itemImg} 
                        alt={item.name} 
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200/60 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900" 
                      />
                      <div className="text-left overflow-hidden">
                        <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full inline-block mb-1">
                          {itemCategory}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[160px] leading-tight">
                          {item.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white">₹{itemPrice.toLocaleString()}</span>
                          {item.discount && (
                            <span className="text-[9.5px] text-[#f43397] font-black">{item.discount}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[9.5px] font-bold text-slate-400 dark:text-slate-400">
                          <span className="text-amber-500 font-extrabold flex items-center gap-0.5">★ {item.rating || 4.5}</span>
                          {item.reviews && <span>({item.reviews})</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button 
                        type="button"
                        onClick={() => {
                          if (item.category === 'Luxury Hotels' || item.category === 'Stay' || item.category === 'Travel Ticket') {
                            setActiveBookNowModalItem(item);
                            setIsWishlistOpen(false);
                          } else {
                            addToCart(item);
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[9.5px] font-black px-2.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer uppercase flex items-center justify-center gap-1 border-none active:scale-95"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => toggleFavorite(item.id)}
                        className="text-[9.5px] font-extrabold border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/40 py-1 px-2 rounded-xl cursor-pointer transition-colors text-center bg-white dark:bg-slate-900 active:scale-95"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          {wishlistProducts.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2">
              <button 
                onClick={() => {
                  wishlistProducts.forEach(item => addToCart(item));
                  setIsWishlistOpen(false);
                  setIsCartOpen(true);
                  triggerNotification("Added all wishlist items to cart!");
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 border-none active:scale-95"
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
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#0b1329] w-screen h-screen flex flex-col md:flex-row overflow-hidden animate-fade-in text-slate-800 dark:text-slate-200">
            {/* Modal Left Navigation Sidebar */}
            <div className="w-full md:w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0 text-slate-800 dark:text-slate-200">
              <div className="space-y-6 text-left">
                {/* Logo */}
                <div className="flex flex-col items-center pb-2 border-b border-slate-100 dark:border-slate-800/60 w-full">
                  <img 
                    src={logoImg} 
                    alt="Forge India Connect" 
                    className="h-16 object-contain" 
                  />
                </div>

                {/* Profile Details */}
                <div className="flex flex-col items-center text-center gap-2 pb-5 border-b border-slate-100 dark:border-slate-800/60 w-full">
                  <div className="w-16 h-16 rounded-full bg-[#fbb53c] text-slate-900 flex items-center justify-center font-black text-2xl border border-amber-300 shadow-sm shrink-0">
                    {(currentUser?.name || profileName).charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div className="w-full overflow-hidden mt-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 break-all leading-tight">
                      {currentUser?.name || profileName}
                    </h4>
                    <span className="inline-block px-3 py-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 rounded-full mt-1.5 uppercase tracking-wider">
                      Customer Member
                    </span>
                  </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex flex-row md:flex-col gap-1 overflow-x-auto no-scrollbar py-2">
                  {[
                    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                    { id: 'wallet', label: 'Connect Wallet', icon: Wallet },
                    { id: 'payments', label: 'Payments', icon: CreditCard },
                    { id: 'card', label: 'Membership Card', icon: Sparkles },
                    { id: 'edit', label: 'Edit Profile', icon: User },
                    { id: 'settings', label: 'Settings', icon: Settings }
                  ].map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeProfileTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveProfileTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all w-full text-left whitespace-nowrap cursor-pointer border-none ${
                          isActive 
                            ? 'bg-[#FFB300] text-slate-950 shadow-sm font-extrabold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white bg-transparent'
                        }`}
                      >
                        <TabIcon className={`w-4.5 h-4.5 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={() => {
                  setIsProfileModalOpen(false);
                  onLogOut();
                }}
                className="mt-6 w-full py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 dark:bg-slate-900 dark:hover:bg-red-950/20 dark:border-red-900/50 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>Logout</span>
              </button>
            </div>

            {/* Modal Right Content Panel */}
            <div className="flex-grow p-6 md:p-8 overflow-y-auto flex flex-col justify-between bg-[#f8fafc] dark:bg-[#0b1329] text-slate-800 dark:text-slate-200 relative">
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute right-5 top-5 p-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-grow">
                {/* 1. MY ORDERS TAB */}
                {/* 1. MY ORDERS TAB */}
                {activeProfileTab === 'orders' && (
                  <div className="space-y-6 animate-fade-in text-left flex flex-col h-full justify-between">
                    {trackingOrder ? (
                      /* Live Tracking UI */
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
                          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2 text-xs text-slate-800 dark:text-slate-200 shadow-xs">
                            <h4 className="font-bold text-slate-900 dark:text-white">Order #{trackingOrder.order_number}</h4>
                            <p className="text-slate-500 dark:text-slate-400">Address: <strong>{trackingOrder.customer_address}</strong></p>
                            <p className="text-slate-500 dark:text-slate-400">Items: <strong>{trackingOrder.product_details}</strong></p>
                            <p className="text-slate-500 dark:text-slate-400">Total Amount: <strong className="text-[#f43397] font-extrabold">₹{trackingOrder.amount}</strong></p>
                          </div>
                          
                          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-center text-center space-y-1 shadow-xs">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Estimated Arrival</span>
                            {eta ? (
                              <span className="text-xl font-black text-amber-500">{eta} mins remaining</span>
                            ) : (
                              <span className="text-xs font-bold text-slate-400">Calculating ETA...</span>
                            )}
                            {distanceRemaining !== null && (
                              <span className="text-[10px] text-slate-500 mt-0.5">{distanceRemaining.toFixed(2)} km away</span>
                            )}
                          </div>
                        </div>

                        {/* Live Leaflet Map container */}
                        <div className="bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xs">
                          <div id="customer-tracking-map" className="h-[240px] rounded-xl bg-slate-950 relative overflow-hidden flex items-center justify-center border border-slate-900">
                            <span className="text-xs text-slate-500 animate-pulse font-bold">Initializing live GPS map...</span>
                          </div>
                        </div>

                        {/* Animated Timeline */}
                        <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl text-center shadow-xs">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-left">Delivery Progress Timeline</h4>
                          <div className="flex justify-between items-center relative w-full px-2">
                            <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -z-10" />
                            
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
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-[10px] transition-all duration-300 ${
                                    isCompleted 
                                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_8px_#10B981]' 
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                                  }`}>
                                    {isCompleted ? '✓' : idx + 1}
                                  </div>
                                  <span className={`text-[8px] font-bold uppercase transition-colors ${
                                    isActive ? 'text-[#f43397]' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                                  }`}>
                                    {step.replace('Delivery Partner ', '')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Delivery Partner Details */}
                        {trackingPartner ? (
                          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-3">
                              <img src={trackingPartner.photo} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 bg-white" />
                              <div className="text-left">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{trackingPartner.name}</h4>
                                <span className="text-[10px] text-slate-500 block mt-0.5">{trackingPartner.vehicle_type} • {trackingPartner.vehicle_number}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <a href={`tel:${trackingPartner.mobile}`} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-full border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-center">
                                <Phone className="w-4 h-4" />
                              </a>
                              {!['Delivered', 'Completed', 'Cancelled'].includes(trackingOrder.status) && (
                                <div className="bg-amber-400/10 border border-amber-400/30 text-amber-600 dark:text-amber-400 rounded-xl px-3.5 py-1 text-center shrink-0 flex flex-col justify-center">
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

                        {/* Rating Sub-panel */}
                        {['Delivered', 'Completed'].includes(trackingOrder.status) && (
                          <div className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 mt-4 text-center shadow-xs">
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
                                    <button key={star} type="button" onClick={() => setRatingValue(star)} className="p-1 cursor-pointer transition-transform hover:scale-110 border-none bg-transparent">
                                      <Star className={`w-5 h-5 ${star <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                    </button>
                                  ))}
                                  <span className="text-[10px] font-bold text-slate-500 ml-2">({ratingValue} Stars)</span>
                                </div>
                                <textarea rows={2} value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} placeholder="Add comments about delivery speed, politeness, safety..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:border-amber-400" />
                                <button type="submit" onClick={() => setRatingOrder(trackingOrder)} className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border-none shadow">
                                  Submit Delivery Review
                                </button>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Main Orders Tab Layout */
                      <div className="space-y-6 flex-grow flex flex-col justify-between">
                        <div>
                          {/* Header with notification bell & support */}
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">Recent Orders</h3>
                              <p className="text-xs text-slate-500 mt-1">Track your shopping orders and deliveries</p>
                            </div>
                            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                              <button className="relative p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer border-none bg-transparent">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-0 right-0 w-4 h-4 bg-[#FFC107] text-slate-950 text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">3</span>
                              </button>
                              <button className="flex items-center gap-1.5 text-xs font-bold hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-none bg-transparent">
                                <Phone className="w-4 h-4" />
                                <span>Help & Support</span>
                              </button>
                            </div>
                          </div>

                          {/* Stats Grid cards */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                              { label: 'Total Orders', value: customerOrders.length > 0 ? String(customerOrders.length).padStart(2, '0') : '12', sub: 'All Time', icon: ShoppingBag, iconColor: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40' },
                              { label: 'Delivered Orders', value: customerOrders.filter(o => ['Delivered','Completed'].includes(o.status)).length > 0 ? String(customerOrders.filter(o => ['Delivered','Completed'].includes(o.status)).length).padStart(2, '0') : '08', sub: 'This Year', icon: CheckCircle2, iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40' },
                              { label: 'In Transit', value: customerOrders.filter(o => ['Out For Delivery','Delivery Partner Accepted','Picked Up'].includes(o.status)).length > 0 ? String(customerOrders.filter(o => ['Out For Delivery','Delivery Partner Accepted','Picked Up'].includes(o.status)).length).padStart(2, '0') : '02', sub: 'Right Now', icon: Clock, iconColor: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40' },
                              { label: 'Cancelled', value: customerOrders.filter(o => o.status === 'Cancelled').length > 0 ? String(customerOrders.filter(o => o.status === 'Cancelled').length).padStart(2, '0') : '02', sub: 'This Year', icon: X, iconColor: 'text-rose-600', bgColor: 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/40' }
                            ].map((stat, i) => {
                              const StatIcon = stat.icon;
                              return (
                                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xs text-left">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${stat.bgColor}`}>
                                    <StatIcon className={`w-5 h-5 ${stat.iconColor}`} />
                                  </div>
                                  <div className="text-left leading-none">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white block mt-1.5">{stat.value}</span>
                                    <span className="text-[9px] font-semibold text-slate-400 mt-1 block">{stat.sub}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Filter Options tab bar */}
                          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 shadow-xs mb-6">
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                              {['All Orders', 'Processing', 'In Transit', 'Delivered', 'Cancelled', 'Returned'].map((tabName) => {
                                const isSelected = selectedOrdersTab === tabName;
                                return (
                                  <button
                                    key={tabName}
                                    onClick={() => setSelectedOrdersTab(tabName)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border-none ${
                                      isSelected
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-extrabold'
                                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white bg-transparent'
                                    }`}
                                  >
                                    {tabName}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <select className="bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none">
                                <option>Last 30 Days</option>
                                <option>Last 6 Months</option>
                                <option>All Time</option>
                              </select>
                              <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span>Filter</span>
                              </button>
                            </div>
                          </div>

                          {/* Orders List or Empty State */}
                          <div className="flex-grow">
                            {filteredCustomerOrders.length === 0 ? (
                              <div className="border border-dashed border-blue-200/80 dark:border-slate-700 rounded-3xl p-8 md:p-12 text-center bg-white dark:bg-slate-900 shadow-xs flex flex-col items-center">
                                <div className="w-48 h-48 mb-4 relative">
                                  <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="100" cy="100" r="80" fill="#EEF2F6" opacity="0.3" />
                                    <path d="M40 100C40 70 60 50 90 50C120 50 140 70 140 100" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
                                    <circle cx="150" cy="80" r="6" fill="#A5B4FC" opacity="0.6" />
                                    <path d="M165 95L172 88" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M35 120L28 113" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
                                    <rect x="105" y="70" width="45" height="60" rx="6" fill="#FFFFFF" stroke="#818CF8" strokeWidth="3" />
                                    <rect x="115" y="65" width="25" height="8" rx="2" fill="#A5B4FC" />
                                    <line x1="115" y1="85" x2="140" y2="85" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                                    <line x1="115" y1="95" x2="140" y2="95" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                                    <line x1="115" y1="105" x2="130" y2="105" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
                                    <path d="M60 90H95C98 90 100 92 100 95V140C100 143 98 145 95 145H60C57 145 55 143 55 140V95C55 92 57 90 60 90Z" fill="#4F46E5" />
                                    <path d="M66 90V80C66 73 71 68 78 68C85 68 90 73 90 80V90" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" />
                                    <rect x="75" y="112" width="30" height="30" rx="4" fill="#FFB300" />
                                    <path d="M82 112V107C82 104 84 102 87 102C90 102 92 104 92 107V112" stroke="#D4AF37" strokeWidth="2" />
                                  </svg>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 dark:text-white">No Orders Yet!</h4>
                                <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                                  Looks like you haven't placed any orders yet.<br />Explore deals and place your first order now.
                                </p>
                                <button 
                                  onClick={() => setIsProfileModalOpen(false)}
                                  className="mt-6 px-6 py-3 bg-[#FFC107] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 border-none"
                                >
                                  <ShoppingCart className="w-4 h-4 text-slate-950" />
                                  <span>Explore Deals</span>
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                {filteredCustomerOrders.map(ord => (
                                  <div key={ord.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-center bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xs">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/20 flex items-center justify-center text-amber-500 text-xs">
                                        <ShoppingBag className="w-5 h-5" />
                                      </div>
                                      <div className="text-left">
                                        <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1">{ord.product_details}</h4>
                                        <span className="text-[9px] text-slate-400 block mt-0.5">Order No: #{ord.order_number}</span>
                                        <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(ord.created_at || Date.now()).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                                      <span className="text-xs font-extrabold text-slate-800 dark:text-white">₹{ord.amount}</span>
                                      <div className="flex gap-2 items-center">
                                        {!['Delivered', 'Cancelled'].includes(ord.status) && (
                                          <button onClick={() => setTrackingOrder(ord)} className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 text-[9px] font-black uppercase rounded-lg border-none cursor-pointer">
                                            Track Live
                                          </button>
                                        )}
                                        {['Delivered'].includes(ord.status) && (
                                          <button onClick={() => setTrackingOrder(ord)} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-[9px] font-black uppercase rounded-lg border border-emerald-500/30 cursor-pointer">
                                            Rate Partner ★
                                          </button>
                                        )}
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                          ord.status === 'Delivered'
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            : ord.status === 'Cancelled'
                                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                          {ord.status.replace('Delivery Partner ', '')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom trust factors row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs mt-6 text-left shrink-0">
                          {[
                            { title: 'Secure Payments', desc: '100% safe and secured payments', icon: ShieldCheck, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
                            { title: '24/7 Support', desc: 'We are here to help you anytime', icon: Phone, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
                            { title: 'Best Offers', desc: 'Exclusive deals & amazing discounts', icon: Award, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
                            { title: 'Fast Delivery', desc: 'Quick and reliable delivery service', icon: Truck, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' }
                          ].map((item, i) => {
                            const IconComp = item.icon;
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                                  <IconComp className="w-4 h-4" />
                                </div>
                                <div className="leading-tight text-left">
                                  <h5 className="text-[11px] font-bold text-slate-800 dark:text-white">{item.title}</h5>
                                  <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{item.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
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
          
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] z-10 text-slate-800 dark:text-slate-200">
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
                  <div className={`border rounded-2xl p-4 flex gap-3 text-left ${(tier?.name || '').toLowerCase().includes('silver') ? 'bg-slate-50/50 dark:bg-slate-800/10 border-slate-300 dark:border-slate-700/60' : 'opacity-60 border-slate-100 dark:border-slate-900 bg-transparent'}`}>
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

                  <div className={`border rounded-2xl p-4 flex gap-3 text-left ${(tier?.name || '').toLowerCase().includes('gold') ? 'bg-amber-500/5 dark:bg-amber-400/5 border-amber-300 dark:border-amber-900/40' : 'opacity-60 border-slate-100 dark:border-slate-900 bg-transparent'}`}>
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

                  <div className={`border rounded-2xl p-4 flex gap-3 text-left md:col-span-2 ${(tier?.name || '').toLowerCase().includes('diamond') ? 'bg-cyan-500/5 dark:bg-cyan-400/5 border-cyan-300 dark:border-cyan-900/40' : 'opacity-60 border-slate-100 dark:border-slate-900 bg-transparent'}`}>
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

      {/* ==================== 1. SCHEDULE MODAL (Screenshot 1 style) ==================== */}
      {activeScheduleModalItem && (() => {
        const terms = getModalTerms(activeScheduleModalItem);
        const isStayItem = terms.summaryLabel === 'Hotel Stay';
        const isTravelItem = terms.summaryLabel === 'Travel Ticket';
        const basePrice = activeScheduleModalItem.price || 0;
        const diffNights = Math.max(1, Math.ceil((new Date(stayCheckOutDate) - new Date(stayCheckInDate)) / 86400000));
        const totalPrice = isStayItem ? basePrice * diffNights : basePrice;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in text-slate-800 dark:text-slate-200">
            <div onClick={() => setActiveScheduleModalItem(null)} className="absolute inset-0" />
            
            <div className="relative bg-slate-50 dark:bg-[#030712] w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col gap-6 z-10 border border-slate-200 dark:border-slate-800/80 max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button 
                onClick={() => setActiveScheduleModalItem(null)}
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-white dark:bg-[#0b1329] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center shadow-3xs cursor-pointer border border-slate-200/60 dark:border-slate-800 transition-colors border-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Column 1: Profile Info */}
                <div className="bg-white dark:bg-[#0b1329] rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 flex flex-col items-center text-center justify-between">
                  <div className="w-full flex flex-col items-center">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400 p-0.5 mt-2 shadow-xs">
                      <img src={activeScheduleModalItem.image} alt={activeScheduleModalItem.name} className="w-full h-full object-cover rounded-full" />
                      <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    
                    <span className="mt-3 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-full">Available</span>
                    
                    <h3 className="text-base font-black text-slate-850 dark:text-white mt-3 flex items-center gap-1 justify-center w-full">
                      <span className="truncate max-w-[80%]">{activeScheduleModalItem.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-white dark:text-white fill-blue-500 shrink-0" />
                    </h3>
                    
                    <span className="text-xs font-bold text-slate-450 dark:text-slate-400 mt-1 block">{terms.category}</span>
                    
                    <span className="text-[10px] text-slate-500 dark:text-slate-405 mt-2.5 leading-relaxed text-center block">
                      {(() => {
                        const isDoctor = activeScheduleModalItem.name?.startsWith('Dr.') || ['Hospital', 'Clinic', 'Cardiology', 'Pediatrics', 'Dentist', 'Homeopathy'].includes(activeScheduleModalItem.category);
                        if (isStayItem) {
                          return 'Verified Host • 5+ Years Experience';
                        }
                        if (isTravelItem) {
                          return 'Luxury Agent • 10+ Years Tours';
                        }
                        if (isDoctor) {
                          return 'MBBS, MD - Specialist • 12+ Years Experience';
                        }
                        return 'Verified Partner • Premium Quality Guarantee';
                      })()}
                    </span>

                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-full px-2.5 py-0.5 mt-3 select-none">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
                      <span className="text-[11px] font-black text-slate-750 dark:text-amber-450">{activeScheduleModalItem.rating || 4.5} <span className="font-bold text-slate-450 dark:text-slate-500">({activeScheduleModalItem.reviews || 120} Reviews)</span></span>
                    </div>
                  </div>

                  <div className="w-full mt-6 space-y-2 border-t border-slate-100 dark:border-slate-850/40 pt-4 text-left">
                    {!isTravelItem && (
                      <>
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-405 dark:text-slate-400">{terms.type2}</span>
                          <span className="text-emerald-600 dark:text-emerald-450 font-bold">Available</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-405 dark:text-slate-400">{terms.type1}</span>
                          <span className="text-emerald-600 dark:text-emerald-450 font-bold">Available</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between text-xs font-medium border-t border-slate-50 dark:border-slate-850/30 pt-2.5">
                      <span className="text-slate-405 dark:text-slate-400">{terms.feeLabel}</span>
                      <div className="text-right">
                        <span className="text-slate-850 dark:text-white font-extrabold">₹{totalPrice.toLocaleString()}</span>
                        {isStayItem && diffNights > 1 && (
                          <span className="text-[9px] font-bold text-slate-400 block leading-none mt-0.5">(₹{basePrice.toLocaleString()} × {diffNights} nights)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2 & 3: Configure Timings & Dates (Available & Not Available View) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0b1329] rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 select-none flex-wrap gap-2">
                      <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider text-left flex items-center gap-2">
                        <span>Configure Timings & Dates</span>
                      </h3>
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30 flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        <LiveClock prefix="Live: " />
                      </span>
                    </div>
                    
                    {/* Toggle Button Types (Hidden for Travel) */}
                    {!isTravelItem && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button 
                        onClick={() => setSelectedModalType(terms.type2)}
                        className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          selectedModalType === terms.type2
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-black' 
                            : 'bg-transparent text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{terms.type2}</span>
                      </button>
                      <button 
                        onClick={() => setSelectedModalType(terms.type1)}
                        className={`py-2 px-1 text-[10px] font-black uppercase rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          selectedModalType === terms.type1
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-black' 
                            : 'bg-transparent text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        <span className="truncate">{terms.type1}</span>
                      </button>
                    </div>
                    )}

                    {/* Check-In & Check-Out Cards with Available / Not Available dates & times */}
                    <div className="space-y-4 mb-4 select-none">
                      {/* Check-In / Departure Details Card */}
                      <div className="bg-slate-50 dark:bg-slate-900/60 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl p-4 text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" /> {isTravelItem ? 'Departure Details' : 'Check-In Details'}
                          </span>
                          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full">
                            {formatDateFromYYYYMMDD(stayCheckInDate)} • {checkInTime}
                          </span>
                        </div>

                        {/* Check-In / Departure Date Strip */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{isTravelItem ? 'Select Departure Date' : 'Select Check-In Date'}</span>
                            <span className="text-[9px] font-bold text-slate-400">Scroll for dates →</span>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {generateUpcomingDates(formatDateYYYYMMDD(todayObj), 14).map((d) => {
                              const isSelected = stayCheckInDate === d.dateStr;
                              return (
                                <button
                                  key={`in-date-${d.dateStr}`}
                                  type="button"
                                  disabled={!d.isAvailable}
                                  onClick={() => {
                                    setStayCheckInDate(d.dateStr);
                                    if (stayCheckOutDate <= d.dateStr) {
                                      const next = new Date(d.dateStr + 'T00:00:00');
                                      next.setDate(next.getDate() + 1);
                                      setStayCheckOutDate(formatDateYYYYMMDD(next));
                                    }
                                  }}
                                  className={`min-w-[72px] py-2 px-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shrink-0 ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-md font-black ring-2 ring-blue-500/30'
                                      : !d.isAvailable
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-750 opacity-40 cursor-not-allowed line-through'
                                        : 'bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                  }`}
                                >
                                  <span className="text-[9px] font-extrabold uppercase opacity-80">{d.dayName}</span>
                                  <span className="text-sm font-black">{d.dayNumber}</span>
                                  <span className="text-[8px] font-bold uppercase">{d.monthName}</span>
                                  <span className={`text-[7px] font-black uppercase px-1 py-0.2 rounded mt-0.5 ${
                                    isSelected 
                                      ? 'bg-blue-700 text-white' 
                                      : !d.isAvailable 
                                        ? 'text-red-500' 
                                        : 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                                  }`}>
                                    {isSelected ? 'SELECTED' : !d.isAvailable ? 'FULL' : 'AVAILABLE'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Check-In / Departure Time Slots */}
                        <div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">{isTravelItem ? 'Select Departure Time' : 'Select Check-In Time Slot'}</span>
                          <div className="grid grid-cols-5 gap-2">
                            {checkInTimeSlots.map((slot) => {
                              const isSelected = checkInTime === slot.time;
                              const isAvail = slot.status === 'Available';
                              return (
                                <button
                                  key={`in-time-${slot.time}`}
                                  type="button"
                                  disabled={!isAvail}
                                  onClick={() => setCheckInTime(slot.time)}
                                  className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black ring-2 ring-emerald-500/30'
                                      : !isAvail
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800 opacity-40 cursor-not-allowed line-through'
                                        : 'bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                                  }`}
                                >
                                  <span className="text-[11px] font-extrabold">{slot.time}</span>
                                  <span className={`text-[7.5px] font-black uppercase ${
                                    isSelected 
                                      ? 'text-white' 
                                      : !isAvail 
                                        ? 'text-red-500' 
                                        : 'text-emerald-600 dark:text-emerald-400'
                                  }`}>
                                    {isSelected ? 'SELECTED' : slot.status}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Check-Out Details Card (Hidden for Travel) */}
                      {!isTravelItem && (
                      <div className="bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl p-4 text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Check-Out Details
                          </span>
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full">
                            {formatDateFromYYYYMMDD(stayCheckOutDate)} • {checkOutTime}
                          </span>
                        </div>

                        {/* Check-Out Date Strip */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Select Check-Out Date</span>
                            <span className="text-[9px] font-bold text-slate-400">Scroll for dates →</span>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {generateUpcomingDates(stayCheckInDate, 14).slice(1).map((d) => {
                              const isSelected = stayCheckOutDate === d.dateStr;
                              return (
                                <button
                                  key={`out-date-${d.dateStr}`}
                                  type="button"
                                  disabled={!d.isAvailable}
                                  onClick={() => setStayCheckOutDate(d.dateStr)}
                                  className={`min-w-[72px] py-2 px-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shrink-0 ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black ring-2 ring-emerald-500/30'
                                      : !d.isAvailable
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-750 opacity-40 cursor-not-allowed line-through'
                                        : 'bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                                  }`}
                                >
                                  <span className="text-[9px] font-extrabold uppercase opacity-80">{d.dayName}</span>
                                  <span className="text-sm font-black">{d.dayNumber}</span>
                                  <span className="text-[8px] font-bold uppercase">{d.monthName}</span>
                                  <span className={`text-[7px] font-black uppercase px-1 py-0.2 rounded mt-0.5 ${
                                    isSelected 
                                      ? 'bg-emerald-700 text-white' 
                                      : !d.isAvailable 
                                        ? 'text-red-500' 
                                        : 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                                  }`}>
                                    {isSelected ? 'SELECTED' : !d.isAvailable ? 'FULL' : 'AVAILABLE'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Check-Out Time Slots */}
                        <div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">Select Check-Out Time Slot</span>
                          <div className="grid grid-cols-4 gap-2">
                            {checkOutTimeSlots.map((slot) => {
                              const isSelected = checkOutTime === slot.time;
                              const isAvail = slot.status === 'Available';
                              return (
                                <button
                                  key={`out-time-${slot.time}`}
                                  type="button"
                                  disabled={!isAvail}
                                  onClick={() => setCheckOutTime(slot.time)}
                                  className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black ring-2 ring-emerald-500/30'
                                      : !isAvail
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800 opacity-40 cursor-not-allowed line-through'
                                        : 'bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                                  }`}
                                >
                                  <span className="text-[11px] font-extrabold">{slot.time}</span>
                                  <span className={`text-[7.5px] font-black uppercase ${
                                    isSelected 
                                      ? 'text-white' 
                                      : !isAvail 
                                        ? 'text-red-500' 
                                        : 'text-emerald-600 dark:text-emerald-400'
                                  }`}>
                                    {isSelected ? 'SELECTED' : slot.status}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      )}
                    </div>

                    {/* Guest/Traveler Counter Block */}
                    {(isStayItem || isTravelItem) && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-left select-none space-y-3">
                        <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">Travelers / Guests</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {/* Adults Selector */}
                          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 overflow-hidden">
                            <div className="shrink-0">
                              <span className="block font-black text-xs text-slate-850 dark:text-white leading-tight">Adults</span>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Age 12+</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-3xs shrink-0">
                              <button 
                                type="button"
                                onClick={() => setAdultCount(prev => Math.max(1, prev - 1))}
                                className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 cursor-pointer border-none text-xs active:scale-95"
                              >
                                -
                              </button>
                              <span className="font-black text-xs w-4 text-center text-slate-800 dark:text-white">{adultCount}</span>
                              <button 
                                type="button"
                                onClick={() => setAdultCount(prev => prev + 1)}
                                className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 cursor-pointer border-none text-xs active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Children Selector */}
                          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 overflow-hidden">
                            <div className="shrink-0">
                              <span className="block font-black text-xs text-slate-850 dark:text-white leading-tight">Children</span>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Age 2-12</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-3xs shrink-0">
                              <button 
                                type="button"
                                onClick={() => setChildCount(prev => Math.max(0, prev - 1))}
                                className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 cursor-pointer border-none text-xs active:scale-95"
                              >
                                -
                              </button>
                              <span className="font-black text-xs w-4 text-center text-slate-800 dark:text-white">{childCount}</span>
                              <button 
                                type="button"
                                onClick={() => setChildCount(prev => prev + 1)}
                                className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 cursor-pointer border-none text-xs active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Add Guest Details Name Inputs */}
                        {adultCount + childCount > 1 && (
                          <div className="bg-amber-500/5 dark:bg-amber-400/2 border border-amber-400/20 rounded-xl p-3 space-y-2.5">
                            <span className="text-[9.5px] font-black text-amber-600 dark:text-amber-450 uppercase tracking-wider block">Add Guest Details</span>
                            {Array.from({ length: adultCount + childCount - 1 }).map((_, idx) => (
                              <div key={idx} className="flex flex-col gap-1">
                                <span className="text-[9px] font-extrabold text-slate-450 dark:text-slate-500 uppercase">Guest {idx + 2} Full Name</span>
                                <input 
                                  type="text" 
                                  placeholder={`Guest ${idx + 2} Name`}
                                  className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-750 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Duration Summary Badge */}
                  {(() => {
                    const s = new Date(stayCheckInDate + 'T00:00:00');
                    const e = new Date(stayCheckOutDate + 'T00:00:00');
                    const diff = Math.max(1, Math.ceil((e - s) / 86400000));
                    return (
                      <div className="flex items-center gap-2 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3 text-[10px] font-extrabold text-blue-700 dark:text-blue-300 mt-4 leading-relaxed text-left">
                        <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>Stay Summary: {diff} {diff === 1 ? 'Night' : 'Nights'} (Check-In: {checkInTime} | Check-Out: {checkOutTime})</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Column 4: Appointment Summary */}
                <div className="bg-white dark:bg-[#0b1329] rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between">
                  <div className="space-y-5">
                    <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider text-left">Appointment Summary</h3>
                    
                    <div className="space-y-3.5 text-xs text-left">
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block leading-none mb-1">{terms.label}</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{activeScheduleModalItem.name}</span>
                          <span className="text-[10px] text-slate-450 dark:text-slate-550 block mt-0.5 leading-none">{terms.category}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-855/40 pt-3">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block leading-none mb-1">Check-In</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{formatDateFromYYYYMMDD(stayCheckInDate)}</span>
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{checkInTime}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-855/40 pt-3">
                        <Calendar className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block leading-none mb-1">Check-Out</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 block">{formatDateFromYYYYMMDD(stayCheckOutDate)}</span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{checkOutTime}</span>
                        </div>
                      </div>

                      {(() => {
                        const s = new Date(stayCheckInDate + 'T00:00:00');
                        const e = new Date(stayCheckOutDate + 'T00:00:00');
                        const diff = Math.max(1, Math.ceil((e - s) / 86400000));
                        return (
                          <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-855/40 pt-3">
                            <Home className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block leading-none mb-1">Duration</span>
                              <span className="font-extrabold text-slate-800 dark:text-slate-200">{diff} {diff === 1 ? 'Night' : 'Nights'}</span>
                            </div>
                          </div>
                        );
                      })()}

                      {(isStayItem || isTravelItem) && (
                        <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-855/40 pt-3">
                          <User className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block leading-none mb-1">Guests / Travelers</span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200">
                              {adultCount + childCount} {adultCount + childCount === 1 ? 'Person' : 'People'}
                              <span className="text-[10px] text-slate-450 dark:text-slate-550 block mt-0.5 leading-none">
                                ({adultCount} Adults, {childCount} Children)
                              </span>
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-855/40 pt-3">
                        <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block leading-none mb-1">Booking Time (Live)</span>
                          <span className="font-extrabold text-slate-850 dark:text-white flex items-center gap-1.5">
                            <LiveClock />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-855/40 pt-3">
                        <svg className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block leading-none mb-1">Type</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedModalType}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 border-t border-slate-100 dark:border-slate-855/40 pt-3">
                        <CreditCard className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block leading-none mb-1">Fee</span>
                          <span className="font-black text-slate-850 dark:text-white text-sm">₹{(activeScheduleModalItem.price || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const itemToCart = {
                        ...activeScheduleModalItem,
                        price: totalPrice,
                        basePrice: basePrice,
                        nights: isStayItem ? diffNights : 1,
                        bookingDate: formatDateFromYYYYMMDD(stayCheckInDate),
                        checkInDate: stayCheckInDate,
                        checkOutDate: isTravelItem ? undefined : stayCheckOutDate,
                        checkInTime: checkInTime,
                        checkOutTime: isTravelItem ? undefined : checkOutTime,
                        bookingTime: isTravelItem ? checkInTime : `${checkInTime} - ${checkOutTime}`,
                        bookingType: selectedModalType,
                        adults: adultCount,
                        children: childCount
                      };
                      addToCart(itemToCart);
                      setActiveScheduleModalItem(null);
                      setIsCartOpen(true);
                      if (isTravelItem) {
                        triggerNotification(`Travel Booking scheduled & added to Cart! Departure: ${formatDateFromYYYYMMDD(stayCheckInDate)} (${checkInTime})`);
                      } else {
                        triggerNotification(`Booking scheduled & added to Cart! Check-In: ${formatDateFromYYYYMMDD(stayCheckInDate)} (${checkInTime}), Check-Out: ${formatDateFromYYYYMMDD(stayCheckOutDate)} (${checkOutTime}) (${diffNights} nights)`);
                      }
                    }}
                    className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1 border-none active:scale-[0.99]"
                  >
                    <span>Schedule Now</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Secure Footer Banner */}
              <div className="flex items-center justify-center gap-1.5 border-t border-slate-200/50 dark:border-slate-850/40 pt-4 mt-2 text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-widest select-none">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
                <span>Your appointment is safe and secure with Connect App</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================== 2. BOOK NOW MODAL (Screenshot 2 style) ==================== */}
      {activeBookNowModalItem && (() => {
        const terms = getModalTerms(activeBookNowModalItem);
        const isStayItem = terms.summaryLabel === 'Hotel Stay';
        const isTravelItem = terms.summaryLabel === 'Travel Ticket';
        const basePrice = activeBookNowModalItem.price || 0;
        const diffNights = Math.max(1, Math.ceil((new Date(stayCheckOutDate) - new Date(stayCheckInDate)) / 86400000));
        const totalPrice = isStayItem ? basePrice * diffNights : basePrice;
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in text-slate-800 dark:text-slate-200">
            <div onClick={() => setActiveBookNowModalItem(null)} className="absolute inset-0" />
            
            <div className="relative bg-slate-50 dark:bg-[#030712] w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col gap-6 z-10 border border-slate-200 dark:border-slate-800/80 max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button 
                onClick={() => setActiveBookNowModalItem(null)}
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-white dark:bg-[#0b1329] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center shadow-3xs cursor-pointer border border-slate-200/60 dark:border-slate-800 transition-colors border-none"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 & 2 (lg:col-span-2): Configure Timings & Dates (Available & Not Available View) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0b1329] rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 select-none flex-wrap gap-2">
                      <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider text-left flex items-center gap-2">
                        <span>Configure Timings & Dates</span>
                      </h3>
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30 flex items-center gap-1 shrink-0 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <LiveClock prefix="Live: " />
                      </span>
                    </div>

                    {/* Check-In & Check-Out Cards with Available / Not Available view */}
                    <div className="space-y-4 mb-4 select-none">
                      {/* Check-In / Departure Details Card */}
                      <div className="bg-slate-50 dark:bg-slate-900/60 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl p-4 text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" /> {isTravelItem ? 'Departure Details' : 'Check-In Details'}
                          </span>
                          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full">
                            {formatDateFromYYYYMMDD(stayCheckInDate)} • {checkInTime}
                          </span>
                        </div>

                        {/* Check-In / Departure Date Strip */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{isTravelItem ? 'Select Departure Date' : 'Select Check-In Date'}</span>
                            <span className="text-[9px] font-bold text-slate-400">Scroll for dates →</span>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {generateUpcomingDates(formatDateYYYYMMDD(todayObj), 14).map((d) => {
                              const isSelected = stayCheckInDate === d.dateStr;
                              return (
                                <button
                                  key={`in-date-m2-${d.dateStr}`}
                                  type="button"
                                  disabled={!d.isAvailable}
                                  onClick={() => {
                                    setStayCheckInDate(d.dateStr);
                                    if (stayCheckOutDate <= d.dateStr) {
                                      const next = new Date(d.dateStr + 'T00:00:00');
                                      next.setDate(next.getDate() + 1);
                                      setStayCheckOutDate(formatDateYYYYMMDD(next));
                                    }
                                  }}
                                  className={`min-w-[72px] py-2 px-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shrink-0 ${
                                    isSelected
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-md font-black ring-2 ring-blue-500/30'
                                      : !d.isAvailable
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-750 opacity-40 cursor-not-allowed line-through'
                                        : 'bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                                  }`}
                                >
                                  <span className="text-[9px] font-extrabold uppercase opacity-80">{d.dayName}</span>
                                  <span className="text-sm font-black">{d.dayNumber}</span>
                                  <span className="text-[8px] font-bold uppercase">{d.monthName}</span>
                                  <span className={`text-[7px] font-black uppercase px-1 py-0.2 rounded mt-0.5 ${
                                    isSelected 
                                      ? 'bg-blue-700 text-white' 
                                      : !d.isAvailable 
                                        ? 'text-red-500' 
                                        : 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                                  }`}>
                                    {isSelected ? 'SELECTED' : !d.isAvailable ? 'FULL' : 'AVAILABLE'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Check-In / Departure Time Slots */}
                        <div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">{isTravelItem ? 'Select Departure Time' : 'Select Check-In Time Slot'}</span>
                          <div className="grid grid-cols-5 gap-2">
                            {checkInTimeSlots.map((slot) => {
                              const isSelected = checkInTime === slot.time;
                              const isAvail = slot.status === 'Available';
                              return (
                                <button
                                  key={`in-time-m2-${slot.time}`}
                                  type="button"
                                  disabled={!isAvail}
                                  onClick={() => setCheckInTime(slot.time)}
                                  className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black ring-2 ring-emerald-500/30'
                                      : !isAvail
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800 opacity-40 cursor-not-allowed line-through'
                                        : 'bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                                  }`}
                                >
                                  <span className="text-[11px] font-extrabold">{slot.time}</span>
                                  <span className={`text-[7.5px] font-black uppercase ${
                                    isSelected 
                                      ? 'text-white' 
                                      : !isAvail 
                                        ? 'text-red-500' 
                                        : 'text-emerald-600 dark:text-emerald-400'
                                  }`}>
                                    {isSelected ? 'SELECTED' : slot.status}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Check-Out Details Card (Hidden for Travel) */}
                      {!isTravelItem && (
                      <div className="bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl p-4 text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Check-Out Details
                          </span>
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full">
                            {formatDateFromYYYYMMDD(stayCheckOutDate)} • {checkOutTime}
                          </span>
                        </div>

                        {/* Check-Out Date Strip */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Select Check-Out Date</span>
                            <span className="text-[9px] font-bold text-slate-400">Scroll for dates →</span>
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {generateUpcomingDates(stayCheckInDate, 14).slice(1).map((d) => {
                              const isSelected = stayCheckOutDate === d.dateStr;
                              return (
                                <button
                                  key={`out-date-m2-${d.dateStr}`}
                                  type="button"
                                  disabled={!d.isAvailable}
                                  onClick={() => setStayCheckOutDate(d.dateStr)}
                                  className={`min-w-[72px] py-2 px-2 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shrink-0 ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black ring-2 ring-emerald-500/30'
                                      : !d.isAvailable
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-750 opacity-40 cursor-not-allowed line-through'
                                        : 'bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                                  }`}
                                >
                                  <span className="text-[9px] font-extrabold uppercase opacity-80">{d.dayName}</span>
                                  <span className="text-sm font-black">{d.dayNumber}</span>
                                  <span className="text-[8px] font-bold uppercase">{d.monthName}</span>
                                  <span className={`text-[7px] font-black uppercase px-1 py-0.2 rounded mt-0.5 ${
                                    isSelected 
                                      ? 'bg-emerald-700 text-white' 
                                      : !d.isAvailable 
                                        ? 'text-red-500' 
                                        : 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                                  }`}>
                                    {isSelected ? 'SELECTED' : !d.isAvailable ? 'FULL' : 'AVAILABLE'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Check-Out Time Slots */}
                        <div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">Select Check-Out Time Slot</span>
                          <div className="grid grid-cols-4 gap-2">
                            {checkOutTimeSlots.map((slot) => {
                              const isSelected = checkOutTime === slot.time;
                              const isAvail = slot.status === 'Available';
                              return (
                                <button
                                  key={`out-time-m2-${slot.time}`}
                                  type="button"
                                  disabled={!isAvail}
                                  onClick={() => setCheckOutTime(slot.time)}
                                  className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black ring-2 ring-emerald-500/30'
                                      : !isAvail
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-750 opacity-40 cursor-not-allowed line-through'
                                        : 'bg-white dark:bg-slate-950 text-slate-750 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                                  }`}
                                >
                                  <span className="text-[11px] font-extrabold">{slot.time}</span>
                                  <span className={`text-[7.5px] font-black uppercase ${
                                    isSelected 
                                      ? 'text-white' 
                                      : !isAvail 
                                        ? 'text-red-500' 
                                        : 'text-emerald-600 dark:text-emerald-400'
                                  }`}>
                                    {isSelected ? 'SELECTED' : slot.status}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      )}
                    </div>

                    {/* Guest/Traveler Counter Block */}
                    {(isStayItem || isTravelItem) && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-left select-none space-y-3">
                        <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">Travelers / Guests</span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {/* Adults Selector */}
                          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 overflow-hidden">
                            <div className="shrink-0">
                              <span className="block font-black text-xs text-slate-850 dark:text-white leading-tight">Adults</span>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Age 12+</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-3xs shrink-0">
                              <button 
                                type="button"
                                onClick={() => setAdultCount(prev => Math.max(1, prev - 1))}
                                className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 cursor-pointer border-none text-xs active:scale-95"
                              >
                                -
                              </button>
                              <span className="font-black text-xs w-4 text-center text-slate-800 dark:text-white">{adultCount}</span>
                              <button 
                                type="button"
                                onClick={() => setAdultCount(prev => prev + 1)}
                                className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 cursor-pointer border-none text-xs active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Children Selector */}
                          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 overflow-hidden">
                            <div className="shrink-0">
                              <span className="block font-black text-xs text-slate-850 dark:text-white leading-tight">Children</span>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Age 2-12</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-3xs shrink-0">
                              <button 
                                type="button"
                                onClick={() => setChildCount(prev => Math.max(0, prev - 1))}
                                className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 cursor-pointer border-none text-xs active:scale-95"
                              >
                                -
                              </button>
                              <span className="font-black text-xs w-4 text-center text-slate-800 dark:text-white">{childCount}</span>
                              <button 
                                type="button"
                                onClick={() => setChildCount(prev => prev + 1)}
                                className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center font-black text-slate-700 dark:text-slate-200 cursor-pointer border-none text-xs active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Add Guest Details Name Inputs */}
                        {adultCount + childCount > 1 && (
                          <div className="bg-amber-500/5 dark:bg-amber-400/2 border border-amber-400/20 rounded-xl p-3 space-y-2.5">
                            <span className="text-[9.5px] font-black text-amber-600 dark:text-amber-450 uppercase tracking-wider block">Add Guest Details</span>
                            {Array.from({ length: adultCount + childCount - 1 }).map((_, idx) => (
                              <div key={idx} className="flex flex-col gap-1">
                                <span className="text-[9px] font-extrabold text-slate-455 dark:text-slate-500 uppercase">Guest {idx + 2} Full Name</span>
                                <input 
                                  type="text" 
                                  placeholder={`Guest ${idx + 2} Name`}
                                  className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-750 dark:text-slate-200 focus:border-blue-500 focus:outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stay / Travel Summary Badge */}
                  {(() => {
                    if (isTravelItem) {
                      return (
                        <div className="flex items-center gap-2 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3 text-[10px] font-extrabold text-blue-700 dark:text-blue-300 mt-4 leading-relaxed text-left">
                          <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                          <span>Travel Summary: Departure Date: {formatDateFromYYYYMMDD(stayCheckInDate)} at {checkInTime}</span>
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-2 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3 text-[10px] font-extrabold text-blue-700 dark:text-blue-300 mt-4 leading-relaxed text-left">
                        <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>Stay Summary: {diffNights} {diffNights === 1 ? 'Night' : 'Nights'} (Check-In: {checkInTime} | Check-Out: {checkOutTime})</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Column 3: Confirmation Summary */}
                <div className="bg-white dark:bg-[#0b1329] rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between">
                  <div className="space-y-5">
                    <h3 className="text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider text-left">Your Appointment</h3>
                    
                    {/* Mini Profile card */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#030712] border border-slate-100 dark:border-slate-850/40 rounded-xl p-3 select-none">
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 p-0.5">
                        <img src={activeBookNowModalItem.image} alt={activeBookNowModalItem.name} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <div className="text-left flex-grow">
                        <h4 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-0.5 w-full">
                          <span className="truncate max-w-[80%]">{activeBookNowModalItem.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white dark:text-white fill-blue-500 shrink-0" />
                        </h4>
                        <span className="text-[9px] text-slate-400 block leading-none mt-1">{terms.category}</span>
                        <div className="flex items-center gap-0.5 mt-1.5 text-[9px] font-black text-slate-650 dark:text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
                          <span>{activeBookNowModalItem.rating || 4.5} <span className="font-bold text-slate-450 dark:text-slate-500">({activeBookNowModalItem.reviews || 120} Reviews)</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Summary row matrix */}
                    <div className="space-y-3.5 text-xs text-left">
                      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-855/30 pb-2">
                        <span className="text-slate-405 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-500" /> Check-In</span>
                        <span className="font-extrabold text-slate-850 dark:text-slate-200 text-right">
                          {formatDateFromYYYYMMDD(stayCheckInDate)}
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-bold">{checkInTime}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-855/30 pb-2">
                        <span className="text-slate-405 dark:text-slate-400 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-500" /> Check-Out</span>
                        <span className="font-extrabold text-slate-850 dark:text-slate-200 text-right">
                          {formatDateFromYYYYMMDD(stayCheckOutDate)}
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">{checkOutTime}</span>
                        </span>
                      </div>

                      {(() => {
                        const s = new Date(stayCheckInDate + 'T00:00:00');
                        const e = new Date(stayCheckOutDate + 'T00:00:00');
                        const diff = Math.max(1, Math.ceil((e - s) / 86400000));
                        return (
                          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-855/30 pb-2">
                            <span className="text-slate-405 dark:text-slate-400 flex items-center gap-1.5"><Home className="w-4 h-4 text-slate-450" /> Duration</span>
                            <span className="font-extrabold text-slate-850 dark:text-slate-200">{diff} {diff === 1 ? 'Night' : 'Nights'}</span>
                          </div>
                        );
                      })()}

                      {(isStayItem || isTravelItem) && (
                        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-855/30 pb-2">
                          <span className="text-slate-405 dark:text-slate-400 flex items-center gap-1.5"><User className="w-4 h-4 text-slate-450" /> Travelers / Guests</span>
                          <span className="font-extrabold text-slate-855 dark:text-slate-200 text-right">
                            {adultCount + childCount} {adultCount + childCount === 1 ? 'Person' : 'People'}
                            <span className="text-[10px] text-slate-450 dark:text-slate-550 block mt-0.5 font-bold leading-none">
                              ({adultCount} Adults, {childCount} Children)
                            </span>
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-855/30 pb-2">
                        <span className="text-slate-405 dark:text-slate-400 flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500 animate-pulse" /> Booking Time (Live)</span>
                        <span className="font-extrabold text-slate-855 dark:text-white flex items-center gap-1.5">
                          <LiveClock />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-855/30 pb-2">
                        <span className="text-slate-405 dark:text-slate-400 flex items-center gap-1.5"><svg className="w-4 h-4 text-slate-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Type</span>
                        <span className="font-extrabold text-slate-850 dark:text-slate-200">{selectedModalType}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-405 dark:text-slate-400 flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-455" /> {terms.feeLabel}</span>
                        <div className="text-right">
                          <span className="font-black text-slate-850 dark:text-white text-sm">₹{totalPrice.toLocaleString()}</span>
                          {isStayItem && diffNights > 1 && (
                            <span className="text-[9px] font-bold text-slate-400 block leading-none mt-0.5">(₹{basePrice.toLocaleString()} × {diffNights} nights)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => {
                        const itemToCart = {
                          ...activeBookNowModalItem,
                          price: totalPrice,
                          basePrice: basePrice,
                          nights: isStayItem ? diffNights : 1,
                          bookingDate: formatDateFromYYYYMMDD(stayCheckInDate),
                          checkInDate: stayCheckInDate,
                          checkOutDate: isTravelItem ? undefined : stayCheckOutDate,
                          checkInTime: checkInTime,
                          checkOutTime: isTravelItem ? undefined : checkOutTime,
                          bookingTime: isTravelItem ? checkInTime : `${checkInTime} - ${checkOutTime}`,
                          bookingType: selectedModalType,
                          adults: adultCount,
                          children: childCount
                        };
                        addToCart(itemToCart);
                        setActiveBookNowModalItem(null);
                        setIsCartOpen(true);
                        if (isTravelItem) {
                          triggerNotification(`Travel Booking added to Cart! Departure: ${formatDateFromYYYYMMDD(stayCheckInDate)} (${checkInTime})`);
                        } else {
                          triggerNotification(`Booking added to Cart! Check-In: ${formatDateFromYYYYMMDD(stayCheckInDate)} (${checkInTime}), Check-Out: ${formatDateFromYYYYMMDD(stayCheckOutDate)} (${checkOutTime}) (${diffNights} nights)`);
                        }
                      }}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border-none active:scale-[0.99]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>Book Now</span>
                    </button>
                    
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-455 dark:text-slate-500 font-bold select-none leading-none">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span>You won't be charged yet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================== MEMBERSHIP UPGRADE MODAL ==================== */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-fade-in text-slate-800">
          <div onClick={() => setShowUpgradeModal(false)} className="absolute inset-0" />
          
          <div className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/60 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] z-10 text-slate-800 dark:text-slate-200">
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
