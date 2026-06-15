import { supabase } from '../../lib/supabase/client';
import { WorkflowService } from '../workflow/workflow.service';
import { AIProviderService } from '../ai/provider.service';
import { PromptService } from '../ai/prompt.service';
import type { Document, DocumentStatus } from '../../types/document';

/**
 * ExtractService
 * 
 * Manages the extraction phase of the document pipeline.
 * Transitions document status and prepares data for AI processing.
 */
export const ExtractService = {
  /**
   * Orchestrates the extraction process for a specific document.
   * 
   * @param documentId The UUID of the document to process.
   */
  async processDocument(documentId: string): Promise<{ data: Record<string, any> | null; error: Error | null }> {
    try {
      // 1. Fetch the document and its associated workflow
      const [
        { data: document, error: docError },
        { data: workflow, error: wfError }
      ] = await Promise.all([
        supabase.from('documents').select('*').eq('id', documentId).single(),
        WorkflowService.getWorkflowByDocumentId(documentId)
      ]);

      if (docError || !document) throw docError || new Error('Document not found');
      if (wfError || !workflow) throw wfError || new Error('Workflow not found');

      // 2. Update document status to 'processing'
      const { error: statusError } = await supabase
        .from('documents')
        .update({ status: 'processing' as DocumentStatus })
        .eq('id', documentId);
      if (statusError) throw statusError;

      // 3. Update the 'Extraction' step to 'in_progress'
      await WorkflowService.updateStepStatus(workflow.id, 'Extraction', 'in_progress');

      // 4. Generate the prompt for AI extraction based on document type
      const prompt = PromptService.getExtractionPrompt((document as Document).type);

      // 5. Call the AI Provider Service to perform extraction
      const { data: aiResult, error: aiError } = await AIProviderService.analyze(prompt);
      if (aiError || !aiResult) throw aiError || new Error('AI extraction failed');
      
      // 6. Update document metadata with extracted results
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          metadata: {
            ...document.metadata,
            extractedData: aiResult.structuredData,
            extractedAt: new Date().toISOString(),
            aiProvider: aiResult.provider,
            aiModel: aiResult.model
          }
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      // 7. Mark the 'Extraction' step as completed
      const { error: stepError } = await WorkflowService.updateStepStatus(workflow.id, 'Extraction', 'completed');
      if (stepError) throw stepError;

      return { data: aiResult.structuredData, error: null };
    } catch (error: any) {
      console.error('[ExtractService] Error:', error.message);
      return { data: null, error };
    }
  }
};