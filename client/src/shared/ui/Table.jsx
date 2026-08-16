import React from 'react';

export function Table({ headers, children, className = '' }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left text-[14px] text-[var(--text-secondary)]">
        <thead className="bg-[var(--surface-secondary)] text-[var(--text-muted)] text-[12px] uppercase tracking-[0.08em] font-medium border-b border-[var(--border)] transition-colors">
          <tr className="h-[48px]">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-3 font-medium font-mono text-[11px]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] transition-colors">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
