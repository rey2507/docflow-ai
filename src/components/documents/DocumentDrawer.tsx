import React, { useState, useEffect } from 'react';
import DocumentViewer from './DocumentViewer';
import DocumentChat from './DocumentChat';
import { Button } from '../ui/button';
import { DocumentStorageService } from '../../services/documents/storage.service';

export default function DocumentDrawer({ document, onClose }: { document: any; onClose: () => void }) {
  if (!document) return null;

  const [signedUrl, setSignedUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    async function resolveUrl() {
      if (!document?.storagePath) return;
      const { url } = await DocumentStorageService.getDownloadUrl(document.storagePath);
      if (!cancelled && url) setSignedUrl(url);
    }
    resolveUrl();
    return () => { cancelled = true; };
  }, [document?.storagePath]);

  const textPreview = document?.metadata?.textPreview;
  const [tab, setTab] = useState<'preview' | 'chat' | 'meta'>('preview');

  return (
    <div className="fixed inset-0 z-50 flex items-stretch">
      {/* backdrop */}
      <div className="hidden md:block flex-1" onClick={onClose} />

      <aside className="fixed inset-0 md:relative md:inset-auto md:ml-auto md:w-[72%] max-w-full bg-slate-50 p-4 md:p-6 border-l shadow-lg overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold break-words max-w-[60vw] md:max-w-none">{document.name}</h3>
            <p className="text-xs text-slate-500">{document.createdAt ? new Date(document.createdAt).toLocaleString() : '—'}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={signedUrl || '#'} target="_blank" rel="noreferrer" className="inline-flex">
              <Button variant="ghost">Download</Button>
            </a>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <button className={`px-3 py-1 rounded-md ${tab === 'preview' ? 'bg-white shadow' : 'bg-transparent'}`} onClick={() => setTab('preview')}>Preview</button>
          <button className={`px-3 py-1 rounded-md ${tab === 'chat' ? 'bg-white shadow' : 'bg-transparent'}`} onClick={() => setTab('chat')}>Chat</button>
          <button className={`px-3 py-1 rounded-md ${tab === 'meta' ? 'bg-white shadow' : 'bg-transparent'}`} onClick={() => setTab('meta')}>Metadata</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 min-h-[60vh] h-full bg-transparent">
            {tab === 'preview' && (
              <div className="h-full bg-white border rounded-md p-2">
                <DocumentViewer document={document} signedUrl={signedUrl} textPreview={textPreview} />
              </div>
            )}
            {tab === 'chat' && (
              <div className="h-full bg-white border rounded-md p-3">
                <DocumentChat document={document} />
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            {tab === 'meta' ? (
              <div className="bg-white border rounded-md p-3">
                <h4 className="text-sm font-semibold">Metadata</h4>
                <pre className="text-xs mt-2 overflow-auto max-h-[50vh]">{JSON.stringify(document.metadata || {}, null, 2)}</pre>
              </div>
            ) : (
              <div className="bg-white border rounded-md p-3">
                <DocumentChat document={document} />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
