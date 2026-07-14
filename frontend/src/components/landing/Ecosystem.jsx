import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, ShoppingBag, Truck, Utensils, BedDouble, Plane, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import worldGlobe from '../../assets/images/world_globe.jpg';

const pillars = [
  {
    id: 'services',
    icon: Briefcase,
    accent: '#f59e0b',
    iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    title: 'Services',
    desc: 'From salon visits to plumbing, get priority booking and flat rates with top professionals across 19 categories.',
    tag: '19 Categories',
  },
  {
    id: 'products',
    icon: ShoppingBag,
    accent: '#fb923c',
    iconBg: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    title: 'Products',
    desc: 'Exclusive pricing on electronics, fashion, furniture, and lifestyle goods from 500+ partner brands.',
    tag: '16 Categories',
  },
  {
    id: 'daily-needs',
    icon: Truck,
    accent: '#38bdf8',
    iconBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    title: 'Daily Needs',
    desc: 'Groceries, dairy, pharmacy, and household essentials delivered at your door with zero convenience fees.',
    tag: '12 Categories',
  },
  {
    id: 'food',
    icon: Utensils,
    accent: '#34d399',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    title: 'Food',
    desc: 'Dine like royalty with 20%+ off at premium restaurants, cafes, and cloud kitchens in your city.',
    tag: '16 Categories',
  },
  {
    id: 'stay',
    icon: BedDouble,
    accent: '#fbbf24',
    iconBg: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    title: 'Stay',
    desc: 'Luxury hotels, resorts, homestays and wellness retreats with member-only corporate rates.',
    tag: '16 Categories',
  },
  {
    id: 'travel',
    icon: Plane,
    accent: '#818cf8',
    iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    title: 'Travel',
    desc: 'Flights, trains, cab services, tour packages, and visa assistance — all in one ecosystem.',
    tag: '19 Categories',
  },
  {
    id: 'jobs',
    icon: UserCheck,
    accent: '#c084fc',
    iconBg: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
    title: 'Jobs',
    desc: 'Explore 23 career categories spanning banking, IT, healthcare, government and freelance roles.',
    tag: '23 Categories',
  },
];

