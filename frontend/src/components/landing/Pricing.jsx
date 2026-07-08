import React, { useState, useRef } from 'react';
import { Check, X, Star, RefreshCw } from 'lucide-react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import diamondPattern from '../../assets/images/diamond_pattern.png';
import goldPattern from '../../assets/images/gold_pattern.png';

// Gold Chip Component
const GoldChip = () => (
  <svg className="w-8 h-6 rounded-[3px] shadow-sm shrink-0" viewBox="0 0 50 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="50" height="38" rx="3" fill="url(#pricingChipGold)" />
    <path d="M 0 10 H 50 M 0 28 H 50 M 16 0 V 38 M 34 0 V 38 M 16 10 C 20 12, 20 26, 16 28 M 34 10 C 30 12, 30 26, 34 28" stroke="rgba(130, 95, 15, 0.6)" strokeWidth="0.8" />
    <defs>
      <linearGradient id="pricingChipGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF9E6" />
        <stop offset="35%" stopColor="#E6C35C" />
        <stop offset="70%" stopColor="#B3861B" />
        <stop offset="100%" stopColor="#805B07" />
      </linearGradient>
    </defs>
  </svg>
);

// Premium Lace Border for all cards (Silver, Gold, Diamond)
const PremiumLaceBorder = ({ tier }) => {
  const isSilver = tier === 'Silver Tier';
  const isGold = tier === 'Gold Elite';
  
  const outerStroke = isSilver 
    ? "rgba(148, 163, 184, 0.35)" 
    : isGold 
    ? "rgba(212, 175, 55, 0.45)" 
    : "rgba(212, 175, 55, 0.55)";
    
  const innerStroke = isSilver 
    ? "rgba(203, 213, 225, 0.18)" 
    : isGold 
    ? "rgba(243, 229, 171, 0.18)" 
    : "rgba(212, 175, 55, 0.25)";
    
  const primaryScroll = isSilver ? "#cbd5e1" : isGold ? "#fffae6" : "#e2e8f0";
  const secondaryScroll = isSilver ? "#94a3b8" : isGold ? "#e5c158" : "#d4af37";
  const goldAccent = isSilver ? "#cbd5e1" : isGold ? "#9c781a" : "#AA7C11";
  
  return (
    <svg className="absolute inset-0 w-full h-full p-1 pointer-events-none z-0" viewBox="0 0 200 126" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,16 150,16 182,63 150,110 50,110 18,63" stroke={outerStroke} strokeWidth="1.2" />
      <polygon points="52,18 148,18 179,63 148,108 52,108 21,63" stroke={innerStroke} strokeWidth="0.6" strokeDasharray="2 1.5" />
      <path d="M 55,14 L 145,14" stroke={innerStroke} strokeWidth="0.5" strokeDasharray="1 3" />
      <path d="M 55,112 L 145,112" stroke={innerStroke} strokeWidth="0.5" strokeDasharray="1 3" />
      
      {/* TOP LEFT CORNER */}
      <g opacity="0.35">
        <path d="M 12,12 C 25,6 35,22 46,12" stroke={primaryScroll} strokeWidth="0.6" />
        <path d="M 8,25 C 22,20 18,38 35,20" stroke={secondaryScroll} strokeWidth="0.5" />
        <path d="M 5,40 C 25,35 25,48 40,30" stroke={primaryScroll} strokeWidth="0.4" />
        <path d="M 15,5 C 28,15 38,5 48,15" stroke={primaryScroll} strokeWidth="0.5" />
        <path d="M 5,8 Q 18,18 28,4" stroke={secondaryScroll} strokeWidth="0.5" />
        <path d="M 22,2 Q 30,15 42,2" stroke={goldAccent} strokeWidth="0.4" />
        <path d="M 6,12 Q 10,12 8,8 Q 8,10 6,12 Z" fill={secondaryScroll} />
        <path d="M 16,18 Q 20,20 18,16 Q 16,18 16,18 Z" fill={goldAccent} />
        <path d="M 32,10 Q 36,12 34,8 Q 32,10 32,10 Z" fill={primaryScroll} />
      </g>

      {/* TOP RIGHT CORNER */}
      <g opacity="0.35" transform="translate(200, 0) scale(-1, 1)">
        <path d="M 12,12 C 25,6 35,22 46,12" stroke={primaryScroll} strokeWidth="0.6" />
        <path d="M 8,25 C 22,20 18,38 35,20" stroke={secondaryScroll} strokeWidth="0.5" />
        <path d="M 5,40 C 25,35 25,48 40,30" stroke={primaryScroll} strokeWidth="0.4" />
        <path d="M 15,5 C 28,15 38,5 48,15" stroke={primaryScroll} strokeWidth="0.5" />
        <path d="M 5,8 Q 18,18 28,4" stroke={secondaryScroll} strokeWidth="0.5" />
        <path d="M 22,2 Q 30,15 42,2" stroke={goldAccent} strokeWidth="0.4" />
        <path d="M 6,12 Q 10,12 8,8 Q 8,10 6,12 Z" fill={secondaryScroll} />
        <path d="M 16,18 Q 20,20 18,16 Q 16,18 16,18 Z" fill={goldAccent} />
      </g>

      {/* BOTTOM LEFT CORNER */}
      <g opacity="0.35" transform="translate(0, 126) scale(1, -1)">
        <path d="M 12,12 C 25,6 35,22 46,12" stroke={primaryScroll} strokeWidth="0.6" />
        <path d="M 8,25 C 22,20 18,38 35,20" stroke={secondaryScroll} strokeWidth="0.5" />
        <path d="M 5,40 C 25,35 25,48 40,30" stroke={primaryScroll} strokeWidth="0.4" />
        <path d="M 15,5 C 28,15 38,5 48,15" stroke={primaryScroll} strokeWidth="0.5" />
        <path d="M 5,8 Q 18,18 28,4" stroke={secondaryScroll} strokeWidth="0.5" />
        <path d="M 22,2 Q 30,15 42,2" stroke={goldAccent} strokeWidth="0.4" />
        <path d="M 6,12 Q 10,12 8,8 Q 8,10 6,12 Z" fill={secondaryScroll} />
        <path d="M 16,18 Q 20,20 18,16 Q 16,18 16,18 Z" fill={goldAccent} />
      </g>

      {/* BOTTOM RIGHT CORNER */}
      <g opacity="0.35" transform="translate(200, 126) scale(-1, -1)">
        <path d="M 12,12 C 25,6 35,22 46,12" stroke={primaryScroll} strokeWidth="0.6" />
        <path d="M 8,25 C 22,20 18,38 35,20" stroke={secondaryScroll} strokeWidth="0.5" />
        <path d="M 5,40 C 25,35 25,48 40,30" stroke={primaryScroll} strokeWidth="0.4" />
        <path d="M 15,5 C 28,15 38,5 48,15" stroke={primaryScroll} strokeWidth="0.5" />
        <path d="M 5,8 Q 18,18 28,4" stroke={secondaryScroll} strokeWidth="0.5" />
        <path d="M 22,2 Q 30,15 42,2" stroke={goldAccent} strokeWidth="0.4" />
        <path d="M 6,12 Q 10,12 8,8 Q 8,10 6,12 Z" fill={secondaryScroll} />
        <path d="M 16,18 Q 20,20 18,16 Q 16,18 16,18 Z" fill={goldAccent} />
      </g>

      <g opacity="0.25">
        <path d="M 4,45 C 10,48 10,78 4,81" stroke={primaryScroll} strokeWidth="0.5" />
        <path d="M 196,45 C 190,48 190,78 196,81" stroke={primaryScroll} strokeWidth="0.5" />
      </g>
    </svg>
  );
};

export default function Pricing({ onSelectTier }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });



  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    let index = 0;
    if (latest < 0.33) {
      index = 0;
    } else if (latest < 0.66) {
      index = 1;
    } else {
      index = 2;
    }
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  });

  const handleCardClick = (index, planName) => {
    if (index !== activeIndex) {
      if (containerRef.current) {
        const element = containerRef.current;
        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const containerTop = rect.top + scrollTop;
        const containerHeight = rect.height;
        const targetProgress = index === 0 ? 0.15 : index === 1 ? 0.5 : 0.85;
        const targetScroll = containerTop + targetProgress * (containerHeight - window.innerHeight);
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  };

  const plans = [
    {
      name: 'Silver Tier',
      price: '49',
      cardNumber: '4000 8841 2921 1012',
      features: [
        { text: '10% Off All Vendors', included: true },
        { text: '2 Daily Delivery Slots', included: true },
        { text: 'No Lounge Access', included: false },
      ],
      buttonText: 'Select Silver',
      featured: false,
      dark: false,
      isSilver: true,
      cardGradient: 'from-slate-200 via-slate-100 to-white border-slate-300',
    },
    {
      name: 'Gold Elite',
      price: '99',
      cardNumber: '5412 8841 2921 2045',
      features: [
        { text: '20% Off All Vendors', included: true },
        { text: 'Priority Support', included: true },
        { text: '5 Monthly Lounge Passes', included: true },
      ],
      buttonText: 'Select Gold',
      featured: true,
      dark: false,
      isSilver: false,
      cardGradient: 'from-[#9c781a] via-[#e5c158] to-[#fffae6] border-yellow-300',
    },
    {
      name: 'Diamond Prestige',
      price: '249',
      cardNumber: '3782 8841 2921 3099',
      features: [
        { text: 'Unlimited VIP Access', included: true, vip: true },
        { text: 'Dedicated Concierge', included: true, vip: true },
        { text: 'Airport Limo Transfer', included: true, vip: true },
      ],
      buttonText: 'Select Diamond',
      featured: false,
      dark: true,
      isSilver: false,
      cardGradient: 'from-[#101726] via-[#090d16] to-[#020305] border-slate-800',
    },
  ];

  const activePlan = plans[activeIndex];

  // Motion Values for Card 0 (Silver)
  // Silver is active in front initially, then slides straight up and exits on scroll
  const x0 = useTransform(scrollYProgress, [0, 0.25, 0.4, 1.0], [0, 0, 0, 0]);
  const y0 = useTransform(scrollYProgress, [0, 0.25, 0.4, 1.0], [0, 0, -450, -450]);
  const z0 = useTransform(scrollYProgress, [0, 0.25, 0.4, 1.0], [0, 0, 100, 100]);
  const scale0 = useTransform(scrollYProgress, [0, 0.25, 0.4, 1.0], [1, 1, 0.9, 0.9]);
  const opacity0 = useTransform(scrollYProgress, [0, 0.25, 0.4, 1.0], [1, 1, 0, 0]);
  const rotateX0 = useTransform(scrollYProgress, [0, 0.25, 0.4, 1.0], [15, 15, 20, 20]);
  const rotateY0 = useTransform(scrollYProgress, [0, 0.25, 0.4, 1.0], [-25, -25, -20, -20]);
  const rotateZ0 = useTransform(scrollYProgress, [0, 0.25, 0.4, 1.0], [5, 5, 0, 0]);

  // Motion Values for Card 1 (Gold)
  // Gold is visible stacked behind Silver initially, then moves to front active position, then slides straight up and exits.
  const x1 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [30, 30, 0, 0, 0, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [-20, -20, 0, 0, -450, -450]);
  const z1 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [-80, -80, 0, 0, 100, 100]);
  const scale1 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [0.93, 0.93, 1, 1, 0.9, 0.9]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [0.85, 0.85, 1, 1, 0, 0]);
  const rotateX1 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [12, 12, 15, 15, 20, 20]);
  const rotateY1 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [-23, -23, -25, -25, -20, -20]);
  const rotateZ1 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [4, 4, 5, 5, 0, 0]);

  // Motion Values for Card 2 (Diamond)
  // Diamond is visible stacked behind Gold initially, then moves to middle, then moves to front active position.
  const x2 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [60, 60, 30, 30, 0, 0]);
  const y2 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [-40, -40, -20, -20, 0, 0]);
  const z2 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [-160, -160, -80, -80, 0, 0]);
  const scale2 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [0.86, 0.86, 0.93, 0.93, 1, 1]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [0.7, 0.7, 0.85, 0.85, 1, 1]);
  const rotateX2 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [10, 10, 12, 12, 15, 15]);
  const rotateY2 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [-20, -20, -23, -23, -25, -25]);
  const rotateZ2 = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.65, 0.8, 1.0], [3, 3, 4, 4, 5, 5]);

  const cardsTransforms = [
    { x: x0, y: y0, z: z0, scale: scale0, opacity: opacity0, rotateX: rotateX0, rotateY: rotateY0, rotateZ: rotateZ0 },
    { x: x1, y: y1, z: z1, scale: scale1, opacity: opacity1, rotateX: rotateX1, rotateY: rotateY1, rotateZ: rotateZ1 },
    { x: x2, y: y2, z: z2, scale: scale2, opacity: opacity2, rotateX: rotateX2, rotateY: rotateY2, rotateZ: rotateZ2 }
  ];

  return (
    <section 
      ref={containerRef} 
      id="pricing" 
      className="relative h-[220vh] bg-[#f4f7fc] dark:bg-brand-navy transition-colors duration-300"
    >
      {/* Sticky viewport frame wrapper */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden z-10">
        
        {/* Background radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-200/50 dark:bg-slate-900/10 rounded-full blur-[140px] pointer-events-none z-0" />

        <div className="w-full px-6 md:px-16 lg:px-24 relative z-10 flex flex-col h-full max-h-[85vh] justify-between py-6">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-4 md:mb-8 shrink-0">
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
              Choose Your Prestige
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Scroll down to explore tiers and details.
            </p>
          </div>

          {/* Interactive Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center flex-grow">
            
            {/* Left: Dynamic details container */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center w-full max-w-md mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 25 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 md:p-6 shadow-xl flex flex-col z-10"
                >
                  {/* Badge & Price */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      activeIndex === 0 
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350'
                        : activeIndex === 1
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-brand-gold-light'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200'
                    }`}>
                      {activePlan.name}
                    </span>
                    <div className="flex items-baseline">
                      <span className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                        ${activePlan.price}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/mo</span>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <h3 className="text-sm font-bold tracking-wider text-slate-400 dark:text-slate-450 uppercase mb-3 select-none">
                    Membership Benefits
                  </h3>
                  <ul className="space-y-2.5 mb-5">
                    {activePlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs">
                        {feature.vip ? (
                          <Star className="w-4 h-4 text-brand-gold fill-brand-gold shrink-0 mt-0.5" />
                        ) : feature.included ? (
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-slate-350 dark:text-slate-605 shrink-0 mt-0.5" />
                        )}
                        <span className={!feature.included ? 'text-slate-400 dark:text-slate-655 line-through' : 'text-slate-600 dark:text-slate-300'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectTier) onSelectTier(activePlan.name);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer ${
                      activeIndex === 1
                        ? 'bg-gradient-gold text-slate-900 hover:brightness-105'
                        : activeIndex === 2
                        ? 'bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                        : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600'
                    }`}
                  >
                    {activePlan.buttonText}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: 3D Stack container */}
            <div className="lg:col-span-7 order-1 lg:order-2 flex items-center justify-center w-full max-w-md lg:max-w-lg mx-auto py-4 lg:py-0">
              <div 
                className="relative w-full aspect-[1.586/1] max-w-[360px] md:max-w-[400px] h-[220px] md:h-[250px] mx-auto flex items-center justify-center scale-90 sm:scale-95 md:scale-100 origin-center"
                style={{
                  perspective: '1200px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {plans.map((plan, i) => {
                  const isActive = i === activeIndex;
                  const t = cardsTransforms[i];

                  return (
                    <motion.div
                      key={plan.name}
                      style={{
                        x: t.x,
                        y: t.y,
                        z: t.z,
                        scale: t.scale,
                        opacity: t.opacity,
                        rotateX: t.rotateX,
                        rotateY: t.rotateY,
                        rotateZ: t.rotateZ,
                        transformStyle: 'preserve-3d',
                        zIndex: 10 - i
                      }}
                      onClick={() => handleCardClick(i, plan.name)}
                      className="absolute w-full h-full cursor-pointer pointer-events-auto"
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    >
                      <div className="relative w-full h-full select-none">
                        {/* ==================== FRONT OF CARD ==================== */}
                        <div
                          className={`absolute inset-0 w-full h-full rounded-2xl border p-5 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-350 bg-gradient-to-tr ${
                            plan.cardGradient
                          }`}
                        >
                          {plan.name === 'Diamond Prestige' && (
                            <div 
                              className="absolute inset-0 w-full h-full bg-cover bg-center opacity-90 rounded-2xl pointer-events-none z-0"
                              style={{ backgroundImage: `url(${diamondPattern})` }}
                            />
                          )}
                          {plan.name === 'Gold Elite' && (
                            <div 
                              className="absolute inset-0 w-full h-full bg-cover bg-center opacity-[0.38] rounded-2xl pointer-events-none z-0 mix-blend-overlay"
                              style={{ backgroundImage: `url(${goldPattern})` }}
                            />
                          )}
                          {/* Premium Lace Border */}
                          <PremiumLaceBorder tier={plan.name} />
                          
                          {/* Left EMV Chip */}
                          <div className="absolute left-[15%] bottom-[20%] z-20">
                            <GoldChip />
                          </div>

                          {/* Contactless symbol */}
                          <div className="absolute right-6 top-5 z-20 flex items-center space-x-1.5">
                            <span className={`text-[8px] font-bold tracking-wider opacity-85 uppercase ${
                              plan.isSilver ? 'text-slate-400' : 'text-[#d4af37]'
                            }`}>
                              {plan.name.split(' ')[0]}
                            </span>
                            <span className="text-[10px] text-slate-400 opacity-60">📶</span>
                          </div>



                          {/* Large Center 3D Logo */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                            <svg className="w-14 h-10 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)]" viewBox="0 0 100 70" fill={`url(#${plan.isSilver ? 'silverPricingDiamondGradCent' : 'goldPricingDiamondGradCent'})`} xmlns="http://www.w3.org/2000/svg">
                              <polygon points="50,5 90,26 50,65 10,26" stroke={plan.isSilver ? "#64748B" : "#AA7C11"} strokeWidth="1.2" />
                              <polygon points="50,5 70,26 50,65 30,26" stroke={plan.isSilver ? "#64748B" : "#AA7C11"} strokeWidth="1" />
                              <line x1="10" y1="26" x2="90" y2="26" stroke={plan.isSilver ? "#64748B" : "#AA7C11"} strokeWidth="1.2" />
                              <line x1="30" y1="26" x2="50" y2="5" stroke={plan.isSilver ? "#64748B" : "#AA7C11"} strokeWidth="1" />
                              <line x1="70" y1="26" x2="50" y2="5" stroke={plan.isSilver ? "#64748B" : "#AA7C11"} strokeWidth="1" />
                              <defs>
                                <linearGradient id="goldPricingDiamondGradCent" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#FFF9E6" />
                                  <stop offset="30%" stopColor="#F5D061" />
                                  <stop offset="70%" stopColor="#D4AF37" />
                                  <stop offset="100%" stopColor="#805B07" />
                                </linearGradient>
                                <linearGradient id="silverPricingDiamondGradCent" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#FFFFFF" />
                                  <stop offset="40%" stopColor="#CBD5E1" />
                                  <stop offset="100%" stopColor="#64748B" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <span className={`text-[13px] md:text-[15px] font-extrabold tracking-[0.3em] mt-2 uppercase font-sans drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] ${
                              plan.isSilver 
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500'
                                : 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFF9E6] via-[#D4AF37] to-[#805B07]'
                            }`}>
                              CONNECT
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
