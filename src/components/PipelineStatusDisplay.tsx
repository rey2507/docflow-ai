import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import type { Document } from '../types/document';

interface PipelineStatusDisplayProps {
  documentId: string;
}

/**
 * PipelineStatusDisplay Component
 * 
 * Displays the current status of the document pipeline and 
 * details regarding extraction results or failure messages.
 */
const PipelineStatusDisplay: React.FC<PipelineStatusDisplayProps> = ({ documentId }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryLoading, setRetryLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (fetchError) throw fetchError;
        setDocument(data as Document);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    // Subscribe to real-time updates for this specific document
    // This allows the UI to update automatically as the Orchestrator works in the background
    const channel = supabase
      .channel(`document-updates-${documentId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'documents', filter: `id=eq.${documentId}` },
        (payload: RealtimePostgresUpdatePayload<Document>) => {
          setDocument(payload.new as Document);
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`[PipelineStatusDisplay] Realtime subscription ${status}:`, err);
          setError(`Realtime connection error: ${status}. Live updates may be paused.`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  const handleRetry = async () => {
    setRetryLoading(true);
    setError(null);
    try {
      // Call the server-side API endpoint that handles the pipeline execution
      const response = await fetch(`/api/documents/${documentId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errData = await response.json();
        let errorMessage = 'Server failed to initiate retry.';
        if (typeof errData === 'object' && errData !== null && 'message' in errData && typeof errData.message === 'string') {
          errorMessage = errData.message;
        }
        throw new Error(errorMessage);
      }
      
      // We don't need to manually set the document state here; 
      // the Supabase Realtime subscription will catch the 'processing' update.
    } catch (err: any) {
      setError(`Retry failed: ${err.message}`);
    } finally {
      setRetryLoading(false);
    }
  };

  if (loading) return <div className="p-4 animate-pulse text-gray-500 text-center">Checking document status...</div>;
  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Error: {error}</div>;
  if (!document) return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Document not found.</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
      case 'validating': return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="font-semibold text-slate-800">Pipeline execution</h3>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${getStatusColor(document.status)}`}>
          {document.status}
        </span>
      </div>

      <div className="space-y-4 p-5">
        {/* Error Notification Section */}
        {document.status === 'failed' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-bold text-rose-800">Processing failed</p>
            <p className="mt-1 text-sm text-rose-700">
              {document.metadata?.pipelineError || 'An unexpected error occurred during processing.'}
            </p>
            {document.metadata?.failedAt && (
              <p className="mt-2 text-xs italic text-rose-500">
                Timestamp: {new Date(document.metadata.failedAt).toLocaleString()}
              </p>
            )}
            
            {document.metadata?.duplicateOf && (
              <a 
                href={`/documents/${document.metadata.duplicateOf}`}
                className="mt-3 inline-block text-sm font-semibold text-rose-800 underline decoration-rose-300 underline-offset-2 transition hover:text-rose-900"
              >
                View original document →
              </a>
            )}

            <button
              onClick={handleRetry}
              disabled={retryLoading}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {retryLoading ? 'Retrying…' : 'Retry processing'}
            </button>
          </div>
        )}

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="col-span-1">
            <p className="text-slate-500">AI provider</p>
            <p className="font-medium text-slate-900">{document.metadata?.aiProvider || 'Pending…'}</p>
          </div>
          <div className="col-span-1">
            <p className="text-slate-500">AI model</p>
            <p className="font-medium text-slate-900">{document.metadata?.aiModel || 'Pending…'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineStatusDisplay;