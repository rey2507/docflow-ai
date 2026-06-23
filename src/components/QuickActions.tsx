import React, { useCallback } from 'react';
import { Upload, FileText, GitBranch, MessageSquare, BarChart3 } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface QuickActionsProps {
  onUpload: () => void;
  onNavigate: (page: 'workflows' | 'chat' | 'reports') => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onUpload, onNavigate }) => {
  const actions: QuickAction[] = [
    { id: 'upload', label: 'Upload Document', icon: <FileText className="h-4 w-4" />, onClick: onUpload },
    { id: 'workflow', label: 'Start Workflow', icon: <GitBranch className="h-4 w-4" />, onClick: () => onNavigate('workflows') },
    { id: 'chat', label: 'Open AI Chat', icon: <MessageSquare className="h-4 w-4" />, onClick: () => onNavigate('chat') },
    { id: 'reports', label: 'View Reports', icon: <BarChart3 className="h-4 w-4" />, onClick: () => onNavigate('reports') },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="text-slate-500">{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

interface UploadZoneProps {
  onUpload: (file: File) => void;
  uploading?: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, uploading = false }) => {
  const [dragOver, setDragOver] = React.useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        dragOver
          ? 'border-slate-900 bg-slate-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
        <Upload className={`h-5 w-5 ${uploading ? 'animate-bounce text-blue-600' : 'text-slate-500'}`} />
      </div>
      <p className="text-sm font-medium text-slate-900">
        {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
      </p>
      <p className="text-xs text-slate-500 mt-1">PDF, PNG, JPG, CSV up to 10MB</p>
      <label className="mt-3 inline-flex">
        <input
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.csv"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <span className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white cursor-pointer hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Browse files
        </span>
      </label>
    </div>
  );
};

export { QuickActions, UploadZone };
