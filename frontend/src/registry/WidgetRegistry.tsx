import React from 'react';
import { WidgetType, WidgetConfig } from '../types';
import { CategoricalWidget } from './widgets/CategoricalWidget';
import { TemporalWidget } from './widgets/TemporalWidget';
import { HierarchicalWidget } from './widgets/HierarchicalWidget';
import { RelationalWidget } from './widgets/RelationalWidget';

// Prop structures for custom editor forms
interface ConfigEditorProps {
  options: Record<string, any>;
  onChange: (newOptions: Record<string, any>) => void;
}

// 1. Categorical Editor Form
const CategoricalEditor: React.FC<ConfigEditorProps> = ({ options, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Data Source</label>
    <select
      value={options.source || 'sales'}
      onChange={(e) => onChange({ ...options, source: e.target.value })}
      className="form-input"
    >
      <option value="sales">Product Category Sales ($)</option>
      <option value="regions">Regional Share</option>
      <option value="browsers">Browser Usage (%)</option>
    </select>
  </div>
);

// 2. Temporal Editor Form
const TemporalEditor: React.FC<ConfigEditorProps> = ({ options, onChange }) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Time Range</label>
      <select
        value={options.period || '30d'}
        onChange={(e) => onChange({ ...options, period: e.target.value })}
        className="form-input"
      >
        <option value="30d">Last 30 Days (Daily)</option>
        <option value="24h">Last 24 Hours (Hourly)</option>
      </select>
    </div>
    
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Trend Fluctuation</label>
      <select
        value={options.trend || 'upward'}
        onChange={(e) => onChange({ ...options, trend: e.target.value })}
        className="form-input"
      >
        <option value="upward">Steady Upward</option>
        <option value="downward">Steady Downward</option>
        <option value="seasonal">Seasonal Waves (Sine-Wave)</option>
      </select>
    </div>
  </div>
);

// 3. Hierarchical Editor Form
const HierarchicalEditor: React.FC<ConfigEditorProps> = ({ options, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Category Schema</label>
    <select
      value={options.source || 'organization'}
      onChange={(e) => onChange({ ...options, source: e.target.value })}
      className="form-input"
    >
      <option value="organization">Corporate Expense Tree</option>
      <option value="disk">Hard Drive Directory Structure</option>
    </select>
  </div>
);

// 4. Relational Editor Form
const RelationalEditor: React.FC<ConfigEditorProps> = ({ options, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Relational Metric Pairing</label>
    <select
      value={options.source || 'marketing'}
      onChange={(e) => onChange({ ...options, source: e.target.value })}
      className="form-input"
    >
      <option value="marketing">Ad Spend vs conversion % vs revenue</option>
      <option value="fitness">Active duration vs calories vs heart rate</option>
    </select>
  </div>
);

// Main Registry Definition Interface
export interface RegistryEntry {
  type: WidgetType;
  name: string;
  defaultTitle: string;
  defaultLayout: { w: number; h: number };
  defaultOptions: Record<string, any>;
  component: React.ComponentType<{ data: any }>;
  editor: React.ComponentType<ConfigEditorProps>;
}

// Registry mapping
export const WIDGET_REGISTRY: Record<WidgetType, RegistryEntry> = {
  categorical: {
    type: 'categorical',
    name: 'Categorical Bar Chart',
    defaultTitle: 'Sales Distribution by Category',
    defaultLayout: { w: 6, h: 3 },
    defaultOptions: { source: 'sales' },
    component: CategoricalWidget,
    editor: CategoricalEditor
  },
  temporal: {
    type: 'temporal',
    name: 'Temporal Time-Series',
    defaultTitle: 'Platform Metric Trend over Time',
    defaultLayout: { w: 6, h: 3 },
    defaultOptions: { period: '30d', trend: 'seasonal' },
    component: TemporalWidget,
    editor: TemporalEditor
  },
  hierarchical: {
    type: 'hierarchical',
    name: 'Hierarchical Treemap',
    defaultTitle: 'System Structure Breakdown',
    defaultLayout: { w: 6, h: 3 },
    defaultOptions: { source: 'organization' },
    component: HierarchicalWidget,
    editor: HierarchicalEditor
  },
  relational: {
    type: 'relational',
    name: 'Relational Scatter Plot',
    defaultTitle: 'Multi-Dimensional Data Correlation',
    defaultLayout: { w: 6, h: 3 },
    defaultOptions: { source: 'marketing' },
    component: RelationalWidget,
    editor: RelationalEditor
  }
};

// Helper function to render a widget dynamically based on registered type
export const renderWidgetComponent = (type: WidgetType, data: any) => {
  const entry = WIDGET_REGISTRY[type];
  if (!entry) {
    return <div className="text-rose-400 p-4">Unregistered Widget Type: {type}</div>;
  }
  const WidgetComponent = entry.component;
  return <WidgetComponent data={data} />;
};
