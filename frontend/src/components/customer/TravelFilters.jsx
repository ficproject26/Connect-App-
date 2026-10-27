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
  ShieldCheck,
  ArrowRightLeft,
  Navigation
} from 'lucide-react';
import { BookingDateInput, BookingTimeInput } from '../common/BookingDateTimePicker';

/**
 * TravelFilters Component
 *
 * Implements category-aware dynamic filtering and search for the Customer Website Travel page.
 * Strictly adheres to 3-tier DB hierarchy (Level 1: Travel -> Level 2: Subcategory [Bus, Cab] -> Level 3: Child Category).
 *
 * Features:
 * - Dynamic Category Selection (All, Bus, Cab, and DB child categories)
 * - Dynamic From & To location selection with route swap
 * - Calendar-based date selection
 * - Clock-based time selection and Departure time slots
 * - Budget range slider with live feedback
 * - Category-specific filters (AC/Non-AC, Sleeper/Seater for Bus; Pickup/Destination & Cab types for Cab)
 * - Apply Filters & Search, Cancel Filters, and Reset workflow
 */
export default function TravelFilters({
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
  const [isExpanded, setIsExpanded] = useState(true);

  // Synchronize draft when initialFilters or priceBounds change externally
  useEffect(() => {
    setDraft(prev => ({
      ...prev,
      ...initialFilters,
      maxPrice: initialFilters.maxPrice !== undefined ? initialFilters.maxPrice : (prev.maxPrice || priceBounds.max)
    }));
  }, [initialFilters, priceBounds]);

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

  // Apply Action: Commits draft filters to parent
  const handleApply = (e) => {
    if (e) e.preventDefault();
    if (typeof onApplyFilters === 'function') {
      onApplyFilters(draft);
    }
  };

  // Cancel Action: Reverts draft filters back to committed filters
  const handleCancel = () => {
    setDraft(defaultFilters);
    if (typeof onCancelFilters === 'function') {
      onCancelFilters();
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

  return (
    <div className="w-full bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 sm:p-6 shadow-sm text-slate-800 dark:text-slate-100 transition-all text-left">
      {/* ================= 1. CATEGORY HIERARCHY SELECTOR ROW ================= */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/15 text-amber-500 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-tight">
                Travel Category & Filters
              </span>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                {isAllSelected ? 'All Travel Services' : isBusSelected ? 'Bus Tickets & Routes' : isCabSelected ? 'Cab & Taxi Booking' : `${activeSubCat} Travel`}
              </h3>
            </div>
          </div>

          {/* Results Badge & Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {totalResultsCount} {totalResultsCount === 1 ? 'Option Available' : 'Options Available'}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Level 2 Subcategory Pills (ALL, Bus, Cab) */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <button
            type="button"
            onClick={() => {
              if (typeof onSelectSubCat === 'function') onSelectSubCat('ALL');
              if (typeof onSelectChildCat === 'function') onSelectChildCat('');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${
              isAllSelected
                ? 'bg-[#0b1e36] text-white border-[#0b1e36] dark:bg-amber-400 dark:text-[#0b1e36] dark:border-amber-400 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALL TRAVEL</span>
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
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSubActive
                    ? 'bg-[#0b1e36] text-white border-[#0b1e36] dark:bg-amber-400 dark:text-[#0b1e36] dark:border-amber-400 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
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
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
              {isBusSelected ? 'Bus Classes:' : isCabSelected ? 'Cab Types:' : 'Category Types:'}
            </span>
            <button
              type="button"
              onClick={() => {
                if (typeof onSelectChildCat === 'function') onSelectChildCat('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                !selectedChildCat
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                    isChildActive
                      ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
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

      {/* ================= 2. DYNAMIC FILTER CONTROLS GRID ================= */}
      <form onSubmit={handleApply} className={`${isExpanded ? 'block' : 'hidden md:block'} pt-4 space-y-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Departure / From Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-500" />
              <span>{isCabSelected ? 'Pickup Location' : 'From / Departure'}</span>
            </label>
            <div className="relative">
              <select
                value={draft.from}
                onChange={(e) => updateDraft('from', e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none transition-all truncate pr-8"
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

          {/* 2. Destination / To Location with Swap Button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Navigation className="w-3 h-3 text-amber-500" />
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
                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer focus:border-amber-500 focus:outline-none transition-all truncate pr-8"
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

          {/* 3. Calendar-Based Travel Date Selection */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-amber-500" />
                <span>Travel Date</span>
              </label>
              {draft.date && (
                <button
                  type="button"
                  onClick={() => updateDraft('date', '')}
                  className="text-[9.5px] font-bold text-slate-400 hover:text-red-500 cursor-pointer border-none bg-transparent p-0"
                >
                  Clear Date
                </button>
              )}
            </div>
            <BookingDateInput
              label="Travel Date"
              value={draft.date}
              onChange={(val) => updateDraft('date', val)}
              minDate={todayStr}
              accentColor="amber"
              className="w-full text-xs"
            />
          </div>

          {/* 4. Clock-Based Departure / Pickup Time Selection */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-500" />
                <span>{isCabSelected ? 'Pickup Time' : 'Departure Time'}</span>
              </label>
              {draft.exactTime && (
                <button
                  type="button"
                  onClick={() => updateDraft('exactTime', '')}
                  className="text-[9.5px] font-bold text-slate-400 hover:text-red-500 cursor-pointer border-none bg-transparent p-0"
                >
                  Clear Time
                </button>
              )}
            </div>
            <BookingTimeInput
              label={isCabSelected ? 'Pickup Time' : 'Departure Time'}
              value={draft.exactTime}
              onChange={(val) => updateDraft('exactTime', val)}
              accentColor="amber"
              className="w-full text-xs"
            />
          </div>
        </div>

        {/* ================= 3. TIME SLOTS & VEHICLE SPECIFIC CONTROLS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-1 items-end">
          {/* Departure Time Slots (Morning, Afternoon, Evening, Night) */}
          <div className="md:col-span-6 space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>Timing Window</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {timeSlotOptions.map((slot) => {
                const isSelected = draft.timeSlot === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => updateDraft('timeSlot', slot.id)}
                    className={`py-2 px-1 text-center rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-black truncate">{slot.label}</span>
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 truncate leading-none hidden sm:block">
                      {slot.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Range Slider */}
          <div className="md:col-span-6 space-y-1 bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Budget Range Slider
              </span>
              <span className="font-extrabold text-amber-600 dark:text-amber-400 text-xs">
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
                className="w-full accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                ₹{Math.max(priceBounds.max, 2000).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ================= 4. CATEGORY-SPECIFIC TOGGLES (BUS VS CAB) ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Bus Specific: Sleeper vs Seater */}
          {(!isCabSelected) && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Vehicle Class
              </label>
              <select
                value={draft.vehicleClass}
                onChange={(e) => updateDraft('vehicleClass', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Classes (Sleeper & Seater)</option>
                <option value="sleeper">Sleeper Only</option>
                <option value="seater">Seater Only</option>
              </select>
            </div>
          )}

          {/* Bus Specific: AC vs Non-AC */}
          {(!isCabSelected) && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                AC Preference
              </label>
              <select
                value={draft.acPreference}
                onChange={(e) => updateDraft('acPreference', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All (AC & Non-AC)</option>
                <option value="ac">AC Only</option>
                <option value="non-ac">Non-AC Only</option>
              </select>
            </div>
          )}

          {/* Cab Specific: Cab Types (Dynamic from DB child categories if present) */}
          {isCabSelected && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Cab Type
              </label>
              <select
                value={draft.cabType}
                onChange={(e) => updateDraft('cabType', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Cab Types</option>
                {(currentChildCategories.length > 0 ? currentChildCategories : ['Sedan', 'SUV', 'Hatchback', 'Prime']).map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
          )}

          {/* Minimum Rating Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Customer Rating
            </label>
            <select
              value={draft.rating === null ? '' : String(draft.rating)}
              onChange={(e) => updateDraft('rating', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
            >
              <option value="">All Ratings</option>
              <option value="4.0">4.0 ★ & Above</option>
              <option value="4.5">4.5 ★ & Above</option>
              <option value="4.8">4.8 ★ & Above</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Sort By
            </label>
            <select
              value={draft.sortBy}
              onChange={(e) => updateDraft('sortBy', e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:border-amber-500 focus:outline-none"
            >
              <option value="popularity">Relevance / Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Customer Rated</option>
            </select>
          </div>
        </div>

        {/* ================= 5. ACTION BUTTONS: APPLY, CANCEL, RESET ================= */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 flex-wrap gap-2">
          {/* Left: Active Filters indicator & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasActiveFilters}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all border ${
                hasActiveFilters
                  ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 cursor-pointer'
                  : 'text-slate-400 bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 cursor-not-allowed opacity-60'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>

            {hasActiveFilters && (
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hidden sm:inline">
                Custom filter criteria active
              </span>
            )}
          </div>

          {/* Right: Cancel & Apply Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-500 active:scale-98 transition-all cursor-pointer shadow-md flex items-center gap-1.5 border-none"
            >
              <Search className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Apply Filters & Search</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
