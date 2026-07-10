import React from 'react';
import { WIDGET_REGISTRY, renderWidgetComponent } from '../registry/WidgetRegistry';

// Mock Recharts to avoid JSOM/SVG rendering errors in Node environment
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    Treemap: ({ children }: any) => <div data-testid="treemap">{children}</div>,
    ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  };
});

describe('Dynamic Widget Registry Integration tests', () => {
  test('Registry contains all 4 mandatory visualization types', () => {
    expect(WIDGET_REGISTRY).toHaveProperty('categorical');
    expect(WIDGET_REGISTRY).toHaveProperty('temporal');
    expect(WIDGET_REGISTRY).toHaveProperty('hierarchical');
    expect(WIDGET_REGISTRY).toHaveProperty('relational');
  });

  test('Each registry entry exposes valid schema mappings', () => {
    Object.entries(WIDGET_REGISTRY).forEach(([key, entry]) => {
      expect(entry.type).toBe(key);
      expect(entry.name).toBeTruthy();
      expect(entry.defaultTitle).toBeTruthy();
      
      // Default grid sizing constraints
      expect(entry.defaultLayout).toHaveProperty('w');
      expect(entry.defaultLayout).toHaveProperty('h');
      expect(entry.defaultLayout.w).toBeGreaterThanOrEqual(1);
      expect(entry.defaultLayout.h).toBeGreaterThanOrEqual(1);
      
      // Default option config block
      expect(entry.defaultOptions).toBeInstanceOf(Object);
      
      // Verification of React elements
      expect(entry.component).toBeDefined();
      expect(entry.editor).toBeDefined();
    });
  });

  test('renderWidgetComponent resolves and renders registered widgets without crashing', () => {
    // Categorical
    const categoricalResult = renderWidgetComponent('categorical', [{ key: 'A', value: 10 }]);
    expect(categoricalResult).toBeDefined();
    
    // Temporal
    const temporalResult = renderWidgetComponent('temporal', [{ timestamp: new Date().toISOString(), value: 50, label: 'test' }]);
    expect(temporalResult).toBeDefined();

    // Hierarchical
    const hierarchicalResult = renderWidgetComponent('hierarchical', { name: 'Root', children: [{ name: 'Sub', value: 100 }] });
    expect(hierarchicalResult).toBeDefined();

    // Relational
    const relationalResult = renderWidgetComponent('relational', [{ x: 10, y: 20, z: 5 }]);
    expect(relationalResult).toBeDefined();
  });
});
