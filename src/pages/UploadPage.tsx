import React, { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { DocumentUploadService } from '../services/documents/upload.service';

interface UploadPageProps {
  userId: string;
  onUploadComplete: () => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ userId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: uploadError } = await DocumentUploadService.uploadDocument({} as any, supabase, file, userId);
      
      if (uploadError) {
        setError(uploadError.message || 'Upload failed');
      } else if (data) {
        setSuccess(`Uploaded "${file.name}" successfully. Processing started.`);
        setTimeout(() => {
          onUploadComplete();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [userId, onUploadComplete]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">Upload document</h2>
        <p className="mt-1 text-sm text-slate-600">
          Drop a PDF, image, or spreadsheet into the workspace. DocFlow AI will extract, validate, and organize the content.
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-900">
          {dragOver ? 'Drop your file here' : 'Drag and drop your file here'}
        </p>
        <p className="mt-1 text-xs text-slate-500">or</p>
        <label className="mt-3 inline-block cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
          {uploading ? 'Uploading…' : 'Browse files'}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        <p className="mt-3 text-xs text-slate-500">
          Supported: PDF, PNG, JPG, JPEG, CSV, XLS, XLSX
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-900">Upload failed</p>
          <p className="mt-1 text-sm text-rose-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">Success</p>
          <p className="mt-1 text-sm text-emerald-700">{success}</p>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
