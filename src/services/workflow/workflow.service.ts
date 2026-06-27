import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import type { Workflow, WorkflowStep, WorkflowPriority } from '../../types/workflow';
import { LogService } from '@/services/logging/log.service';

export const WorkflowService = {
  async createWorkflow(
    _db: any,
    documentId: string,
    priority: WorkflowPriority = 'medium'
  ): Promise<{ data: Workflow | null; error: Error | null }> {
    try {
      const firstStepId = uuidv4();
      const newWorkflowData = {
        id: uuidv4(),
        documentId,
        status: 'active' as const,
        priority,
        currentStepId: firstStepId,
        steps: [
          { id: firstStepId, name: 'Extraction', order: 1, status: 'pending' },
          { id: uuidv4(), name: 'Validation', order: 2, status: 'pending' },
          { id: uuidv4(), name: 'Finalization', order: 3, status: 'pending' },
        ],
        startedAt: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('workflows')
        .insert(newWorkflowData)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Workflow, error: null };
    } catch (error: any) {
      LogService.error('Workflow creation failed', error, { documentId });
      return { data: null, error };
    }
  },

  async getWorkflowByDocumentId(
    _db: any,
    documentId: string
  ): Promise<{ data: Workflow | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('document_id', documentId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { data: null, error: new Error('Workflow not found') };
      return { data: data as Workflow, error: null };
    } catch (error: any) {
      LogService.error('getWorkflowByDocumentId failed', error, { documentId });
      return { data: null, error };
    }
  },

  async updateStepStatus(
    _db: any,
    workflowId: string,
    stepName: string,
    status: WorkflowStep['status']
  ): Promise<{ error: Error | null }> {
    try {
      const { data: workflow, error: fetchError } = await supabase
        .from('workflows')
        .select('steps, current_step_id')
        .eq('id', workflowId)
        .single();

      if (fetchError || !workflow) throw fetchError || new Error('Workflow not found');

      const steps = (workflow.steps || []) as WorkflowStep[];
      const currentUpdatingStep = steps.find((s) => s.name === stepName);
      let newCurrentStepId = workflow.current_step_id;

      if (currentUpdatingStep && status === 'completed') {
        const nextStep = steps.find((s) => s.order === currentUpdatingStep.order + 1);
        if (nextStep) newCurrentStepId = nextStep.id;
      }

      const updatedSteps = steps.map((step) =>
        step.name === stepName ? { ...step, status } : step
      );

      const { error: updateError } = await supabase
        .from('workflows')
        .update({
          steps: updatedSteps,
          current_step_id: newCurrentStepId,
        })
        .eq('id', workflowId);

      if (updateError) throw updateError;
      return { error: null };
    } catch (error: any) {
      LogService.error('updateStepStatus failed', error, { workflowId, stepName });
      return { error };
    }
  },

  async completeWorkflow(
    _db: any,
    workflowId: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({
          status: 'completed',
          completedAt: new Date().toISOString(),
        })
        .eq('id', workflowId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      LogService.error('completeWorkflow failed', error, { workflowId });
      return { error };
    }
  },

  async resetWorkflow(
    _db: any,
    workflowId: string
  ): Promise<{ error: Error | null }> {
    try {
      const { data: workflow, error: fetchError } = await supabase
        .from('workflows')
        .select('steps, current_step_id')
        .eq('id', workflowId)
        .single();

      if (fetchError || !workflow) throw fetchError || new Error('Workflow not found');

      const steps = (workflow.steps || []) as WorkflowStep[];
      const resetSteps = steps.map((step) => ({ ...step, status: 'pending' as const }));
      const firstStepId = steps.find((s) => s.order === 1)?.id || workflow.current_step_id;

      const { error: updateError } = await supabase
        .from('workflows')
        .update({
          status: 'active',
          current_step_id: firstStepId,
          steps: resetSteps,
          completedAt: null,
        })
        .eq('id', workflowId);

      if (updateError) throw updateError;
      return { error: null };
    } catch (error: any) {
      LogService.error('resetWorkflow failed', error, { workflowId });
      return { error };
    }
  },
};
