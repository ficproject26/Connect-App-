import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans relative overflow-hidden px-4 py-12">
      {/* Premium Ambient Light Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#F4C400]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
