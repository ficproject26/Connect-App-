import React from 'react';
import { MapPin, Phone } from 'lucide-react';

const branches = [
  {
    type: 'HEAD OFFICE',
    city: 'Krishnagiri',
    cityColor: 'text-white',
    address: 'RK Towers, Rayakottai Rd, opposite to HP Petrol Bunk, Wahab Nagar, Krishnagiri, Tamil Nadu 635002',
    phone: '+91 63694 06416',
    mapsQuery: 'RK+Towers+Rayakottai+Rd+Krishnagiri+Tamil+Nadu+635002',
  },
  {
    type: 'BRANCH OFFICE',
    city: 'Tirupattur',
    cityColor: 'text-white',
    address: 'No 83, Hyundai showroom, 1st floor, opp to Jio Petrol Bunk, Tirupattur, Tamil Nadu - 635853',
    phone: '+91 63694 06416',
    mapsQuery: 'Tirupattur+Tamil+Nadu+635853',
  },
  {
    type: 'BRANCH OFFICE',
    city: 'Chennai',
    cityColor: 'text-white',
    address: '22, VVM Towers, 3rd Floor, Pattullos Rd, Anna Salai, Royapettah, Chennai, Tamil Nadu 600002',
    phone: '+91 63694 06416',
    mapsQuery: '22+VVM+Towers+Pattullos+Rd+Anna+Salai+Royapettah+Chennai+600002',
  },
  {
    type: 'LIAISON OFFICE',
    city: 'Bangalore',
    cityColor: 'text-white',
    address: 'Excel Coworks, Marilingappa layout, Nagarbhavi, Papareddypalya, Bangalore.',
    phone: '+91 63694 06416',
    mapsQuery: 'Excel+Coworks+Marilingappa+layout+Nagarbhavi+Bangalore',
  },
  {
    type: 'AGENT BRANCH',
    city: 'Palacode',
    cityColor: 'text-white',
    address: '832F+39C, Theerthagiri Nagar, Karagathahalli, Palacode, Tamil Nadu 636808',
    phone: '+91 63694 06416',
    mapsQuery: '832F%2B39C+Theerthagiri+Nagar+Karagathahalli+Palacode+Tamil+Nadu+636808',
  },
];

export default function BranchLocations() {
  const openMaps = (query) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="bg-[#04091a] py-16 px-6 md:px-16 lg:px-24">
      {/* Section Header */}
      <div className="text-center mb-12">
        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Our Locations</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Visit Us Across India
        </h2>
        <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
          We have offices across key cities. Click any branch card to view its location on Google Maps.
        </p>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-6 max-w-7xl mx-auto">
        {branches.map((branch, idx) => (
          <button
            key={idx}
            onClick={() => openMaps(branch.mapsQuery)}
            className="group text-left bg-[#0b132b] hover:bg-[#0f1d3a] border border-slate-800 hover:border-amber-500/50 rounded-xl sm:rounded-2xl p-3.5 sm:p-6 flex flex-col gap-2.5 sm:gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 cursor-pointer"
          >
            {/* Office Type */}
            <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-500 group-hover:text-amber-400 transition-colors">
              {branch.type}
            </span>

            {/* City Name */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <h3 className={`text-base sm:text-xl font-black ${branch.cityColor} group-hover:text-amber-400 transition-colors`}>
                {branch.city}
              </h3>
            </div>

            {/* Address */}
            <p className="text-slate-400 text-[11px] sm:text-sm leading-relaxed flex-grow group-hover:text-slate-300 transition-colors">
              {branch.address}
            </p>

            {/* Phone */}
            <div className="flex items-center gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 border-t border-slate-800/80">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
              <span className="text-amber-400 font-bold text-[11px] sm:text-sm tracking-wide">{branch.phone}</span>
            </div>

            {/* Maps hint */}
            <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-400 font-semibold">View on Google Maps →</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
