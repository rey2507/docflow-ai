import { supabase } from '../../lib/supabase/client';
import { WorkflowService } from '../workflow/workflow.service';
import { AIProviderService } from '../ai/provider.service';
import { PromptService } from '../ai/prompt.service';
import { AIProvider } from '../ai/provider.service'; // Import AIProvider type
import { UsageService } from '../usage/usage.service';
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
  async processDocument(documentId: string, providerOverride?: AIProvider): Promise<{ data: Record<string, any> | null; error: Error | null }> {
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

      // 5. Call the AI Provider Service to perform extraction, using providerOverride if provided
      const { data: aiResult, error: aiError } = await AIProviderService.analyze(prompt, { provider: providerOverride });
      if (aiError || !aiResult) throw aiError || new Error('AI extraction failed');
      
      // 6. Log usage details (Task 9.1)
      // We log this as soon as we have a successful AI response
      await UsageService.logAIUsage({
        userId: (document as Document).userId,
        documentId: document.id,
        provider: aiResult.provider,
        model: aiResult.model,
        promptTokens: aiResult.usage.promptTokens,
        completionTokens: aiResult.usage.completionTokens,
        totalTokens: aiResult.usage.totalTokens,
      });

      // Normalize data: Ensure every field has a confidence score (Task 8.2)
      const normalizedData: Record<string, any> = {};
      if (aiResult.structuredData) {
        Object.entries(aiResult.structuredData).forEach(([key, content]) => {
          // If the AI returned a flat value instead of {value, confidence}, wrap it
          if (typeof content !== 'object' || content === null || !('confidence' in content)) {
            normalizedData[key] = {
              value: content,
              confidence: 0.7, // Default "guess" confidence
            };
          } else {
            normalizedData[key] = content;
          }
        });
      }

      // 7. Update document metadata with extracted results
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          metadata: {
            ...document.metadata,
            extractedData: normalizedData,
            validationSuggestions: aiResult.suggestions || [],
            extractedAt: new Date().toISOString(),
            aiProvider: aiResult.provider,
            aiModel: aiResult.model
          }
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      // 8. Mark the 'Extraction' step as completed
      const { error: stepError } = await WorkflowService.updateStepStatus(workflow.id, 'Extraction', 'completed');
      if (stepError) throw stepError;

      return { data: aiResult.structuredData, error: null };
    } catch (error: any) {
      console.error('[ExtractService] Error:', error.message);
      return { data: null, error };
    }
  }
};