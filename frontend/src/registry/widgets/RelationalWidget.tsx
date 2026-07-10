import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface RelationalItem {
  x: number;
  y: number;
  z?: number;
  label?: string;
}

interface RelationalWidgetProps {
  data: RelationalItem[];
}

export const RelationalWidget: React.FC<RelationalWidgetProps> = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No relational data available
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2" style={{ minHeight: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="relationalGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#EC4899" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.05)" 
          />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Spend" 
            unit="k"
            stroke="rgba(15, 23, 42, 0.4)"
            tick={{ fill: 'rgba(15, 23, 42, 0.6)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Conversion" 
            unit="%"
            stroke="rgba(15, 23, 42, 0.4)"
            tick={{ fill: 'rgba(15, 23, 42, 0.6)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          {/* ZAxis maps size of the bubble. Scale from 10 to 200 */}
          <ZAxis 
            type="number" 
            dataKey="z" 
            range={[40, 300]} 
            name="Scale/Revenue" 
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255, 255, 255, 0.15)' }}
            contentStyle={{
              backgroundColor: 'rgba(17, 25, 40, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(5px)'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'Spend') return [`$${value}k`, name];
              if (name === 'Conversion') return [`${value}%`, name];
              if (name === 'Scale/Revenue') return [`$${value}k`, 'Revenue'];
              return [value, name];
            }}
            // Custom label resolver
            labelFormatter={(value, items) => {
              const payload = items[0]?.payload as RelationalItem;
              return payload?.label || `Point`;
            }}
          />
          <Scatter 
            name="Campaigns" 
            data={data} 
            fill="url(#relationalGlow)" 
            style={{ filter: 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.3))' }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
});

RelationalWidget.displayName = 'RelationalWidget';
