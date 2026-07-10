import { create } from 'zustand';
import { DashboardStoreState, WidgetConfig, WidgetDataState } from '../types';

const API_BASE = '/api';
const LOCAL_STORAGE_KEY_PREFIX = 'dashboard_builder_';

export const useDashboardStore = create<DashboardStoreState>((set, get) => ({
  widgets: [],
  activeDashboardId: 'default',
  dashboardName: 'Default Monitoring System',
  isLoading: false,
  isSaving: false,
  saveError: null,
  widgetData: {},
  latencySimMs: 300, // default 300ms latency simulated for premium visual skeletons

  setLatencySimMs: (latency: number) => set({ latencySimMs: latency }),

  fetchDashboard: async (id: string) => {
    set({ isLoading: true, activeDashboardId: id });
    try {
      const response = await fetch(`${API_BASE}/dashboard/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to load dashboard from API (status ${response.status})`);
      }
      const data = await response.json();
      
      set({ 
        widgets: data.widgets || [], 
        dashboardName: data.name || 'Dashboard',
        isLoading: false 
      });

      // After fetching layout, trigger batch data fetching for all widgets
      get().fetchAllWidgetData();
    } catch (error: any) {
      console.warn('Backend unavailable, falling back to LocalStorage:', error);
      
      // Fallback: Read from LocalStorage
      const localData = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${id}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        set({ 
          widgets: parsed.widgets || [], 
          dashboardName: parsed.name || 'Dashboard (Offline)',
          isLoading: false 
        });
      } else {
        // Fallback default mock widgets
        const fallbackWidgets: WidgetConfig[] = [
          {
            id: 'widget-categorical-sales',
            type: 'categorical',
            title: 'Quarterly Sales by Segment (Offline)',
            x: 0, y: 0, w: 6, h: 3,
            options: { source: 'sales' }
          },
          {
            id: 'widget-temporal-traffic',
            type: 'temporal',
            title: 'Network Traffic Over Time (Offline)',
            x: 6, y: 0, w: 6, h: 3,
            options: { period: '30d', trend: 'seasonal' }
          },
          {
            id: 'widget-hierarchical-budget',
            type: 'hierarchical',
            title: 'Global Budget Tree Allocation (Offline)',
            x: 0, y: 3, w: 6, h: 3,
            options: { source: 'organization' }
          },
          {
            id: 'widget-relational-campaigns',
            type: 'relational',
            title: 'Ad Spend vs Customer Acquisition (Offline)',
            x: 6, y: 3, w: 6, h: 3,
            options: { source: 'marketing' }
          }
        ];
        set({ 
          widgets: fallbackWidgets,
          dashboardName: 'Default Monitoring System (Offline Demo)',
          isLoading: false 
        });
      }
      
      // Still load data for widgets from mock endpoints (or handle local generation if offline)
      get().fetchAllWidgetData();
    }
  },

  saveDashboard: async () => {
    const { activeDashboardId, dashboardName, widgets } = get();
    set({ isSaving: true, saveError: null });
    const payload = {
      id: activeDashboardId,
      name: dashboardName,
      widgets
    };
    
    // Save to LocalStorage immediately for instant persistence fallback
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${activeDashboardId}`, JSON.stringify(payload));
    
    try {
      const response = await fetch(`${API_BASE}/dashboard/${activeDashboardId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save dashboard to backend database (status ${response.status})`);
      }
      set({ isSaving: false });
    } catch (error: any) {
      console.error('Save to server failed. Persisted locally only.', error);
      set({ isSaving: false, saveError: error.message || 'Offline save only' });
    }
  },

  addWidget: (widgetInput) => {
    const newId = `widget-${widgetInput.type}-${Date.now()}`;
    const newWidget: WidgetConfig = {
      ...widgetInput,
      id: newId
    };

    set((state) => ({
      widgets: [...state.widgets, newWidget],
      widgetData: {
        ...state.widgetData,
        [newId]: { data: null, isLoading: true, error: null }
      }
    }));

    // Fetch data for the new widget
    get().fetchWidgetData(newId);
    // Auto save layout changes
    get().saveDashboard();
  },

  updateWidgetLayout: (layouts) => {
    set((state) => {
      let layoutChanged = false;
      const updatedWidgets = state.widgets.map((widget) => {
        const layout = layouts.find((l) => l.i === widget.id);
        if (layout) {
          if (
            widget.x !== layout.x ||
            widget.y !== layout.y ||
            widget.w !== layout.w ||
            widget.h !== layout.h
          ) {
            layoutChanged = true;
            return {
              ...widget,
              x: layout.x,
              y: layout.y,
              w: layout.w,
              h: layout.h
            };
          }
        }
        return widget;
      });

      if (!layoutChanged) return state; // Avoid re-render if nothing shifted

      return { widgets: updatedWidgets };
    });

    // Auto save updated coordinates to persistence layer
    get().saveDashboard();
  },

  updateWidgetConfig: (id, updates) => {
    set((state) => ({
      widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w))
    }));

    // If options changed, we need to refresh data for this widget
    if (updates.options || updates.type) {
      get().fetchWidgetData(id);
    }
    
    get().saveDashboard();
  },

  removeWidget: (id) => {
    set((state) => {
      const { [id]: _, ...remainingData } = state.widgetData;
      return {
        widgets: state.widgets.filter((w) => w.id !== id),
        widgetData: remainingData
      };
    });
    get().saveDashboard();
  },

  // Concurrent single widget fetching
  fetchWidgetData: async (id: string) => {
    const widget = get().widgets.find((w) => w.id === id);
    if (!widget) return;

    set((state) => ({
      widgetData: {
        ...state.widgetData,
        [id]: { ...(state.widgetData[id] || {}), isLoading: true, error: null }
      }
    }));

    const { type, options } = widget;
    const queryParams = new URLSearchParams();
    Object.entries(options || {}).forEach(([k, v]) => queryParams.append(k, String(v)));

    try {
      const response = await fetch(
        `${API_BASE}/widgets/data/${type}?${queryParams.toString()}`,
        {
          headers: {
            'x-simulate-latency': String(get().latencySimMs)
          }
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `API error (${response.status})`);
      }

      const resJson = await response.json();
      
      set((state) => ({
        widgetData: {
          ...state.widgetData,
          [id]: { data: resJson.data, isLoading: false, error: null }
        }
      }));
    } catch (err: any) {
      console.error(`Error fetching widget data for ${id}:`, err);
      set((state) => ({
        widgetData: {
          ...state.widgetData,
          [id]: { 
            data: null, 
            isLoading: false, 
            error: err.message || 'Network connectivity error' 
          }
        }
      }));
    }
  },

  // Batch Concurrent Fetching
  fetchAllWidgetData: async () => {
    const { widgets, latencySimMs } = get();
    if (widgets.length === 0) return;

    // Set all widgets to loading status
    const initialLoadingState = { ...get().widgetData };
    widgets.forEach((widget) => {
      initialLoadingState[widget.id] = {
        data: initialLoadingState[widget.id]?.data || null,
        isLoading: true,
        error: null
      };
    });
    set({ widgetData: initialLoadingState });

    try {
      const payload = {
        requests: widgets.map((w) => ({
          id: w.id,
          type: w.type,
          queryParams: w.options
        }))
      };

      const response = await fetch(`${API_BASE}/widgets/batch-data`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-simulate-latency': String(latencySimMs)
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Batch fetching service request failed.');
      }

      const resJson = await response.json();
      const newWidgetData: Record<string, WidgetDataState> = {};

      widgets.forEach((widget) => {
        const batchResult = resJson.widgets[widget.id];
        if (batchResult && batchResult.success) {
          newWidgetData[widget.id] = {
            data: batchResult.data,
            isLoading: false,
            error: null
          };
        } else {
          newWidgetData[widget.id] = {
            data: null,
            isLoading: false,
            error: batchResult?.error || 'No data returned in batch request.'
          };
        }
      });

      set({ widgetData: newWidgetData });
    } catch (err: any) {
      console.warn('Batch fetch failed, executing concurrent individual fallbacks:', err);
      
      // Fallback: Fetch each widget concurrently one by one
      await Promise.all(
        widgets.map((widget) => get().fetchWidgetData(widget.id))
      );
    }
  }
}));
