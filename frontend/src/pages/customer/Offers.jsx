import React, { useState } from 'react';
import { Copy, Check, Tag, Gift, Plane, ShieldCheck, Utensils } from 'lucide-react';

export default function Offers() {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }).catch(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const offers = [
    { 
      title: 'Summer Festival Sale', 
      discount: 'Flat 20% OFF', 
      code: 'CONN-SUMMER20', 
      desc: 'Active at all ABC Electronics stores and select lifestyle boutiques.',
      icon: Tag,
      lightBg: 'bg-[#fffbeb] dark:bg-[#1a1208]/40',
      borderColor: 'border-[#fde68a] dark:border-[#38260e]/50',
      tagBg: 'bg-gradient-to-r from-orange-500 to-orange-600',
      iconBg: 'bg-[#ffedd5] dark:bg-[#341a0b] text-[#f97316]',
      illustration: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="absolute -right-2 -bottom-2 w-32 h-32 text-orange-200/25 dark:text-orange-500/5 pointer-events-none select-none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M6 5h12" />
        </svg>
      )
    },
    { 
      title: 'Priority Dine-In Privilege', 
      discount: 'Flat 15% OFF', 
      code: 'CONN-DINEOUT15', 
      desc: 'Valid at Celeste Dining Skylounge and partner restaurants.',
      icon: Utensils,
      lightBg: 'bg-[#f5f3ff] dark:bg-[#110c22]/40',
      borderColor: 'border-[#ddd6fe] dark:border-[#22174d]/50',
      tagBg: 'bg-gradient-to-r from-violet-500 to-indigo-600',
      iconBg: 'bg-[#e0e7ff] dark:bg-[#1a1738] text-[#6366f1]',
      illustration: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="absolute -right-2 -bottom-2 w-32 h-32 text-purple-200/25 dark:text-purple-500/5 pointer-events-none select-none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M4 22h16M12 4a8 8 0 00-8 8h16a8 8 0 00-8-8zM2 18h20" />
        </svg>
      )
    },
    { 
      title: 'Helicopter Transfer Deal', 
      discount: 'Flat 25% OFF', 
      code: 'CONN-CHARTER25', 
      desc: 'Valid for private airport transfers and yacht cruises.',
      icon: Plane,
      lightBg: 'bg-[#eff6ff] dark:bg-[#0c1228]/40',
      borderColor: 'border-[#bfdbfe] dark:border-[#101d3f]/50',
      tagBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      iconBg: 'bg-[#e0f2fe] dark:bg-[#132845] text-[#3b82f6]',
      illustration: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="absolute -right-2 -bottom-2 w-32 h-32 text-blue-200/25 dark:text-blue-500/5 pointer-events-none select-none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M12 6v4M5 10c0-3 3-5 7-5s7 2 7 5m-14 4h14M9 14v4M7 18h10" />
        </svg>
      )
    },
    { 
      title: 'Clinic Consultation Waiver', 
      discount: '100% Waived Fee', 
      code: 'CONN-HEALTHFREE', 
      desc: 'Instant priority pass slot booking at Apollo Clinic outlets.',
      icon: ShieldCheck,
      lightBg: 'bg-[#f0fdf4] dark:bg-[#081b10]/40',
      borderColor: 'border-[#bbf7d0] dark:border-[#0e2d1c]/50',
      tagBg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
      iconBg: 'bg-[#d1fae5] dark:bg-[#0c2f1f] text-[#10b981]',
      illustration: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="absolute -right-2 -bottom-2 w-32 h-32 text-emerald-200/25 dark:text-emerald-500/5 pointer-events-none select-none">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
        </svg>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left animate-fade-in p-4 sm:p-6 bg-white dark:bg-slate-950 border border-slate-150/45 dark:border-slate-850 rounded-3xl text-slate-800 dark:text-slate-100 shadow-2xs">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-50/50 via-indigo-50/25 to-white dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-3xs">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Gift className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Privilege Offers</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">Exclusive discounts pre-applied for active Connect members</p>
          </div>
        </div>

        {/* Decorative Gift Box Illustration */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-4">
          <div className="relative w-16 h-16 animate-bounce" style={{ animationDuration: '3s' }}>
            {/* Bow */}
            <div className="absolute -top-3.5 left-5 w-5 h-4 bg-amber-400 rounded-full rotate-12 z-30"></div>
            <div className="absolute -top-3.5 left-8 w-5 h-4 bg-amber-400 rounded-full -rotate-12 z-30"></div>
            <div className="absolute -top-3 left-7 w-3 h-3 bg-amber-300 rounded-full z-40"></div>
            {/* Lid */}
            <div className="absolute top-0 left-2 w-13 h-4 bg-gradient-to-r from-violet-400 to-indigo-400 rounded shadow-md z-20"></div>
            {/* Box base */}
            <div className="absolute top-3 left-3.5 w-10.5 h-11 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-b-lg shadow-lg z-10">
              {/* Ribbon */}
              <div className="absolute top-0 left-4 w-2.5 h-full bg-amber-400"></div>
            </div>
            {/* Floating Tag */}
            <div className="absolute -right-1 top-4 bg-violet-600 text-white text-[9px] font-black py-0.5 px-1 rounded-md rotate-12 shadow-sm animate-pulse flex items-center justify-center">
              %
            </div>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((off, idx) => {
          const Icon = off.icon;
          const isCopied = copiedCode === off.code;
          return (
            <div 
              key={off.title} 
              className={`relative overflow-hidden rounded-3xl border-2 ${off.borderColor} ${off.lightBg} p-6 flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Illustration Background Graphic */}
              {off.illustration}
              
              {/* Top Section */}
              <div className="relative z-10 flex items-start gap-4">
                <div className={`w-14 h-14 rounded-full ${off.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
                  <Icon className="w-6.5 h-6.5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">{off.title}</h4>
                  <p className="text-xs text-slate-455 dark:text-slate-400 mt-1.5 leading-relaxed max-w-[280px] font-medium">{off.desc}</p>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
                {/* Discount Tag */}
                <span className={`${off.tagBg} text-white text-xs font-extrabold px-4.5 py-2.5 rounded-full shadow-md shadow-slate-500/10 uppercase tracking-wide border-none`}>
                  {off.discount}
                </span>

                {/* Coupon Code Block */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Use Code</span>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-4 pr-2.5 py-1.5 flex items-center gap-3 shadow-3xs">
                    <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-200 tracking-wider">
                      {off.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(off.code)}
                      className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700 border-none p-0 group/copy"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400 group-hover/copy:text-indigo-500 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50/20 dark:bg-slate-900/40 border border-blue-100/50 dark:border-slate-800 rounded-2xl py-3.5 px-6 flex items-center justify-center gap-2.5 shadow-3xs text-center">
        <ShieldCheck className="w-5 h-5 text-blue-500" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
          Offers are auto-applied at checkout for eligible Connect members. <span className="text-blue-500 cursor-pointer hover:underline">Terms & conditions</span> apply.
        </p>
      </div>
    </div>
  );
}
