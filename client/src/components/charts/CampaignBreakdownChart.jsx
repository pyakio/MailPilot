import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '../../hooks/useTheme';

export function CampaignBreakdownChart({ data = [] }) {
  const { isDark } = useTheme();

  const textColor = isDark ? '#94A3B8' : '#64748B';
  const gridColor = isDark ? '#1E293B' : '#F1F5F9';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} />
          <YAxis stroke={textColor} fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
              borderRadius: '12px',
              color: isDark ? '#FFFFFF' : '#0F172A',
              fontSize: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {value}
              </span>
            )}
          />
          <Bar dataKey="Sent" fill="#6366F1" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Opened" fill="#22C55E" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Clicked" fill="#F59E0B" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CampaignBreakdownChart;
