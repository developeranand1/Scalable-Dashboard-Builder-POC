import React from 'react';
import { Settings, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { WidgetConfig } from '../types';
import { useDashboardStore } from '../store/dashboardStore';
import { renderWidgetComponent } from '../registry/WidgetRegistry';
import { toast } from 'react-toastify';

interface WidgetContainerProps {
  widget: WidgetConfig;
  onEdit: (widget: WidgetConfig) => void;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = React.memo(({ widget, onEdit }) => {
  const { id, title, type } = widget;
  
  // Select only the specific widget's data state from Zustand store
  const widgetState = useDashboardStore(
    (state) => state.widgetData[id] || { data: null, isLoading: true, error: null }
  );
  
  const fetchWidgetData = useDashboardStore((state) => state.fetchWidgetData);
  const removeWidget = useDashboardStore((state) => state.removeWidget);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent grid drag action trigger
    fetchWidgetData(id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove the widget "${title}"?`)) {
      removeWidget(id);
      toast.info(`Widget "${title}" removed.`, {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(widget);
  };

  return (
    <div className="widget-card flex flex-col h-full w-full border rounded-xl overflow-hidden shadow-md transition-all duration-300">
      
      {/* Widget Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 border-b border-gray-100 cursor-grab active:cursor-grabbing select-none drag-handle">
        <h3 className="text-xs font-bold text-gray-700 tracking-wide truncate max-w-[70%]">
          {title}
        </h3>
        
        {/* Actions Controls (Borderless, clean hover) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            title="Refresh Widget Data"
            disabled={widgetState.isLoading}
            className="widget-action-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${widgetState.isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleEdit}
            title="Configure Widget"
            className="widget-action-btn"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRemove}
            title="Delete Widget"
            className="widget-action-btn delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Widget Content Area */}
      <div className="flex-1 min-h-0 relative">
        
        {/* Loading Overlay / Skeleton Loader */}
        {widgetState.isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm z-10 p-4">
            <div className="w-[85%] h-[60%] flex flex-col gap-3 justify-end items-stretch animate-pulse">
              <div className="flex justify-between items-end h-[50%] gap-2">
                <div className="w-[18%] bg-indigo-600/10 rounded h-[70%]" />
                <div className="w-[18%] bg-indigo-600/10 rounded h-[90%]" />
                <div className="w-[18%] bg-indigo-600/10 rounded h-[40%]" />
                <div className="w-[18%] bg-indigo-600/10 rounded h-[75%]" />
                <div className="w-[18%] bg-indigo-600/10 rounded h-[50%]" />
              </div>
              <div className="h-1.5 bg-indigo-600/10 rounded w-full" />
              <div className="h-1.5 bg-indigo-600/10 rounded w-[60%]" />
            </div>
            <span className="text-[10px] text-indigo-900/60 font-semibold tracking-wider uppercase animate-pulse mt-4">
              Loading Telemetry Stream...
            </span>
          </div>
        )}

        {/* Isolated Error boundary screen */}
        {widgetState.error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-rose-950/20 backdrop-blur-sm text-center z-10">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-full mb-2 animate-bounce">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <h4 className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
              Telemetry Query Fault
            </h4>
            <p className="text-[10px] text-gray-500 mt-2 max-w-[80%] line-clamp-3">
              {widgetState.error}
            </p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 hover:text-white rounded-md text-[10px] font-bold tracking-wide transition-all shadow-md active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          /* Render visualization component once loaded */
          !widgetState.isLoading && renderWidgetComponent(type, widgetState.data)
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom memo comparator
  return (
    prevProps.widget.id === nextProps.widget.id &&
    prevProps.widget.title === nextProps.widget.title &&
    prevProps.widget.x === nextProps.widget.x &&
    prevProps.widget.y === nextProps.widget.y &&
    prevProps.widget.w === nextProps.widget.w &&
    prevProps.widget.h === nextProps.widget.h &&
    JSON.stringify(prevProps.widget.options) === JSON.stringify(nextProps.widget.options)
  );
});

WidgetContainer.displayName = 'WidgetContainer';
