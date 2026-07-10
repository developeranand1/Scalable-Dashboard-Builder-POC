import React, { useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { 
  Layout, 
  Plus, 
  Save, 
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { useDashboardStore } from './store/dashboardStore';
import { WidgetConfig } from './types';
import { WidgetContainer } from './components/WidgetContainer';
import { AddWidgetModal } from './components/AddWidgetModal';
import { WidgetEditor } from './components/WidgetEditor';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const App: React.FC = () => {
  const {
    widgets,
    dashboardName,
    isLoading,
    isSaving,
    saveError,
    latencySimMs,
    setLatencySimMs,
    fetchDashboard,
    saveDashboard,
    updateWidgetLayout,
    fetchAllWidgetData
  } = useDashboardStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  
  // Connection status
  const [isOnline, setIsOnline] = useState(true);

  // Initialize and load default dashboard
  useEffect(() => {
    fetchDashboard('default');
    
    // Track connectivity statuses
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchDashboard]);

  // Handle Save Layout Persistence
  const handleSave = async () => {
    await saveDashboard();
    
    if (saveError) {
      toast.warning('Autosaved locally. Live database connection lost.', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
    } else {
      toast.success('Dashboard configurations persisted to MongoDB Atlas!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      // Fire premium design confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#4f46e5', '#ec4899', '#10b981', '#f59e0b']
      });
    }
  };

  const handleLayoutChange = (currentLayout: any) => {
    updateWidgetLayout(currentLayout);
  };

  // Convert widgets to RGL layout parameters
  const getLayouts = () => {
    return widgets.map((w) => ({
      i: w.id,
      x: w.x,
      y: w.y,
      w: w.w,
      h: w.h,
      minW: 3,
      minH: 2
    }));
  };

  return (
    <div className="min-h-screen flex flex-col pb-12 select-none">
      
      {/* Sleek Dashboard Top Navigation Header */}
      <header className="sticky top-0 z-40 px-5 py-3 flex items-center justify-between shadow-md">
        
        {/* Left Area: Title & Sync status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600/10 border border-indigo-500/10 text-indigo-600 rounded-lg">
              <Layout className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-gray-800 tracking-wide">{dashboardName}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-600' : 'bg-rose-400'} animate-pulse`} />
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  {isOnline ? 'Live DB persistent' : 'Cached Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Interactive Live Controls (Latency Simulation & Reloads) */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Simulate Network Latency:</span>
          <div className="latency-btn-group">
            <button
              onClick={() => setLatencySimMs(0)}
              className={`latency-btn ${latencySimMs === 0 ? 'active' : ''}`}
            >
              Instant
            </button>
            <button
              onClick={() => setLatencySimMs(300)}
              className={`latency-btn ${latencySimMs === 300 ? 'active' : ''}`}
            >
              Normal (300ms)
            </button>
            <button
              onClick={() => setLatencySimMs(1500)}
              className={`latency-btn ${latencySimMs === 1500 ? 'active' : ''}`}
            >
              Slow (1.5s)
            </button>
          </div>
        </div>

        {/* Right Area: Main Dashboard Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAllWidgetData()}
            title="Refresh All Widgets"
            className="btn btn-secondary px-2 py-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="btn btn-primary px-3 py-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Widget
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-secondary px-3 py-1.5 disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" /> Save Board
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="flex-1 px-5 py-4 overflow-hidden">
        {isLoading ? (
          <div className="w-full h-80 flex flex-col items-center justify-center">
            <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
            <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase mt-4">
              Loading Layout Configurations...
            </span>
          </div>
        ) : widgets.length === 0 ? (
          /* Empty Dashboard Hero Landing Banner */
          <div className="w-full max-w-md mx-auto mt-16 p-6 border border-dashed border-gray-200 rounded-2xl bg-white text-center shadow-md">
            <div className="p-3 bg-indigo-600/10 text-indigo-600 rounded-full w-fit mx-auto mb-3">
              <Layout className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-bold text-gray-800 tracking-wide">Clean Workspace</h2>
            <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Build a personalized visual cockpit. Add nested hierarchical trees, coordinate distributions, categorical bars, or temporal logs.
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-5 btn btn-primary px-4 py-2"
            >
              <Plus className="w-3.5 h-3.5" /> Create First Widget
            </button>
          </div>
        ) : (
          /* Responsive Layout Draggable Grid wrapper */
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: getLayouts() }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
            rowHeight={100}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
            margin={[16, 16]}
            containerPadding={[0, 0]}
          >
            {widgets.map((widget) => (
              <div key={widget.id}>
                <WidgetContainer widget={widget} onEdit={setEditingWidget} />
              </div>
            ))}
          </ResponsiveGridLayout>
        )}
      </main>

      {/* Floating System Modals */}
      <AddWidgetModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      
      <WidgetEditor
        widget={editingWidget}
        isOpen={editingWidget !== null}
        onClose={() => setEditingWidget(null)}
      />

      {/* Toast Alert Feedback Container */}
      <ToastContainer />
    </div>
  );
};

export default App;
