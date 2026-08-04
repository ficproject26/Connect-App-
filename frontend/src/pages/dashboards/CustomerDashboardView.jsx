import React, { useState } from 'react';
import { 
  ShoppingBag, Briefcase, Utensils, BedDouble, Plane, Sparkles, 
  Search, Star, Plus, MapPin, SlidersHorizontal, ShieldCheck, 
  TrendingUp, Clock, CheckCircle2, ArrowRight
} from 'lucide-react';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export default function CustomerDashboardView({
  products = [],
  loading = false,
  onCategoryClick,
  onJobsClick,
  onProductClick
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubTab, setSelectedSubTab] = useState('All');

  const mainCategories = [
    { name: 'Products', icon: ShoppingBag, color: 'text-amber-500 bg-amber-500/10' },
    { name: 'Services', icon: Briefcase, color: 'text-blue-500 bg-blue-500/10' },
    { name: 'Daily Needs', icon: Sparkles, color: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'Food', icon: Utensils, color: 'text-orange-500 bg-orange-500/10' },
    { name: 'Stay', icon: BedDouble, color: 'text-purple-500 bg-purple-500/10' },
    { name: 'Travel', icon: Plane, color: 'text-sky-500 bg-sky-500/10' },
  ];

  const subFilterTabs = ['All', 'Smartphones', 'Sarees', 'Hotels', 'Appliance Repair', 'Gourmet Food', 'Travel Tickets'];

  const filteredProducts = products.filter(item => {
    const matchesSearch = !searchQuery || (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedSubTab === 'All' || item.category === selectedSubTab || item.subNavbarCategory === selectedSubTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">

      {/* ── HERO BANNER & STATS ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0b132b] via-[#1c2541] to-[#0b132b] p-6 sm:p-8 lg:p-10 border border-slate-800 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400/20 border border-amber-400/40 text-amber-300">
            <Sparkles size={12} /> Enterprise Customer Hub
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-sans tracking-tight text-white leading-tight">
            Discover & Book India's Finest Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Instant doorstep delivery, certified professionals, luxury stays, and exclusive member discounts across all major cities.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative z-10 mt-6 max-w-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, doorstep services, luxury stays, food..."
              className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />
          </div>
        </div>

        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── CATEGORIES NAVIGATION ── */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
            Explore Categories
          </h2>
          <span className="text-xs font-bold text-amber-500 hover:underline cursor-pointer">
            View All
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {mainCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => onCategoryClick && onCategoryClick(cat.name)}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2.5 hover:border-amber-400 dark:hover:border-amber-400 transition-all cursor-pointer shadow-xs group text-center"
              >
                <div className={`p-3 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition-colors">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SUB-NAVBAR FILTER PILLS ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <SlidersHorizontal size={16} className="text-slate-400 shrink-0 mr-1" />
        {subFilterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedSubTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none shrink-0 ${
              selectedSubTab === tab
                ? 'bg-[#0b132b] text-white dark:bg-amber-400 dark:text-slate-950 shadow-sm font-extrabold'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── PRODUCTS & SERVICES GRID ── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-sans">
            Featured Offerings ({filteredProducts.length})
          </h2>
        </div>

        {loading ? (
          <SkeletonLoader count={8} type="card" />
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
            <ShoppingBag size={40} className="mx-auto text-slate-400" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No matching items found</h3>
            <p className="text-xs text-slate-500">Try adjusting your filter or search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id || idx}
                onClick={() => onProductClick && onProductClick(product)}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80'}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-950/80 backdrop-blur-sm text-amber-400 rounded-full text-[9.5px] font-black uppercase tracking-wider">
                    {product.category || 'Featured'}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description || 'Verified Connect partner listing with instant booking.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        ₹{(product.price || 999).toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-[11px] rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer border-none"
                    >
                      <Plus size={12} /> Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
