import { supabase } from '@/lib/supabase/client';
import { WorkflowService } from '../workflow/workflow.service';
import { getValidator } from './validator.factory';
import { LogService } from '@/services/logging/log.service';

export const ValidateService = {
  async validateData(
    _db: any,
    documentId: string,
    extractedData: Record<string, any>
  ): Promise<{ isValid: boolean; error: Error | null }> {
    try {
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();

      if (docError || !document) throw docError || new Error('Document not found');

      const { data: workflow, error: wfError } = await WorkflowService.getWorkflowByDocumentId(null, documentId);
      if (wfError || !workflow) throw wfError || new Error('Workflow not found');

      const { error: stepError } = await WorkflowService.updateStepStatus(null, workflow.id, 'Validation', 'in_progress');
      if (stepError) throw stepError;

      const { error: statusError } = await supabase
        .from('documents')
        .update({ status: 'validating', updated_at: new Date().toISOString() })
        .eq('id', documentId);

      if (statusError) throw statusError;

      LogService.info('Validation started', { documentId });

      let isValid = true;
      let validationError: Error | null = null;

      const validator = getValidator(document.type);
      if (validator) {
        const result = validator.validate(extractedData);
        isValid = result.isValid;
        validationError = result.error;
      } else {
        LogService.warn('No specific validation rules for document type', { type: document.type, documentId });
      }

      if (!isValid) {
        await WorkflowService.updateStepStatus(null, workflow.id, 'Validation', 'failed');
        return { isValid: false, error: validationError };
      }

      await WorkflowService.updateStepStatus(null, workflow.id, 'Validation', 'completed');
      return { isValid: true, error: null };
    } catch (error: any) {
      LogService.error('Validation phase failed', error, { documentId });
      return { isValid: false, error };
    }
  },
};
