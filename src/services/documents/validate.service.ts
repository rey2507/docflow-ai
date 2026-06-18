import { eq } from 'drizzle-orm';
import { DbClient } from 'docs/client';
import { documents } from 'docs/schema';
import { WorkflowService } from '../workflow/workflow.service';
import type { DocumentStatus } from '../../types/document';
import { LogService } from '@/services/logging/log.service';
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
   * @param db The Drizzle database client.
   * @param documentId The UUID of the document.
   * @param extractedData The data object returned from the AI layer.
   */
  async validateData(db: DbClient, documentId: string, extractedData: Record<string, any>): Promise<{ isValid: boolean; error: Error | null }> {
    try {
      // 1. Fetch document and workflow
      const document = await db.query.documents.findFirst({
        where: eq(documents.id, documentId)
      });
      const { data: workflow, error: wfError } = await WorkflowService.getWorkflowByDocumentId(db, documentId);

      if (!document) throw new Error('Document not found');
      if (wfError || !workflow) throw wfError || new Error('Workflow not found');

      await WorkflowService.updateStepStatus(db, workflow.id, 'Validation', 'in_progress');

      // 2. Update document status to 'validating' (if not already set by orchestrator)
      await db.update(documents)
        .set({ status: 'validating', updatedAt: new Date() })
        .where(eq(documents.id, documentId));

      LogService.info(`Validation started`, { documentId });

      let isValid = true;
      let validationError: Error | null = null;

      // 3. Get specific validator for document type
      const validator = getValidator(document.type);
      if (validator) {
        const result = validator.validate(extractedData);
        isValid = result.isValid;
        validationError = result.error;
      } else {
        LogService.warn(`No specific validation rules for document type`, { type: document.type, documentId });
      }

      if (!isValid) {
        await WorkflowService.updateStepStatus(db, workflow.id, 'Validation', 'failed');
        return { isValid: false, error: validationError };
      }

      // Temporary: auto-validate as true for structure testing
      await WorkflowService.updateStepStatus(db, workflow.id, 'Validation', 'completed');
      
      return { isValid: true, error: null };
    } catch (error: any) {
      LogService.error('Validation phase failed', error, { documentId });
      return { isValid: false, error };
    }
  },
};
