export type WidgetType = 'categorical' | 'temporal' | 'hierarchical' | 'relational';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  options: Record<string, any>;
}

export interface Dashboard {
  id: string;
  name: string;
  widgets: WidgetConfig[];
}

export interface WidgetDataState {
  data: any;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardStoreState {
  widgets: WidgetConfig[];
  activeDashboardId: string;
  dashboardName: string;
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  widgetData: Record<string, WidgetDataState>;
  latencySimMs: number; // For demo purpose: customize latency simulation
  
  // Actions
  setLatencySimMs: (latency: number) => void;
  fetchDashboard: (id: string) => Promise<void>;
  saveDashboard: () => Promise<void>;
  addWidget: (widget: Omit<WidgetConfig, 'id'>) => void;
  updateWidgetLayout: (layouts: { i: string; x: number; y: number; w: number; h: number }[]) => void;
  updateWidgetConfig: (id: string, updates: Partial<WidgetConfig>) => void;
  removeWidget: (id: string) => void;
  fetchWidgetData: (id: string) => Promise<void>;
  fetchAllWidgetData: () => Promise<void>;
}
