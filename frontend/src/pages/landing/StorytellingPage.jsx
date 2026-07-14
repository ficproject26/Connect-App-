import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Star, Globe, Gift, Tag, Headphones, Check, 
  Briefcase, ShoppingBag, Truck, Utensils, BedDouble, Plane, UserCheck, ShieldCheck, Zap 
} from 'lucide-react';
import Globe3D from '../../components/landing/Globe3D';

const pillars = [
  {
    id: 'services',
    icon: Briefcase,
    accent: '#f59e0b',
    title: 'Services',
    desc: 'From salon visits to plumbing, get priority booking and flat rates with top professionals across 19 categories.',
    tag: '19 Categories',
    categories: ['IT Services', 'Non-IT Services', 'Job Consulting', 'Business Consulting']
  },
  {
    id: 'products',
    icon: ShoppingBag,
    accent: '#fb923c',
    title: 'Products',
    desc: 'Exclusive pricing on electronics, fashion, furniture, and lifestyle goods from 500+ partner brands.',
    tag: '16 Categories',
    categories: ['Fashion & Luxury', 'Electronics & Gadgets', 'Home & Interiors']
  },
  {
    id: 'daily-needs',
    icon: Truck,
    accent: '#38bdf8',
    title: 'Daily Needs',
    desc: 'Groceries, dairy, pharmacy, and household essentials delivered at your door with zero convenience fees.',
    tag: '12 Categories',
    categories: ['Gourmet & Fresh', 'Personal Health', 'Express Conveniences']
  },
  {
    id: 'food',
    icon: Utensils,
    accent: '#34d399',
    title: 'Food',
    desc: 'Dine like royalty with 20%+ off at premium restaurants, cafes, and cloud kitchens in your city.',
    tag: '16 Categories',
    categories: ['Luxury Dining', 'Casual & Cafes', 'Private Catering']
  },
  {
    id: 'stay',
    icon: BedDouble,
    accent: '#fbbf24',
    title: 'Stay',
    desc: 'Luxury hotels, resorts, homestays and wellness retreats with member-only corporate rates.',
    tag: '16 Categories',
    categories: ['Villas & Resorts', 'Boutique Hoteliers', 'Unique Getaways']
  },
  {
    id: 'travel',
    icon: Plane,
    accent: '#818cf8',
    title: 'Travel',
    desc: 'Flights, trains, cab services, tour packages, and visa assistance — all in one ecosystem.',
    tag: '19 Categories',
    categories: ['Business Class', 'Lounges & Transit', 'Bespoke Expeditions']
  },
  {
    id: 'jobs',
    icon: UserCheck,
    accent: '#c084fc',
    title: 'Jobs',
    desc: 'Explore 23 career categories spanning banking, IT, healthcare, government and freelance roles.',
    tag: '23 Categories',
    categories: ['Banking & IT', 'Healthcare & Gov', 'Freelance Roles']
  },
];

const pricingPlans = [
  {
    name: 'Silver Tier',
    price: '$49',
    cardNumber: '4000 8841 2921 1012',
    features: [
      '10% Off All Vendors',
      '2 Daily Delivery Slots',
      'Standard Customer Support',
      'Convenience Fees Waived'
    ],
    accent: '#94a3b8',
    featured: false
  },
  {
    name: 'Gold Elite',
    price: '$99',
    cardNumber: '5412 8841 2921 2045',
    features: [
      '20% Off All Vendors',
      'Priority Customer Support',
      '5 Monthly Lounge Passes',
      'Invite-Only Local Events',
      'No Booking Fees'
    ],
    accent: '#FFC107',
    featured: true
  },
  {
    name: 'Diamond Prestige',
    price: '$249',
    cardNumber: '3782 8841 2921 3099',
    features: [
      '30% Off All Vendors',
      '24/7 Dedicated Concierge',
      'Unlimited Lounge Access',
      'Private Club Memberships',
      'VIP Global Events'
    ],
    accent: '#FFD54F',
    featured: false
  }
];

