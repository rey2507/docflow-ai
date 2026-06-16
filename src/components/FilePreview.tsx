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

  if (loading) return <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg animate-pulse text-gray-400">Loading preview...</div>;
  if (!url) return <div className="flex items-center justify-center h-64 bg-gray-50 border-2 border-dashed rounded-lg text-gray-400">Preview not available</div>;

  const isImage = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(fileType) || 
                  ['png', 'jpg', 'jpeg'].some(ext => fileName.toLowerCase().endsWith(ext));
  const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="w-full h-full min-h-[500px] border rounded-lg overflow-hidden bg-white shadow-inner">
      {isImage && (
        <img src={url} alt={fileName} className="w-full h-auto object-contain max-h-screen" />
      )}
      {isPdf && (
        <iframe src={`${url}#toolbar=0`} title={fileName} className="w-full h-full min-h-[600px]" />
      )}
      {!isImage && !isPdf && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <span className="text-4xl">📄</span>
          <p className="text-gray-500 text-sm">Preview for this file type is not supported.</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline">Download file instead</a>
        </div>
      )}
    </div>
  );
};

export default FilePreview;