import React, { useRef } from 'react';
import { Briefcase, ShoppingBag, Truck, Utensils, BedDouble, Plane, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import worldGlobe from '../../assets/images/world_globe.jpg';

const pillars = [
  {
    id: 'services',
    icon: Briefcase,
    accent: '#f59e0b',
    iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    title: 'Services',
    desc: 'From salon visits to plumbing, get priority booking and flat rates with top professionals across 19 categories.',
    tag: '19 Categories',
    categories: ['IT Services', 'Non-IT Services', 'Job Consulting', 'Business Consulting']
  },
  {
    id: 'products',
    icon: ShoppingBag,
    accent: '#fb923c',
    iconBg: 'bg-orange-500/15 text-orange-400 border border-orange-500/30',
    title: 'Products',
    desc: 'Exclusive pricing on electronics, fashion, furniture, and lifestyle goods from 500+ partner brands.',
    tag: '16 Categories',
    categories: ['Fashion & Luxury', 'Electronics & Gadgets', 'Home & Interiors']
  },
  {
    id: 'daily-needs',
    icon: Truck,
    accent: '#38bdf8',
    iconBg: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
    title: 'Daily Needs',
    desc: 'Groceries, dairy, pharmacy, and household essentials delivered at your door with zero convenience fees.',
    tag: '12 Categories',
    categories: ['Gourmet & Fresh', 'Personal Health', 'Express Conveniences']
  },
  {
    id: 'food',
    icon: Utensils,
    accent: '#34d399',
    iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    title: 'Food',
    desc: 'Dine like royalty with 20%+ off at premium restaurants, cafes, and cloud kitchens in your city.',
    tag: '16 Categories',
    categories: ['Luxury Dining', 'Casual & Cafes', 'Private Catering']
  },
  {
    id: 'stay',
    icon: BedDouble,
    accent: '#fbbf24',
    iconBg: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    title: 'Stay',
    desc: 'Luxury hotels, resorts, homestays and wellness retreats with member-only corporate rates.',
    tag: '16 Categories',
    categories: ['Villas & Resorts', 'Boutique Hoteliers', 'Unique Getaways']
  },
  {
    id: 'travel',
    icon: Plane,
    accent: '#818cf8',
    iconBg: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    title: 'Travel',
    desc: 'Flights, trains, cab services, tour packages, and visa assistance — all in one ecosystem.',
    tag: '19 Categories',
    categories: ['Business Class', 'Lounges & Transit', 'Bespoke Expeditions']
  },
  {
    id: 'jobs',
    icon: UserCheck,
    accent: '#c084fc',
    iconBg: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
    title: 'Jobs',
    desc: 'Explore 23 career categories spanning banking, IT, healthcare, government and freelance roles.',
    tag: '23 Categories',
    categories: ['Banking & IT', 'Healthcare & Gov', 'Freelance Roles']
  },
];

export default function Ecosystem({ onCardClick }) {
  const containerRef = useRef(null);

  return (
    <section
      ref={containerRef}
      id="services"
      className="relative bg-[#020b18] py-12 md:py-20 overflow-hidden"
    >
      {/* ── GLOBE BACKGROUND ── */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[#020b18]" />
        {/* Slow spinning background globe */}
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[min(90vw,800px)] aspect-square overflow-hidden rounded-full z-0">
          <img
            src={worldGlobe}
            alt="World Network"
            className="w-full h-full opacity-30 rounded-full animate-globe-spin object-cover"
            style={{ filter: 'brightness(1.1) saturate(1.3)' }}
          />
        </div>
        <div className="absolute inset-0 bg-radial-fade" />
      </div>

      {/* ── CONTENT WRAPPER ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="w-full text-center max-w-2xl mx-auto mb-10 md:mb-16 flex flex-col items-center">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-amber-400/90">
            One Membership · Seven Pillars
          </span>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold font-sans tracking-tight text-white leading-none">
            Our{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400">
              Ecosystem
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-xs md:text-sm leading-relaxed max-w-md">
            Scroll down to explore each pillar — a premium world of services, products, dining, travel, and careers.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative w-full">
          {/* Central Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-500 via-sky-500 to-violet-500 z-0 opacity-30" />

          {/* Pillars List */}
          <div className="space-y-12 md:space-y-18">
            {pillars.map((pillar, idx) => {
              const isEven = idx % 2 === 1;
              
              return (
                <div
                  key={pillar.id}
                  className="relative flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-x-20 lg:gap-x-28 items-center pl-16 md:pl-0 pr-0 w-full group"
                >
                  {/* Timeline Glowing Node */}
                  <div
                    className="absolute left-8 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#020b18] border-2 flex items-center justify-center z-25 transition-all duration-500"
                    style={{
                      borderColor: pillar.accent,
                      color: pillar.accent,
                      boxShadow: `0 0 12px ${pillar.accent}40`,
                    }}
                  >
                    {React.createElement(pillar.icon, { className: "w-4.5 h-4.5" })}
                  </div>

                  {/* Left Column (Odd pillars) */}
                  {!isEven ? (
                    <motion.div
                      initial={{ opacity: 0, x: -35 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      onClick={() => onCardClick(pillar.title)}
                      className="w-full max-w-xs md:max-w-sm md:ml-auto md:mr-6 lg:mr-10 cursor-pointer text-left"
                    >
                      <div
                        className="w-full p-5 md:p-6 rounded-3xl bg-slate-950/75 backdrop-blur-xl border transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                        style={{
                          borderColor: `${pillar.accent}20`,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03)`,
                        }}
                      >
                        {/* Big Index */}
                        <div
                          className="text-2xl md:text-3xl font-extrabold font-mono opacity-80 tracking-tight"
                          style={{ color: pillar.accent }}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-lg md:text-xl font-black text-white tracking-tight mt-1.5">
                          {pillar.title}
                        </h3>
                        <p className="mt-2.5 text-slate-300 text-xs leading-relaxed">
                          {pillar.desc}
                        </p>

                        {/* Category Tags */}
                        {pillar.categories && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {pillar.categories.map((cat, cIdx) => (
                              <span
                                key={cIdx}
                                className="text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-300"
                                style={{
                                  backgroundColor: `${pillar.accent}08`,
                                  borderColor: `${pillar.accent}20`,
                                  color: `${pillar.accent}`
                                }}
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer Divider & Action */}
                        <div className="w-full flex items-center justify-between pt-4 border-t border-white/5 mt-5">
                          <span
                            className="text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${pillar.accent}15`, color: pillar.accent }}
                          >
                            {pillar.tag}
                          </span>
                          <span
                            className="text-xs font-bold flex items-center gap-1 transition-colors duration-200"
                            style={{ color: pillar.accent }}
                          >
                            Explore Pillar
                            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="hidden md:block pointer-events-none" />
                  )}

                  {/* Right Column (Even pillars) */}
                  {isEven ? (
                    <motion.div
                      initial={{ opacity: 0, x: 35 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      onClick={() => onCardClick(pillar.title)}
                      className="w-full max-w-xs md:max-w-sm md:mr-auto md:ml-6 lg:ml-10 cursor-pointer text-left"
                    >
                      <div
                        className="w-full p-5 md:p-6 rounded-3xl bg-slate-950/75 backdrop-blur-xl border transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                        style={{
                          borderColor: `${pillar.accent}20`,
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03)`,
                        }}
                      >
                        {/* Big Index */}
                        <div
                          className="text-2xl md:text-3xl font-extrabold font-mono opacity-80 tracking-tight"
                          style={{ color: pillar.accent }}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-lg md:text-xl font-black text-white tracking-tight mt-1.5">
                          {pillar.title}
                        </h3>
                        <p className="mt-2.5 text-slate-300 text-xs leading-relaxed">
                          {pillar.desc}
                        </p>

                        {/* Category Tags */}
                        {pillar.categories && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {pillar.categories.map((cat, cIdx) => (
                              <span
                                key={cIdx}
                                className="text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all duration-300"
                                style={{
                                  backgroundColor: `${pillar.accent}08`,
                                  borderColor: `${pillar.accent}20`,
                                  color: `${pillar.accent}`
                                }}
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer Divider & Action */}
                        <div className="w-full flex items-center justify-between pt-4 border-t border-white/5 mt-5">
                          <span
                            className="text-[9px] md:text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: `${pillar.accent}15`, color: pillar.accent }}
                          >
                            {pillar.tag}
                          </span>
                          <span
                            className="text-xs font-bold flex items-center gap-1 transition-colors duration-200"
                            style={{ color: pillar.accent }}
                          >
                            Explore Pillar
                            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="hidden md:block pointer-events-none" />
                  )}

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
