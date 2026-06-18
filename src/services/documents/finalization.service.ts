import { supabase } from '@/lib/supabase/client';
import { eq } from 'drizzle-orm';
import { DbClient } from 'docs/client';
import { documents } from 'docs/schema';
import { WorkflowService } from '../workflow/workflow.service';
import { LogService } from '@/services/logging/log.service';
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
   * @param db The Drizzle database client.
   * @param documentId The UUID of the document to finalize.
   */
  async finalizeDocument(db: DbClient, documentId: string): Promise<{ error: Error | null }> {
    try {
      // 1. Retrieve the active workflow for this document
      const { data: workflow, error: wfError } = await WorkflowService.getWorkflowByDocumentId(db, documentId);
      if (wfError || !workflow) {
        throw wfError || new Error('Workflow not found for this document');
      }

      // 2. Update the document status to 'completed'
      await db.update(documents)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(documents.id, documentId));

      // 3. Update the 'Finalization' step status within the workflow
      const { error: stepError } = await WorkflowService.updateStepStatus(db,
        workflow.id,
        'Finalization', 
        'completed'
      );

      if (stepError) throw stepError;

      // 4. Mark the entire workflow record as completed
      const { error: completeError } = await WorkflowService.completeWorkflow(db, workflow.id);
      
      if (completeError) throw completeError;

      LogService.info(`Document finalized successfully`, { documentId });
      return { error: null };
    } catch (error: any) {
      LogService.error('finalizeDocument failed', error, { documentId });
      return { error };
    }
  }
};