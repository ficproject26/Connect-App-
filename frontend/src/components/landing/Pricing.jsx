import React, { useEffect, useState, useRef } from 'react';
import { Check, X, Star } from 'lucide-react';
import diamondPattern from '../../assets/images/diamond_pattern.png';
import goldPattern from '../../assets/images/gold_pattern.png';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const plans = [
    {
      name: 'Silver Tier',
      price: '49',
      cardNumber: '4000 8841 2921 1012',
      features: [
        { text: '10% Off All Vendors', included: true },
        { text: '2 Daily Delivery Slots', included: true },
        { text: 'No Lounge Access', included: false },
        { text: 'Standard Customer Support', included: true },
        { text: 'Everyday Delivery Partner Fees Appy', included: true },
      ],
      buttonText: 'Select Silver',
      featured: false,
      dark: false,
      isSilver: true,
      cardGradient: 'from-slate-200 via-slate-100 to-white border-slate-300 text-slate-800',
      badgeClass: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      accentColor: '#64748B'
    },
    {
      name: 'Gold Elite',
      price: '99',
      cardNumber: '5412 8841 2921 2045',
      features: [
        { text: '20% Off All Vendors', included: true },
        { text: 'Priority Customer Support', included: true },
        { text: '5 Monthly Lounge Passes', included: true },
        { text: 'Exclusive Invite Only Local Events', included: true },
        { text: 'No Booking & Convenice Fees', included: true },
      ],
      buttonText: 'Select Gold',
      featured: true,
      dark: false,
      isSilver: false,
      cardGradient: 'from-[#9c781a] via-[#e5c158] to-[#fffae6] border-yellow-300 text-slate-900',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-brand-gold-light',
      accentColor: '#D4AF37'
    },
    {
      name: 'Diamond Prestige',
      price: '249',
      cardNumber: '3782 8841 2921 3099',
      features: [
        { text: 'Unlimited VIP Lounge Access', included: true, vip: true },
        { text: 'Dedicated Lifestyle Concierge', included: true, vip: true },
        { text: 'Airport Limo Transfer & Escort', included: true, vip: true },
        { text: 'Waived Delivery Fees Everywhere', included: true },
        { text: 'Complimentary Partner Offers', included: true },
      ],
      buttonText: 'Select Diamond',
      featured: false,
      dark: true,
      isSilver: false,
      cardGradient: 'from-[#101726] via-[#090d16] to-[#020305] border-slate-800 text-white',
      badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200',
      accentColor: '#AA7C11'
    },
  ];

  const [flippedCards, setFlippedCards] = useState([false, false, false]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        id: 'pricing-trigger',
        trigger: containerRef.current,
        start: 'top top',
        end: '+=180%',
        pin: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          let flips = [false, false, false];
          if (progress > 0.15) flips[0] = true;
          if (progress > 0.50) flips[1] = true;
          if (progress > 0.85) flips[2] = true;
          setFlippedCards(flips);
        }
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  const handleCardClick = (idx) => {
    if (!containerRef.current) return;
    const trigger = ScrollTrigger.getById('pricing-trigger');
    if (trigger) {
      const start = trigger.start;
      const end = trigger.end;
      const progressVal = idx === 0 ? 0.3 : idx === 1 ? 0.65 : 0.95;
      const targetScroll = start + progressVal * (end - start);
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    } else {
      setFlippedCards(prev => {
        const copy = [...prev];
        copy[idx] = !copy[idx];
        return copy;
      });
    }
  };

  return (
    <section 
      ref={containerRef}
      id="pricing" 
      className="bg-[#f4f7fc] dark:bg-brand-navy transition-colors duration-300 relative overflow-hidden w-full h-screen flex flex-col justify-center items-center select-none"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-200/50 dark:bg-slate-900/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="w-full px-6 md:px-16 lg:px-24 relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Pricing Tiers</span>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-slate-900 dark:text-white mt-2">
            Choose Your Prestige
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Select the membership tier that fits your lifestyle. Get priority booking, heavy discounts, and luxury perks.
          </p>
        </div>

        {/* Side-by-Side Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch justify-center max-w-6xl mx-auto w-full">
          {plans.map((plan, i) => (
            <div 
              key={plan.name}
              onClick={() => handleCardClick(i)}
              className="flip-card-container w-full h-[540px] flex flex-col cursor-pointer"
            >
              <div className={`flip-card-inner ${flippedCards[i] ? 'flipped' : ''} ${
                plan.featured ? 'ring-2 ring-amber-400 dark:ring-amber-500 rounded-3xl shadow-amber-400/10' : ''
              }`}>
                
                {/* ── CARD FRONT (Credit Card Mockup + Pricing Intro) ── */}
                <div className="flip-card-front flex flex-col justify-between p-6 bg-white/70 dark:bg-slate-900/70 border border-slate-200/55 dark:border-slate-800/60 shadow-xl backdrop-blur-md">
                  
                  {/* Credit Card Artwork Container */}
                  <div className="relative aspect-[1.586/1] w-full p-4 flex flex-col justify-between shadow-inner overflow-hidden rounded-2xl">
                    {/* Background Card Color/Pattern */}
                    <div className={`absolute inset-0 bg-gradient-to-tr ${plan.cardGradient} z-0`} />
                    {plan.name === 'Diamond Prestige' && (
                      <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-90 pointer-events-none z-0"
                        style={{ backgroundImage: `url(${diamondPattern})` }}
                      />
                    )}
                    {plan.name === 'Gold Elite' && (
                      <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-[0.38] pointer-events-none z-0 mix-blend-overlay"
                        style={{ backgroundImage: `url(${goldPattern})` }}
                      />
                    )}
                    
                    {/* Premium Lace Border */}
                    <PremiumLaceBorder tier={plan.name} />

                    {/* Left EMV Chip */}
                    <div className="absolute left-[12%] bottom-[18%] z-10">
                      <GoldChip />
                    </div>

                    {/* Contactless symbol */}
                    <div className="absolute right-5 top-4 z-10 flex items-center space-x-1.5">
                      <span className={`text-[8px] font-bold tracking-wider opacity-80 uppercase ${
                        plan.isSilver ? 'text-slate-500' : 'text-[#d4af37]'
                      }`}>
                        {plan.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] text-slate-400 opacity-60">📶</span>
                    </div>

                    {/* Large Center 3D Logo */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                      <svg className="w-12 h-8 filter drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 100 70" fill={`url(#pricingDiamondGrid-${plan.name})`} xmlns="http://www.w3.org/2000/svg">
                        <polygon points="50,5 90,26 50,65 10,26" stroke={plan.isSilver ? "#64748B" : "#AA7C11"} strokeWidth="1.2" />
                        <polygon points="50,5 70,26 50,65 30,26" stroke={plan.isSilver ? "#64748B" : "#AA7C11"} strokeWidth="1" />
                        <line x1="10" y1="26" x2="90" y2="26" stroke={plan.isSilver ? "#64748B" : "#AA7C11"} strokeWidth="1.2" />
                        <line x1="30" y1="26" x2="50" y2="5" stroke={plan.isSilver ? "#64748B" : "#AA7C11"} strokeWidth="1" />
                        <line x1="70" y1="26" x2="50" y2="5" stroke={plan.isSilver ? "#64748B" : "#AA7C11"} strokeWidth="1" />
                        <defs>
                          <linearGradient id={`pricingDiamondGrid-${plan.name}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={plan.isSilver ? "#FFFFFF" : "#FFF9E6"} />
                            <stop offset="40%" stopColor={plan.isSilver ? "#CBD5E1" : "#F5D061"} />
                            <stop offset="100%" stopColor={plan.isSilver ? "#64748B" : "#805B07"} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className={`text-[11px] font-extrabold tracking-[0.25em] mt-1.5 uppercase font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
                        plan.isSilver 
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-350 to-slate-500'
                          : 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFF9E6] via-[#D4AF37] to-[#805B07]'
                      }`}>
                        CONNECT
                      </span>
                    </div>
                  </div>

                  {/* Card Visual Front Info */}
                  <div className="flex flex-col items-center justify-center flex-grow py-5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${plan.badgeClass} mb-3.5`}>
                      {plan.name}
                    </span>
                    <div className="flex items-baseline mb-3.5">
                      <span className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/mo</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase animate-pulse">
                      Scroll or Click for Benefits
                    </span>
                  </div>

                </div>

                {/* ── CARD BACK (Benefits Details + Button) ── */}
                <div className="flip-card-back flex flex-col justify-between p-6 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 shadow-2xl">
                  <div>
                    {/* Badge & Price */}
                    <div className="flex items-center justify-between mb-5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${plan.badgeClass}`}>
                        {plan.name}
                      </span>
                      <div className="flex items-baseline">
                        <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                          ${plan.price}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">/mo</span>
                      </div>
                    </div>

                    {/* Plan Features */}
                    <h3 className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-4 select-none">
                      Membership Benefits
                    </h3>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-650 dark:text-slate-350">
                          {feature.vip ? (
                            <Star className="w-4 h-4 text-brand-gold fill-brand-gold shrink-0 mt-0.5" />
                          ) : feature.included ? (
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-slate-350 dark:text-slate-600 shrink-0 mt-0.5" />
                          )}
                          <span className={!feature.included ? 'text-slate-400 dark:text-slate-500 line-through' : ''}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTier(plan.name);
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer mt-auto text-center ${
                      plan.featured
                        ? 'bg-gradient-gold text-slate-900 hover:brightness-105'
                        : plan.dark
                        ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100'
                        : 'bg-slate-105 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                    }`}
                  >
                    {plan.buttonText}
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
