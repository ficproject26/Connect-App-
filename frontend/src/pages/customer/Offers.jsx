import React, { useState } from 'react';
import { Percent, Sparkles, Copy, Check, Tag, Gift, Plane, ShieldCheck } from 'lucide-react';

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
      gradient: 'from-orange-500 to-rose-500',
      lightBg: 'bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/30 dark:to-rose-950/20',
      borderColor: 'border-orange-200/60 dark:border-orange-800/30',
      tagBg: 'bg-orange-500',
      iconBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    },
    { 
      title: 'Priority Dine-In Privilege', 
      discount: 'Flat 15% OFF', 
      code: 'CONN-DINEOUT15', 
      desc: 'Valid at Celeste Dining Skylounge and partner restaurants.',
      icon: Gift,
      gradient: 'from-purple-500 to-indigo-500',
      lightBg: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20',
      borderColor: 'border-purple-200/60 dark:border-purple-800/30',
      tagBg: 'bg-purple-500',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    },
    { 
      title: 'Helicopter Transfer Deal', 
      discount: 'Flat 25% OFF', 
      code: 'CONN-CHARTER25', 
      desc: 'Valid for private airport transfers and yacht cruises.',
      icon: Plane,
      gradient: 'from-cyan-500 to-blue-500',
      lightBg: 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/20',
      borderColor: 'border-cyan-200/60 dark:border-cyan-800/30',
      tagBg: 'bg-cyan-500',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
    },
    { 
      title: 'Clinic Consultation Waiver', 
      discount: '100% Waived Fee', 
      code: 'CONN-HEALTHFREE', 
      desc: 'Instant priority pass slot booking at Apollo Clinic outlets.',
      icon: ShieldCheck,
      gradient: 'from-emerald-500 to-teal-500',
      lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20',
      borderColor: 'border-emerald-200/60 dark:border-emerald-800/30',
      tagBg: 'bg-emerald-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left animate-fade-in p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl text-white">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Percent className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-850 dark:text-white tracking-tight">Privilege Offers</h2>
          <p className="text-sm text-slate-400 font-medium mt-0.5">Exclusive discounts pre-applied for active Connect members</p>
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
              className={`relative overflow-hidden rounded-3xl border ${off.borderColor} ${off.lightBg} p-6 flex flex-col justify-between gap-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Decorative sparkle */}
              <Sparkles className="w-24 h-24 absolute -top-4 -right-4 text-slate-200/20 dark:text-white/5 group-hover:text-slate-300/30 dark:group-hover:text-white/10 transition-colors duration-500 rotate-12" />
              
              {/* Top Section */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${off.iconBg} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-850 dark:text-white leading-tight">{off.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[260px]">{off.desc}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-750/30">
                {/* Discount Tag */}
                <span className={`${off.tagBg} text-white text-sm font-black px-4 py-1.5 rounded-xl shadow-sm tracking-wide`}>
                  {off.discount}
                </span>

                {/* Coupon Code */}
                <button
                  onClick={() => handleCopyCode(off.code)}
                  className="flex items-center gap-2 bg-slate-900 border border-dashed border-slate-700 rounded-xl px-3.5 py-2 cursor-pointer transition-all hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm group/copy"
                >
                  <span className="font-mono text-xs font-black text-slate-200 tracking-wider select-all">
                    {off.code}
                  </span>
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 group-hover/copy:text-amber-500 shrink-0 transition-colors" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Offers are auto-applied at checkout for eligible Connect members. Terms & conditions apply.
        </p>
      </div>
    </div>
  );
}

