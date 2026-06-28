import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import type { Document } from '../types/document';
import { ErrorState } from './ui/empty-state';

interface PipelineStatusDisplayProps {
  documentId: string;
}

const PipelineStatusDisplay: React.FC<PipelineStatusDisplayProps> = ({ documentId }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      setError('Unable to fetch pipeline status.');
    } finally {
      setLoading(false);
    }
  }, [documentId, supabase]);

  useEffect(() => {
    fetchDocument();

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
          setError('Realtime connection error: Live updates may be paused.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, fetchDocument]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'failed': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'processing':
      case 'validating': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'error': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const displayStatus = loading ? 'loading' : document?.status || (error ? 'error' : 'unknown');

  const handleReport = () => {
    const subject = encodeURIComponent(`DocFlow AI Error Report - Document ${documentId}`);
    const body = encodeURIComponent(`An error occurred while processing your document.\n\nDocument ID: ${documentId}\nError: ${document?.metadata?.pipelineError || error || 'Unknown error'}\nTime: ${new Date().toISOString()}\n\nPlease investigate this issue.`);
    window.open(`mailto:reyahmen25@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

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
          <ErrorState message="Unable to fetch pipeline status. Please try again." onReport={handleReport} />
        )}

        {!loading && !error && !document && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Document not found.
          </div>
        )}

        {document && document.status === 'failed' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-800">Processing failed</p>
              <p className="mt-1 text-sm text-rose-700">
                An unexpected error occurred during processing.
              </p>
            </div>
            <ErrorState onReport={handleReport} />
          </div>
        )}

        {document && document.status !== 'failed' && (
          <>
            {!document.status && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Workflow not started yet.
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