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
    categories: ['IT Services', 'Non-IT Services', 'Job Consulting', 'Business Consulting']
  },
  {
    id: 'products',
    icon: ShoppingBag,
    accent: '#fb923c',
    iconBg: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    title: 'Products',
    desc: 'Exclusive pricing on electronics, fashion, furniture, and lifestyle goods from 500+ partner brands.',
    tag: '16 Categories',
    categories: ['Fashion & Luxury', 'Electronics & Gadgets', 'Home & Interiors']
  },
  {
    id: 'daily-needs',
    icon: Truck,
    accent: '#38bdf8',
    iconBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    title: 'Daily Needs',
    desc: 'Groceries, dairy, pharmacy, and household essentials delivered at your door with zero convenience fees.',
    tag: '12 Categories',
    categories: ['Gourmet & Fresh', 'Personal Health', 'Express Conveniences']
  },
  {
    id: 'food',
    icon: Utensils,
    accent: '#34d399',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    title: 'Food',
    desc: 'Dine like royalty with 20%+ off at premium restaurants, cafes, and cloud kitchens in your city.',
    tag: '16 Categories',
    categories: ['Luxury Dining', 'Casual & Cafes', 'Private Catering']
  },
  {
    id: 'stay',
    icon: BedDouble,
    accent: '#fbbf24',
    iconBg: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    title: 'Stay',
    desc: 'Luxury hotels, resorts, homestays and wellness retreats with member-only corporate rates.',
    tag: '16 Categories',
    categories: ['Villas & Resorts', 'Boutique Hoteliers', 'Unique Getaways']
  },
  {
    id: 'travel',
    icon: Plane,
    accent: '#818cf8',
    iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    title: 'Travel',
    desc: 'Flights, trains, cab services, tour packages, and visa assistance — all in one ecosystem.',
    tag: '19 Categories',
    categories: ['Business Class', 'Lounges & Transit', 'Bespoke Expeditions']
  },
  {
    id: 'jobs',
    icon: UserCheck,
    accent: '#c084fc',
    iconBg: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
    title: 'Jobs',
    desc: 'Explore 23 career categories spanning banking, IT, healthcare, government and freelance roles.',
    tag: '23 Categories',
    categories: ['Banking & IT', 'Healthcare & Gov', 'Freelance Roles']
  },
];

