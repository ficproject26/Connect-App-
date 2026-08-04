import React from 'react';

/**
 * ResponsiveTable:
 * - Desktop/Tablet: Displays standard formatted HTML table inside an overflow scroll container.
 * - Mobile (< 640px): Automatically converts table rows into stacked cards with clear labels so no columns overflow or clip.
 */
export default function ResponsiveTable({
  columns = [],
  data = [],
  keyExtractor = (item, idx) => item.id || idx,
  emptyMessage = "No records found.",
  onRowClick
}) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── DESKTOP & TABLET VIEW (TABLE) ── */}
      <div className="hidden sm:block w-full overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs bg-white dark:bg-slate-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {columns.map((col, idx) => (
                <th key={idx} className={`p-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
            {data.map((row, rowIdx) => (
              <tr
                key={keyExtractor(row, rowIdx)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`p-4 align-middle ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE VIEW (STACKED CARDS) ── */}
      <div className="block sm:hidden space-y-3">
        {data.map((row, rowIdx) => (
          <div
            key={keyExtractor(row, rowIdx)}
            onClick={() => onRowClick && onRowClick(row)}
            className={`p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2.5 transition-all ${
              onRowClick ? 'cursor-pointer active:scale-[0.99]' : ''
            }`}
          >
            {columns.map((col, colIdx) => (
              <div key={colIdx} className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800/60 pb-2 last:border-0 last:pb-0">
                <span className="font-extrabold text-[10.5px] uppercase tracking-wider text-slate-400 shrink-0 mr-3">
                  {col.header}
                </span>
                <div className="text-right font-semibold text-slate-800 dark:text-slate-100 break-words max-w-[65%]">
                  {col.render ? col.render(row, rowIdx) : row[col.accessor]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
