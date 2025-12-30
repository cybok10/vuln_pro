
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Finding, Severity } from '../types';

interface DashboardStatsProps {
  findings: Finding[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ findings }) => {
  const severityCounts = React.useMemo(() => {
    const counts = {
      [Severity.CRITICAL]: 0,
      [Severity.HIGH]: 0,
      [Severity.MEDIUM]: 0,
      [Severity.LOW]: 0,
      [Severity.INFO]: 0,
    };
    findings.forEach(f => counts[f.severity]++);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [findings]);

  const COLORS = {
    [Severity.CRITICAL]: '#ef4444',
    [Severity.HIGH]: '#f97316',
    [Severity.MEDIUM]: '#eab308',
    [Severity.LOW]: '#3b82f6',
    [Severity.INFO]: '#71717a',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">Findings by Severity</h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#71717a" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#71717a" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', fontSize: '12px' }}
                itemStyle={{ color: '#fafafa' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {severityCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as Severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-widest">Distribution Pie</h4>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityCounts}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {severityCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as Severity]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
