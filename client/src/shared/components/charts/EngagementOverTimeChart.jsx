import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export function EngagementOverTimeChart({ data }) {
  if (!data || data.length === 0 || data.every((d) => d.Opens === 0 && d.Clicks === 0)) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-xs text-[var(--text-muted)] font-mono border border-dashed border-[var(--border)] rounded-lg p-6">
        <span className="text-sm font-semibold text-[var(--text-secondary)] mb-1">No Engagement Recorded</span>
        <span>Broadcast a campaign and view recipient opens & clicks live over time.</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="opensGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E8A33D" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#E8A33D" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
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
          <Area
            type="monotone"
            dataKey="Opens"
            stroke="#E8A33D"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#opensGradient)"
            dot={{ fill: '#E8A33D', r: 3 }}
            activeDot={{ r: 5, fill: '#F59E0B' }}
          />
          <Area
            type="monotone"
            dataKey="Clicks"
            stroke="#22C55E"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#clicksGradient)"
            dot={{ fill: '#22C55E', r: 3 }}
            activeDot={{ r: 5, fill: '#4ADE80' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EngagementOverTimeChart;
