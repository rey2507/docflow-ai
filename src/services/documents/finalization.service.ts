import { supabase } from '../../lib/supabase/client';
import { WorkflowService } from '../workflow/workflow.service';
import type { DocumentStatus } from '../../types/document';

/**
 * FinalizationService
 * 
 * Handles the terminal phase of the document pipeline.
 * Updates document status, marks the final workflow step, and closes the workflow.
 */
export const FinalizationService = {
  /**
   * Completes the document processing lifecycle.
   * 
   * @param documentId The UUID of the document to finalize.
   */
  async finalizeDocument(documentId: string): Promise<{ error: Error | null }> {
    try {
      // 1. Retrieve the active workflow for this document
      const { data: workflow, error: wfError } = await WorkflowService.getWorkflowByDocumentId(documentId);
      if (wfError || !workflow) {
        throw wfError || new Error('Workflow not found for this document');
      }

      // 2. Update the document status to 'completed'
      const { error: docError } = await supabase
        .from('documents')
        .update({ status: 'completed' as DocumentStatus })
        .eq('id', documentId);

      if (docError) throw docError;

      // 3. Update the 'Finalization' step status within the workflow
      const { error: stepError } = await WorkflowService.updateStepStatus(
        workflow.id, 
        'Finalization', 
        'completed'
      );

      if (stepError) throw stepError;

      // 4. Mark the entire workflow record as completed
      const { error: completeError } = await WorkflowService.completeWorkflow(workflow.id);
      
      if (completeError) throw completeError;

      console.log(`[FinalizationService] Document ${documentId} finalized successfully.`);
      return { error: null };
    } catch (error: any) {
      console.error('[FinalizationService] finalizeDocument Error:', error.message);
      return { error };
    }
  }
};