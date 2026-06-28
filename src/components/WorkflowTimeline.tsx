import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import { WorkflowService } from '../services/workflow/workflow.service';
import type { Workflow, WorkflowStep } from '../types/workflow';

interface WorkflowTimelineProps {
  documentId: string;
}

/**
 * WorkflowTimeline Component
 * 
 * Visualizes the progression of a document through its defined workflow steps.
 * Displays the status of each step and updates in real-time.
 */
const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ documentId }) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkflow = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await WorkflowService.getWorkflowByDocumentId({} as any, documentId);

        if (fetchError) throw fetchError;
        if (!data) throw new Error('No workflow found');
        setWorkflow(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load workflow');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();

    // Subscribe to real-time updates for this specific workflow
    // This allows the UI to update automatically as the Orchestrator updates workflow steps
    const channel = supabase
      .channel(`workflow-updates-${documentId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'workflows', filter: `document_id=eq.${documentId}` },
        (payload: RealtimePostgresUpdatePayload<Workflow>) => {
          setWorkflow(payload.new as Workflow);
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`[WorkflowTimeline] Realtime subscription ${status}:`, err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId]);

  const getStepBadgeClasses = (stepStatus: WorkflowStep['status']) => {
    switch (stepStatus) {
      case 'completed': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'in_progress': return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'failed': return 'border-rose-200 bg-rose-50 text-rose-700';
      default: return 'border-slate-200 bg-slate-100 text-slate-600';
    }
  };

  const getStepDotClasses = (stepStatus: WorkflowStep['status']) => {
    switch (stepStatus) {
      case 'completed': return 'bg-emerald-500';
      case 'in_progress': return 'bg-blue-500 animate-pulse';
      case 'failed': return 'bg-rose-500';
      default: return 'bg-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="font-semibold text-slate-800">Workflow progress</h3>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div
              className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
              aria-hidden="true"
            />
            <span>Loading workflow steps…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="font-semibold text-slate-800">Workflow progress</h3>
        </div>
        <div className="p-5">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-800">Could not load workflow</p>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h3 className="font-semibold text-slate-800">Workflow progress</h3>
        </div>
        <div className="p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No workflow found for this document.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="font-semibold text-slate-800">Workflow progress</h3>
      </div>
      <div className="p-5">
        <ol className="relative border-l border-slate-200 space-y-0">
          {workflow.steps
            .sort((a, b) => a.order - b.order)
            .map((step) => (
              <li key={step.name} className="mb-7 ml-6 last:mb-0">
                <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${getStepDotClasses(step.status)}`}>
                  {step.status === 'completed' && (
                    <svg className="h-2.5 w-2.5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                    </svg>
                  )}
                  {step.status === 'in_progress' && (
                    <svg className="h-2.5 w-2.5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
                    </svg>
                  )}
                  {step.status === 'failed' && (
                    <svg className="h-2.5 w-2.5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                    </svg>
                  )}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">{step.name}</h4>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${getStepBadgeClasses(step.status)}`}>
                    {step.status.replace('_', ' ')}
                  </span>
                </div>
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
};

export default WorkflowTimeline;