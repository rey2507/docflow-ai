import React, { useCallback, useRef } from 'react';
import { Upload, FileText, GitBranch, MessageSquare, BarChart3 } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface QuickActionsProps {
  onUpload: (file: File) => void;
  onNavigate: (page: 'workflows' | 'chat' | 'reports') => void;
  uploading?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onUpload, onNavigate, uploading = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  const actions: QuickAction[] = [
    { id: 'upload', label: 'Upload Document', icon: <FileText className="h-4 w-4" />, onClick: handleUploadClick },
    { id: 'workflow', label: 'Start Workflow', icon: <GitBranch className="h-4 w-4" />, onClick: () => onNavigate('workflows') },
    { id: 'chat', label: 'Open AI Chat', icon: <MessageSquare className="h-4 w-4" />, onClick: () => onNavigate('chat') },
    { id: 'reports', label: 'View Reports', icon: <BarChart3 className="h-4 w-4" />, onClick: () => onNavigate('reports') },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 sm:gap-2 sm:p-3">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-4 text-xs font-medium text-slate-700 transition active:scale-[0.98] hover:border-slate-300 hover:bg-slate-50 sm:min-h-0 sm:flex-row sm:justify-start sm:px-3 sm:py-2.5 sm:text-sm"
          >
            <span className="text-slate-500">{action.icon}</span>
            <span className="leading-tight text-center sm:text-left">{action.label}</span>
          </button>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        aria-label="Upload document"
        title="Upload document"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.csv,.doc,.docx"
        onChange={handleFileChange}
        disabled={uploading}
      />
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
      className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors sm:p-6 ${
        dragOver
          ? 'border-slate-900 bg-slate-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
        <Upload className={`h-5 w-5 ${uploading ? 'animate-bounce text-blue-600' : 'text-slate-500'}`} />
      </div>
      <p className="text-sm font-medium text-slate-900 sm:text-base">
        {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
      </p>
      <p className="mt-1 text-xs text-slate-500">PDF, PNG, JPG, CSV, DOC up to 25MB</p>
      <label className="mt-3 inline-flex">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.csv,.doc,.docx"
            onChange={handleFileChange}
            disabled={uploading}
          />
        <span className="inline-flex cursor-pointer items-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
          Browse files
        </span>
      </label>
    </div>
  );
};

export { QuickActions, UploadZone };
