import React from 'react';

export default function CTA({ onJoinClick }) {
  return (
    <section className="py-16 bg-white relative">
      <div className="w-full px-6 md:px-16 lg:px-24">
        {/* Inner Card Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b132b] via-[#050b18] to-[#010510] py-16 px-8 md:py-20 md:px-16 text-center shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute top-[-50%] left-[-20%] w-[350px] h-[350px] bg-brand-gold/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-[-50%] right-[-20%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

          {/* Sparkle stars */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-6 left-[15%] w-1 h-1 bg-white rounded-full sparkle-slow" />
            <div className="absolute bottom-10 left-[80%] w-1.5 h-1.5 bg-brand-gold rounded-full sparkle-fast" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Ready to Unlock Exclusive Benefits?
            </h2>
            
            {/* Subheading */}
            <p className="mt-6 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Join over 10,000 executives and lifestyle enthusiasts who are already experiencing the power of the Connect ecosystem.
            </p>

            {/* Gold Button */}
            <div className="mt-10">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (onJoinClick) onJoinClick();
                }}
                className="inline-flex items-center justify-center text-sm font-bold text-slate-900 bg-gradient-gold hover:opacity-95 px-8 py-4 rounded-sm transition shadow-lg hover:shadow-xl hover:scale-105 duration-300"
              >
                Join the Club Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
