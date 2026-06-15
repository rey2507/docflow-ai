import { supabase } from '../../lib/supabase/client';
import { WorkflowService } from '../workflow/workflow.service';
import type { Document, DocumentStatus } from '../../types/document';
import { getValidator } from './validator.factory';

/**
 * ValidateService
 * 
 * Manages the validation phase of the document pipeline.
 * Ensures extracted information adheres to business rules.
 */
export const ValidateService = {
  /**
   * Validates extracted document data.
   * 
   * @param documentId The UUID of the document.
   * @param extractedData The data object returned from the AI layer.
   */
  async validateData(documentId: string, extractedData: Record<string, any>): Promise<{ isValid: boolean; error: Error | null }> {
    try {
      // 1. Fetch document and workflow
      const [{ data: document, error: docError }, { data: workflow, error: wfError }] = await Promise.all([
        supabase.from('documents').select('*').eq('id', documentId).single(),
        WorkflowService.getWorkflowByDocumentId(documentId),
      ]);

      if (docError || !document) throw docError || new Error('Document not found');
      if (wfError || !workflow) throw wfError || new Error('Workflow not found');

      await WorkflowService.updateStepStatus(workflow.id, 'Validation', 'in_progress');

      // 2. Update document status to 'validating' (if not already set by orchestrator)
      const { error: statusError } = await supabase
        .from('documents')
        .update({ status: 'validating' as DocumentStatus })
        .eq('id', documentId);
      if (statusError) throw statusError;

      console.log(`[ValidateService] Validation started for: ${documentId}`, extractedData);

      let isValid = true;
      let validationError: Error | null = null;

      // 3. Get specific validator for document type
      const validator = getValidator(document.type);
      if (validator) {
        const result = validator.validate(extractedData);
        isValid = result.isValid;
        validationError = result.error;
      } else {
        console.log(`[ValidateService] No specific validation rules for document type: ${document.type}`);
      }

      if (!isValid) {
        await WorkflowService.updateStepStatus(workflow.id, 'Validation', 'failed');
        return { isValid: false, error: validationError };
      }

      // Temporary: auto-validate as true for structure testing
      await WorkflowService.updateStepStatus(workflow.id, 'Validation', 'completed');
      
      return { isValid: true, error: null };
    } catch (error: any) {
      console.error('[ValidateService] Error:', error.message);
      return { isValid: false, error };
    }
  },
};
