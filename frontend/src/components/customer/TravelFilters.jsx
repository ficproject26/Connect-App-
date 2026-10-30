import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  SlidersHorizontal,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  RotateCcw,
  Search,
  X,
  Bus,
  Car,
  Check,
  ChevronDown,
  Sparkles,
  ArrowRightLeft,
  Navigation,
  Plane,
  Star,
  ArrowUpDown,
  Coins
} from 'lucide-react';
import { BookingDateInput, BookingTimeInput } from '../common/BookingDateTimePicker';

/**
 * TravelFilters Component (Modal Portal Edition)
 *
 * Implements a category-aware dynamic filtering and search experience as a
 * perfectly centered, zero-scroll popup modal mounted directly to document.body
 * via React Portal.
 *
 * Architectural Invariants:
 * - True Viewport Centering: Uses React Portal into document.body to decouple from
 *   any transformed or scrolling parent containers in the page flow.
 * - Full Dark Blurred Backdrop: Covers 100% of the browser viewport (including header/nav).
 * - Dual-Target Background Scroll Locking: Locks document.body and document.documentElement.
 * - Compact Zero-Scroll Layout: Total height ~360px–380px, fitting comfortably on any
 *   desktop/laptop display without vertical clipping or inner scrollbars.
 * - 100% Feature Parity: Zero changes to filter logic, route swap, date/time pickers, or budget slider.
 */
