import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import logoImg from '../../assets/images/forge india logo.jpg';
import {
  Shield, User, Briefcase, ShoppingBag, Globe,
  LogIn, LogOut, Sun, Moon, Menu, X, ChevronRight, Plus
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════════
   MEGA-MENU DATA  — dynamic category lists matching CustomerDashboard
   ══════════════════════════════════════════════════════════════ */
const MENU_DATA = {};

const MEGA_MENU_LINKS = ['Services', 'Products', 'Daily Needs', 'Food', 'Stay', 'Travel', 'Jobs'];

const ROLE_CONFIG = {
  admin: { label: 'Admin', icon: Shield, cls: 'text-rose-400' },
  vendor: { label: 'Vendor', icon: ShoppingBag, cls: 'text-violet-400' },
  employer: { label: 'Employer', icon: Briefcase, cls: 'text-sky-400' },
  user: { label: 'Member', icon: User, cls: 'text-emerald-400' },
  visitor: { label: 'Guest', icon: Globe, cls: 'text-amber-400' },
};

import { fetchAdminCategories, getDynamicMenuData, getActiveMainCategories, BASE_TAXONOMY } from '../../services/categoryService';

/* ══════════════════════════════════════════════════════════════
   GLASSMORPHIC MEGA DROPDOWN  (matches CustomerDashboard style)
   ══════════════════════════════════════════════════════════════ */
function GlassMegaDropdown({ menuKey, onClose, onCategoryClick, setIsJobsOpen, onMouseEnter, onMouseLeave, menuDataOverride }) {
  const data = (menuDataOverride && menuDataOverride[menuKey]) || BASE_TAXONOMY[menuKey] || {};
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
      const catItems = Array.isArray(catData) ? catData : (catData?.items || []);
      items = [...items, ...catItems];
    });
    items = Array.from(new Set(items));
  } else {
    const activeData = data[activeCat];
    if (activeData) {
      items = Array.isArray(activeData) ? activeData : (activeData.items || []);
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

  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    const loadCategories = () => {
      fetchAdminCategories().then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDbCategories(data);
        }
      });
    };

    loadCategories();

    // Socket.IO Real-time synchronization
    let socket;
    try {
      socket = io(getAdminBackendUrl(), { transports: ['websocket', 'polling'] });
      socket.on('categories:updated', () => {
        console.log('⚡ Real-time category update received in Navbar via Socket.IO');
        loadCategories();
      });
    } catch (err) {
      console.warn('Socket connection error in Navbar:', err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const dynamicMenuData = useMemo(() => getDynamicMenuData(dbCategories), [dbCategories]);
  const activeMainCatNames = useMemo(() => getActiveMainCategories(dbCategories), [dbCategories]);

  const menuConfig = useMemo(() => {
    const list = activeMainCatNames.map(name => ({
      label: name.toUpperCase(),
      menuKey: name
    }));
    list.push({ label: 'MEMBERSHIP', menuKey: null });
    return list;
  }, [activeMainCatNames]);

  const handleLinkClick = (link) => {
    if (link.label === 'MEMBERSHIP') {
      const el = document.getElementById('pricing');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onHomeClick();
        setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else if (link.label === 'JOBS' || link.menuKey === 'Jobs') {
      setIsJobsOpen(true);
    } else {
      onCategoryClick(link.menuKey || link.label);
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
          <nav className="hidden xl:flex items-center gap-1 xl:gap-2">
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
          <div className="hidden xl:flex items-center gap-4 justify-end">
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
          <div className="flex xl:hidden items-center gap-3">
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
        className="hidden xl:block relative w-full"
        onMouseEnter={cancelLeave}
        onMouseLeave={handleMouseLeave}
      >
        {openMenu && activeMainCatNames.includes(openMenu) && (
          <GlassMegaDropdown
            menuKey={openMenu}
            menuDataOverride={dynamicMenuData}
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
        <div className="xl:hidden w-full bg-[#0b132b] border-b border-[#1c2541]/40 flex flex-col py-4 px-6 gap-3.5 shadow-xl animate-fade-in">
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
