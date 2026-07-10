import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { WidgetConfig } from '../types';
import { WIDGET_REGISTRY } from '../registry/WidgetRegistry';
import { useDashboardStore } from '../store/dashboardStore';
import { toast } from 'react-toastify';

interface WidgetEditorProps {
  widget: WidgetConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetEditor: React.FC<WidgetEditorProps> = ({ widget, isOpen, onClose }) => {
  const updateWidgetConfig = useDashboardStore((state) => state.updateWidgetConfig);
  
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<Record<string, any>>({});

  useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setOptions(widget.options || {});
    }
  }, [widget]);

  if (!isOpen || !widget) return null;

  const registryEntry = WIDGET_REGISTRY[widget.type];
  const EditorComponent = registryEntry?.editor;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateWidgetConfig(widget.id, {
      title: title.trim(),
      options
    });

    toast.success(`Widget "${title.trim()}" updated successfully!`, {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
    });

    onClose();
  };

  const handleOptionChange = (newOptions: Record<string, any>) => {
    setOptions(newOptions);
  };

  return (
    <div className="modal-overlay animate-fade-in p-4">
      <div className="modal-content animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-gray-800 tracking-wide">Configure Widget</h2>
            <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider mt-0.5">
              {registryEntry?.name}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-200/60 rounded-md text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
          {/* Title Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Widget Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sales Report"
              className="form-input"
              required
            />
          </div>

          {/* Dynamic Options Section loaded from registry */}
          {EditorComponent && (
            <div className="border-t border-gray-100 pt-3">
              <EditorComponent options={options} onChange={handleOptionChange} />
            </div>
          )}

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
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
