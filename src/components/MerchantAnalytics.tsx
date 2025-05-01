import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area } from 'recharts';

interface Merchant {
  name: string;
  category: string;
  totalSpent: number;
  frequency: number;
  averageSpent: number;
  icon?: React.ElementType;
  color?: string;
  pieColor?: string;
}

interface MerchantAnalyticsProps {
  merchants: Merchant[];
  topMerchantsChartData: { name: string; totalSpent: number; fill: string }[];
  COLORS: string[];
}

export const MerchantAnalytics: React.FC<MerchantAnalyticsProps> = ({
  merchants,
  topMerchantsChartData,
  COLORS
}) => {
  // Enhanced dashboard color palette
  const DASHBOARD_COLORS = [
    '#FFD600', // yellow
    '#00CFFF', // cyan
    '#00E676', // green
    '#8E44AD', // purple
    '#FF3D57', // red
    '#FF9100', // orange
    '#2979FF', // blue
    '#64DD17', // lime
  ];

  // Only define these ONCE, using the palette above
  const pieData = topMerchantsChartData.map((m, idx) => ({
    name: m.name,
    value: m.totalSpent,
    fill: DASHBOARD_COLORS[idx % DASHBOARD_COLORS.length],
  }));

  const lineData = topMerchantsChartData.map((m, idx) => ({
    name: m.name,
    totalSpent: m.totalSpent,
    frequency: merchants[idx]?.frequency || 0,
  }));

  const areaData = lineData;

  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">Top Merchants Analysis</h3>
      {/* 2x2 Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Donut Chart (Top Left) */}
        <div className="bg-[#232946] rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <h4 className="text-lg font-semibold mb-4 text-white">Donut Chart</h4>
          <div className="h-[220px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={95}
                  // Remove label prop for clarity
                  stroke="#232946"
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-donut-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#232946', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value, name) => [
                    value,
                    pieData.find(d => d.name === name)?.name || name
                  ]}
                />
                <Legend
                  wrapperStyle={{
                    color: '#fff',
                    fontSize: 13,
                    paddingTop: 10,
                  }}
                  iconType="circle"
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Line Chart (Top Right) */}
        <div className="bg-[#232946] rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <h4 className="text-lg font-semibold mb-4 text-white">Line Chart</h4>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid stroke="#393e5b" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#fff" }} />
                <YAxis tick={{ fontSize: 12, fill: "#fff" }} />
                <Tooltip
                  contentStyle={{ background: '#232946', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="totalSpent" stroke="#FFD600" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="frequency" stroke="#00CFFF" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Bar Chart (Bottom Left) */}
        <div className="bg-[#232946] rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <h4 className="text-lg font-semibold mb-4 text-white">Bar Chart</h4>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topMerchantsChartData.map((m, idx) => ({
                  ...m,
                  fill: DASHBOARD_COLORS[idx % DASHBOARD_COLORS.length],
                }))}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid stroke="#393e5b" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 14, fill: "#fff" }}
                />
                <Tooltip
                  contentStyle={{ background: '#232946', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="totalSpent" radius={[0, 8, 8, 0]} barSize={32}>
                  {topMerchantsChartData.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={DASHBOARD_COLORS[index % DASHBOARD_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Area Chart (Bottom Right) */}
        <div className="bg-[#232946] rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <h4 className="text-lg font-semibold mb-4 text-white">Area Chart</h4>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <CartesianGrid stroke="#393e5b" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#fff" }} />
                <YAxis tick={{ fontSize: 12, fill: "#fff" }} />
                <Tooltip
                  contentStyle={{ background: '#232946', border: 'none', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="totalSpent" stroke="#FFD600" fill="#FFD600" fillOpacity={0.2} strokeWidth={3} />
                <Area type="monotone" dataKey="frequency" stroke="#00CFFF" fill="#00CFFF" fillOpacity={0.2} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Merchant List below charts */}
      <div className="bg-[#232946] rounded-2xl shadow-lg p-6 mt-10">
        <h4 className="text-lg font-semibold mb-4 text-white">Merchants</h4>
        <div className="space-y-3 overflow-y-auto max-h-[320px] pr-2">
          {merchants.map((merchant, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border border-[#393e5b] hover:bg-[#393e5b] transition-colors",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-md", merchant.color || 'bg-gray-500')}>
                  {merchant.icon ? React.createElement(merchant.icon, { className: "w-5 h-5 text-white" }) : <Tag className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <p className="text-base font-medium text-white">{merchant.name}</p>
                  <p className="text-xs text-gray-400">{merchant.frequency} transaction{merchant.frequency > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-semibold text-white">${merchant.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-gray-400">Avg: ${merchant.averageSpent.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};