export default function StorytellingPage({ onJoinClick, onCategoryClick }) {
  const containerRef = useRef(null);
  
  // Mouse positioning state for cursor parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [typedText, setTypedText] = useState('');

  // Native scroll progress hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth spring physics mapping (Momentum scrolling simulation)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001
  });

  // Track mouse coordinate offsets
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeMouseMoveListener || window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Headline character typewriter logic
  useEffect(() => {
    let charIndex = 0;
    const phrase = "Everywhere You Go.";
    let timer;
    
    const tick = () => {
      if (charIndex <= phrase.length) {
        setTypedText(phrase.substring(0, charIndex));
        charIndex++;
        timer = setTimeout(tick, 110);
      }
    };
    
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  // 1. Hero Section transformations (Progress: 0.0 -> 0.22)
  const heroOpacity = useTransform(smoothProgress, [0, 0.16], [1, 0]);
  const heroScale = useTransform(smoothProgress, [0, 0.16], [1, 0.88]);
  const heroY = useTransform(smoothProgress, [0, 0.16], [0, -70]);

  // 2. Pillars Section transitions (Progress: 0.22 -> 0.72)
  const ecoOpacity = useTransform(smoothProgress, [0.18, 0.22, 0.68, 0.72], [0, 1, 1, 0]);
  const ecoScale = useTransform(smoothProgress, [0.18, 0.22, 0.68, 0.72], [0.94, 1, 1, 0.94]);

  // Generate unconditional framer hook triggers for the 7 pillars
  const pillarTransforms = pillars.map((_, idx) => {
    const step = 0.06;
    const start = 0.22 + idx * step;
    const peak = start + 0.015;
    const hold = start + 0.045;
    const end = start + 0.06;
    const isEven = idx % 2 === 1;

    const opacity = useTransform(smoothProgress, [start, peak, hold, end], [0, 1, 1, 0]);
    const y = useTransform(smoothProgress, [start, peak, hold, end], [60, 0, 0, -60]);
    const scale = useTransform(smoothProgress, [start, peak, hold, end], [0.9, 1, 1, 0.9]);
    const rotateX = useTransform(smoothProgress, [start, peak, hold, end], [12, 0, 0, -12]);
    const rotateY = useTransform(smoothProgress, [start, peak, hold, end], [isEven ? -8 : 8, 0, 0, isEven ? 8 : -8]);
    
    return { opacity, y, scale, rotateX, rotateY };
  });

  // Calculate current active pillar index dynamically for the badge node glowing path
  const [activeBadgeIdx, setActiveBadgeIdx] = useState(0);
  useEffect(() => {
    return smoothProgress.onChange((val) => {
      if (val < 0.22) {
        setActiveBadgeIdx(-1);
      } else if (val >= 0.68) {
        setActiveBadgeIdx(7);
      } else {
        const relativeIdx = Math.floor((val - 0.22) / 0.06);
        setActiveBadgeIdx(Math.max(0, Math.min(relativeIdx, 6)));
      }
    });
  }, [smoothProgress]);

  // 3. Pricing Section transitions (Progress: 0.72 -> 0.94)
  const priceOpacity = useTransform(smoothProgress, [0.68, 0.72, 0.92, 0.96], [0, 1, 1, 0]);
  const priceScale = useTransform(smoothProgress, [0.68, 0.72, 0.92, 0.96], [0.94, 1, 1, 0.94]);
  const priceY = useTransform(smoothProgress, [0.68, 0.72, 0.92, 0.96], [80, 0, 0, -50]);

  // 4. CTA Section transitions (Progress: 0.92 -> 1.0)
  const ctaOpacity = useTransform(smoothProgress, [0.92, 0.96], [0, 1]);
  const ctaScale = useTransform(smoothProgress, [0.92, 0.96], [0.95, 1]);
  const ctaY = useTransform(smoothProgress, [0.92, 0.96], [50, 0]);

  return (
    <div 
      ref={containerRef}
      className="relative bg-[#08101D] text-white overflow-visible select-none min-h-[550vh] w-full font-sans"
    >
      {/* ── 3D CANVAS BACKGROUND ── */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <Globe3D scrollProgress={smoothProgress} />
      </div>

      {/* ── CURSOR SPOTLIGHT GLOW ── */}
      <div 
        className="fixed pointer-events-none w-[500px] h-[500px] rounded-full bg-[#FFC107]/4 blur-[100px] z-50 -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
        style={{ left: mousePos.x, top: mousePos.y }}
      />

      {/* ── STICKY VIEWER PORT ── */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-10 flex flex-col justify-between">
        
        {/* Decorative ambient gradients */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-[#0b1220]/40 rounded-full blur-[120px] pointer-events-none" />

        {/* ── SECTION 1: HERO OVERLAY ── */}
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-auto"
        >
          {/* Tag */}
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#FFC107] mb-4">
            One Membership · Seven Pillars
          </span>

          {/* Headline character/typewriter style */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-none max-w-4xl">
            Everything Connected.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 mt-2 min-h-[1.1em] text-3xl sm:text-4xl md:text-6xl">
              {typedText}
              <span className="inline-block w-[3px] h-[0.8em] bg-[#FFC107] ml-1 animate-pulse" />
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-slate-350 text-xs sm:text-sm md:text-base leading-relaxed max-w-md">
            Explore a world of services, products, dining, travel, and careers. All unified by a single global card.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => onJoinClick && onJoinClick()}
              className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-105 px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-amber-400/20 hover:scale-[1.03] duration-300 cursor-pointer"
            >
              <span>Join Membership</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const target = document.getElementById('storyteller-scroll-hint');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>Scroll to Explore</span>
              <span className="animate-bounce">↓</span>
            </button>
          </div>

          {/* 3D Floating Glass UI Cards */}
          <div className="hidden lg:block absolute left-[8%] top-[25%] pointer-events-none">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md shadow-xl text-left flex items-start gap-3 w-56"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#FFC107]">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-[10px] font-black text-white uppercase tracking-wider">Priority Service</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Activated for Elite levels</div>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:block absolute right-[8%] bottom-[25%] pointer-events-none">
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
              className="p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md shadow-xl text-left flex items-start gap-3 w-56"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="text-[10px] font-black text-white uppercase tracking-wider">Flat Rates Approved</div>
                <div className="text-[9px] text-slate-400 mt-0.5">Flat rates with top professionals</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── SECTION 2: ECOSYSTEM PILLARS ── */}
        <motion.div
          style={{ opacity: ecoOpacity, scale: ecoScale }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none"
        >
          {/* Header */}
          <div className="text-center mb-10 max-w-xl">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#FFC107]">
              The Core Structure
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mt-1.5 leading-none">
              Explore Our Seven Pillars
            </h2>
          </div>

          {/* Alternating Reveal Container */}
          <div className="relative w-full max-w-4xl h-[300px] flex items-center justify-center">
            
            {/* Center vertical indicator line */}
            <div className="absolute left-8 md:left-1/2 top-[-80px] bottom-[-80px] w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-500/50 via-sky-500/50 to-violet-500/50 opacity-20" />

            {/* Glowing nodes path on timeline */}
            {pillars.map((pillar, idx) => {
              const isActive = idx === activeBadgeIdx;
              
              return (
                <div
                  key={`node-${pillar.id}`}
                  className={`absolute left-8 md:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#08101D] border-2 flex items-center justify-center z-25 transition-all duration-500 ${
                    isActive ? 'scale-110 opacity-100' : 'scale-75 opacity-20'
                  }`}
                  style={{
                    borderColor: isActive ? pillar.accent : 'rgba(255,255,255,0.15)',
                    color: isActive ? pillar.accent : 'rgba(255,255,255,0.4)',
                    boxShadow: isActive ? `0 0 14px ${pillar.accent}50` : 'none',
                    top: `calc(50% + ${(idx - 3) * 38}px)`
                  }}
                >
                  {React.createElement(pillar.icon, { className: "w-4 h-4" })}
                </div>
              );
            })}

            {/* Alternating floating cards */}
            {pillars.map((pillar, idx) => {
              const isEven = idx % 2 === 1;
              const { opacity, y, scale, rotateX, rotateY } = pillarTransforms[idx];

              return (
                <motion.div
                  key={pillar.id}
                  style={{ opacity, y, scale, rotateX, rotateY, transformPerspective: 1000 }}
                  className={`absolute w-full max-w-xs md:max-w-sm pointer-events-auto cursor-pointer ${
                    isEven ? 'md:mr-auto md:ml-[55%]' : 'md:ml-auto md:mr-[55%]'
                  } pl-14 md:pl-0`}
                >
                  <div
                    onClick={() => onCategoryClick && onCategoryClick(pillar.title)}
                    className="w-full p-5 md:p-6 rounded-3xl bg-[#111827]/75 backdrop-blur-xl border border-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-white/10 shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] text-left group"
                    style={{
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 15px 35px rgba(0,0,0,0.4)`,
                    }}
                  >
                    {/* Header Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${pillar.accent}15`, color: pillar.accent }}>
                        {pillar.tag}
                      </span>
                      <pillar.icon className="w-4.5 h-4.5 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: pillar.accent }} />
                    </div>

                    {/* Title & Desc */}
                    <h3 className="text-base md:text-lg font-black text-white tracking-tight mt-3">
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-slate-300 text-xs leading-relaxed">
                      {pillar.desc}
                    </p>

                    {/* Tags */}
                    {pillar.categories && (
                      <div className="flex flex-wrap gap-1 mt-4">
                        {pillar.categories.map((cat, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[8px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-350"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Link */}
                    <div className="w-full flex items-center justify-end pt-3 border-t border-white/5 mt-4 text-[10px] font-bold" style={{ color: pillar.accent }}>
                      <span>Explore Pillar</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              );
            })}

          </div>
        </motion.div>

        {/* ── SECTION 3: PRICING PLANS ── */}
        <motion.div
          style={{ opacity: priceOpacity, scale: priceScale, y: priceY }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none"
        >
          {/* Header */}
          <div className="text-center mb-10 max-w-xl">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#FFC107]">
              Premium Tiers
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mt-1">
              Select Your Access Level
            </h2>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pointer-events-auto">
            {pricingPlans.map((plan) => {
              const isPopular = plan.featured;
              return (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-3xl backdrop-blur-xl border text-left transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between group cursor-pointer ${
                    isPopular 
                      ? 'bg-[#111827]/85 border-[#FFC107]/40 shadow-xl shadow-amber-500/5' 
                      : 'bg-[#111827]/70 border-white/5 shadow-md shadow-black/25'
                  }`}
                  style={{
                    boxShadow: isPopular ? `inset 0 1px 0 rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.5)` : 'none'
                  }}
                  onClick={() => onJoinClick && onJoinClick()}
                >
                  {isPopular && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                      Popular
                    </div>
                  )}

                  <div>
                    {/* Name & Pricing */}
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.name}</div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl md:text-3xl font-extrabold text-white">{plan.price}</span>
                      <span className="text-[10px] text-slate-400 font-medium">/ month</span>
                    </div>

                    {/* Card style strip */}
                    <div className="h-10 w-full rounded-lg bg-white/5 border border-white/5 flex items-center justify-between px-3 mt-4">
                      <span className="text-[8px] font-mono tracking-widest text-slate-400">{plan.cardNumber}</span>
                      <div className="w-4 h-4 rounded-full bg-[#FFC107]/20 border border-[#FFC107]/30 flex items-center justify-center text-[#FFC107] text-[6px] font-black">
                        C
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="mt-5 space-y-2.5">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start text-[10px] text-slate-300 gap-2 leading-tight">
                          <Check className="w-3.5 h-3.5 text-[#FFC107] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className={`w-full mt-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isPopular 
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md hover:shadow-amber-400/20' 
                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}
                  >
                    Choose Plan
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── SECTION 4: STORY CTA ── */}
        <motion.div
          style={{ opacity: ctaOpacity, scale: ctaScale, y: ctaY }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        >
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#FFC107] mb-3">
            Get Everything
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-none max-w-2xl">
            Ready to Connect <br /> Your World?
          </h2>
          <p className="mt-4 text-slate-400 text-xs sm:text-sm max-w-sm">
            Join the ecosystem today and unlock elite flat rates, priority lounge access, and professional support.
          </p>

          <div className="mt-8 pointer-events-auto">
            <button
              onClick={() => onJoinClick && onJoinClick()}
              className="inline-flex items-center space-x-2.5 text-xs font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-105 px-10 py-4.5 rounded-full transition-all shadow-xl hover:shadow-amber-400/20 hover:scale-[1.03] duration-300 cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ── FOOTER STATS DOCK (Reveals only in Hero and final CTA) ── */}
        <div className="w-full py-4 border-t border-white/5 bg-[#08101D]/75 backdrop-blur-md flex items-center justify-center px-6 z-30 select-none">
          <div className="w-full max-w-4xl flex items-center justify-between text-[9px] text-slate-400">
            <span className="font-bold">CONNECT PLATFORM · ALL RIGHTS RESERVED</span>
            <div className="flex gap-4 font-bold">
              <span className="hover:text-white cursor-pointer transition-colors">PRIVACY POLICY</span>
              <span className="hover:text-white cursor-pointer transition-colors">TERMS OF SERVICE</span>
            </div>
          </div>
        </div>

      </div>

      {/* Helper target offset anchor for scroll hint positioning */}
      <div id="storyteller-scroll-hint" className="absolute top-[10vh] left-0 pointer-events-none" />
    </div>
  );
}
