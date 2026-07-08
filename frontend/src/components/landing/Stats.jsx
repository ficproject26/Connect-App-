import React from 'react';

export default function Stats() {
  return (
    <section className="relative bg-[#020617] py-8 overflow-hidden border-y border-slate-900">
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-72 h-72 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sparkles / Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-4 left-[10%] w-1.5 h-1.5 bg-brand-gold rounded-full sparkle-slow" />
        <div className="absolute top-12 left-[25%] w-1 h-1 bg-white rounded-full sparkle-fast" />
        <div className="absolute bottom-6 left-[40%] w-2 h-2 bg-brand-gold-light rounded-full sparkle-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-8 left-[60%] w-1 h-1 bg-white rounded-full sparkle-slow" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-10 left-[75%] w-1.5 h-1.5 bg-brand-gold rounded-full sparkle-fast" style={{ animationDelay: '1.2s' }} />
        <div className="absolute top-6 left-[90%] w-2 h-2 bg-brand-gold-light rounded-full sparkle-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full px-6 md:px-16 lg:px-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 text-center">
          
          {/* Stat 1 */}
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
              10k<span className="text-brand-gold">+</span>
            </span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Active Members
            </span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center border-y border-slate-800/40 md:border-y-0 md:border-x md:border-slate-800/40 py-8 md:py-0">
            <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
              500<span className="text-brand-gold">+</span>
            </span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Premium Vendors
            </span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
              50<span className="text-brand-gold">+</span>
            </span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Cities Covered
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
