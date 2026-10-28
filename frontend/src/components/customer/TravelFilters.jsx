import React, { useState, useEffect, useMemo, useRef } from 'react';
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
 * TravelFilters Component (Modal Edition)
 *
 * Implements a category-aware dynamic filtering and search experience as a
 * centered popup modal for the Customer Website Travel page.
 *
 * Strictly adheres to 3-tier DB hierarchy:
 * Level 1: Travel -> Level 2: Subcategory [Bus, Cab] -> Level 3: Child Category
 *
 * Features:
 * - Centered responsive modal with translucent backdrop & blur
 * - Dynamic Category Selection (All Travel, Bus, Cab, and DB child categories)
 * - Dynamic From & To location selection with route swap
 * - Calendar-based date selection
 * - Clock-based time selection and Departure time slots
 * - Budget range slider with live feedback
 * - Category-specific filters (AC/Non-AC, Sleeper/Seater for Bus; Cab types for Cab)
 * - Apply Filters & Search, Cancel Filters, Reset Filters, and Close (X) workflow
 * - Escape key dismissal and body scroll locking
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

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
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

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="travel-filter-modal-title"
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-[#0b1329] border border-slate-100 dark:border-slate-800 rounded-[28px] p-6 sm:p-8 shadow-2xl text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto scrollbar-thin my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= 1. MODAL HEADER ================= */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/40 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <SlidersHorizontal className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <h2
                id="travel-filter-modal-title"
                className="text-xl sm:text-2xl font-black text-[#0B1728] dark:text-white tracking-tight leading-tight"
              >
                Travel Category & Filters
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-400 mt-0.5">
                Find the right travel option
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer border-none shadow-2xs"
          >
            <X className="w-5 h-5 stroke-[2.4]" />
          </button>
        </div>

        {/* ================= 2. CATEGORY SELECTION ================= */}
        <div className="py-4 space-y-3.5 border-b border-slate-100 dark:border-slate-800/80">
          {/* Level 2 Subcategory Pills (All Travel, Bus, Cab) */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (typeof onSelectSubCat === 'function') onSelectSubCat('ALL');
                if (typeof onSelectChildCat === 'function') onSelectChildCat('');
              }}
              className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-2.5 ${
                isAllSelected
                  ? 'bg-[#0B1728] text-white border-[#0B1728] dark:bg-amber-400 dark:text-[#0b1e36] dark:border-amber-400 shadow-sm'
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300'
              }`}
            >
              <Plane className="w-4 h-4" />
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
                  className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-2.5 ${
                    isSubActive
                      ? 'bg-[#0B1728] text-white border-[#0B1728] dark:bg-amber-400 dark:text-[#0b1e36] dark:border-amber-400 shadow-sm'
                      : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300'
                  }`}
                >
                  <SubIcon className="w-4 h-4" />
                  <span>{subName}</span>
                </button>
              );
            })}
          </div>

          {/* Level 3 Child Category Chips (e.g. A/C Sleeper, Seater) */}
          {currentChildCategories.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Category Types
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof onSelectChildCat === 'function') onSelectChildCat('');
                  }}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    !selectedChildCat
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300 font-black shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300'
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
                      className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                        isChildActive
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300 font-black shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-300'
                      }`}
                    >
                      {isChildActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{childName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ================= 3. DYNAMIC FILTER CONTROLS FORM ================= */}
        <form onSubmit={handleApply} className="py-4 space-y-4">
          {/* Row 1: Departure, Destination, Date, Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* 1. From / Departure */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{isCabSelected ? 'Pickup Location' : 'From / Departure'}</span>
              </label>
              <div className="relative">
                <select
                  value={draft.from}
                  onChange={(e) => updateDraft('from', e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none transition-all truncate pr-8 shadow-2xs"
                >
                  <option value="">{isCabSelected ? 'Select Pickup Point (All)' : 'From: All Locations'}</option>
                  {travelFromOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Destination with Swap Button */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isCabSelected ? 'Destination / Drop' : 'To / Destination'}</span>
                </label>
                {(draft.from || draft.to) && (
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className="text-[9.5px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-0.5 cursor-pointer border-none bg-transparent p-0"
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
                  className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none transition-all truncate pr-8 shadow-2xs"
                >
                  <option value="">{isCabSelected ? 'Select Destination (All)' : 'To: All Destinations'}</option>
                  {travelToOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Travel Date with Calendar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Travel Date</span>
                </label>
                {draft.date && (
                  <button
                    type="button"
                    onClick={() => updateDraft('date', '')}
                    className="text-[9.5px] font-bold text-slate-400 hover:text-red-500 cursor-pointer border-none bg-transparent p-0"
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
                className="w-full text-xs"
              />
            </div>

            {/* 4. Departure / Pickup Time */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isCabSelected ? 'Pickup Time' : 'Departure Time'}</span>
                </label>
                {draft.exactTime && (
                  <button
                    type="button"
                    onClick={() => updateDraft('exactTime', '')}
                    className="text-[9.5px] font-bold text-slate-400 hover:text-red-500 cursor-pointer border-none bg-transparent p-0"
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
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* Row 2: Timing Window Chips & Budget Range Slider */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-1 items-stretch">
            {/* Timing Window (5 options) */}
            <div className="lg:col-span-6 space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Timing Window</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {timeSlotOptions.map((slot) => {
                  const isSelected = draft.timeSlot === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => updateDraft('timeSlot', slot.id)}
                      className={`py-2.5 px-1 text-center rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 text-amber-700 dark:text-amber-300 font-extrabold shadow-2xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-black truncate">{slot.label}</span>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500 truncate leading-none mt-0.5 hidden sm:block">
                        {slot.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Range Slider */}
            <div className="lg:col-span-6 space-y-2 bg-slate-50/70 dark:bg-slate-900/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>Budget Range Slider</span>
                </span>
                <span className="font-extrabold text-white bg-[#FF9800] text-xs px-3.5 py-1 rounded-full shadow-xs">
                  Up to ₹{(draft.maxPrice || priceBounds.max).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] font-bold text-slate-400 font-mono">
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
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  ₹{Math.max(priceBounds.max, 2000).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Vehicle Class, AC Preference, Customer Rating, Sort By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {/* Bus Specific / General: Vehicle Class */}
            {!isCabSelected && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7] flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Vehicle Class</span>
                </label>
                <div className="relative">
                  <select
                    value={draft.vehicleClass}
                    onChange={(e) => updateDraft('vehicleClass', e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none shadow-2xs pr-8"
                  >
                    <option value="all">All Classes (Sleeper & Seater)</option>
                    <option value="sleeper">Sleeper Only</option>
                    <option value="seater">Seater Only</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Bus Specific / General: AC Preference */}
            {!isCabSelected && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>AC Preference</span>
                </label>
                <div className="relative">
                  <select
                    value={draft.acPreference}
                    onChange={(e) => updateDraft('acPreference', e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none shadow-2xs pr-8"
                  >
                    <option value="all">All (AC & Non-AC)</option>
                    <option value="ac">AC Only</option>
                    <option value="non-ac">Non-AC Only</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Cab Specific: Cab Types */}
            {isCabSelected && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7] flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Cab Type</span>
                </label>
                <div className="relative">
                  <select
                    value={draft.cabType}
                    onChange={(e) => updateDraft('cabType', e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none shadow-2xs pr-8"
                  >
                    <option value="all">All Cab Types</option>
                    {(currentChildCategories.length > 0 ? currentChildCategories : ['Sedan', 'SUV', 'Hatchback', 'Prime']).map((ct) => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Minimum Rating */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Customer Rating</span>
              </label>
              <div className="relative">
                <select
                  value={draft.rating === null ? '' : String(draft.rating)}
                  onChange={(e) => updateDraft('rating', e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none shadow-2xs pr-8"
                >
                  <option value="">All Ratings</option>
                  <option value="4.0">4.0 ★ & Above</option>
                  <option value="4.5">4.5 ★ & Above</option>
                  <option value="4.8">4.8 ★ & Above</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Sort By</span>
              </label>
              <div className="relative">
                <select
                  value={draft.sortBy}
                  onChange={(e) => updateDraft('sortBy', e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none shadow-2xs pr-8"
                >
                  <option value="popularity">Relevance / Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* ================= 4. ACTION BUTTONS: APPLY, CANCEL, RESET ================= */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80 flex-wrap gap-3">
            {/* Left: Reset Filters & Active Status */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasActiveFilters}
                className={`flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-full transition-all border-none ${
                  hasActiveFilters
                    ? 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 cursor-pointer shadow-2xs'
                    : 'text-slate-400 bg-slate-100/60 cursor-not-allowed opacity-60'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>

              {hasActiveFilters && (
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                  Custom filter criteria active
                </span>
              )}
            </div>

            {/* Right: Cancel & Apply Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border-none flex items-center gap-1.5 shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                className="px-7 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white bg-[#FF9800] hover:bg-[#F57C00] active:scale-98 transition-all cursor-pointer shadow-md shadow-orange-500/25 flex items-center gap-2 border-none"
              >
                <Search className="w-3.5 h-3.5 stroke-[2.8]" />
                <span>Apply Filters & Search</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
