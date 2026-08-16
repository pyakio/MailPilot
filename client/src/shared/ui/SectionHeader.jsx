import React from 'react';

export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-center justify-between gap-4 pb-3 border-b border-[rgba(255,255,255,0.05)]">
      <div>
        <h3 className="text-xs font-semibold text-[#F8FAFC] tracking-tight">{title}</h3>
        {description && (
          <p className="text-[11px] text-[#94A3B8] mt-0.5">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default SectionHeader;
