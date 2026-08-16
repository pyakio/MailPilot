import React from 'react';

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex items-center gap-1 p-1 bg-[#161C2E] border border-[rgba(255,255,255,0.05)] rounded-mp-md ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-mp-sm transition-all duration-150 ${
              isActive
                ? 'bg-[#111625] text-[#F8FAFC] font-semibold border border-[rgba(255,255,255,0.05)]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
