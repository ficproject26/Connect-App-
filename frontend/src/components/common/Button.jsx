import React from 'react';

export default function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
  const baseStyle = 'px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg focus:outline-none';
  const variants = {
    primary: 'bg-white text-slate-950 hover:bg-slate-100',
    gold: 'bg-gradient-to-r from-[#F4C400] to-yellow-500 text-slate-950 hover:brightness-105',
    outline: 'border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 bg-slate-900/40',
    danger: 'bg-red-500/10 border border-red-900/30 text-red-400 hover:bg-red-500/20'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
