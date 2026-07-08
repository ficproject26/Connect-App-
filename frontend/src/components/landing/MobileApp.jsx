import React, { useState, useEffect } from 'react';
import { Smartphone, Apple, Play, Home, Search, Ticket, Settings } from 'lucide-react';

export default function MobileApp() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('daily-needs');
      if (!element) return;
      
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top;
      const viewportHeight = window.innerHeight;
      
      if (elementTop < viewportHeight && rect.bottom > 0) {
        // Compute progress of the section in the viewport (0 to 1)
        const progress = (viewportHeight - elementTop) / (viewportHeight + rect.height);
        // Smoothly translate the phone container up/down by 45px
        setOffsetY((progress - 0.5) * 90);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial run
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="daily-needs" className="bg-[#020617] py-24 overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full px-6 md:px-16 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column: Text Content & Downloads */}
        <div className="lg:col-span-6 flex flex-col items-start relative z-10 text-white">
          <span className="text-sm font-bold tracking-[0.2em] uppercase text-brand-gold-light mb-4">
            Your Membership. Digitized.
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-sans leading-tight">
            The Connect App is your portal to the ecosystem
          </h2>
          <p className="mt-6 text-slate-400 leading-relaxed text-base md:text-lg max-w-xl">
            Manage your digital card, find nearby premium vendors, unlock exclusive discounts on-the-go, and track your annual savings in real-time.
          </p>

          {/* App Download Buttons */}
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            {/* App Store */}
            <a
              href="#"
              className="inline-flex items-center space-x-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-5 py-3 rounded-xl transition shadow-md hover:shadow-lg"
            >
              <Apple className="w-6 h-6 text-white shrink-0 fill-white" />
              <div className="text-left leading-none">
                <span className="text-[10px] uppercase text-slate-400 font-medium block">Available on the</span>
                <span className="text-sm font-bold block mt-0.5 font-sans">App Store</span>
              </div>
            </a>

            {/* Play Store */}
            <a
              href="#"
              className="inline-flex items-center space-x-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-5 py-3 rounded-xl transition shadow-md hover:shadow-lg"
            >
              <Play className="w-6 h-6 text-white shrink-0 fill-white" />
              <div className="text-left leading-none">
                <span className="text-[10px] uppercase text-slate-400 font-medium block">Available on</span>
                <span className="text-sm font-bold block mt-0.5 font-sans">Play Store</span>
              </div>
            </a>
          </div>
        </div>

        {/* Right Column: High-fidelity Phone Mockup */}
        <div className="lg:col-span-6 flex items-center justify-center relative z-10 py-10 lg:py-0">
          
          {/* Mockup Frame Container (matches the rounded dark blue card in the images) */}
          <div className="bg-[#050b18] border-[12px] border-[#0e1726] rounded-[56px] p-8 sm:p-12 md:p-16 flex items-center justify-center shadow-2xl relative overflow-hidden max-w-sm sm:max-w-md w-full mx-auto group">
            
            {/* Ambient Gold Glowing Circles Behind the Phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-brand-gold/10 rounded-full blur-[70px] opacity-80 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            
            {/* Soft gold glow particles/circles floating around the phone */}
            <div className="absolute top-[15%] left-[5%] w-4 h-4 rounded-full bg-brand-gold/30 blur-xs animate-pulse" />
            <div className="absolute top-[45%] right-[5%] w-6 h-6 rounded-full bg-brand-gold/20 blur-sm animate-pulse delay-200" />
            <div className="absolute bottom-[25%] left-[10%] w-5 h-5 rounded-full bg-brand-gold/25 blur-xs animate-pulse delay-500" />
            <div className="absolute bottom-[10%] right-[10%] w-3 h-3 rounded-full bg-brand-gold/40 blur-xs animate-pulse delay-700" />

            {/* 3D Perspective Wrapper */}
            <div 
              className="relative phone-perspective-container"
              style={{
                transform: `translateY(${offsetY}px)`,
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >

              
              {/* Phone Frame (3D Tilted and Rotated isometric design) */}
              <div 
                className="relative w-[260px] h-[520px] rounded-[48px] bg-[#0b0f19] border-[8px] border-[#1e293b] overflow-hidden flex flex-col justify-between p-3.5 phone-mockup-3d cursor-pointer"
              >
                {/* Dynamic Island / Notch */}
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-end pr-4">
                  <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800/40" />
                </div>

                {/* Phone Screen Internal Container */}
                <div className="relative flex-1 w-full h-full bg-[#030712] rounded-[38px] overflow-hidden flex flex-col justify-between pt-8 pb-5 px-4 z-20">
                  
                  {/* App Status Bar */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 px-2 mt-1">
                    <span>9:41</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-[9px] text-[#3b82f6]">📶</span>
                      <span className="text-[9px] text-[#22c55e]">🔋</span>
                    </div>
                  </div>

                  {/* App Internal Content */}
                  <div className="flex-1 flex flex-col justify-between mt-4">
                    
                    {/* App Header */}
                    <div className="flex justify-between items-center px-1">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">Welcome back</span>
                        <h4 className="text-xs font-bold text-white mt-0.5">Dhanush A.</h4>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#0f172a] border border-[#1e293b] flex items-center justify-center font-bold text-xs text-brand-gold">
                        DA
                      </div>
                    </div>

                    {/* Simulated Digital Card */}
                    <div className="mt-4 w-full h-[115px] rounded-xl bg-gradient-to-tr from-[#AA7C11] via-[#D4AF37] to-[#FFF8DC] p-3 flex flex-col justify-between shadow-lg shadow-brand-gold/10 border border-white/10 relative overflow-hidden">
                      {/* Glowing light overlay */}
                      <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-bold tracking-widest text-brand-gold-dark uppercase font-sans">
                          Connect Elite
                        </span>
                        <span className="text-[10px] text-brand-gold-dark/60 font-mono">★★★★</span>
                      </div>

                      <div className="text-left">
                        <div className="text-xs font-bold text-brand-gold-dark">Dhanush An</div>
                        <div className="text-[8px] text-brand-gold-dark/80 font-mono mt-0.5">MEMBER ID: 884-129-C</div>
                      </div>
                    </div>

                    {/* QR Code Scan Area */}
                    <div className="mt-4 bg-[#0f172a]/80 border border-[#1e293b]/60 rounded-2xl p-4 flex flex-col items-center justify-center flex-1">
                      <span className="text-[9px] text-slate-400 tracking-wider uppercase mb-2">
                        Scan Member QR
                      </span>
                      
                      {/* Custom SVG QR Code Design */}
                      <div className="w-20 h-20 bg-white p-2 rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                          {/* Outer frame */}
                          <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                          <rect x="5" y="5" width="15" height="15" fill="white" />
                          <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                          <rect x="80" y="5" width="15" height="15" fill="white" />
                          <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                          <rect x="5" y="80" width="15" height="15" fill="white" />
                          
                          {/* Random QR pixels */}
                          <rect x="35" y="5" width="10" height="10" fill="currentColor" />
                          <rect x="55" y="15" width="10" height="5" fill="currentColor" />
                          <rect x="35" y="45" width="15" height="10" fill="currentColor" />
                          <rect x="60" y="40" width="10" height="20" fill="currentColor" />
                          <rect x="45" y="65" width="15" height="15" fill="currentColor" />
                          <rect x="75" y="75" width="10" height="10" fill="currentColor" />
                          <rect x="70" y="30" width="5" height="10" fill="currentColor" />
                          <rect x="15" y="45" width="10" height="10" fill="currentColor" />
                        </svg>
                      </div>

                      <span className="text-[8px] text-brand-gold-light mt-3 uppercase tracking-widest">
                        Tap to Scan QR Code
                      </span>
                    </div>

                    {/* App Navigation Icons */}
                    <div className="mt-4 flex justify-between items-center border-t border-slate-900/60 pt-3.5 px-1">
                      <div className="w-8 h-8 rounded-lg bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold hover:bg-brand-gold/25 transition-colors cursor-pointer">
                        <Home className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-brand-gold hover:border-brand-gold/20 transition-colors cursor-pointer">
                        <Search className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-brand-gold hover:border-brand-gold/20 transition-colors cursor-pointer">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[#0f172a] border border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-brand-gold hover:border-brand-gold/20 transition-colors cursor-pointer">
                        <Settings className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
