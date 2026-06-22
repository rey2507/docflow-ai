import React, { useEffect, useState } from 'react';
import { DocumentStorageService } from '../services/documents/storage.service';

interface FilePreviewProps {
  storagePath: string;
  fileType: string;
  fileName: string;
}

const WarningIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-amber-500">
    <path
      d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3l-8.47-14.14a2 2 0 0 0-3.42 0Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocumentIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-10 w-10 text-slate-400">
    <path
      d="M7 3.75A2.25 2.25 0 0 0 4.75 6v12A2.25 2.25 0 0 0 7 20.25h10A2.25 2.25 0 0 0 19.25 18V9.75L13.5 3.75H7Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 3.75V8.5a1.25 1.25 0 0 0 1.25 1.25h4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M8 13h8M8 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const FilePreview: React.FC<FilePreviewProps> = ({ storagePath, fileType, fileName }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUrl() {
      setLoading(true);
      const { url, error } = await DocumentStorageService.getDownloadUrl(storagePath);
      if (!error && url) {
        setUrl(url);
      }
      setLoading(false);
    }
    loadUrl();
  }, [storagePath]);

  if (loading) return (
    <div className="w-full min-h-[300px] md:min-h-[500px] flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex flex-col items-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
        <p className="text-sm text-slate-500">Loading preview…</p>
      </div>
    </div>
  );
  if (!url) return (
    <div className="w-full min-h-[300px] md:min-h-[500px] flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
      <div className="flex flex-col items-center space-y-3 text-center">
        <WarningIcon />
        <p className="text-sm font-medium text-slate-700">Preview not available</p>
        <p className="text-xs text-slate-500">This file type cannot be previewed in the browser.</p>
      </div>
    </div>
  );

  const isImage = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(fileType) || 
                  ['png', 'jpg', 'jpeg'].some(ext => fileName.toLowerCase().endsWith(ext));
  const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="w-full min-h-[300px] md:min-h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {isImage && (
        <img src={url} alt={fileName} className="h-auto max-h-screen w-full object-contain" />
      )}
      {isPdf && (
        <iframe src={`${url}#toolbar=0`} title={fileName} className="min-h-[600px] h-full w-full" />
      )}
      {!isImage && !isPdf && (
        <div className="flex min-h-[18rem] flex-col items-center justify-center space-y-4 p-6 text-center">
          <DocumentIcon />
          <p className="text-sm text-slate-500">Preview for this file type is not supported.</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-800">Download file instead</a>
        </div>
      )}
    </div>
  );
};

export default FilePreview;