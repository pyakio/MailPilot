import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DEFAULT_DEVICE_DATA = [
  { name: 'Apple Mail (Desktop/iOS)', value: 44, color: '#E8A33D' },
  { name: 'Gmail Web & Mobile', value: 36, color: '#3E6B70' },
  { name: 'Outlook (Office 365)', value: 14, color: '#22C55E' },
  { name: 'Other Mail Clients', value: 6, color: '#6366F1' },
];

export const DeviceBreakdownChart = React.memo(function DeviceBreakdownChart({ data }) {
  const chartData = data && data.length > 0 ? data : DEFAULT_DEVICE_DATA;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div className="bg-[#1B1E24] border border-[rgba(255,255,255,0.12)] p-3 rounded-lg shadow-xl text-xs font-mono text-white">
          <p className="font-semibold text-[#F4F5F7] mb-1">{entry.name}</p>
          <p className="text-[#E8A33D]">Share: <strong className="text-white">{entry.value}%</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-mono text-[var(--text-secondary)]">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

export default DeviceBreakdownChart;