export default function Ecosystem({ onCardClick }) {
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(1); // 1 to pillars.length
  const visibleCountRef = useRef(1);

  useEffect(() => {
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  useEffect(() => {
    let lastTouchY = 0;
    let isTransitioning = false;

    const handleWheel = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Check if the sticky container is at the top of the viewport
      // rect.top is the top of the parent section. If it is <= 5 and rect.bottom >= windowHeight - 5,
      // the sticky child is currently locked in the viewport.
      const isStickyActive = rect.top <= 5 && rect.bottom >= windowHeight - 5;

      if (isStickyActive) {
        const delta = e.deltaY;
        const current = visibleCountRef.current;

        // Scroll down: Go to next card
        if (delta > 0 && current < pillars.length) {
          e.preventDefault();
          if (!isTransitioning) {
            isTransitioning = true;
            setVisibleCount(current + 1);
            setTimeout(() => { isTransitioning = false; }, 300);
          }
          return;
        }

        // Scroll up: Go to previous card
        if (delta < 0 && current > 1) {
          e.preventDefault();
          if (!isTransitioning) {
            isTransitioning = true;
            setVisibleCount(current - 1);
            setTimeout(() => { isTransitioning = false; }, 300);
          }
          return;
        }
      }
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        lastTouchY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (!containerRef.current || e.touches.length !== 1) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isStickyActive = rect.top <= 5 && rect.bottom >= windowHeight - 5;

      if (isStickyActive) {
        const currentY = e.touches[0].clientY;
        const deltaY = lastTouchY - currentY; // positive: swipe up (scroll down)
        const current = visibleCountRef.current;

        // Swipe up (scroll down): Go to next card
        if (deltaY > 30 && current < pillars.length) {
          e.preventDefault();
          if (!isTransitioning) {
            isTransitioning = true;
            setVisibleCount(current + 1);
            lastTouchY = currentY;
            setTimeout(() => { isTransitioning = false; }, 300);
          }
          return;
        }

        // Swipe down (scroll up): Go to previous card
        if (deltaY < -30 && current > 1) {
          e.preventDefault();
          if (!isTransitioning) {
            isTransitioning = true;
            setVisibleCount(current - 1);
            lastTouchY = currentY;
            setTimeout(() => { isTransitioning = false; }, 300);
          }
          return;
        }

        // If swipe gesture is active and not at edges, prevent default page scrolling
        if ((deltaY > 0 && current < pillars.length) || (deltaY < 0 && current > 1)) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const latestIdx = visibleCount - 1; // -1 at step 0 (welcome)
  const activePillar = latestIdx >= 0 ? pillars[latestIdx] : null;

  return (
    <section
      ref={containerRef}
      id="services"
      className="relative bg-[#020b18]"
      style={{ height: '100vh' }}
    >
      {/* ── STICKY FRAME ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        
        {/* ── GLOBE BACKGROUND ── */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {/* Dark base */}
          <div className="absolute inset-0 bg-[#020b18]" />

          {/* Globe image container — centered and rounded to clip black corners */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(85vw,650px)] aspect-square select-none pointer-events-none overflow-hidden rounded-full z-0">
            <img
              src={worldGlobe}
              alt="World Network"
              className="w-full h-full opacity-35 rounded-full animate-globe-spin object-cover"
              style={{ filter: 'brightness(1.1) saturate(1.3)' }}
            />
          </div>

          {/* Radial fade — edges dark */}
          <div className="absolute inset-0 bg-radial-fade" />

          {/* Ambient glow blobs matching active card accent */}
          <div 
            className="absolute top-[20%] left-[20%] w-96 h-96 rounded-full blur-[140px] opacity-15 transition-all duration-700" 
            style={{ 
              background: activePillar ? activePillar.accent : '#f59e0b'
            }} 
          />
          <div 
            className="absolute bottom-[20%] right-[20%] w-96 h-96 rounded-full blur-[140px] opacity-15 transition-all duration-700" 
            style={{ 
              background: activePillar ? activePillar.accent : '#818cf8'
            }} 
          />
        </div>

        {/* ── CONTENT CONTAINER ── */}
        <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full px-6 md:px-12 py-10 lg:py-16 justify-between">
          
          {/* Header */}
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="max-w-xl text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400/90">
                  One Membership · Seven Pillars
                </span>
                <h2 className="mt-2 text-3xl md:text-5xl font-extrabold font-sans tracking-tight text-white leading-none">
                  Our{' '}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400">
                    Ecosystem
                  </span>
                </h2>
              </div>
              <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm text-left">
                Scroll down to unlock each pillar — a world of services, products, dining, travel, and careers.
              </p>
            </div>
          </div>

          {/* Main Workspace: Centered Interactive Card transition area */}
          <div className="flex-1 flex items-center justify-center my-auto min-h-[380px] w-full relative">
            <AnimatePresence mode="wait">
              {activePillar && (
                <motion.div
                  key={activePillar.id}
                  initial={{ opacity: 0, y: 40, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -40, scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  onClick={() => onCardClick(activePillar.title)}
                  className="absolute w-full max-w-[460px] p-6 sm:p-8 rounded-3xl cursor-pointer group bg-slate-950/75 backdrop-blur-xl border select-none text-center flex flex-col items-center justify-between min-h-[300px]"
                  style={{
                    borderColor: `${activePillar.accent}30`,
                    boxShadow: `0 25px 50px -12px ${activePillar.accent}25, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                >
                  {/* Circular Icon container with accent glow */}
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg transition-transform duration-300 group-hover:scale-110 mb-5 shrink-0"
                    style={{
                      backgroundColor: `${activePillar.accent}15`,
                      borderColor: `${activePillar.accent}40`,
                      color: activePillar.accent
                    }}
                  >
                    {React.createElement(activePillar.icon, { className: "w-8 h-8" })}
                  </div>

                  {/* Index indicator */}
                  <div className="text-[10px] font-mono tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: activePillar.accent }}>
                    Pillar {String(visibleCount).padStart(2, '0')} / 07
                  </div>

                  {/* Text area */}
                  <div className="flex-grow flex flex-col justify-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                      {activePillar.title}
                    </h3>
                    <p className="mt-3 text-slate-350 text-xs sm:text-sm leading-relaxed max-w-sm">
                      {activePillar.desc}
                    </p>
                  </div>

                  {/* Footer Pill and Explore Link */}
                  <div className="w-full flex items-center justify-between pt-5 border-t border-white/5 mt-auto">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: `${activePillar.accent}15`, color: activePillar.accent }}
                    >
                      {activePillar.tag}
                    </span>
                    <span
                      className="text-xs font-black flex items-center gap-1 transition-colors duration-200"
                      style={{ color: activePillar.accent }}
                    >
                      Explore Pillar
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Indicator Dots at Bottom */}
          <div className="w-full flex justify-center items-center gap-2 mt-4 shrink-0 relative z-20">
            {pillars.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  visibleCount === i + 1 
                    ? 'w-7 bg-amber-400' 
                    : 'w-2 bg-white/20'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
