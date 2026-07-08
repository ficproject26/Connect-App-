import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  FileText, ShieldCheck, LayoutDashboard, Tv, Coins,
  Store, Settings, Percent, Megaphone, TrendingUp,
  User
} from 'lucide-react';

// Calculates the midpoint and tangent angle of a cubic Bezier curve at t = 0.5
const getBezierMidpoint = (p0, p1, p2, p3) => {
  const t = 0.5;
  const mt = 1 - t;
  
  // Coordinate on the curve
  const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
  const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
  
  // Tangent vector (derivative)
  const dx = 3 * mt * mt * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
  const dy = 3 * mt * mt * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
  
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return { x, y, angle };
};

const stepStyles = [
  {
    // Step 1: Gold / Yellow
    cardActiveCls: 'bg-gradient-to-br from-[#0F172A] to-[#2A210F] border-brand-gold/40 shadow-[0_12px_35px_-10px_rgba(212,175,55,0.3)]',
    iconActiveCls: 'bg-brand-gold/15 text-brand-gold border border-brand-gold/30',
    titleActiveCls: 'text-brand-gold-light',
    badgeActiveCls: 'bg-brand-gold text-[#0f1322] border-brand-gold ring-brand-gold/30',
  },
  {
    // Step 2: Light Blue
    cardActiveCls: 'bg-gradient-to-br from-[#0F172A] to-[#0C2D48] border-sky-500/40 shadow-[0_12px_35px_-10px_rgba(14,165,233,0.3)]',
    iconActiveCls: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    titleActiveCls: 'text-sky-400',
    badgeActiveCls: 'bg-sky-500 text-white border-sky-500 ring-sky-500/30',
  },
  {
    // Step 3: Light Pink
    cardActiveCls: 'bg-gradient-to-br from-[#0F172A] to-[#3F1B2C] border-pink-500/40 shadow-[0_12px_35px_-10px_rgba(236,72,153,0.3)]',
    iconActiveCls: 'bg-pink-500/15 text-pink-400 border border-pink-500/30',
    titleActiveCls: 'text-pink-400',
    badgeActiveCls: 'bg-pink-500 text-white border-pink-500 ring-pink-500/30',
  },
  {
    // Step 4: Ash (Cool grey)
    cardActiveCls: 'bg-gradient-to-br from-[#0F172A] to-[#1E293B] border-slate-500/40 shadow-[0_12px_35px_-10px_rgba(100,116,139,0.3)]',
    iconActiveCls: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
    titleActiveCls: 'text-slate-400',
    badgeActiveCls: 'bg-slate-500 text-white border-slate-500 ring-slate-500/30',
  },
  {
    // Step 5: Orange
    cardActiveCls: 'bg-gradient-to-br from-[#0F172A] to-[#381E15] border-orange-500/40 shadow-[0_12px_35px_-10px_rgba(249,115,22,0.3)]',
    iconActiveCls: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    titleActiveCls: 'text-orange-400',
    badgeActiveCls: 'bg-orange-500 text-white border-orange-500 ring-orange-500/30',
  },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState('agent'); // 'agent' | 'vendor'
  const [scrollProgress, setScrollProgress] = useState(0);
  const [coords, setCoords] = useState([]);
  const [midpoints, setMidpoints] = useState([]);
  const [pathLength, setPathLength] = useState(1000);
  const [activeSteps, setActiveSteps] = useState([true, false, false, false, false]);
  const [revealedSteps, setRevealedSteps] = useState([true, true, false, false, false]);
  const [lineTip, setLineTip] = useState({ x: 0, y: 0, angle: 90 });

  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const activePathRef = useRef(null);
  const desktopRefs = useRef([]);
  const mobileRefs = useRef([]);
  const targetProgressRef = useRef(0);

  const agentSteps = [
    {
      number: '1',
      title: 'Apply Online',
      desc: 'Submit your profile and business details on our portal in under 5 minutes.',
      icon: FileText,
    },
    {
      number: '2',
      title: 'Credentials Review',
      desc: 'Our compliance team reviews and validates your onboarding details in 24 hours.',
      icon: ShieldCheck,
    },
    {
      number: '3',
      title: 'Unlock Dashboard',
      desc: 'Receive your secure access keys, digital assets, and premium welcome kits.',
      icon: LayoutDashboard,
    },
    {
      number: '4',
      title: 'Onboarding Session',
      desc: 'Schedule a quick 1-on-1 walkthrough with a success manager to maximize your revenue.',
      icon: Tv,
    },
    {
      number: '5',
      title: 'Start Earning',
      desc: 'Connect with premium global members and start collecting automated commission payouts.',
      icon: Coins,
    },
  ];

  const vendorSteps = [
    {
      number: '1',
      title: 'Register Store',
      desc: 'Create your merchant profile and upload your business credentials.',
      icon: Store,
    },
    {
      number: '2',
      title: 'Configure POS',
      desc: 'Integrate your menu, reservation system, or catalog into our platform.',
      icon: Settings,
    },
    {
      number: '3',
      title: 'Define Privileges',
      desc: 'Establish exclusive discounts and special perks for premium members.',
      icon: Percent,
    },
    {
      number: '4',
      title: 'Merchant Launch',
      desc: 'Get featured on our member map, global searches, and newsletters.',
      icon: Megaphone,
    },
    {
      number: '5',
      title: 'Go Live',
      desc: 'Attract affluent high-paying members and scale your business revenue.',
      icon: TrendingUp,
    },
  ];

  const steps = activeTab === 'agent' ? agentSteps : vendorSteps;
  const thresholds = [0.0, 0.20, 0.40, 0.60, 0.80];

  const handleScroll = () => {
    if (!containerRef.current) return;
    const viewportHeight = window.innerHeight;

    // Check coordinates of each badge
    const activeRefs = window.innerWidth >= 768 ? desktopRefs : mobileRefs;
    
    // Compute scroll progress based on the position of the first and last badge relative to the viewport
    const badge1 = activeRefs.current[0];
    const badge5 = activeRefs.current[4];
    
    if (badge1 && badge5) {
      const rect1 = badge1.getBoundingClientRect();
      const rect5 = badge5.getBoundingClientRect();
      const totalDist = rect5.top - rect1.top;
      if (totalDist > 0) {
        // We want the progress to start when Badge 1 crosses yActive (65% viewport depth)
        // and complete when Badge 5 crosses yActive (65% viewport depth).
        const yActive = viewportHeight * 0.65;
        const currentDist = yActive - rect1.top;
        const progress = Math.min(Math.max(currentDist / totalDist, 0), 1);
        targetProgressRef.current = progress;
      }
    }
  };

  // Smooth lerp loop to damp scroll progress changes and make the movement fluid
  useEffect(() => {
    let animationFrameId;
    const tick = () => {
      setScrollProgress((prev) => {
        const diff = targetProgressRef.current - prev;
        if (Math.abs(diff) < 0.001) {
          return targetProgressRef.current;
        }
        return prev + diff * 0.06; // Easing factor (0.06 slows down the speed beautifully)
      });
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Update step activation and reveal states based on lerped scrollProgress
  useEffect(() => {
    const newActive = [
      true, // Step 1 always active once loaded
      scrollProgress >= 0.23,
      scrollProgress >= 0.48,
      scrollProgress >= 0.73,
      scrollProgress >= 0.98
    ];

    const newRevealed = [
      true, // Step 1 always revealed
      true, // Step 2 always revealed
      scrollProgress >= 0.15,
      scrollProgress >= 0.40,
      scrollProgress >= 0.65
    ];

    setActiveSteps(newActive);
    setRevealedSteps(newRevealed);
  }, [scrollProgress]);

  // Calculate scroll progress and dynamic viewport-based step states as user scrolls
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activeTab]);

  const updateCoords = () => {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const activeRefs = window.innerWidth >= 768 ? desktopRefs : mobileRefs;
    const newCoords = activeRefs.current.map((ref) => {
      if (!ref) return { x: 0, y: 0 };
      const rect = ref.getBoundingClientRect();
      return {
        x: rect.left - svgRect.left + rect.width / 2,
        y: rect.top - svgRect.top + rect.height / 2,
      };
    });
    
    // Check if measured coords are valid (not all zeroes)
    const isValid = newCoords.length === 5 && newCoords.every(c => c.x !== 0 || c.y !== 0);
    if (isValid) {
      setCoords(newCoords);
    }
  };

  // Run coordinates tracking on mount, resize, and tab swap
  useLayoutEffect(() => {
    // Staggered checks to handle splash loader completion and page layout settlement
    const timeouts = [120, 800, 2000, 3500, 5000];
    const timers = timeouts.map(delay => 
      setTimeout(() => {
        updateCoords();
        handleScroll();
      }, delay)
    );

    window.addEventListener('resize', updateCoords);
    window.addEventListener('resize', handleScroll);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activeTab]);

  // Update coords on load, and observe size changes on the SVG canvas wrapper
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateCoords();
    });
    if (svgRef.current) {
      observer.observe(svgRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const hasValidCoords = coords.length === 5;

  // Compute bezier path data and segment midpoints
  let pathData = '';
  useEffect(() => {
    if (hasValidCoords) {
      const mids = [];
      let tempPath = `M ${coords[0].x} ${coords[0].y}`;
      
      for (let i = 0; i < 4; i++) {
        const pStart = coords[i];
        const pEnd = coords[i + 1];
        const dy = pEnd.y - pStart.y;
        
        // Vertical control points to form smooth curves.
        // This makes the curve enter and exit every badge vertically, avoiding loops and intersections.
        const cp1 = { x: pStart.x, y: pStart.y + dy / 2 };
        const cp2 = { x: pEnd.x, y: pEnd.y - dy / 2 };
        
        tempPath += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${pEnd.x} ${pEnd.y}`;
        
        const mid = getBezierMidpoint(pStart, cp1, cp2, pEnd);
        mids.push(mid);
      }
      setMidpoints(mids);
    }
  }, [coords, hasValidCoords]);

  // Re-generate raw path string for render
  if (hasValidCoords) {
    pathData = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < 4; i++) {
      const pStart = coords[i];
      const pEnd = coords[i + 1];
      const dy = pEnd.y - pStart.y;
      const cp1x = pStart.x;
      const cp1y = pStart.y + dy / 2;
      const cp2x = pEnd.x;
      const cp2y = pEnd.y - dy / 2;
      pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pEnd.x} ${pEnd.y}`;
    }
  }

  // Map overall scrollProgress cleanly to active line drawing timeline (completing fully at 0.85)
  const pathProgress = Math.min(scrollProgress / 0.85, 1);
  const strokeDashoffset = pathLength - pathLength * pathProgress;

  // Calculate active path length
  useLayoutEffect(() => {
    if (activePathRef.current && hasValidCoords) {
      try {
        const length = activePathRef.current.getTotalLength();
        setPathLength(length);
      } catch (e) {
        console.error('Failed to get path length', e);
      }
    }
  }, [coords, hasValidCoords, pathData]);

  // Calculate line tip position and orientation angle for the moving car
  useLayoutEffect(() => {
    if (activePathRef.current && pathLength > 0) {
      try {
        const currentLength = pathLength * pathProgress;
        const point = activePathRef.current.getPointAtLength(currentLength);
        
        // Sample a point slightly behind to get the tangent/angle
        const sampleDist = 2; // px
        const prevLength = Math.max(0, currentLength - sampleDist);
        const prevPoint = activePathRef.current.getPointAtLength(prevLength);
        
        let angle = 90; // Default facing downwards
        if (currentLength > 0) {
          const dx = point.x - prevPoint.x;
          const dy = point.y - prevPoint.y;
          angle = Math.atan2(dy, dx) * (180 / Math.PI);
        } else if (midpoints.length > 0) {
          angle = midpoints[0].angle;
        }
        
        setLineTip({ x: point.x, y: point.y, angle });
      } catch (e) {
        // Ignore fallback
      }
    }
  }, [pathProgress, pathLength, coords, pathData, midpoints]);

  const currentStepIdx = activeSteps.reduce((acc, curr, idx) => curr ? idx : acc, 0);

  return (
    <section 
      ref={containerRef} 
      className="dark relative pt-8 md:pt-12 pb-24 md:pb-36 bg-[#070e1b] text-slate-100 select-none overflow-hidden"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto px-6 mb-8 md:mb-12">
        <span className="text-xs md:text-sm font-black text-brand-gold uppercase tracking-widest">
          Premium Onboarding Journey
        </span>
        <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight text-[#0f1322] dark:text-white mt-2">
          How It Works
        </h2>
        <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base max-w-lg mx-auto">
          Get set up in five simple steps and begin your premium global membership experience.
        </p>
      </div>

      {/* Dynamic Toggle Switcher */}
      <div className="flex justify-center mb-10 md:mb-14 z-20">
        <div className="bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur-md p-1.5 rounded-full flex items-center space-x-1 border border-slate-300/60 dark:border-slate-700/60 shadow-sm">
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex items-center space-x-2 px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'agent'
                ? 'bg-[#0f1322] dark:bg-brand-gold text-white dark:text-[#0f1322] shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Agent Option</span>
          </button>
          <button
            onClick={() => setActiveTab('vendor')}
            className={`flex items-center space-x-2 px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'vendor'
                ? 'bg-[#0f1322] dark:bg-brand-gold text-white dark:text-[#0f1322] shadow-md'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>2. Vendor Option</span>
          </button>
        </div>
      </div>

      {/* Timeline Layout Container */}
      <div className="relative w-full max-w-6xl mx-auto px-6 md:px-12">
        
        {/* SVG Curve Canvas (Underneath cards) */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg ref={svgRef} className="w-full h-full">
            <defs>
              <linearGradient id="goldTimelineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#AA7C11" />
                <stop offset="50%" stopColor="#D4AF37" />
                <stop offset="100%" stopColor="#FFF8DC" />
              </linearGradient>
              <linearGradient id="carBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
              <linearGradient id="packageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#6D28D9" />
              </linearGradient>
              <filter id="goldTimelineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {hasValidCoords && (
              <>
                {/* Background Path (gray, inactive) */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="text-slate-200 dark:text-slate-800/60"
                />
                {/* Active Path (gold gradient with glow, drawing dynamically) */}
                <path
                  ref={activePathRef}
                  d={pathData}
                  fill="none"
                  stroke="url(#goldTimelineGradient)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={pathLength || 1000}
                  strokeDashoffset={strokeDashoffset}
                  filter="url(#goldTimelineGlow)"
                />

                {/* Midpoints Arrowheads */}
                {midpoints.map((mid, idx) => {
                  const isArrowActive = activeSteps[idx + 1];
                  const isArrowRevealed = activeSteps[idx];

                  return (
                    <g 
                      key={idx} 
                      transform={`translate(${mid.x}, ${mid.y}) rotate(${mid.angle})`}
                      className={`transition-all duration-500 transform ${
                        isArrowRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                      }`}
                    >
                      <path
                        d="M -5 -4 L 3 0 L -5 4"
                        fill="none"
                        stroke={isArrowActive ? "#D4AF37" : "currentColor"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-colors duration-300 ${
                          isArrowActive ? "" : "text-slate-350 dark:text-slate-700"
                        }`}
                        style={isArrowActive ? {
                          filter: 'drop-shadow(0 0 3px rgba(212, 175, 55, 0.6))'
                        } : {}}
                      />
                    </g>
                  );
                })}

                {/* Moving Delivery Bike at the tip of the drawn path */}
                {lineTip.x !== 0 && (
                  <g 
                    transform={`translate(${lineTip.x}, ${lineTip.y}) rotate(${lineTip.angle})`}
                  >
                    {/* Shadow */}
                    <ellipse cx="-2" cy="1" rx="14" ry="5" fill="rgba(0,0,0,0.15)" />
                    
                    {/* Wheels (Front & Rear, centered on midline) */}
                    <rect x="9" y="-1.5" width="5" height="3" rx="1" fill="#1e293b" />
                    <rect x="-13" y="-1.5" width="5" height="3" rx="1" fill="#1e293b" />
                    
                    {/* Handlebars */}
                    <line x1="5" y1="-6" x2="5" y2="6" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="5" cy="-6" r="1" fill="#1e293b" />
                    <circle cx="5" cy="6" r="1" fill="#1e293b" />
                    
                    {/* Side Mirrors */}
                    <line x1="6" y1="-4" x2="8" y2="-6" stroke="#475569" strokeWidth="1" />
                    <line x1="6" y1="4" x2="8" y2="6" stroke="#475569" strokeWidth="1" />
                    <circle cx="8" cy="-6" r="0.7" fill="#cbd5e1" />
                    <circle cx="8" cy="6" r="0.7" fill="#cbd5e1" />

                    {/* Scooter Body (Red) */}
                    {/* Front Shield / Fairing */}
                    <path
                      d="M 4 -4 C 4 -4, 9 -3, 9 0 C 9 3, 4 4, 4 4 C 4 4, 3 2, 3 0 C 3 -2, 4 -4, 4 -4 Z"
                      fill="url(#carBodyGradient)"
                      stroke="#B91C1C"
                      strokeWidth="0.5"
                    />
                    {/* Footboard */}
                    <rect x="-4" y="-3" width="7" height="6" rx="0.5" fill="#334155" />
                    {/* Seat */}
                    <path
                      d="M -9 -2.5 C -9 -2.5, -4 -2.5, -4 0 C -4 2.5, -9 2.5, -9 2.5 Z"
                      fill="#0f172a"
                    />
                    {/* Main frame / rear engine cover */}
                    <path
                      d="M -11 -3.5 C -11 -3.5, -9 -3.5, -9 0 C -9 3.5, -11 3.5, -11 3.5 Z"
                      fill="url(#carBodyGradient)"
                      stroke="#B91C1C"
                      strokeWidth="0.5"
                    />

                    {/* Purple Delivery Package Box at the back */}
                    <rect x="-14" y="-4" width="5" height="8" rx="0.8" fill="url(#packageGradient)" stroke="#6D28D9" strokeWidth="0.5" />
                    {/* Straps on the box */}
                    <line x1="-14" y1="0" x2="-9" y2="0" stroke="#FBBF24" strokeWidth="0.5" />
                    <line x1="-11.5" y1="-4" x2="-11.5" y2="4" stroke="#FBBF24" strokeWidth="0.5" />

                    {/* Headlight */}
                    <circle cx="9" cy="0" r="1" fill="#FDE047" />
                    <polygon points="9,0 18,-4 18,4" fill="rgba(253, 224, 71, 0.15)" />
                  </g>
                )}
              </>
            )}
          </svg>
        </div>

        {/* Steps Journey Stack */}
        <div className="relative z-10 flex flex-col space-y-12 md:space-y-24">
          {steps.map((step, idx) => {
            const isEven = idx % 2 === 1;
            const isActive = activeSteps[idx];
            const isRevealed = revealedSteps[idx];
            const isCurrent = idx === currentStepIdx;
            const isCompleted = idx < currentStepIdx;

            return (
              <div 
                key={step.number}
                className="w-full"
              >
                {/* DESKTOP ALTERNATING VIEW */}
                <div className="hidden md:grid grid-cols-2 gap-x-16 lg:gap-x-24 items-center">
                  
                  {/* Left Column Item (Odd steps) */}
                  {!isEven ? (
                    <div 
                      className={`flex items-center justify-end space-x-6 lg:space-x-8 text-right transition-all duration-700 transform ${
                        isRevealed 
                          ? 'opacity-100 translate-y-0 scale-100' 
                          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                      }`}
                    >
                      {/* Premium Glassmorphic Card */}
                      <div className={`p-6 rounded-2xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl flex items-start space-x-4 text-left justify-start max-w-md ${
                        isCurrent
                          ? stepStyles[idx].cardActiveCls
                          : isCompleted
                          ? 'bg-slate-900 border-slate-800/85 opacity-90 scale-100 shadow-sm'
                          : 'bg-slate-900/20 border-slate-800/40 opacity-40 scale-[0.97] shadow-none pointer-events-none'
                      }`}>
                        {/* Icon */}
                        <div className={`p-3 rounded-xl shrink-0 transition-colors duration-300 ${
                          isCurrent
                            ? stepStyles[idx].iconActiveCls
                            : isCompleted
                            ? 'bg-slate-800 text-slate-400 border border-slate-700/30'
                            : 'bg-slate-800/20 text-slate-600 border border-slate-700/20'
                        }`}>
                          <step.icon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <h3 className={`text-base font-bold tracking-tight transition-colors duration-300 ${
                            isCurrent
                              ? stepStyles[idx].titleActiveCls
                              : isCompleted
                              ? 'text-slate-200'
                              : 'text-slate-600'
                          }`}>
                            {step.title}
                          </h3>
                          <p className={`mt-2 text-xs md:text-sm leading-relaxed transition-colors duration-300 ${
                            isCurrent
                              ? 'text-slate-300'
                              : isCompleted
                              ? 'text-slate-400'
                              : 'text-slate-500'
                          }`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Badge (Floating circle) */}
                      <div
                        ref={(el) => (desktopRefs.current[idx] = el)}
                        className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-sm lg:text-lg transition-all duration-500 border shrink-0 relative z-20 ${
                          isCurrent
                            ? `${stepStyles[idx].badgeActiveCls} scale-115 shadow-xl ring-4`
                            : isCompleted
                            ? 'bg-brand-gold/20 text-brand-gold-light border-brand-gold/45 scale-100 shadow-md'
                            : 'bg-slate-800 text-slate-550 border-slate-700 scale-95'
                        }`}
                      >
                        {step.number}
                      </div>
                    </div>
                  ) : (
                    <div className="pointer-events-none" />
                  )}

                  {/* Right Column Item (Even steps) */}
                  {isEven ? (
                    <div 
                      className={`flex items-center justify-start space-x-6 lg:space-x-8 text-left transition-all duration-700 transform ${
                        isRevealed 
                          ? 'opacity-100 translate-y-0 scale-100' 
                          : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
                      }`}
                    >
                      {/* Timeline Badge (Floating circle) */}
                      <div
                        ref={(el) => (desktopRefs.current[idx] = el)}
                        className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-sm lg:text-lg transition-all duration-500 border shrink-0 relative z-20 ${
                          isCurrent
                            ? `${stepStyles[idx].badgeActiveCls} scale-115 shadow-xl ring-4`
                            : isCompleted
                            ? 'bg-brand-gold/20 text-brand-gold-light border-brand-gold/45 scale-100 shadow-md'
                            : 'bg-slate-800 text-slate-555 border-slate-700 scale-95'
                        }`}
                      >
                        {step.number}
                      </div>

                      {/* Premium Glassmorphic Card */}
                      <div className={`p-6 rounded-2xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl flex items-start space-x-4 text-left justify-start max-w-md ${
                        isCurrent
                          ? stepStyles[idx].cardActiveCls
                          : isCompleted
                          ? 'bg-slate-900 border-slate-805 opacity-90 scale-100 shadow-sm'
                          : 'bg-slate-900/20 border-slate-800/40 opacity-40 scale-[0.97] shadow-none pointer-events-none'
                      }`}>
                        {/* Icon */}
                        <div className={`p-3 rounded-xl shrink-0 transition-colors duration-300 ${
                          isCurrent
                            ? stepStyles[idx].iconActiveCls
                            : isCompleted
                            ? 'bg-slate-800 text-slate-400 border border-slate-700/30'
                            : 'bg-slate-800/20 text-slate-600 border border-slate-700/20'
                        }`}>
                          <step.icon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <h3 className={`text-base font-bold tracking-tight transition-colors duration-300 ${
                            isCurrent
                              ? stepStyles[idx].titleActiveCls
                              : isCompleted
                              ? 'text-slate-200'
                              : 'text-slate-600'
                          }`}>
                            {step.title}
                          </h3>
                          <p className={`mt-2 text-xs md:text-sm leading-relaxed transition-colors duration-300 ${
                            isCurrent
                              ? 'text-slate-300'
                              : isCompleted
                              ? 'text-slate-400'
                              : 'text-slate-500'
                          }`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pointer-events-none" />
                  )}

                </div>

                {/* MOBILE VIEW (Single Column stacked layout) */}
                <div 
                  className={`flex md:hidden items-start space-x-5 text-left transition-all duration-700 transform pl-2 sm:pl-6 ${
                    isRevealed 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                >
                  {/* Left Timeline Badge */}
                  <div
                    ref={(el) => (mobileRefs.current[idx] = el)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border shrink-0 relative z-20 ${
                      isCurrent
                        ? `${stepStyles[idx].badgeActiveCls} scale-110 shadow-lg ring-2`
                        : isCompleted
                        ? 'bg-brand-gold/20 text-brand-gold-light border-brand-gold/45 scale-100 shadow-sm'
                        : 'bg-slate-800 text-slate-550 border-slate-700 scale-95'
                    }`}
                  >
                    {step.number}
                  </div>

                  {/* Card Content Stack */}
                  <div className={`p-5 rounded-2xl border flex items-start space-x-3 text-left justify-start flex-1 transition-all duration-500 ${
                    isCurrent
                      ? stepStyles[idx].cardActiveCls
                      : isCompleted
                      ? 'bg-slate-900 border-slate-805 opacity-90 scale-100 shadow-sm'
                      : 'bg-slate-900/20 border-slate-800/40 opacity-40 scale-[0.97] shadow-none pointer-events-none'
                  }`}>
                    {/* Icon */}
                    <div className={`p-2.5 rounded-lg shrink-0 transition-colors duration-300 ${
                      isCurrent
                        ? stepStyles[idx].iconActiveCls
                        : isCompleted
                        ? 'bg-slate-800 text-slate-400 border border-slate-700/30'
                        : 'bg-slate-800/20 text-slate-600 border border-slate-700/20'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-start">
                      <h3 className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                        isCurrent
                          ? stepStyles[idx].titleActiveCls
                          : isCompleted
                          ? 'text-slate-200'
                          : 'text-slate-600'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`mt-1 text-xs leading-relaxed transition-colors duration-300 ${
                        isCurrent
                          ? 'text-slate-300'
                          : isCompleted
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