export default function TravelFilters({
  isOpen = false,
  onClose,
  activeSubCat = 'ALL',
  onSelectSubCat,
  selectedChildCat = '',
  onSelectChildCat,
  availableSubCategories = [], // ['Bus', 'Cab'] from DB
  categoryTaxonomy = {},       // { Bus: ['A/C Sleeper', 'Seater'], Cab: [] } from DB
  travelFromOptions = [],
  travelToOptions = [],
  priceBounds = { min: 0, max: 2500 },
  initialFilters = {},
  onApplyFilters,
  onCancelFilters,
  onResetFilters,
  totalResultsCount = 0,
  theme = 'light'
}) {
  // Committed filter values passed from parent
  const defaultFilters = useMemo(() => ({
    from: '',
    to: '',
    date: '',
    timeSlot: 'all', // 'all' | 'morning' | 'afternoon' | 'evening' | 'night'
    exactTime: '',
    maxPrice: priceBounds.max || 2500,
    minPrice: priceBounds.min || 0,
    vehicleClass: 'all', // 'all' | 'sleeper' | 'seater' (for Bus)
    acPreference: 'all', // 'all' | 'ac' | 'non-ac' (for Bus)
    cabType: 'all',      // 'all' | dynamic (for Cab)
    rating: null,
    sortBy: 'popularity',
    ...initialFilters
  }), [initialFilters, priceBounds]);

  // Draft filter state (uncommitted until "Apply Filters & Search" is clicked)
  const [draft, setDraft] = useState(defaultFilters);

  // Synchronize draft when initialFilters or priceBounds change externally
  useEffect(() => {
    setDraft(prev => ({
      ...prev,
      ...initialFilters,
      maxPrice: initialFilters.maxPrice !== undefined ? initialFilters.maxPrice : (prev.maxPrice || priceBounds.max)
    }));
  }, [initialFilters, priceBounds, isOpen]);

  // Dual-target scroll lock: Locks both body & documentElement to prevent background scrolling
  useEffect(() => {
    if (isOpen && typeof document !== 'undefined') {
      const origBodyOverflow = document.body.style.overflow;
      const origDocOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origBodyOverflow;
        document.documentElement.style.overflow = origDocOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, defaultFilters]);

  const isBusSelected = activeSubCat === 'Bus';
  const isCabSelected = activeSubCat === 'Cab';
  const isAllSelected = !activeSubCat || activeSubCat === 'ALL';

  // Get active Level 3 child categories for currently active subcategory
  const currentChildCategories = useMemo(() => {
    if (isAllSelected) {
      return Array.from(new Set(Object.values(categoryTaxonomy).flat())).filter(Boolean);
    }
    return (categoryTaxonomy[activeSubCat] || []).filter(Boolean);
  }, [categoryTaxonomy, activeSubCat, isAllSelected]);

  // Handle draft field update
  const updateDraft = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  // Swap From and To locations
  const handleSwapLocations = () => {
    setDraft(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  // Close (X) / Dismiss action: reverts draft and closes modal
  const handleClose = () => {
    setDraft(defaultFilters);
    if (typeof onCancelFilters === 'function') {
      onCancelFilters();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // Cancel Action: Reverts draft filters back to committed filters and closes modal
  const handleCancel = () => {
    setDraft(defaultFilters);
    if (typeof onCancelFilters === 'function') {
      onCancelFilters();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // Apply Action: Commits draft filters to parent and closes modal
  const handleApply = (e) => {
    if (e) e.preventDefault();
    if (typeof onApplyFilters === 'function') {
      onApplyFilters(draft);
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // Reset Action: Clears all draft and committed filters
  const handleReset = () => {
    const cleared = {
      from: '',
      to: '',
      date: '',
      timeSlot: 'all',
      exactTime: '',
      maxPrice: priceBounds.max || 2500,
      minPrice: priceBounds.min || 0,
      vehicleClass: 'all',
      acPreference: 'all',
      cabType: 'all',
      rating: null,
      sortBy: 'popularity'
    };
    setDraft(cleared);
    if (typeof onResetFilters === 'function') {
      onResetFilters(cleared);
    }
  };

  // Today's ISO date string for minDate in calendar
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Time slot quick options
  const timeSlotOptions = [
    { id: 'all', label: 'All Times', sub: '24 Hours' },
    { id: 'morning', label: 'Morning', sub: '6 AM - 12 PM' },
    { id: 'afternoon', label: 'Afternoon', sub: '12 PM - 5 PM' },
    { id: 'evening', label: 'Evening', sub: '5 PM - 9 PM' },
    { id: 'night', label: 'Night', sub: '9 PM - 6 AM' }
  ];

  // Has active uncommitted or committed filters
  const hasActiveFilters = Boolean(
    draft.from ||
    draft.to ||
    draft.date ||
    draft.timeSlot !== 'all' ||
    draft.exactTime ||
    (draft.maxPrice && draft.maxPrice < priceBounds.max) ||
    draft.vehicleClass !== 'all' ||
    draft.acPreference !== 'all' ||
    draft.cabType !== 'all' ||
    draft.rating !== null ||
    selectedChildCat
  );

  // If modal is not open, do not render modal contents
  if (!isOpen) return null;

  // React Portal content mounted directly to document.body for true viewport centering
  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="travel-filter-modal-title"
    >
      {/* 1. Backdrop Overlay (Covers 100% of visible viewport including Navbar & Header) */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 2. Perfectly Centered Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 md:p-6 pointer-events-none">
        <div
          className="pointer-events-auto relative w-full max-w-4xl bg-white dark:bg-[#0b1329] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden text-left animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ================= 1. COMPACT FIXED HEADER ================= */}
          <div className="shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-white dark:bg-[#0b1329]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-4 h-4 stroke-[2.3]" />
              </div>
              <div>
                <h2
                  id="travel-filter-modal-title"
                  className="text-base sm:text-lg font-black text-[#0B1728] dark:text-white tracking-tight leading-tight"
                >
                  Travel Category & Filters
                </h2>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 leading-none mt-0.5">
                  Find the right travel option
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer border-none shadow-2xs shrink-0"
            >
              <X className="w-4 h-4 stroke-[2.4]" />
            </button>
          </div>

          {/* ================= 2. COMPACT CATEGORY SELECTION ================= */}
          <div className="shrink-0 px-5 sm:px-6 py-2 border-b border-slate-100 dark:border-slate-800/80 space-y-1.5 bg-slate-50/50 dark:bg-slate-900/40">
            {/* Level 2 Subcategory Pills (All Travel, Bus, Cab) */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (typeof onSelectSubCat === 'function') onSelectSubCat('ALL');
                  if (typeof onSelectChildCat === 'function') onSelectChildCat('');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isAllSelected
                    ? 'bg-[#0B1728] text-white border-[#0B1728] dark:bg-amber-400 dark:text-[#0b1e36] dark:border-amber-400 shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>All Travel</span>
              </button>

              {availableSubCategories.map((subName) => {
                const isSubActive = !isAllSelected && activeSubCat.toLowerCase() === subName.toLowerCase();
                const SubIcon = subName.toLowerCase().includes('bus') ? Bus : Car;
                return (
                  <button
                    key={subName}
                    type="button"
                    onClick={() => {
                      if (typeof onSelectSubCat === 'function') onSelectSubCat(subName);
                      if (typeof onSelectChildCat === 'function') onSelectChildCat('');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer border flex items-center gap-1.5 ${
                      isSubActive
                        ? 'bg-[#0B1728] text-white border-[#0B1728] dark:bg-amber-400 dark:text-[#0b1e36] dark:border-amber-400 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <SubIcon className="w-3.5 h-3.5" />
                    <span>{subName}</span>
                  </button>
                );
              })}
            </div>

            {/* Level 3 Child Category Chips (e.g. A/C Sleeper, Seater) */}
            {currentChildCategories.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
                  Types:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof onSelectChildCat === 'function') onSelectChildCat('');
                  }}
                  className={`px-3 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                    !selectedChildCat
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300 font-black shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  All Types
                </button>
                {currentChildCategories.map((childName) => {
                  const isChildActive = selectedChildCat && selectedChildCat.toLowerCase() === childName.toLowerCase();
                  return (
                    <button
                      key={childName}
                      type="button"
                      onClick={() => {
                        if (typeof onSelectChildCat === 'function') {
                          onSelectChildCat(isChildActive ? '' : childName);
                        }
                      }}
                      className={`px-3 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                        isChildActive
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300 font-black shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {isChildActive && <Check className="w-3 h-3 stroke-[3]" />}
                      <span>{childName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ================= 3. COMPACT FORM BODY WITH STICKY FOOTER ================= */}
          <form onSubmit={handleApply} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Scrollable Filter Controls Content (Only scrolls if viewport is extremely short) */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-3 sm:py-3.5 space-y-2.5 sm:space-y-3 scrollbar-thin">
              {/* Row 1: Departure, Destination, Date, Departure Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 items-start">
                {/* 1. From / Departure */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between h-3.5">
                    <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{isCabSelected ? 'Pickup Location' : 'From / Departure'}</span>
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={draft.from}
                      onChange={(e) => updateDraft('from', e.target.value)}
                      className="w-full h-8.5 appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-3 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none transition-all truncate pr-7 shadow-2xs"
                    >
                      <option value="">{isCabSelected ? 'Pickup Point (All)' : 'From: All Locations'}</option>
                      {travelFromOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Destination with Swap Button */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between h-3.5">
                    <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{isCabSelected ? 'Destination / Drop' : 'To / Destination'}</span>
                    </label>
                    {(draft.from || draft.to) && (
                      <button
                        type="button"
                        onClick={handleSwapLocations}
                        className="text-[9.5px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-0.5 cursor-pointer border-none bg-transparent p-0 transition-colors"
                        title="Swap Origin and Destination"
                      >
                        <ArrowRightLeft className="w-2.5 h-2.5" />
                        <span>Swap</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={draft.to}
                      onChange={(e) => updateDraft('to', e.target.value)}
                      className="w-full h-8.5 appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-3 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none transition-all truncate pr-7 shadow-2xs"
                    >
                      <option value="">{isCabSelected ? 'Destination (All)' : 'To: All Destinations'}</option>
                      {travelToOptions.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 3. Travel Date with Calendar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between h-3.5">
                    <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Travel Date</span>
                    </label>
                    {draft.date && (
                      <button
                        type="button"
                        onClick={() => updateDraft('date', '')}
                        className="text-[9px] font-bold text-slate-400 hover:text-red-500 cursor-pointer border-none bg-transparent p-0 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <BookingDateInput
                    label=""
                    value={draft.date}
                    onChange={(val) => updateDraft('date', val)}
                    minDate={todayStr}
                    accentColor="blue"
                    className="w-full text-xs [&_input]:!h-8.5 [&_input]:!py-0 [&_input]:!text-xs rounded-lg"
                  />
                </div>

                {/* 4. Departure / Pickup Time */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between h-3.5">
                    <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{isCabSelected ? 'Pickup Time' : 'Departure Time'}</span>
                    </label>
                    {draft.exactTime && (
                      <button
                        type="button"
                        onClick={() => updateDraft('exactTime', '')}
                        className="text-[9px] font-bold text-slate-400 hover:text-red-500 cursor-pointer border-none bg-transparent p-0 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <BookingTimeInput
                    label=""
                    value={draft.exactTime}
                    onChange={(val) => updateDraft('exactTime', val)}
                    accentColor="blue"
                    className="w-full text-xs [&_input]:!h-8.5 [&_input]:!py-0 [&_input]:!text-xs rounded-lg"
                  />
                </div>
              </div>

              {/* Row 2: Timing Window & Budget Range Slider */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
                {/* Timing Window (5 options) */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between h-3.5">
                    <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Timing Window</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {timeSlotOptions.map((slot) => {
                      const isSelected = draft.timeSlot === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => updateDraft('timeSlot', slot.id)}
                          className={`h-11 px-1 text-center rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300 font-extrabold shadow-2xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <span className="text-[10px] font-black truncate leading-tight">{slot.label}</span>
                          <span className="text-[8px] text-slate-400 dark:text-slate-500 truncate leading-none mt-0.5">
                            {slot.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Range Slider */}
                <div className="lg:col-span-6 bg-slate-50/70 dark:bg-slate-900/60 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-1">
                  <div className="flex items-center justify-between text-xs h-3.5">
                    <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Budget Range Slider</span>
                    </span>
                    <span className="font-extrabold text-white bg-[#FF9800] text-[10.5px] px-2.5 py-0.5 rounded-full shadow-xs leading-none">
                      Up to ₹{(draft.maxPrice || priceBounds.max).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-[9.5px] font-bold text-slate-400 font-mono">
                      ₹{priceBounds.min.toLocaleString()}
                    </span>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={Math.max(priceBounds.max, 2000)}
                      step={50}
                      value={draft.maxPrice || priceBounds.max}
                      onChange={(e) => updateDraft('maxPrice', Number(e.target.value))}
                      className="w-full accent-[#FF9800] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                    <span className="text-[9.5px] font-bold text-slate-400 font-mono">
                      ₹{Math.max(priceBounds.max, 2000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 3: Vehicle Class, AC Preference, Customer Rating, Sort By */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCabSelected ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-2.5 sm:gap-3 items-start`}>
                {/* Bus Specific / General: Vehicle Class */}
                {!isCabSelected && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between h-3.5">
                      <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                        <Bus className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Vehicle Class</span>
                      </label>
                    </div>
                    <div className="relative">
                      <select
                        value={draft.vehicleClass}
                        onChange={(e) => updateDraft('vehicleClass', e.target.value)}
                        className="w-full h-8.5 appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-3 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none shadow-2xs pr-7"
                      >
                        <option value="all">All Classes (Sleeper & Seater)</option>
                        <option value="sleeper">Sleeper Only</option>
                        <option value="seater">Seater Only</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Bus Specific / General: AC Preference */}
                {!isCabSelected && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between h-3.5">
                      <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>AC Preference</span>
                      </label>
                    </div>
                    <div className="relative">
                      <select
                        value={draft.acPreference}
                        onChange={(e) => updateDraft('acPreference', e.target.value)}
                        className="w-full h-8.5 appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-3 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none shadow-2xs pr-7"
                      >
                        <option value="all">All (AC & Non-AC)</option>
                        <option value="ac">AC Only</option>
                        <option value="non-ac">Non-AC Only</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Cab Specific: Cab Types */}
                {isCabSelected && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between h-3.5">
                      <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Cab Type</span>
                      </label>
                    </div>
                    <div className="relative">
                      <select
                        value={draft.cabType}
                        onChange={(e) => updateDraft('cabType', e.target.value)}
                        className="w-full h-8.5 appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-3 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none shadow-2xs pr-7"
                      >
                        <option value="all">All Cab Types</option>
                        {(currentChildCategories.length > 0 ? currentChildCategories : ['Sedan', 'SUV', 'Hatchback', 'Prime']).map((ct) => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Minimum Rating */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between h-3.5">
                    <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Customer Rating</span>
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={draft.rating === null ? '' : String(draft.rating)}
                      onChange={(e) => updateDraft('rating', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full h-8.5 appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-3 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none shadow-2xs pr-7"
                    >
                      <option value="">All Ratings</option>
                      <option value="4.0">4.0 ★ & Above</option>
                      <option value="4.5">4.5 ★ & Above</option>
                      <option value="4.8">4.8 ★ & Above</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between h-3.5">
                    <label className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                      <ArrowUpDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Sort By</span>
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={draft.sortBy}
                      onChange={(e) => updateDraft('sortBy', e.target.value)}
                      className="w-full h-8.5 appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg px-3 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none shadow-2xs pr-7"
                    >
                      <option value="popularity">Relevance / Popularity</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating-desc">Highest Rated</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* ================= 4. COMPACT STICKY ACTION BUTTONS FOOTER ================= */}
            <div className="shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-50/70 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
              {/* Left: Reset Filters & Active Status */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!hasActiveFilters}
                  className={`h-8.5 px-3.5 rounded-full text-xs font-bold transition-all border-none flex items-center gap-1.5 ${
                    hasActiveFilters
                      ? 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs'
                      : 'text-slate-400 bg-slate-100/60 dark:bg-slate-800/40 cursor-not-allowed opacity-60'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>

                {hasActiveFilters && (
                  <span className="text-[10.5px] font-medium text-slate-400 dark:text-slate-500 hidden md:inline">
                    Criteria active
                  </span>
                )}
              </div>

              {/* Right: Cancel & Apply Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="h-8.5 px-4 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  className="h-8.5 px-5 rounded-full text-xs font-black uppercase tracking-wider text-white bg-[#FF9800] hover:bg-[#F57C00] active:scale-98 transition-all cursor-pointer shadow-sm shadow-orange-500/25 flex items-center gap-1.5 border-none"
                >
                  <Search className="w-3.5 h-3.5 stroke-[2.8]" />
                  <span>Apply Filters & Search</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Mount directly to document.body via React Portal
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
