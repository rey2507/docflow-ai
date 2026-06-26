import React, { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import { DocumentUploadService } from '../services/documents/upload.service';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { Card, CardHeader, CardBody } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/empty-state';

interface UploadPageProps {
  onUploadComplete: () => void;
}

const UploadPage: React.FC<UploadPageProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const userId = user?.id || '';
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
    <PageContainer variant="narrow">
      <SectionContainer spacing="md">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900">Upload document</h2>
          <p className="mt-1 text-sm text-slate-600">
            Drop a PDF, image, or spreadsheet into the workspace. DocFlow AI will extract, validate, and organize the content.
          </p>
        </div>

        <Card>
          <CardBody>
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
              <Button
                variant="primary"
                disabled={uploading}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                {uploading ? 'Uploading…' : 'Browse files'}
              </Button>
              <p className="mt-3 text-xs text-slate-500">
                Supported: PDF, PNG, JPG, JPEG, CSV, XLS, XLSX
              </p>
            </div>
          </CardBody>
        </Card>

        {error && (
          <EmptyState
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            title="Upload failed"
            description={error}
          />
        )}

        {success && (
          <EmptyState
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
            title="Success"
            description={success}
          />
        )}
      </SectionContainer>
    </PageContainer>
  );
};

export default UploadPage;
