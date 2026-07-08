import React from 'react';
import { Percent, Sparkles } from 'lucide-react';

export default function Offers() {
  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl text-left text-white max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5">
        <Percent className="w-8 h-8 text-[#F4C400]" />
        <div>
          <h2 className="text-xl font-bold">Privilege Offers</h2>
          <p className="text-xs text-slate-400">Exclusive discounts pre-applied for active Connect members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Summer Festival Sale', discount: 'Flat 20% OFF', code: 'CONN-SUMMER20', desc: 'Active at all ABC Electronics stores and select lifestyle boutiques.' },
          { title: 'Priority Dine-In privilege', discount: 'Flat 15% OFF', code: 'CONN-DINEOUT15', desc: 'Valid at Celeste Dining Skylounge and partner restaurants.' },
          { title: 'Helicopter Transfer Deal', discount: 'Flat 25% OFF', code: 'CONN-CHARTER25', desc: 'Valid for private airport transfers and yacht cruises.' },
          { title: 'Clinic Consultation Waiver', discount: '100% Waived Fee', code: 'CONN-HEALTHFREE', desc: 'Instant priority pass slot booking at Apollo Clinic outlets.' }
        ].map(off => (
          <div key={off.title} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-[#F4C400]/40 transition-colors">
            <Sparkles className="w-5 h-5 text-[#F4C400]/10 absolute top-4 right-4 group-hover:text-[#F4C400]/30 transition-colors" />
            <div>
              <h4 className="text-sm font-bold text-white block">{off.title}</h4>
              <p className="text-[10px] text-slate-400 mt-1">{off.desc}</p>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-1.5">
              <span className="text-sm font-black text-[#F4C400]">{off.discount}</span>
              <span className="font-mono text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-350 select-all cursor-pointer">{off.code}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
