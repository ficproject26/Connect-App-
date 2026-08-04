import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="w-full min-h-screen overflow-y-auto bg-white dark:bg-[#030712] font-sans antialiased text-slate-900 dark:text-slate-100">
      {children}
    </div>
  );
}
