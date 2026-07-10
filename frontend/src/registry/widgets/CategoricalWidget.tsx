import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface CategoricalWidgetProps {
  data: { key: string; value: number }[];
}

const COLORS = [
  'url(#cat-grad-0)',
  'url(#cat-grad-1)',
  'url(#cat-grad-2)',
  'url(#cat-grad-3)',
  'url(#cat-grad-4)',
  'url(#cat-grad-5)'
];

const GRADIENTS = (
  <defs>
    <linearGradient id="cat-grad-0" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
      <stop offset="100%" stopColor="#6366F1" stopOpacity={0.3} />
    </linearGradient>
    <linearGradient id="cat-grad-1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#EC4899" stopOpacity={0.8} />
      <stop offset="100%" stopColor="#D946EF" stopOpacity={0.3} />
    </linearGradient>
    <linearGradient id="cat-grad-2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
      <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.3} />
    </linearGradient>
    <linearGradient id="cat-grad-3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
      <stop offset="100%" stopColor="#059669" stopOpacity={0.3} />
    </linearGradient>
    <linearGradient id="cat-grad-4" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8} />
      <stop offset="100%" stopColor="#D97706" stopOpacity={0.3} />
    </linearGradient>
    <linearGradient id="cat-grad-5" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
      <stop offset="100%" stopColor="#DC2626" stopOpacity={0.3} />
    </linearGradient>
  </defs>
);

export const CategoricalWidget: React.FC<CategoricalWidgetProps> = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No categorical data available
      </div>
    );
  }

  // Find max value to draw subtle background indicators if needed
  return (
    <div className="w-full h-full p-2" style={{ minHeight: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
        >
          {GRADIENTS}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.05)" 
            vertical={false} 
          />
          <XAxis 
            dataKey="key" 
            stroke="rgba(15, 23, 42, 0.4)" 
            tick={{ fill: 'rgba(15, 23, 42, 0.6)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="rgba(15, 23, 42, 0.4)" 
            tick={{ fill: 'rgba(15, 23, 42, 0.6)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 25, 40, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(5px)'
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
          />
          <Bar 
            dataKey="value" 
            radius={[6, 6, 0, 0]}
            maxBarSize={45}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

CategoricalWidget.displayName = 'CategoricalWidget';
