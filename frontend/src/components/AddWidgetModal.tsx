import React, { useState } from 'react';
import { X, Plus, BarChart2, TrendingUp, FolderTree, Compass } from 'lucide-react';
import { WidgetType } from '../types';
import { WIDGET_REGISTRY } from '../registry/WidgetRegistry';
import { useDashboardStore } from '../store/dashboardStore';
import { toast } from 'react-toastify';

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WIDGET_ICONS: Record<WidgetType, React.ComponentType<any>> = {
  categorical: BarChart2,
  temporal: TrendingUp,
  hierarchical: FolderTree,
  relational: Compass
};

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose }) => {
  const addWidget = useDashboardStore((state) => state.addWidget);
  
  const [selectedType, setSelectedType] = useState<WidgetType>('categorical');
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleSelectType = (type: WidgetType) => {
    setSelectedType(type);
    setTitle(WIDGET_REGISTRY[type].defaultTitle);
  };

  if (!title && isOpen) {
    setTitle(WIDGET_REGISTRY[selectedType].defaultTitle);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const registryEntry = WIDGET_REGISTRY[selectedType];
    
    addWidget({
      type: selectedType,
      title: title.trim(),
      w: registryEntry.defaultLayout.w,
      h: registryEntry.defaultLayout.h,
      x: 0,
      y: Infinity,
      options: registryEntry.defaultOptions
    });

    toast.success(`Widget "${title.trim()}" added to layout!`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
    });

    setTitle('');
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in p-4">
      <div className="modal-content animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xs font-bold text-gray-800 tracking-wide">Add Widget to Dashboard</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-200/60 rounded-md text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          
          {/* Widget Selection Cards */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Choose Visualization Style</span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {Object.values(WIDGET_REGISTRY).map((entry) => {
                const IconComponent = WIDGET_ICONS[entry.type];
                const isSelected = selectedType === entry.type;
                
                return (
                  <button
                    key={entry.type}
                    type="button"
                    onClick={() => handleSelectType(entry.type)}
                    className={`style-select-card ${isSelected ? 'selected' : ''}`}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <div className={`p-1 rounded-lg mb-1.5 ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200/60 text-gray-500'}`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[11px] font-bold mb-0.5 block text-gray-800">{entry.name}</span>
                    <span className="text-[9px] text-gray-400 font-normal leading-normal">
                      Dynamic {entry.type} telemetry.
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Field */}
          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Widget Name / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Regional Traffic Analytics"
              className="form-input"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary px-3.5 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary px-3.5 py-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Widget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