export default function Ecosystem({ onCardClick, theme }) {
  const containerRef = useRef(null);
  const rowRefs = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      // Set scrolling status to true
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 800); // DNA is hidden 800ms after user stops scrolling

      const centerY = window.innerHeight / 2;
      let closestIdx = 0;
      let minDistance = Infinity;

      rowRefs.current.forEach((rowEl, idx) => {
        if (!rowEl) return;
        const rect = rowEl.getBoundingClientRect();
        // Distance of row vertical center from viewport vertical center
        const rowCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(rowCenterY - centerY);

        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      setActiveIdx(closestIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Run initially with a small delay for page layout rendering
    const timer = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      clearTimeout(timer);
    };
  }, []);  return (
    <section
      ref={containerRef}
      id="services"
      className="relative bg-slate-50 dark:bg-[#020b18] py-12 md:py-20 overflow-hidden transition-colors duration-300 min-h-[300vh]"
    >
      {/* ── GLOBE BACKGROUND ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-10 dark:opacity-20 transition-opacity duration-300">
        <div className="absolute inset-0 bg-transparent" />
        {/* Slow spinning background globe */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[min(90vw,800px)] aspect-square overflow-hidden rounded-full z-0">
          <img
            src={worldGlobe}
            alt="World Network"
            className="w-full h-full opacity-15 dark:opacity-30 rounded-full animate-globe-spin object-cover transition-opacity duration-300"
            style={{ filter: 'brightness(1.1) saturate(1.3)' }}
          />
        </div>
        <div className="absolute inset-0 bg-radial-fade" />
      </div>

      {/* ── CONTENT WRAPPER ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 h-full flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full text-center max-w-2xl mx-auto mb-6 flex flex-col items-center">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-amber-500 dark:text-amber-400/90 transition-colors duration-300">
            One Membership · Seven Pillars
          </span>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold font-sans tracking-tight text-slate-900 dark:text-white leading-none transition-colors duration-300">
            Our{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 dark:from-amber-400 dark:via-amber-200 dark:to-amber-400">
              Ecosystem
            </span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-md transition-colors duration-300">
            Scroll down to explore each pillar — a premium world of services, products, dining, travel, and careers.
          </p>
        </div>

        {/* Sticky Deck Container for DNA line and 3D Cards Carousel */}
        <div className="sticky top-[12vh] h-[72vh] w-full flex flex-col justify-center items-center overflow-visible z-10 select-none">
          
          {/* DNA Double Helix Timeline Line (Centered background) */}
          <div 
            className={`absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-16 z-0 pointer-events-none flex flex-col justify-between items-center py-6 overflow-hidden perspective-500 transform-style-3d transition-all duration-700 ${
              isScrolling ? 'opacity-35 dark:opacity-50 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {Array.from({ length: 55 }).map((_, i) => (
              <div 
                key={i}
                className="w-12 h-3 relative flex items-center justify-between animate-dna-rotate"
                style={{
                  animationDelay: `${i * -0.12}s`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Left Simple Nucleotide Ball */}
                <div 
                  className="w-2.5 h-2.5 rounded-full bg-slate-600 dark:bg-slate-350 shrink-0" 
                  style={{ 
                    transform: 'translateZ(12px)'
                  }} 
                />
                {/* Connection Bar */}
                <div 
                  className="flex-grow h-[1px] bg-slate-300 dark:bg-slate-700 mx-1.5 opacity-60" 
                />
                {/* Right Simple Nucleotide Ball */}
                <div 
                  className="w-2.5 h-2.5 rounded-full bg-slate-600 dark:bg-slate-350 shrink-0" 
                  style={{ 
                    transform: 'translateZ(-12px)'
                  }} 
                />
              </div>
            ))}
          </div>

          {/* 3D Cover Flow Cards Carousel Deck */}
          <div className="relative w-full max-w-4xl h-[380px] perspective-1200 transform-style-3d flex items-center justify-center overflow-visible">
            {pillars.map((pillar, idx) => {
              const diff = idx - activeIdx;
              const isActive = diff === 0;
              const isLeft = diff === -1;
              const isRight = diff === 1;
              const isVisible = Math.abs(diff) <= 1;

              // Calculate 3D transforms based on offset diff
              let transformStr = '';
              let opacityVal = 0;
              let zIndexVal = 10;
              let pointerEventsVal = 'none';

              if (isActive) {
                transformStr = 'translateX(0) scale(1) rotateY(0deg) translateZ(0)';
                opacityVal = 1;
                zIndexVal = 30;
                pointerEventsVal = 'auto';
              } else if (isLeft) {
                // Inactive Left card rotated in single direction (Y-axis 20deg)
                transformStr = 'translateX(-150px) md:translateX(-250px) scale(0.85) rotateY(20deg) translateZ(-80px)';
                opacityVal = 0.55;
                zIndexVal = 20;
                pointerEventsVal = 'auto';
              } else if (isRight) {
                // Inactive Right card rotated in single direction (Y-axis 20deg)
                transformStr = 'translateX(150px) md:translateX(250px) scale(0.85) rotateY(20deg) translateZ(-80px)';
                opacityVal = 0.55;
                zIndexVal = 20;
                pointerEventsVal = 'auto';
              } else {
                // Hidden cards shifted further out
                transformStr = diff < 0
                  ? 'translateX(-300px) md:translateX(-480px) scale(0.65) rotateY(20deg) translateZ(-150px)'
                  : 'translateX(300px) md:translateX(480px) scale(0.65) rotateY(20deg) translateZ(-150px)';
                opacityVal = 0;
                zIndexVal = 10;
                pointerEventsVal = 'none';
              }

              return (
                <div
                  key={pillar.id}
                  onClick={() => isVisible && onCardClick(pillar.title)}
                  className="absolute w-[280px] sm:w-[350px] transform-style-3d text-left cursor-pointer"
                  style={{
                    transform: transformStr,
                    opacity: opacityVal,
                    zIndex: zIndexVal,
                    pointerEvents: pointerEventsVal,
                    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div
                    className="w-full p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-950/85 border border-slate-200/60 dark:border-slate-800/60 shadow-lg shadow-slate-200/50 dark:shadow-[0_20px_40px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-transform"
                    style={{
                      borderColor: theme === 'dark' ? `${pillar.accent}20` : `${pillar.accent}35`,
                      boxShadow: theme === 'dark' ? `inset 0 1px 0 rgba(255,255,255,0.03)` : 'none',
                    }}
                  >
                    {/* Title & Description */}
                    <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
                      {pillar.title}
                    </h3>
                    <p className="mt-2.5 text-slate-700 dark:text-slate-350 text-xs leading-relaxed transition-colors duration-300">
                      {pillar.desc}
                    </p>

                    {/* Category Tags */}
                    {pillar.categories && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {pillar.categories.map((cat, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-300"
                            style={{
                              backgroundColor: `${pillar.accent}08`,
                              borderColor: `${pillar.accent}20`,
                              color: `${pillar.accent}`
                            }}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Divider & Action */}
                    <div className="w-full flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 mt-5 transition-colors duration-300">
                      <span
                        className="text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: theme === 'dark' ? `${pillar.accent}15` : `${pillar.accent}10`, color: pillar.accent }}
                      >
                        {pillar.tag}
                      </span>
                      <span
                        className="text-xs font-bold flex items-center gap-1 transition-colors duration-200"
                        style={{ color: pillar.accent }}
                      >
                        Explore Pillar
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Markers / Spacers (invisible markers that track scroll depth along the timeline) */}
        <div className="w-full flex flex-col items-center justify-start pointer-events-none mt-[-20vh] pb-[35vh]">
          {pillars.map((pillar, idx) => (
            <div 
              key={pillar.id}
              ref={el => rowRefs.current[idx] = el}
              className="h-[50vh] w-full flex items-center justify-center"
            >
              {/* Timeline Glowing Node centered horizontally */}
              <div 
                className={`w-10 h-10 rounded-full bg-white dark:bg-[#020b18] border-2 flex items-center justify-center transition-all duration-500 shadow-xs ${
                  idx === activeIdx ? 'scale-110 opacity-100' : 'scale-90 opacity-40'
                }`}
                style={{
                  borderColor: idx === activeIdx ? pillar.accent : (theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'),
                  color: idx === activeIdx ? pillar.accent : (theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)'),
                  boxShadow: idx === activeIdx 
                    ? (theme === 'dark' ? `0 0 16px ${pillar.accent}60` : `0 0 10px ${pillar.accent}30`)
                    : 'none',
                }}
              >
                {React.createElement(pillar.icon, { className: "w-4.5 h-4.5" })}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
