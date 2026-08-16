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

const DEFAULT_HOURLY_DATA = [
  { hour: '06:00', opens: 12 },
  { hour: '08:00', opens: 45 },
  { hour: '10:00', opens: 88 },
  { hour: '12:00', opens: 64 },
  { hour: '14:00', opens: 92 },
  { hour: '16:00', opens: 78 },
  { hour: '18:00', opens: 55 },
  { hour: '20:00', opens: 38 },
  { hour: '22:00', opens: 18 },
];

export const HourlyEngagementChart = React.memo(function HourlyEngagementChart({ data }) {
  const chartData = data && data.length > 0 ? data : DEFAULT_HOURLY_DATA;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1B1E24] border border-[rgba(255,255,255,0.12)] p-2.5 rounded-lg shadow-xl text-xs font-mono text-white">
          <p className="text-[#9CA3AF] mb-1">Time: {label}</p>
          <p className="text-[#E8A33D] font-bold">Opens: {payload[0].value} reads</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
          <XAxis
            dataKey="hour"
            stroke="var(--text-secondary)"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text-secondary)"
            fontSize={11}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="opens" fill="#E8A33D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default HourlyEngagementChart;
