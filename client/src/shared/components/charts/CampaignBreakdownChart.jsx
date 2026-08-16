import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function CampaignBreakdownChart({ data }) {
  if (!data || data.length === 0 || data.every((d) => d.Opened === 0)) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-[#6B7280] font-mono border border-dashed border-[rgba(255,255,255,0.06)] rounded-lg p-6">
        <span className="text-sm font-semibold text-[#9CA3AF] mb-1">No Broadcast Comparison</span>
        <span>Launch campaigns to benchmark unique recipient opens side by side.</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#6B7280"
            fontSize={11}
            tickLine={false}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis
            stroke="#6B7280"
            fontSize={11}
            tickLine={false}
            allowDecimals={false}
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111317',
              borderColor: 'rgba(255,255,255,0.12)',
              borderRadius: '6px',
              color: '#F4F5F7',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          />
          <Bar dataKey="Opened" fill="#E8A33D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CampaignBreakdownChart;
