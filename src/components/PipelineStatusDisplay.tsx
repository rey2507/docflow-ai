import React, { useCallback, useEffect, useState } from 'react';
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

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;
      setDocument(data as Document);
      setError(null);
    } catch (err: any) {
      setDocument(null);
      setError(err.message || 'Unable to fetch pipeline status.');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
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
  }, [documentId, fetchDocument]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'failed': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'retrying':
      case 'processing':
      case 'validating': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'error': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const displayStatus = retryLoading ? 'retrying' : loading ? 'loading' : document?.status || (error ? 'error' : 'unknown');

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="font-semibold text-slate-800">Pipeline execution</h3>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${getStatusColor(displayStatus)}`}>
          {displayStatus}
        </span>
      </div>

      <div className="space-y-4 p-5">
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Checking latest pipeline state…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-800">Status unavailable</p>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
            <button
              onClick={fetchDocument}
              className="mt-3 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            >
              Retry status fetch
            </button>
          </div>
        )}

        {!loading && !error && !document && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Document not found.
          </div>
        )}

        {document && (
          <>
            {!document.status && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Workflow not started yet.
              </div>
            )}

            {document.status === 'failed' && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-800">Processing failed</p>
                <p className="mt-1 text-sm text-rose-700">
                  {document.metadata?.pipelineError || 'An unexpected error occurred during processing.'}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-rose-700">
                  {document.metadata?.failedAt && (
                    <span>Failed at {new Date(document.metadata.failedAt).toLocaleString()}</span>
                  )}
                  {document.metadata?.duplicateOf && (
                    <a
                      href={`/documents/${document.metadata.duplicateOf}`}
                      className="font-semibold underline decoration-rose-300 underline-offset-2"
                    >
                      View original document
                    </a>
                  )}
                </div>
                <button
                  onClick={handleRetry}
                  disabled={retryLoading}
                  className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {retryLoading ? 'Retrying…' : 'Retry processing'}
                </button>
              </div>
            )}

            {retryLoading && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                Restarting the pipeline and waiting for realtime status updates…
              </div>
            )}

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
          </>
        )}
        {displayStatus === 'processing' || displayStatus === 'validating' ? (
          <div className="h-1.5 overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-blue-500" />
          </div>
        ) : null}
        {document && document.status === 'completed' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Extraction completed. Review the extracted fields below.
          </div>
        )}
        {document && document.status !== 'failed' && document.metadata?.duplicateOf && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Possible duplicate found:{' '}
            <a href={`/documents/${document.metadata.duplicateOf}`} className="font-semibold text-slate-900 underline underline-offset-2">
              open original document
            </a>
          </div>
        )}
        {document && (
          <div className="text-xs text-slate-500">
            Provider metadata updates in realtime as processing progresses.
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelineStatusDisplay;