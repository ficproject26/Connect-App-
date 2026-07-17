import React from 'react';
import { Code, HardHat, UserCheck, BarChart3, ArrowRight } from 'lucide-react';

export default function ServicesSection({ onCategoryClick }) {
  const servicesList = [
    {
      id: 'it-services',
      title: 'IT Services',
      icon: Code,
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      cardStyle: 'from-blue-50/35 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900/60 border-blue-200/40 dark:border-slate-800/80 hover:border-blue-400/60 dark:hover:border-slate-700/80 hover:from-blue-50/50 hover:to-white',
      hoverHighlight: 'group-hover:border-blue-500/20',
      desc: 'Enterprise custom software, web platforms, and secure cloud environments.',
      items: ['Web Development', 'App Development', 'Cloud Architecture', 'Cybersecurity Audit', 'IT Infrastructure']
    },
    {
      id: 'non-it',
      title: 'Non-IT',
      icon: HardHat,
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      cardStyle: 'from-emerald-50/35 via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900/60 border-emerald-200/40 dark:border-slate-800/80 hover:border-emerald-400/60 dark:hover:border-slate-700/80 hover:from-emerald-50/50 hover:to-white',
      hoverHighlight: 'group-hover:border-emerald-500/20',
      desc: 'Vetted field operations, logistics, warehousing, and facilities management.',
      items: ['Office Housekeeping', 'Security Personnel', 'Delivery Logistics', 'Warehouse Management', 'Data Entry Support']
    },
    {
      id: 'job-consulting',
      title: 'Job Consulting',
      icon: UserCheck,
      iconBg: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
      cardStyle: 'from-violet-50/35 via-white to-violet-50/20 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900/60 border-violet-200/40 dark:border-slate-800/80 hover:border-violet-400/60 dark:hover:border-slate-700/80 hover:from-violet-50/50 hover:to-white',
      hoverHighlight: 'group-hover:border-violet-500/20',
      desc: 'End-to-end human capital acquisitions, recruitment drives, and resume builds.',
      items: ['Resume Makeover', 'Interview Preparation', 'Executive Search', 'Recruitment Drives', 'Career Roadmap Planning']
    },
    {
      id: 'business-consulting',
      title: 'Business Consulting',
      icon: BarChart3,
      iconBg: 'bg-amber-50 text-amber-605 dark:bg-amber-950/40 dark:text-amber-400',
      cardStyle: 'from-amber-50/35 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900/60 border-amber-200/40 dark:border-slate-800/80 hover:border-amber-400/60 dark:hover:border-slate-700/80 hover:from-amber-50/50 hover:to-white',
      hoverHighlight: 'group-hover:border-brand-gold/20',
      desc: 'Corporate taxation, GST filings, legal drafts, and pitch deck advisory.',
      items: ['Company Setup & Incorporation', 'Tax & Compliance Audit', 'Legal Drafts & Licensing', 'Pitch Deck Advisory', 'Financial Planning']
    }
  ];

  return (
    <section className="pt-8 pb-24 bg-gradient-to-b from-[#dbeafe] via-[#f0f7ff] to-[#dbeafe]/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background abstract radial glows */}
      <div className="absolute top-[30%] right-[5%] w-[600px] h-[600px] bg-blue-300/40 dark:bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[600px] h-[600px] bg-brand-gold/10 dark:bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full px-6 md:px-16 lg:px-24 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Connect Group Business</span>
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-slate-900 dark:text-white mt-2">
            Our Services Portfolio
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed text-sm md:text-base">
            Access institutional-grade professional assistance and operational support for your business needs.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8 max-w-7xl mx-auto items-start">
          {servicesList.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                onClick={() => {
                  if (onCategoryClick) {
                    onCategoryClick(service.title, true);
                  }
                }}
                className={`group relative bg-gradient-to-br ${service.cardStyle} p-3.5 sm:p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-350 hover:translate-y-[-4px] cursor-pointer flex flex-col justify-between`}
              >
                {/* Theme border highlight on card hover */}
                <div className={`absolute inset-0 rounded-2xl border border-transparent ${service.hoverHighlight} transition-all duration-300 pointer-events-none`} />

                <div>
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${service.iconBg} mb-3.5 sm:mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-brand-gold-dark dark:group-hover:text-brand-gold transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-[10.5px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                {/* Collapsible details visible on hover */}
                <div className="max-h-[350px] opacity-100 overflow-hidden transition-all duration-500 ease-in-out lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-[350px] lg:group-hover:opacity-100">
                  {/* Divider */}
                  <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800/60 my-2.5 sm:my-4" />

                  {/* Bullet points */}
                  <ul className="space-y-1.5 sm:space-y-2.5">
                    {service.items.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-brand-gold group-hover:bg-slate-900 dark:group-hover:bg-slate-200 transition-colors shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Explore button */}
                  <div className="flex items-center text-[10px] sm:text-xs font-bold text-brand-gold group-hover:text-slate-950 dark:group-hover:text-white mt-4 sm:mt-6 transition-colors self-start uppercase tracking-widest space-x-1.5">
                    <span>Explore Details</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
