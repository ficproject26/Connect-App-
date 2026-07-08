import React from 'react';
import { Bell, X } from 'lucide-react';

export default function Notification({ message, type = 'info', onClose }) {
  const types = {
    info: 'bg-[#0B132B]/85 border-[#1C2541] text-white',
    success: 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400',
    warning: 'bg-amber-950/20 border-amber-900/30 text-amber-400',
    error: 'bg-red-950/20 border-red-900/30 text-red-400'
  };

  return (
    <div className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-lg backdrop-blur-md ${types[type] || types.info}`}>
      <div className="flex items-center space-x-2.5">
        <Bell className="w-4 h-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer ml-3">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
