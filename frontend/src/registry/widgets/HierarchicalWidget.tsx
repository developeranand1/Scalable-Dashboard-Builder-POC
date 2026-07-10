import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface HierarchicalNode {
  name: string;
  value?: number;
  children?: HierarchicalNode[];
}

interface HierarchicalWidgetProps {
  data: HierarchicalNode;
}

// Flat item structure for Recharts tooltip compatibility and rendering
interface FlatCell {
  name: string;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  depth: number;
}

// Vibrant theme colors for our premium layout
const HIER_COLORS = [
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#8B5CF6'  // Purple
];

const CustomTreemapContent: React.FC<any> = (props) => {
  const { root, depth, x, y, width, height, index, name, value } = props;
  
  if (width < 30 || height < 15) return null;

  // Determine a color based on root category index
  const colorIndex = index !== undefined ? index % HIER_COLORS.length : 0;
  const fillColor = HIER_COLORS[colorIndex];

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fillColor,
          stroke: 'rgba(17, 25, 40, 0.4)',
          strokeWidth: 2,
          opacity: 0.85,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out'
        }}
        className="hover:opacity-100"
      />
      {width > 50 && height > 25 && (
        <text
          x={x + 6}
          y={y + 18}
          fill="#fff"
          fontSize={11}
          fontWeight={600}
          style={{ pointerEvents: 'none' }}
        >
          {name}
        </text>
      )}
      {width > 60 && height > 40 && value && (
        <text
          x={x + 6}
          y={y + 32}
          fill="rgba(255, 255, 255, 0.7)"
          fontSize={10}
          style={{ pointerEvents: 'none' }}
        >
          ${(value / 1000).toFixed(0)}k
        </text>
      )}
    </g>
  );
};

export const HierarchicalWidget: React.FC<HierarchicalWidgetProps> = React.memo(({ data }) => {
  if (!data || (!data.children && !data.value)) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        No hierarchical data available
      </div>
    );
  }

  // If there are no children, make it a single root item
  const formattedData = data.children ? data.children : [data];

  return (
    <div className="w-full h-full p-2 flex flex-col" style={{ minHeight: '100%' }}>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={formattedData}
            dataKey="value"
            stroke="#fff"
            content={<CustomTreemapContent />}
          >
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
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Allocated']}
            />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

HierarchicalWidget.displayName = 'HierarchicalWidget';
