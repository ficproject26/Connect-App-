import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 4 }) {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {items.map((_, i) => (
          <div key={i} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3" />
            <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
        {items.map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  // Card Skeleton (default)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 w-full">
      {items.map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs animate-pulse flex flex-col h-[320px]">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 w-full" />
          <div className="p-4 flex-grow space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
              <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
