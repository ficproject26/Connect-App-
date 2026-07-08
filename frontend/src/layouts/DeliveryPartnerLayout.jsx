import React from 'react';

export default function DeliveryPartnerLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-white relative overflow-x-hidden">
      {/* Premium Ambient Light Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex-grow flex flex-col z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
}
