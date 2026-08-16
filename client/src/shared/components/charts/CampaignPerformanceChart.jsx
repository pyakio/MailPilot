import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function CampaignPerformanceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] font-mono border border-dashed border-[var(--border)] rounded-lg p-6">
        <span className="text-sm font-semibold text-[var(--text-secondary)] mb-1">No Broadcast Data</span>
        <span>Create and dispatch your first campaign to view Sent vs Delivered vs Opened vs Clicked metrics.</span>
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
          <Legend
            wrapperStyle={{
              fontSize: '11px',
              paddingTop: '8px',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          <Bar dataKey="Sent" fill="#3E6B70" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Delivered" fill="#4B5563" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Opened" fill="#E8A33D" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Clicked" fill="#22C55E" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CampaignPerformanceChart;
