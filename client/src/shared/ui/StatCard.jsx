import React from 'react';

export function StatCard({ title, value, icon: Icon, change, trend }) {
  return (
    <div className="p-5 bg-[#111625] border border-[rgba(255,255,255,0.05)] rounded-mp-md transition-all duration-150">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#64748B]">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-[#475569]" />}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-3xl font-bold tracking-tight text-[#F8FAFC]">
          {value}
        </h3>
        {change && (
          <span
            className={`text-xs font-semibold ${
              trend === 'up' ? 'text-[#22C55E]' : 'text-[#EF4444]'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

export function MetricCard(props) {
  return <StatCard {...props} />;
}

export default StatCard;
