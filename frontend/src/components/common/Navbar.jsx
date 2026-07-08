import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../../assets/images/forge india logo.jpg';
import {
  Shield, User, Briefcase, ShoppingBag, Globe,
  LogIn, LogOut, Sun, Moon, Menu, X, ChevronRight, Plus
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   MEGA-MENU DATA  — full category lists matching CustomerDashboard
   ══════════════════════════════════════════════════════════════ */
const MENU_DATA = {
  Services: {
    'Healthcare':    { items: ['Hospitals', 'Clinics', 'Diagnostic Centers', 'Pharmacies', 'Dental Care', 'Eye Care', 'Ambulance Services', 'Home Nursing', 'Health Checkups', 'Telemedicine', 'Physiotherapy'] },
    'Education':     { items: ['Schools', 'Colleges', 'Universities', 'Online Courses', 'Training Institutes', 'Skill Development', 'Computer Training', 'AI & IT Training', 'Language Classes', 'Competitive Exam Coaching'] },
    'Financial':     { items: ['Banking Services', 'Personal Loans', 'Home Loans', 'Business Loans', 'Credit Cards', 'Investment Plans', 'Mutual Funds', 'Financial Consulting', 'Tax Planning', 'Retirement Planning'] },
    'Insurance':     { items: ['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'Travel Insurance', 'Property Insurance', 'Business Insurance', 'Accident Insurance'] },
    'Home Services': { items: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Interior Design', 'Home Cleaning', 'Pest Control', 'AC Repair', 'Appliance Repair', 'CCTV Installation', 'Smart Home Solutions'] },
    'Legal':         { items: ['Legal Consultation', 'Property Registration', 'Agreement Drafting', 'Notary Services', 'Court Assistance', 'Company Registration', 'Trademark Registration', 'Legal Documentation'] },
    'Digital':       { items: ['Website Development', 'Mobile App Development', 'UI/UX Design', 'Digital Marketing', 'SEO Services', 'Social Media Marketing', 'Graphic Design', 'Video Editing', 'Cloud Solutions'] },
    'Business':      { items: ['Company Formation', 'GST Registration', 'Payroll Management', 'HR Solutions', 'Recruitment Services', 'Business Consulting', 'Branding Services', 'Franchise Consulting', 'Startup Advisory'] },
    'Automobile':    { items: ['Car Service', 'Bike Service', 'Car Wash', 'Roadside Assistance', 'Vehicle Inspection', 'Vehicle Insurance', 'Driving School', 'Vehicle Rental'] },
    'Bill & Recharge': { items: ['Mobile Recharge', 'DTH Recharge', 'Broadband Services', 'Fiber Internet', 'SIM Activation', 'Business Connectivity', 'Electricity Bill Payment', 'Water Bill Payment', 'Gas Booking', 'Property Tax', 'Internet Bill Payment', 'Government Services'] },
    'Family':        { items: ['Child Care', 'Day Care', 'Elder Care', 'Home Care', 'Family Counseling', 'Parenting Support'] },
    'Fitness':       { items: ['Gym Membership', 'Yoga Classes', 'Personal Training', 'Nutrition Consultation', 'Wellness Centers', 'Spa Services', 'Mental Wellness'] },
    'Events':        { items: ['Wedding Planning', 'Birthday Events', 'Corporate Events', 'Photography', 'Videography', 'Catering Services', 'Decoration Services'] },
    'Real Estate':   { items: ['Property Buying', 'Property Selling', 'Property Rental', 'Property Management', 'Interior Solutions', 'Home Loans'] },
    'Security':      { items: ['Security Guards', 'CCTV Monitoring', 'Cyber Security', 'Home Security', 'Office Security'] },
  },
  Products: {
    'Electronics':        { items: ['Smartphones', 'Tablets', 'Laptops', 'Desktop Computers', 'Smart Watches', 'Headphones', 'Earbuds', 'Speakers', 'Cameras', 'Printers', 'Computer Accessories'] },
    'IT & Office':        { items: ['Monitors', 'Keyboards', 'Mouse', 'Webcams', 'Routers', 'Networking Devices', 'Storage Devices', 'Office Printers', 'Projectors', 'UPS & Power Backup'] },
    'Home Appliances':    { items: ['Refrigerators', 'Washing Machines', 'Air Conditioners', 'Televisions', 'Microwave Ovens', 'Water Purifiers', 'Vacuum Cleaners', 'Air Coolers', 'Fans', 'Geysers'] },
    'Furniture':          { items: ['Sofas', 'Dining Tables', 'Beds', 'Mattresses', 'Wardrobes', 'Office Chairs', 'Office Tables', 'Study Tables', 'TV Units', 'Shoe Racks'] },
    'Fashion':            { items: ['Shirts', 'T-Shirts', 'Jeans', 'Watches', 'Accessories', 'Sarees', 'Kurtis', 'Dresses', 'Footwear', 'Handbags', 'Jewelry', 'Kids Clothing'] },
    'Beauty':             { items: ['Skincare', 'Haircare', 'Cosmetics', 'Perfumes', 'Grooming Products', 'Wellness Products'] },
    'Baby Care':          { items: ['Baby Food', 'Diapers', 'Baby Clothing', 'Baby Toys', 'Baby Care Products', 'Baby Accessories'] },
    'Sports & Fitness':   { items: ['Gym Equipment', 'Yoga Accessories', 'Sports Wear', 'Sports Equipment', 'Fitness Trackers', 'Cycling Accessories'] },
    'Books':              { items: ['Academic Books', 'Story Books', 'Notebooks', 'Office Stationery', 'Art Supplies', 'Educational Materials'] },
    'Gaming':             { items: ['Gaming Consoles', 'Gaming Accessories', 'VR Devices', 'Gaming Chairs', 'Gaming PCs'] },
    'Automobile':         { items: ['Car Accessories', 'Bike Accessories', 'Tyres', 'Vehicle Care Products', 'Safety Equipment', 'GPS Devices'] },
    'Home & Kitchen':     { items: ['Kitchen Appliances', 'Cookware', 'Storage Containers', 'Dining Sets', 'Home Decor', 'Lighting Products'] },
    'Pet Care':           { items: ['Pet Food', 'Pet Toys', 'Pet Accessories', 'Pet Grooming Products', 'Pet Healthcare'] },
    'Gardening':          { items: ['Plants', 'Gardening Tools', 'Outdoor Furniture', 'Seeds', 'Fertilizers'] },
    'Healthcare':         { items: ['Medical Equipment', 'Health Monitoring Devices', 'Wellness Products', 'Orthopedic Products', 'Personal Health Devices'] },
    'Business Products':  { items: ['Safety Equipment', 'Tools & Machinery', 'Office Supplies', 'Packaging Materials', 'Business Equipment'] },
  },
  'Daily Needs': {
    'Grocery':             { items: ['Rice', 'Wheat', 'Flour', 'Pulses', 'Dal', 'Sugar', 'Salt', 'Cooking Oil', 'Spices', 'Biscuits', 'Snacks', 'Noodles', 'Breakfast Cereals', 'Ready-to-Eat Foods', 'Dry Fruits'] },
    'Fruits & Vegetables': { items: ['Fresh Fruits', 'Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Pomegranate', 'Fresh Vegetables', 'Onion', 'Tomato', 'Potato', 'Carrot', 'Green Vegetables'] },
    'Dairy':               { items: ['Milk', 'Curd', 'Butter', 'Ghee', 'Cheese', 'Paneer', 'Yogurt', 'Ice Cream', 'Flavored Milk'] },
    'Water & Beverages':   { items: ['Drinking Water', 'Water Cans', 'Mineral Water', 'RO Water Delivery', 'Tea', 'Coffee', 'Juices', 'Soft Drinks', 'Energy Drinks', 'Health Drinks'] },
    'Household Essentials':{ items: ['Cleaning Products', 'Floor Cleaner', 'Toilet Cleaner', 'Disinfectants', 'Dishwash Liquid', 'Scrub Pads', 'Storage Containers', 'Buckets', 'Mops', 'Dustbins'] },
    'Personal Care':       { items: ['Soap', 'Body Wash', 'Shampoo', 'Conditioner', 'Face Wash', 'Razor', 'Trimmer', 'Hair Oil', 'Deodorants', 'Toothpaste', 'Toothbrush', 'Mouthwash'] },
    'Baby Care':           { items: ['Baby Diapers', 'Baby Wipes', 'Baby Powder', 'Baby Soap', 'Baby Shampoo', 'Baby Food', 'Feeding Bottles'] },
    'Pharmacy':            { items: ['Medicines', 'OTC Medicines', 'Pain Relief Products', 'Cold & Cough Remedies', 'Thermometer', 'BP Monitor', 'Glucose Monitor', 'First Aid Kit', 'Sanitizers'] },
    'Pet Care':            { items: ['Dog Food', 'Cat Food', 'Pet Shampoo', 'Pet Toys', 'Pet Accessories', 'Pet Medicines'] },
    'Bakery':              { items: ['Bread', 'Cakes', 'Buns', 'Cookies', 'Fresh Bakery Items'] },
    'Organic Products':    { items: ['Organic Vegetables', 'Organic Fruits', 'Organic Rice', 'Organic Spices', 'Natural Health Products'] },
    'Utility Products':    { items: ['Batteries', 'Power Banks', 'Chargers', 'LED Bulbs', 'Extension Boards', 'Inverters'] },
  },
  Food: {
    'Restaurants':          { items: ['Fine Dining', 'Family Restaurants', 'Casual Dining', 'Luxury Restaurants', 'Rooftop Restaurants', 'Buffet Restaurants', 'Theme Restaurants'] },
    'Fast Food':            { items: ['Burgers', 'Pizza', 'Sandwiches', 'French Fries', 'Wraps', 'Hot Dogs', 'Fried Chicken'] },
    'Cafes':                { items: ['Coffee Shops', 'Tea Cafes', 'Dessert Cafes', 'Co-working Cafes', 'Juice Cafes', 'Premium Lounges'] },
    'South Indian':         { items: ['Idli', 'Dosa', 'Uttapam', 'Pongal', 'Vada', 'Meals', 'Biryani'] },
    'North Indian':         { items: ['Roti', 'Naan', 'Paneer Dishes', 'Dal Varieties', 'Tandoori Items', 'Thali Meals'] },
    'Biryani':              { items: ['Chicken Biryani', 'Mutton Biryani', 'Veg Biryani', 'Dum Biryani', 'Fried Rice', 'Pulav'] },
    'Healthy Food':         { items: ['Salads', 'Diet Meals', 'Protein Meals', 'Organic Foods', 'Keto Foods', 'Vegan Foods'] },
    'Bakery':               { items: ['Cakes', 'Pastries', 'Cookies', 'Donuts', 'Brownies', 'Chocolates', 'Ice Cream'] },
    'Beverages':            { items: ['Tea', 'Coffee', 'Fresh Juice', 'Smoothies', 'Milkshakes', 'Soft Drinks', 'Energy Drinks'] },
    'International Cuisine':{ items: ['Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'Korean', 'Continental'] },
    'Non-Veg Specials':     { items: ['Chicken', 'Mutton', 'Fish', 'Seafood', 'Grill Items', 'BBQ'] },
    'Vegetarian Specials':  { items: ['Pure Veg Restaurants', 'Jain Food', 'Organic Food', 'Traditional Meals'] },
    'Home Food':            { items: ['Homemade Meals', 'Tiffin Services', 'Daily Lunch Plans', 'Healthy Home Food'] },
    'Catering':             { items: ['Wedding Catering', 'Birthday Catering', 'Corporate Catering', 'Event Catering', 'Bulk Orders'] },
    'Subscription Meals':   { items: ['Daily Breakfast', 'Daily Lunch', 'Daily Dinner', 'Monthly Meal Plans', 'Office Meal Plans'] },
    'Premium Dining':       { items: ['5-Star Hotels', 'Luxury Dining', 'Chef Specials', 'Exclusive Member Restaurants'] },
  },
  Stay: {
    'Hotels':                { items: ['Budget Hotels', 'Business Hotels', 'Premium Hotels', 'Luxury Hotels', '5-Star Hotels', 'Airport Hotels', 'Boutique Hotels'] },
    'Resorts':               { items: ['Beach Resorts', 'Hill Station Resorts', 'Family Resorts', 'Luxury Resorts', 'Wellness Resorts', 'Eco Resorts', 'Adventure Resorts'] },
    'Homestays':             { items: ['Family Homestays', 'Village Homestays', 'Luxury Homestays', 'Farm Stays', 'Heritage Homestays'] },
    'Service Apartments':    { items: ['Daily Rental', 'Weekly Rental', 'Monthly Rental', 'Corporate Apartments', 'Family Apartments'] },
    'Vacation Rentals':      { items: ['Villas', 'Holiday Homes', 'Farm Houses', 'Private Houses', 'Weekend Getaways'] },
    'Student Accommodation': { items: ['Boys Hostel', 'Girls Hostel', 'PG Accommodation', 'Student Apartments', 'College Hostels'] },
    'Corporate Stay':        { items: ['Business Hotels', 'Corporate Guest Houses', 'Executive Suites', 'Long-Term Business Stay'] },
    'Camping & Adventure':   { items: ['Tent Camping', 'Glamping', 'Forest Stay', 'Mountain Camps', 'Adventure Camps'] },
    'Heritage Stay':         { items: ['Palace Hotels', 'Heritage Resorts', 'Traditional Houses', 'Cultural Stays'] },
    'Couple Stay':           { items: ['Honeymoon Resorts', 'Romantic Hotels', 'Luxury Villas', 'Private Pool Villas'] },
    'Family Stay':           { items: ['Family Hotels', 'Family Resorts', 'Kid-Friendly Resorts', 'Holiday Packages'] },
    'Wellness Retreats':     { items: ['Yoga Retreats', 'Meditation Centers', 'Ayurveda Resorts', 'Wellness Retreats', 'Spa Resorts'] },
    'Medical Stay':          { items: ['Hospital Guest Houses', 'Medical Tourism Stay', 'Patient Accommodation', 'Caregiver Accommodation'] },
    'Religious Stay':        { items: ['Temple Guest Houses', 'Pilgrimage Hotels', 'Spiritual Retreats', 'Religious Accommodation'] },
    'Rental Accommodation':  { items: ['Flats', 'Apartments', 'Independent Houses', 'Shared Accommodation', 'Rental Villas'] },
    'International Stay':    { items: ['International Hotels', 'Global Resorts', 'Holiday Packages', 'Travel Accommodation'] },
  },
  Travel: {
    'Flight Booking':    { items: ['Domestic Flights', 'International Flights', 'One-Way Flights', 'Round Trip Flights', 'Multi-City Flights', 'Business Class', 'First Class', 'Charter Flights'] },
    'Train Booking':     { items: ['Express Trains', 'Superfast Trains', 'Premium Trains', 'Tatkal Booking', 'Tourist Trains', 'Luxury Trains'] },
    'Bus Booking':       { items: ['Government Buses', 'Private Buses', 'Sleeper Buses', 'AC Buses', 'Luxury Coaches', 'Volvo Services'] },
    'Cab Services':      { items: ['Local Taxi', 'Airport Transfer', 'Outstation Cabs', 'Luxury Cars', 'Chauffeur Services', 'Self-Drive Cars'] },
    'Car Rental':        { items: ['Self Drive Cars', 'Monthly Rental', 'Luxury Car Rental', 'Corporate Rental', 'Tourist Vehicles'] },
    'Bike Rental':       { items: ['Scooters', 'Motorcycles', 'Premium Bikes', 'Adventure Bikes'] },
    'Tour Packages':     { items: ['Domestic Tours', 'International Tours', 'Weekend Trips', 'Family Packages', 'Group Tours', 'Couple Packages'] },
    'Honeymoon Packages':{ items: ['Beach Destinations', 'Hill Stations', 'International Honeymoon', 'Luxury Honeymoon Resorts'] },
    'Family Travel':     { items: ['Family Holiday Packages', 'Theme Parks', 'Resorts', 'Family Adventures'] },
    'Corporate Travel':  { items: ['Business Flights', 'Hotel Booking', 'Corporate Cab Services', 'Employee Travel Management'] },
    'Adventure Travel':  { items: ['Trekking', 'Camping', 'Wildlife Safari', 'Mountain Climbing', 'Water Sports', 'Adventure Tours'] },
    'Religious Travel':  { items: ['Temple Tours', 'Pilgrimage Packages', 'Spiritual Retreats', 'Holy City Tours'] },
    'Holiday Packages':  { items: ['Beach Holidays', 'Hill Station Holidays', 'Island Vacations', 'Cruise Vacations'] },
    'Cruise Travel':     { items: ['Domestic Cruises', 'International Cruises', 'Luxury Cruises', 'Family Cruises'] },
    'Visa Services':     { items: ['Tourist Visa', 'Business Visa', 'Student Visa', 'Work Visa', 'Visa Consultation'] },
    'Passport Services': { items: ['New Passport', 'Renewal', 'Tatkal Passport', 'Passport Assistance'] },
    'International Travel':{ items: ['International Flights', 'International Hotels', 'Global Packages', 'Travel Assistance'] },
    'Travel Essentials': { items: ['Travel Insurance', 'Forex Services', 'SIM Cards', 'Travel Accessories', 'Airport Lounge Access'] },
    'Emergency Travel':  { items: ['Medical Emergency Travel', 'Emergency Ticket Booking', 'Travel Support', 'Insurance Claims'] },
  },
  Jobs: {
    'Banking':          { items: ['Relationship Manager', 'Sales Officer', 'Branch Operations', 'Customer Service Executive', 'Credit Analyst', 'Loan Officer', 'Branch Manager', 'Wealth Manager'] },
    'IT':               { items: ['Software Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Mobile App Developer', 'UI/UX Designer', 'DevOps Engineer', 'Data Analyst', 'AI Engineer'] },
    'Non-IT':           { items: ['Admin Executive', 'Office Assistant', 'Data Entry Operator', 'Operations Executive', 'Coordinator', 'Receptionist', 'Back Office Executive'] },
    'BPO':              { items: ['Voice Process', 'Non-Voice Process', 'Customer Support', 'Technical Support', 'Chat Support', 'International Process', 'Domestic Process'] },
    'Sales & Marketing':{ items: ['Sales Executive', 'Business Development Executive', 'Marketing Executive', 'Digital Marketing Executive', 'Territory Sales Manager', 'Area Sales Manager'] },
    'Manufacturing':    { items: ['Production Operator', 'Machine Operator', 'Quality Inspector', 'Production Supervisor', 'Plant Manager', 'Maintenance Technician'] },
    'Automobile':       { items: ['Service Advisor', 'Technician', 'Sales Consultant', 'Workshop Manager', 'Spare Parts Executive'] },
    'Healthcare':       { items: ['Doctors', 'Nurses', 'Pharmacists', 'Lab Technicians', 'Medical Representatives', 'Hospital Administrators'] },
    'Education':        { items: ['Teachers', 'Professors', 'Trainers', 'Academic Counselors', 'School Administrators', 'Placement Officers'] },
    'Hospitality':      { items: ['Hotel Manager', 'Front Office Executive', 'Housekeeping Staff', 'Chef', 'Waiter', 'Restaurant Manager'] },
    'Travel & Tourism': { items: ['Travel Consultant', 'Tour Coordinator', 'Ticketing Executive', 'Visa Consultant', 'Travel Operations Executive'] },
    'Real Estate':      { items: ['Property Consultant', 'Sales Executive', 'Site Engineer', 'CRM Executive', 'Real Estate Manager'] },
    'Legal':            { items: ['Advocate', 'Legal Associate', 'Legal Advisor', 'Documentation Executive'] },
    'Finance':          { items: ['Accountant', 'Finance Executive', 'Tax Consultant', 'Auditor', 'Chartered Accountant'] },
    'Logistics':        { items: ['Warehouse Executive', 'Logistics Coordinator', 'Supply Chain Analyst', 'Delivery Executive'] },
    'Construction':     { items: ['Civil Engineer', 'Site Supervisor', 'Project Manager', 'Architect', 'Quantity Surveyor'] },
    'Creative':         { items: ['Graphic Designer', 'Video Editor', 'Animator', 'Content Writer', 'Social Media Manager'] },
    'Retail':           { items: ['Store Manager', 'Cashier', 'Retail Sales Executive', 'Inventory Executive'] },
    'HR & Recruitment': { items: ['HR Executive', 'Recruiter', 'Talent Acquisition Specialist', 'HR Manager'] },
    'Government':       { items: ['State Government Jobs', 'Central Government Jobs', 'Railway Jobs', 'Defense Jobs', 'PSU Jobs'] },
    'International':    { items: ['Gulf Jobs', 'Europe Jobs', 'Singapore Jobs', 'Malaysia Jobs', 'Canada Jobs', 'Australia Jobs'] },
    'Internships':      { items: ['IT Internship', 'HR Internship', 'Marketing Internship', 'Banking Internship', 'Finance Internship'] },
    'Freelance & Remote':{ items: ['Remote Developer', 'Remote Designer', 'Virtual Assistant', 'Freelance Writer', 'Online Tutor'] },
  },
};

const MEGA_MENU_LINKS = ['Services', 'Products', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Jobs'];

const ROLE_CONFIG = {
  admin: { label: 'Admin', icon: Shield, cls: 'text-rose-400' },
  vendor: { label: 'Vendor', icon: ShoppingBag, cls: 'text-violet-400' },
  employer: { label: 'Employer', icon: Briefcase, cls: 'text-sky-400' },
  user: { label: 'Member', icon: User, cls: 'text-emerald-400' },
  visitor: { label: 'Guest', icon: Globe, cls: 'text-amber-400' },
};

/* ══════════════════════════════════════════════════════════════
   GLASSMORPHIC MEGA DROPDOWN  (matches CustomerDashboard style)
   ══════════════════════════════════════════════════════════════ */
function GlassMegaDropdown({ menuKey, onClose, onCategoryClick, setIsJobsOpen, onMouseEnter, onMouseLeave }) {
  const data = MENU_DATA[menuKey] || {};
  const cats = Object.keys(data);
  const [activeCat, setActiveCat] = useState('ALL');

  // Reset category when menu changes
  useEffect(() => { setActiveCat('ALL'); }, [menuKey]);

  // Build items list
  let items = [];
  let title = '';
  if (activeCat === 'ALL') {
    title = `All ${menuKey}`;
    cats.forEach(cat => {
      const catData = data[cat];
      if (catData?.items) items = [...items, ...catData.items];
    });
    items = Array.from(new Set(items));
  } else {
    const activeData = data[activeCat];
    if (activeData) {
      items = activeData.items || [];
      title = activeCat;
    }
  }

  const handleItemClick = (item) => {
    if (menuKey === 'Jobs') {
      setIsJobsOpen(true);
    } else {
      onCategoryClick(item, true);
    }
    onClose();
  };

  return (
    <div
      className="absolute left-6 right-6 top-[calc(100%+2px)] bg-white/95 dark:bg-[#0a192f]/95 backdrop-blur-md shadow-2xl border border-slate-200/80 dark:border-slate-800/60 rounded-2xl py-8 px-8 z-50 flex animate-slide-up"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* LEFT PANEL — categories */}
      <div className="w-full md:w-1/4 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-4 md:pb-0 pr-0 md:pr-6 text-left shrink-0 max-h-[400px] overflow-y-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block pl-2">
          Main Categories
        </span>

        {/* ALL Button */}
        <button
          onClick={() => setActiveCat('ALL')}
          className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-between group/cat shrink-0 ${
            activeCat === 'ALL'
              ? 'bg-[#0b1e36] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>All</span>
          <ChevronRight className={`w-3.5 h-3.5 opacity-60 group-hover/cat:translate-x-0.5 transition-transform ${activeCat === 'ALL' ? 'text-amber-400' : 'text-slate-400'}`} size={14} />
        </button>

        {cats.map((cat) => {
          const isActive = activeCat === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`w-full text-left py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none flex items-center justify-between group/cat shrink-0 ${
                isActive
                  ? 'bg-[#0b1e36] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{cat}</span>
              <ChevronRight className={`w-3.5 h-3.5 opacity-60 group-hover/cat:translate-x-0.5 transition-transform ${isActive ? 'text-amber-400' : 'text-slate-400'}`} size={14} />
            </button>
          );
        })}
      </div>

      {/* RIGHT PANEL — items */}
      <div className="flex-grow pl-0 md:pl-6 text-left max-h-[400px] overflow-y-auto pr-2">
        <div className="flex justify-between items-baseline mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {title}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleItemClick(item)}
              className="p-3 border border-slate-200/60 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-amber-400 dark:hover:border-amber-400 rounded-xl flex justify-between items-center group/item transition-all cursor-pointer hover:shadow-xs text-left w-full text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-gold-dark dark:hover:text-brand-gold"
            >
              <span>{item}</span>
              <div className="w-5 h-5 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover/item:bg-amber-400 dark:group-hover/item:bg-amber-400 text-slate-400 group-hover/item:text-slate-900 transition-colors">
                <Plus size={10} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NAVBAR COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function Navbar({
  theme,
  toggleTheme,
  currentUser,
  onLogOut,
  onAuthClick,
  onHomeClick,
  onCategoryClick,
  setIsJobsOpen,
  onDashboardClick
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);
  const leaveTimeoutRef = useRef(null);
  const navRef = useRef(null);

  // ── Hover timing helpers (same pattern as CustomerDashboard) ──
  const handleMouseEnter = (menuName) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    setOpenMenu(menuName);
  };

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 150);
  };

  const cancelLeave = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
  };

  const role = currentUser ? (currentUser.role || 'user') : 'visitor';
  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.visitor;

  const closeAll = () => {
    setOpenMenu(null);
    setIsMobileMenuOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') closeAll(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Hide Navbar when scrolling inside Ecosystem section
  useEffect(() => {
    const handleScroll = () => {
      const servicesEl = document.getElementById('services');
      if (!servicesEl) {
        setHideNavbar(false);
        return;
      }
      const rect = servicesEl.getBoundingClientRect();
      // Hide if the viewport top is within the services section height (allowing some tolerance)
      if (rect.top <= 0 && rect.bottom > 72) {
        setHideNavbar(true);
      } else {
        setHideNavbar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuConfig = [
    { label: 'SERVICES',    menuKey: 'Services' },
    { label: 'PRODUCTS',    menuKey: 'Products' },
    { label: 'DAILY NEEDS', menuKey: 'Daily Needs' },
    { label: 'FOOD',        menuKey: 'Food' },
    { label: 'STAY',        menuKey: 'Stay' },
    { label: 'TRAVEL',      menuKey: 'Travel' },
    { label: 'MEMBERSHIP',  menuKey: null },
    { label: 'JOBS',        menuKey: 'Jobs' },
  ];

  const handleLinkClick = (link) => {
    if (link.label === 'MEMBERSHIP') {
      const el = document.getElementById('pricing');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onHomeClick();
        setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else if (link.label === 'JOBS') {
      setIsJobsOpen(true);
    } else {
      onCategoryClick(link.label.charAt(0) + link.label.slice(1).toLowerCase().replace(' needs', ' Needs'));
    }
    closeAll();
  };

  return (
    <div
      className={`sticky top-0 z-40 w-full transition-all duration-500 transform ${
        hideNavbar ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
      ref={navRef}
    >
      {/* ── HEADER BAR ── */}
      <header className="w-full bg-[#0b132b] border-b border-[#1c2541]/40 text-white">
        <div className="max-w-screen-2xl mx-auto px-6 h-[72px] flex items-center justify-between">

          {/* LEFT: BRAND LOGO */}
          <button
            onClick={() => { onHomeClick(); closeAll(); }}
            className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
          >
            <img
              src={logoImg}
              alt="Connect App Logo"
              className="h-8 w-8 rounded-full object-contain border border-[#f5a800] shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-extrabold text-[15px] sm:text-[16px] tracking-wider text-white uppercase font-sans">
              Connect App
            </span>
          </button>

          {/* CENTER: NAV LINKS (DESKTOP) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {menuConfig.map((link) => {
              const isOpen = openMenu === link.menuKey && link.menuKey !== null;
              return (
                <button
                  key={link.label}
                  onMouseEnter={(e) => {
                    if (link.menuKey) {
                      handleMouseEnter(link.menuKey);
                    } else {
                      handleMouseLeave();
                    }
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    if (link.menuKey) {
                      handleMouseLeave();
                    }
                    if (!isOpen) e.currentTarget.style.color = '#94a3b8';
                  }}
                  onClick={() => handleLinkClick(link)}
                  className="px-3.5 py-2 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all duration-150 cursor-pointer select-none relative"
                  style={{ color: isOpen ? '#f5a800' : '#94a3b8' }}
                >
                  {link.label}
                  {isOpen && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#f5a800]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT: CONTROLS (DESKTOP) */}
          <div className="hidden lg:flex items-center gap-4 justify-end">
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2.5 rounded-full hover:bg-[#1c2541]/40 text-amber-400 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={15.5} /> : <Moon size={15.5} />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { onLogOut(); onAuthClick('login'); }}
                  className="px-3.5 py-1.5 bg-[#f5a800] hover:bg-[#d48e00] text-slate-950 rounded-full text-[10.5px] font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm font-sans"
                >
                  Login
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => onAuthClick('login')}
                  className="px-3.5 py-1.5 bg-[#f5a800] hover:bg-[#d48e00] text-slate-950 rounded-full text-[10.5px] font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm font-sans"
                >
                  Login
                </button>
                <button
                  onClick={() => onAuthClick('register')}
                  className="text-[11px] font-bold tracking-widest uppercase border border-[#f5a800] text-[#f5a800] hover:bg-[#f5a800]/10 px-4 py-1.5 rounded-full transition-all cursor-pointer"
                >
                  Join Now
                </button>
              </div>
            )}
          </div>

          {/* MOBILE CONTROLS */}
          <div className="flex lg:hidden items-center gap-3">
            <button onClick={toggleTheme} className="p-2 text-amber-400 transition-colors cursor-pointer">
              {theme === 'dark' ? <Sun size={15.5} /> : <Moon size={15.5} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </header>

      {/* ── GLASSMORPHIC MEGA DROPDOWN (DESKTOP) ── */}
      <div
        className="hidden lg:block relative w-full"
        onMouseEnter={cancelLeave}
        onMouseLeave={handleMouseLeave}
      >
        {openMenu && MEGA_MENU_LINKS.includes(openMenu) && (
          <GlassMegaDropdown
            menuKey={openMenu}
            onClose={() => setOpenMenu(null)}
            onCategoryClick={onCategoryClick}
            setIsJobsOpen={setIsJobsOpen}
            onMouseEnter={cancelLeave}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </div>

      {/* ── MOBILE MENU ── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden w-full bg-[#0b132b] border-b border-[#1c2541]/40 flex flex-col py-4 px-6 gap-3.5 shadow-xl animate-fade-in">
          {menuConfig.map((link) => (
            <button
              key={link.label}
              onClick={() => handleLinkClick(link)}
              className="w-full text-left py-2.5 border-b border-[#1c2541]/20 text-[11px] font-bold tracking-widest uppercase text-slate-400 hover:text-[#f5a800] transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}

          {currentUser ? (
            <div className="flex flex-col gap-3.5 mt-2.5">
              <button
                onClick={() => { onLogOut(); onAuthClick('login'); closeAll(); }}
                className="w-full text-center py-2 bg-[#f5a800] hover:bg-[#d48e00] text-slate-950 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Login
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2.5">
              <button
                onClick={() => onAuthClick('login')}
                className="w-full text-center py-2 bg-[#f5a800] hover:bg-[#d48e00] text-slate-950 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => onAuthClick('register')}
                className="w-full text-center py-2 border border-[#f5a800] text-[#f5a800] hover:bg-[#f5a800]/10 rounded-full text-[11px] font-bold tracking-widest uppercase cursor-pointer"
              >
                Join Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
