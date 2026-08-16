import React from 'react';

export function PageHeader({ title, description, actions, badge }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.05)]">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-[#F8FAFC]">
            {title}
          </h1>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-[#161C2E] border border-[rgba(255,255,255,0.05)] text-[#94A3B8] rounded-mp-sm">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}

export default PageHeader;
