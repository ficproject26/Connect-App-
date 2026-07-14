import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, ShoppingBag, Truck, Utensils, BedDouble, Plane, UserCheck } from 'lucide-react';
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
  const [visibleCount, setVisibleCount] = useState(0); // 0 (globe only), 1 to pillars.length

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Section starts when top hits viewport top
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top; // px scrolled into section
      const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1);

      // Divide the scroll space into (pillars.length + 1) segments:
      // Step 0: Globe only
      // Step 1..7: Accumulate cards 1 to 7
      const currentStep = Math.floor(progress * (pillars.length + 1));
      setVisibleCount(Math.min(currentStep, pillars.length));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const latestIdx = visibleCount - 1; // -1 at step 0 (globe only)

  return (
    <section
      ref={containerRef}
      id="services"
      className="relative bg-[#020b18]"
      style={{ height: '240vh' }}
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
              background: latestIdx >= 0 ? pillars[latestIdx].accent : '#f59e0b'
            }} 
          />
          <div 
            className="absolute bottom-[20%] right-[20%] w-96 h-96 rounded-full blur-[140px] opacity-15 transition-all duration-700" 
            style={{ 
              background: latestIdx >= 0 ? pillars[latestIdx].accent : '#818cf8'
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

          {/* Main Workspace: Grid Accumulation Layout */}
          <div className="flex-1 flex items-center justify-center my-auto min-h-[360px] w-full relative">
            
            {/* Step 0: Welcome / Instruction Overlay */}
            {visibleCount === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 animate-float pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <div className="w-3.5 h-3.5 bg-amber-400 rounded-full animate-ping" />
                </div>
                <p className="text-amber-400/95 text-[10px] font-black uppercase tracking-[0.25em]">
                  Interactive Journey
                </p>
                <h3 className="text-white font-black text-2xl mt-3 max-w-[320px] tracking-tight">
                  Scroll down to reveal
                </h3>
                <span className="text-slate-500 text-xs mt-3 block font-medium">
                  (scroll to reveal the ecosystem pillars)
                </span>
              </div>
            )}

            {/* Grid layout containing accumulating cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 w-full relative z-20">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                const isVisible = idx < visibleCount;
                const isLatest = idx === latestIdx;

                return (
                  <div
                    key={pillar.id}
                    onClick={() => isVisible && onCardClick(pillar.title)}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                      pointerEvents: isVisible ? 'auto' : 'none',
                      transition: 'opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                      borderColor: isVisible ? (isLatest ? `${pillar.accent}60` : `${pillar.accent}30`) : 'rgba(255,255,255,0.05)',
                      boxShadow: isVisible && isLatest ? `0 15px 30px -10px ${pillar.accent}30` : 'none',
                    }}
                    className={`relative rounded-2xl p-4 sm:p-6 flex flex-col justify-between cursor-pointer group
                      bg-slate-950/85 backdrop-blur-md border
                      hover:bg-slate-950 hover:scale-[1.02] hover:-translate-y-1
                      transition-all duration-300 overflow-hidden select-none
                      h-[125px] sm:h-[200px] lg:h-[235px] w-full`}

                  >
                    {/* Glowing highlight on active card */}
                    <div
                      className="absolute -top-10 -left-10 w-28 h-28 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 group-hover:scale-125"
                      style={{ background: pillar.accent }}
                    />

                    {/* Card Header: Icon and Category Tag (hidden on mobile to prevent overflow) */}
                    <div className="flex items-start justify-between relative z-10 w-full">
                      <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center ${pillar.iconBg} shadow-inner transition-transform duration-300 group-hover:scale-115 shrink-0`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span
                        className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shrink-0"
                        style={{ background: `${pillar.accent}15`, color: pillar.accent }}
                      >
                        {pillar.tag}
                      </span>
                    </div>

                    {/* Content Area */}
                    <div className="text-left relative z-10 w-full mt-2 sm:mt-4 flex-grow flex flex-col justify-start">
                      <h3 className="text-sm sm:text-base lg:text-lg font-extrabold text-white tracking-tight leading-snug">
                        {pillar.title}
                      </h3>
                      {/* Short Description (hidden on mobile to keep layout compact) */}
                      <p className="hidden sm:block mt-1.5 text-slate-400 text-[11px] lg:text-xs leading-relaxed line-clamp-2 lg:line-clamp-3">
                        {pillar.desc}
                      </p>
                    </div>

                    {/* Interactive Card Footer (hidden on mobile) */}
                    <div className="hidden sm:flex items-center justify-between pt-2 border-t border-white/5 mt-3 relative z-10 w-full">
                      <span
                        className="text-[11px] font-black flex items-center gap-1 transition-colors duration-200"
                        style={{ color: pillar.accent }}
                      >
                        Explore
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                        {String(idx + 1).padStart(2, '0')} / {String(pillars.length).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
