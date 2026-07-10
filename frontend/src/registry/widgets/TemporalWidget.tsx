import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TemporalItem {
  timestamp: string;
  value: number;
  label?: string;
}

interface TemporalWidgetProps {
  data: TemporalItem[];
}

export const TemporalWidget: React.FC<TemporalWidgetProps> = React.memo(({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No temporal data available
      </div>
    );
  }

  // Basic trend analysis: Compare first and last values
  const firstVal = data[0].value;
  const lastVal = data[data.length - 1].value;
  const diff = lastVal - firstVal;
  const percentChange = firstVal !== 0 ? ((diff / firstVal) * 100).toFixed(1) : '0';
  const isUpward = diff >= 0;

  return (
    <div className="w-full h-full flex flex-col p-2" style={{ minHeight: '100%' }}>
      {/* Trend Analysis Ribbon */}
      <div className="flex items-center justify-between px-3 pb-2 text-xs border-b border-white/5">
        <span className="text-gray-400">Trend Analysis:</span>
        <span className={`font-semibold flex items-center gap-1 ${isUpward ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isUpward ? '▲' : '▼'} {Math.abs(diff)} ({isUpward ? '+' : ''}{percentChange}%)
          <span className="text-[10px] text-gray-500 font-normal">vs start of period</span>
        </span>
      </div>

      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorTemporal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.05)" 
              vertical={false} 
            />
            <XAxis 
              dataKey="label" 
              stroke="rgba(15, 23, 42, 0.4)" 
              tick={{ fill: 'rgba(15, 23, 42, 0.6)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="rgba(15, 23, 42, 0.4)" 
              tick={{ fill: 'rgba(15, 23, 42, 0.6)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              labelFormatter={(label, items) => {
                const item = items[0]?.payload as TemporalItem;
                if (!item) return label;
                try {
                  const dateObj = new Date(item.timestamp);
                  return dateObj.toLocaleString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                } catch (e) {
                  return label;
                }
              }}
              contentStyle={{
                backgroundColor: 'rgba(17, 25, 40, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(5px)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#10B981" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorTemporal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

TemporalWidget.displayName = 'TemporalWidget';
