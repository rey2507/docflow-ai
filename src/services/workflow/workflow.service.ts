import { supabase } from '../../lib/supabase/client';
import type { Workflow, WorkflowStep, WorkflowPriority } from '../../types/workflow';

/**
 * WorkflowService
 * 
 * Manages the lifecycle of document workflows. 
 * Orchestrates the transitions between extraction, validation, and completion.
 */
export const WorkflowService = {
  /**
   * Initializes a new workflow for a document.
   */
  async createWorkflow(documentId: string, priority: WorkflowPriority = 'medium'): Promise<{ data: Workflow | null; error: Error | null }> {
    try {
      const defaultSteps: Partial<WorkflowStep>[] = [
        { name: 'Extraction', order: 1, status: 'pending' },
        { name: 'Validation', order: 2, status: 'pending' },
        { name: 'Finalization', order: 3, status: 'pending' }
      ];

      const { data, error } = await supabase
        .from('workflows')
        .insert({
          documentId,
          status: 'active',
          priority,
          steps: defaultSteps,
          startedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data: data as Workflow, error: null };
    } catch (error: any) {
      console.error('[WorkflowService] createWorkflow Error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Retrieves the workflow associated with a specific document.
   */
  async getWorkflowByDocumentId(documentId: string): Promise<{ data: Workflow | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('documentId', documentId)
        .single();

      if (error) throw error;
      return { data: data as Workflow, error: null };
    } catch (error: any) {
      console.error('[WorkflowService] getWorkflowByDocumentId Error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Updates the status of a specific step within a workflow.
   */
  async updateStepStatus(
    workflowId: string, 
    stepName: string, 
    status: WorkflowStep['status']
  ): Promise<{ error: Error | null }> {
    try {
      // Fetch current workflow to get steps array
      const { data: workflow, error: fetchError } = await supabase
        .from('workflows')
        .select('steps')
        .eq('id', workflowId)
        .single();

      if (fetchError) throw fetchError;

      const updatedSteps = (workflow.steps as WorkflowStep[]).map(step => 
        step.name === stepName ? { ...step, status } : step
      );

      const { error: updateError } = await supabase
        .from('workflows')
        .update({ steps: updatedSteps })
        .eq('id', workflowId);

      if (updateError) throw updateError;
      return { error: null };
    } catch (error: any) {
      console.error('[WorkflowService] updateStepStatus Error:', error.message);
      return { error };
    }
  },

  /**
   * Marks a workflow as completed.
   */
  async completeWorkflow(workflowId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ 
          status: 'completed',
          completedAt: new Date().toISOString()
        })
        .eq('id', workflowId);

      return { error: error || null };
    } catch (error: any) {
      console.error('[WorkflowService] completeWorkflow Error:', error.message);
      return { error };
    }
  }
};