import React, { useEffect, useState } from 'react';
import { DocumentStorageService } from '../services/documents/storage.service';

interface FilePreviewProps {
  storagePath: string;
  fileType: string;
  fileName: string;
}

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

  if (loading) return <div className="flex min-h-[18rem] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-sm text-slate-500 animate-pulse">Loading preview…</div>;
  if (!url) return <div className="flex min-h-[18rem] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">Preview not available</div>;

  const isImage = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(fileType) || 
                  ['png', 'jpg', 'jpeg'].some(ext => fileName.toLowerCase().endsWith(ext));
  const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="w-full min-h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {isImage && (
        <img src={url} alt={fileName} className="h-auto max-h-screen w-full object-contain" />
      )}
      {isPdf && (
        <iframe src={`${url}#toolbar=0`} title={fileName} className="min-h-[600px] h-full w-full" />
      )}
      {!isImage && !isPdf && (
        <div className="flex min-h-[18rem] flex-col items-center justify-center space-y-4 p-6 text-center">
          <span className="text-4xl">📄</span>
          <p className="text-sm text-slate-500">Preview for this file type is not supported.</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-800">Download file instead</a>
        </div>
      )}
    </div>
  );
};

export default FilePreview;