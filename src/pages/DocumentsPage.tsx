import React, { useEffect, useState } from 'react';
import { PageContainer } from '../components/ui/layout';
import { Card, CardHeader, CardBody } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Upload } from 'lucide-react';
import type { DocumentStatus } from '../types/document';

type Doc = {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  status: DocumentStatus;
};

const STORAGE_KEY = 'docflow.documents.v1';

function readDocs(): Doc[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function writeDocs(docs: Doc[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

function uuid() {
  return Math.random().toString(36).slice(2, 9);
}

const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<Doc[]>(() => readDocs());
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    writeDocs(docs);
  }, [docs]);

  useEffect(() => {
    // resume processing for any pending/processing docs on mount
    docs.forEach((d) => {
      if (d.status === 'pending' || d.status === 'processing') {
        simulateProcessing(d.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newDocs: Doc[] = Array.from(files).map((f) => ({
      id: uuid(),
      name: f.name,
      size: f.size,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }));
    setDocs((cur) => {
      const merged = [...newDocs, ...cur];
      return merged;
    });
    // start processing
    newDocs.forEach((d) => simulateProcessing(d.id));
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const simulateProcessing = (id: string) => {
    // set to processing quickly
    setDocs((cur) => cur.map((d) => (d.id === id ? { ...d, status: 'processing' } : d)));
    // after a delay, mark completed or failed
    const delay = 1500 + Math.random() * 2500;
    setTimeout(() => {
      setDocs((cur) =>
        cur.map((d) => {
          if (d.id !== id) return d;
          const success = Math.random() > 0.08; // 92% succeed
          return { ...d, status: success ? 'completed' : 'failed' };
        }),
      );
    }, delay);
  };

  const removeDoc = (id: string) => {
    setDocs((cur) => cur.filter((d) => d.id !== id));
  };

  const counts = docs.reduce(
    (acc, d) => {
      acc.total += 1;
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    { total: 0 } as Record<string, number>,
  );

  return (
    <PageContainer variant="medium">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Documents</h2>
            <p className="mt-1 text-sm text-slate-600">Manage uploaded documents for this workspace.</p>
          </div>
          <div className="flex w-full sm:w-auto">
            <input
              ref={fileInputRef}
              id="doc-upload-input"
              type="file"
              multiple
              onChange={(e) => { addFiles(e.target.files); if (e.target) e.target.value = ''; }}
              className="hidden"
            />
            <Button onClick={openFilePicker} className="inline-flex items-center gap-2 justify-center w-full sm:w-auto">
              <Upload className="h-4 w-4" />
              Upload files
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 p-3 bg-white">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-lg font-semibold text-slate-900">{counts.total || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-3 bg-white">
            <p className="text-xs text-slate-500">Processing</p>
            <p className="text-lg font-semibold text-slate-900">{counts.processing || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-3 bg-white">
            <p className="text-xs text-slate-500">Completed</p>
            <p className="text-lg font-semibold text-slate-900">{counts.completed || 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-3 bg-white">
            <p className="text-xs text-slate-500">Failed</p>
            <p className="text-lg font-semibold text-slate-900">{counts.failed || 0}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-slate-100 p-2">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Uploaded documents</h3>
                  <p className="mt-1 text-sm text-slate-500">Recent uploads and processing status.</p>
                </div>
              </div>
              <div />
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {docs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 shadow-inner">
                    <FileText className="h-6 w-6" />
                  </div>
                  <p className="text-base font-semibold tracking-tight text-slate-900">No documents yet</p>
                  <p className="mt-1 text-sm text-slate-500">Upload one or more files to start processing.</p>
                </div>
              )}

              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{d.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(d.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`text-xs font-medium ${d.status === 'completed' ? 'text-emerald-700' : d.status === 'failed' ? 'text-rose-700' : 'text-slate-600'}`}>
                      {d.status}
                    </p>
                    <Button variant="ghost" onClick={() => removeDoc(d.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
};

export default DocumentsPage;
