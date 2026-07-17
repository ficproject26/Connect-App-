import React, { useEffect, useState } from 'react';
import logoImg from '../../assets/images/forge india logo.jpg';

export default function SplashLoader({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress bar loading
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Fade out after 2.4 seconds, complete after 3.2 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2400);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-[#030712] to-[#0a0f1d] text-white transition-all duration-1000 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px]" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Custom Logo */}
        <div className="w-24 h-24 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.25)] border border-brand-gold/30 transition-all duration-500 scale-100 animate-pulse-slow">
          <img src={logoImg} alt="Forge India Connect Logo" className="w-full h-full object-contain rounded-xl" />
        </div>

        {/* Text Logo */}
        <h1 className="mt-6 text-2xl sm:text-3xl font-light tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white font-sans whitespace-nowrap">
          CONNECT
        </h1>
        
        <p className="mt-2 text-xs tracking-[0.2em] uppercase text-slate-400 font-sans">
          One Membership. Unlimited Benefits.
        </p>

        {/* Custom Progress Bar */}
        <div className="relative mt-12 w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-light transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
