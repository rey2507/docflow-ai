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
        { event: 'UPDATE', schema: 'public', table: 'workflows', filter: `documentId=eq.${documentId}` },
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

  if (loading) return <div className="p-4 animate-pulse text-gray-500 text-center">Loading workflow...</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">Error: {error}</div>;
  if (!workflow) return <div className="p-4 text-gray-500">Workflow not found for this document.</div>;

  const getStepStatusClasses = (stepStatus: WorkflowStep['status']) => {
    switch (stepStatus) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white animate-pulse';
      case 'failed': return 'bg-red-500 text-white';
      case 'pending': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-700">Workflow Progress</h3>
      </div>
      <div className="p-5">
        <ol className="relative border-l border-gray-200 dark:border-gray-700">
          {workflow.steps
            .sort((a, b) => a.order - b.order)
            .map((step, index) => (
              <li key={step.name} className="mb-8 ml-6">
                <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-8 ring-white dark:ring-gray-900 ${getStepStatusClasses(step.status)}`}>
                  {/* You can add icons here based on status if desired */}
                  {step.status === 'completed' && (
                    <svg className="w-2.5 h-2.5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                    </svg>
                  )}
                  {step.status === 'in_progress' && (
                    <svg className="w-2.5 h-2.5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm3.982 13.982a1 1 0 0 1-1.414 0l-3.274-3.274A1.012 1.012 0 0 1 9 10V6a1 1 0 0 1 2 0v3.586l2.982 2.982a1 1 0 0 1 0 1.414Z"/>
                    </svg>
                  )}
                  {step.status === 'failed' && (
                    <svg className="w-2.5 h-2.5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                    </svg>
                  )}
                </span>
                <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {step.name}
                  <span className={`ml-3 px-2.5 py-0.5 rounded text-xs font-medium ${getStepStatusClasses(step.status)}`}>
                    {step.status.replace('_', ' ')}
                  </span>
                </h4>
                {/* Optional: Add step details like assignedTo or duration here */}
                {/* <p className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">Assigned to: {step.assignedTo || 'N/A'}</p> */}
              </li>
            ))}
        </ol>
      </div>
    </div>
  );
};

export default WorkflowTimeline;