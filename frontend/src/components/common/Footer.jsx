import React from 'react';
import logoImg from '../../assets/images/forge india logo.jpg';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'Membership',
      links: [
        { label: 'Tiers & Pricing', href: '#pricing' },
        { label: 'Corporate Plans', href: '#' },
        { label: 'Gift a Membership', href: '#' },
      ],
    },
    {
      title: 'Business',
      links: [
        { label: 'Become a Vendor', href: '#' },
        { label: 'Agent Program', href: '#' },
        { label: 'Brand Assets', href: '#' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '#' },
        { label: 'Contact Us', href: '#' },
        { label: 'Security', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-[#020617] border-t border-slate-900 pt-16 pb-8 text-white relative overflow-hidden">
      <div className="w-full px-6 md:px-16 lg:px-24 relative z-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-900">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <span className="flex items-center space-x-2 text-xl font-bold tracking-tight text-white mb-4">
              <img src={logoImg} alt="Forge India Connect" className="h-7 w-auto object-contain rounded-md" />
              <span>Connect</span>
            </span>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm">
              Redefining the relationship between premium vendors and loyal members.
            </p>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-4">
            {sections.map((section) => (
              <div key={section.title} className="flex flex-col">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-4">
                  {section.title}
                </span>
                <ul className="space-y-3">
                  {section.links.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-xs md:text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
          <p>© {currentYear} Connect App. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
