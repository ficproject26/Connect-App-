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
  const [activeIdx, setActiveIdx] = useState(1);
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

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      const sectionHeight = rect.height;
      const viewportHeight = window.innerHeight;
      
      const scrolled = -rect.top; 
      const scrollRange = sectionHeight - viewportHeight;
      
      if (scrollRange > 0) {
        const progress = Math.max(0, Math.min(0.99, scrolled / scrollRange));
        // Map scroll range to 3 steps (0, 1, 2)
        const step = Math.floor(progress * 3);
        
        let newActiveIdx = 1;
        if (step === 0) newActiveIdx = 1;      // Group 1: Services (idx 0), Products (idx 1), Daily Needs (idx 2)
        else if (step === 1) newActiveIdx = 4; // Group 2: Food (idx 3), Stay (idx 4), Travel (idx 5)
        else if (step === 2) newActiveIdx = 6; // Group 3: Jobs (idx 6)
        
        setActiveIdx(newActiveIdx);
      }
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

          {/* Centered Statically Positioned Timeline Nodes (Aligns with background DNA line) */}
          <div className="absolute left-1/2 top-[8%] bottom-[8%] -translate-x-1/2 w-10 z-10 pointer-events-none flex flex-col justify-between items-center py-4">
            {pillars.map((pillar, idx) => {
              const isCenterNode = idx === activeIdx;
              const isLeftNode = idx === (activeIdx - 1 + pillars.length) % pillars.length;
              const isRightNode = idx === (activeIdx + 1) % pillars.length;
              const isNodeActive = isCenterNode || isLeftNode || isRightNode;

              let scaleClass = 'scale-75 opacity-30';
              if (isCenterNode) scaleClass = 'scale-110 opacity-100';
              else if (isNodeActive) scaleClass = 'scale-90 opacity-60';

              return (
                <div 
                  key={pillar.id}
                  className={`w-9 h-9 rounded-full bg-white dark:bg-[#020b18] border-2 flex items-center justify-center transition-all duration-500 shadow-xs ${scaleClass}`}
                  style={{
                    borderColor: isCenterNode 
                      ? pillar.accent 
                      : (isNodeActive ? `${pillar.accent}80` : (theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')),
                    color: isCenterNode 
                      ? pillar.accent 
                      : (isNodeActive ? `${pillar.accent}90` : (theme === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)')),
                    boxShadow: isCenterNode 
                      ? (theme === 'dark' ? `0 0 14px ${pillar.accent}50` : `0 0 8px ${pillar.accent}20`)
                      : 'none',
                  }}
                >
                  {React.createElement(pillar.icon, { className: "w-4 h-4" })}
                </div>
              );
            })}
          </div>

          {/* 3D Cover Flow Cards Carousel Deck */}
          <div className="relative w-full max-w-4xl h-[480px] perspective-1200 transform-style-3d flex items-center justify-center overflow-visible">
            {pillars.map((pillar, idx) => {
              let diff = idx - activeIdx;
              if (diff > Math.floor(pillars.length / 2)) {
                diff -= pillars.length;
              } else if (diff < -Math.floor(pillars.length / 2)) {
                diff += pillars.length;
              }
              const isActive = diff === 0;
              const isLeft = diff === -1;
              const isRight = diff === 1;
              const isVisible = Math.abs(diff) <= 1;

               // Determine CSS class based on circular diff offset
              let cardClass = '';
              if (isActive) {
                cardClass = 'carousel-card-center';
              } else if (isLeft) {
                cardClass = 'carousel-card-left';
              } else if (isRight) {
                cardClass = 'carousel-card-right';
              } else {
                cardClass = diff < 0 ? 'carousel-card-hidden-left' : 'carousel-card-hidden-right';
              }

              return (
                <div
                  key={pillar.id}
                  onClick={() => isVisible && onCardClick(pillar.title)}
                  className={`absolute w-[280px] sm:w-[350px] transform-style-3d text-left cursor-pointer transition-all duration-800 ease-out ${cardClass}`}
                  style={{
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

        {/* Scroll Markers / Spacers (invisible markers that provide scroll depth for sticky interaction) */}
        <div className="w-full flex flex-col items-center justify-start pointer-events-none mt-[-20vh] pb-[35vh]">
          {pillars.map((pillar) => (
            <div 
              key={pillar.id}
              className="h-[50vh] w-full"
            />
          ))}
        </div>

      </div>
    </section>
  );
}
