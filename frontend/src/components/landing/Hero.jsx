import React, { useState, useEffect } from 'react';
import { ArrowRight, Star, Globe, Gift, Tag, Headphones } from 'lucide-react';
import ConnectionNetwork from './ConnectionNetwork';
import WorldMap from './WorldMap';
import earthCurve from '../../assets/images/earth_curve.png';

export default function Hero({ onJoinClick }) {
  const [typedText, setTypedText] = useState('');
  const phrases = ['Everywhere You Go.', 'Get Everything in One Place.'];

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timer;

    const tick = () => {
      const currentPhrase = phrases[phraseIndex];
      const currentText = isDeleting
        ? currentPhrase.substring(0, charIndex - 1)
        : currentPhrase.substring(0, charIndex + 1);

      setTypedText(currentText);

      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      let delta = isDeleting ? 40 : 100; // Deleting is faster than typing

      if (!isDeleting && currentText === currentPhrase) {
        delta = 2500; // Pause at the end of typing
        isDeleting = true;
      } else if (isDeleting && currentText === '') {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        charIndex = 0;
        delta = 500; // Pause before typing the next phrase
      }

      timer = setTimeout(tick, delta);
    };

    timer = setTimeout(tick, 500); // Initial start delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-0 pb-0 overflow-hidden bg-[#030814] text-white transition-colors duration-300">
      {/* Dynamic connection background */}
      <ConnectionNetwork />

      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-950/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-slate-900/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Centered Layout Container */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-16 lg:px-24 relative z-20 flex flex-col items-center text-center pt-4 flex-grow justify-center">
        {/* Centered Subtitle */}
        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FFC107] mb-5 block">
          ONE MEMBERSHIP. UNLIMITED BENEFITS.
        </span>
        
        {/* Centered Main Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-tight font-sans max-w-5xl">
          Everything Connected.
          <span translate="no" className="notranslate block text-gradient-gold mt-2 min-h-[1.2em] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl lg:whitespace-nowrap">
            {typedText}
            <span className="inline-block w-[3px] h-[0.85em] bg-brand-gold ml-1 animate-pulse" style={{ verticalAlign: 'middle' }} />
          </span>
        </h1>

        {/* Centered Description Paragraph */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-100 font-medium max-w-2xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          Explore a world of services, products, travel, jobs and more.
          <br className="hidden sm:inline" /> All powered by one global membership.
        </p>

        {/* Centered Action Buttons */}
        <div className="mt-10 flex flex-wrap gap-5 items-center justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (onJoinClick) onJoinClick();
            }}
            className="inline-flex items-center space-x-2 text-xs md:text-sm font-black uppercase tracking-wider text-slate-950 bg-gradient-gold hover:opacity-95 px-8 py-4 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-[1.02] duration-300 cursor-pointer animate-pulse-slow"
          >
            <span>Join Membership</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              alert("Launching ecosystem video tour...");
            }}
            className="inline-flex items-center space-x-2.5 text-xs md:text-sm font-bold text-slate-300 hover:text-brand-gold transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-slate-400 group-hover:border-[#FFC107] group-hover:text-[#FFC107] transition-all">
              <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span>Watch Video</span>
          </button>
        </div>
      </div>

      {/* Photorealistic Earth Curved Horizon Image Asset */}
      <div className="absolute bottom-[-30px] sm:bottom-[-60px] md:bottom-[-100px] lg:bottom-[-150px] left-1/2 -translate-x-1/2 w-[140%] min-w-[1200px] max-w-[1800px] aspect-square pointer-events-none z-[16] flex justify-center">
        <img 
          src={earthCurve} 
          alt="Curved Earth Horizon with City Lights" 
          className="w-full h-full object-bottom opacity-95 select-none animate-spin-earth" 
        />
      </div>


      {/* Integrated Stats Bar at the bottom (overlays the bottom of the globe) */}
      <div className="w-full px-6 md:px-16 lg:px-24 relative z-20 mt-auto py-5 bg-[#030814]/90 backdrop-blur-md border-t border-white/10 shadow-2xl">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 items-center justify-center">
          {/* Stat 1 */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-slate-900/40 border border-white/10 flex items-center justify-center text-[#FFC107] shrink-0 shadow-xs">
              <Star className="w-4.5 h-4.5 fill-current" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs md:text-sm font-black text-white">10M+</div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Happy Members</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-slate-900/40 border border-white/10 flex items-center justify-center text-[#FFC107] shrink-0 shadow-xs">
              <Globe className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs md:text-sm font-black text-white">50+</div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Countries</div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-full bg-slate-900/40 border border-white/10 flex items-center justify-center text-[#FFC107] shrink-0 shadow-xs">
              <Gift className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs md:text-sm font-black text-white">5000+</div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Partner Brands</div>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex items-center gap-3 justify-center md:justify-start col-span-1">
            <div className="w-10 h-10 rounded-full bg-slate-900/40 border border-white/10 flex items-center justify-center text-[#FFC107] shrink-0 shadow-xs">
              <Tag className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs md:text-sm font-black text-white">Up to 70%</div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Member Savings</div>
            </div>
          </div>

          {/* Stat 5 */}
          <div className="flex items-center gap-3 justify-center md:justify-start col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-full bg-slate-900/40 border border-white/10 flex items-center justify-center text-[#FFC107] shrink-0 shadow-xs">
              <Headphones className="w-4.5 h-4.5" />
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs md:text-sm font-black text-white">24/7</div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
