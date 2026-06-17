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
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">Error: {error}</div>;
  if (!document) return <div className="p-4 text-gray-500">Document not found.</div>;

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
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">Pipeline Execution</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${getStatusColor(document.status)}`}>
          {document.status}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Error Notification Section */}
        {document.status === 'failed' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-sm font-bold text-red-800">Processing Failed</p>
            <p className="text-sm text-red-700 mt-1">
              {document.metadata?.pipelineError || 'An unexpected error occurred during processing.'}
            </p>
            {document.metadata?.failedAt && (
              <p className="text-xs text-red-500 mt-2 italic">
                Timestamp: {new Date(document.metadata.failedAt).toLocaleString()}
              </p>
            )}
            
            {document.metadata?.duplicateOf && (
              <a 
                href={`/documents/${document.metadata.duplicateOf}`}
                className="mt-3 inline-block text-sm font-bold text-red-800 underline hover:text-red-900 transition-colors"
              >
                View original document →
              </a>
            )}

            <button
              onClick={handleRetry}
              disabled={retryLoading}
              className="mt-4 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {retryLoading ? 'Initiating Retry...' : 'Retry Processing'}
            </button>
          </div>
        )}

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div className="col-span-1">
            <p className="text-gray-500">AI Provider</p>
            <p className="font-medium text-gray-900">{document.metadata?.aiProvider || 'Pending...'}</p>
          </div>
          <div className="col-span-1">
            <p className="text-gray-500">AI Model</p>
            <p className="font-medium text-gray-900">{document.metadata?.aiModel || 'Pending...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineStatusDisplay;