import { supabase } from '@/lib/supabase/client';
import { WorkflowService } from '../workflow/workflow.service';
import { LogService } from '@/services/logging/log.service';

export const FinalizationService = {
  async finalizeDocument(
    _db: any,
    documentId: string
  ): Promise<{ error: Error | null }> {
    try {
      const { data: workflow, error: wfError } = await WorkflowService.getWorkflowByDocumentId(null, documentId);
      if (wfError || !workflow) {
        throw wfError || new Error('Workflow not found for this document');
      }

      const { error: statusError } = await supabase
        .from('documents')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', documentId);

      if (statusError) throw statusError;

      const { error: stepError } = await WorkflowService.updateStepStatus(null, workflow.id, 'Finalization', 'completed');
      if (stepError) throw stepError;

      const { error: completeError } = await WorkflowService.completeWorkflow(null, workflow.id);
      if (completeError) throw completeError;

      LogService.info('Document finalized successfully', { documentId });
      return { error: null };
    } catch (error: any) {
      LogService.error('finalizeDocument failed', error, { documentId });
      return { error };
    }
  },
};
