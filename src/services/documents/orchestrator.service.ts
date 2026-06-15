import { supabase } from '../../lib/supabase/client';
import { ExtractService } from '../documents/extract.service';
import { ValidateService } from '../documents/validate.service';
import { FinalizationService } from '../documents/finalization.service';
import type { DocumentStatus } from '../../types/document';

/**
 * PipelineOrchestrator
 * 
 * Coordinates the end-to-end processing of a document.
 * Links Extraction, Validation, and Finalization sequentially.
 */
export const PipelineOrchestrator = {
  /**
   * Runs the full automated pipeline for a given document.
   * 
   * @param documentId The UUID of the document to process.
   */
  async runPipeline(documentId: string): Promise<{ success: boolean; error: Error | null }> {
    const MAX_RETRIES = 3;
    const BASE_DELAY = 2000;

    try {
      console.log(`[PipelineOrchestrator] Starting pipeline for ${documentId}`);

      // Step 1: Extraction with Retry Logic
      let extractedData = null;
      let lastError = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const result = await ExtractService.processDocument(documentId);
        
        if (!result.error && result.data) {
          extractedData = result.data;
          break;
        }

        lastError = result.error || new Error('Extraction produced no data');
        console.warn(`[PipelineOrchestrator] Extraction attempt ${attempt} failed for ${documentId}: ${lastError.message}`);

        if (attempt < MAX_RETRIES) {
          // Wait with incremental delay before next attempt
          await new Promise(resolve => setTimeout(resolve, BASE_DELAY * attempt));
        }
      }

      if (!extractedData) throw lastError || new Error('Extraction failed after retries');

      // Step 2: Validation
      const { isValid, error: validateError } = await ValidateService.validateData(documentId, extractedData);
      if (validateError) throw validateError;

      if (!isValid) {
        // If data is invalid, we stop the pipeline and mark the document as failed
        await this.handleFailure(documentId, new Error('Validation failed: Document data does not meet business rules.'));
        return { success: false, error: new Error('Validation failed') };
      }

      // Step 3: Finalization
      const { error: finalizationError } = await FinalizationService.finalizeDocument(documentId);
      if (finalizationError) throw finalizationError;

      console.log(`[PipelineOrchestrator] Pipeline completed successfully for ${documentId}`);
      return { success: true, error: null };

    } catch (error: any) {
      console.error(`[PipelineOrchestrator] Pipeline failed for ${documentId}:`, error.message);
      await this.handleFailure(documentId, error);
      return { success: false, error };
    }
  },

  /**
   * Internal helper to set document status to failed on pipeline errors.
   */
  async handleFailure(documentId: string, error: Error): Promise<void> {
    try {
      // Fetch existing metadata to avoid overwriting existing fields
      const { data: document } = await supabase
        .from('documents')
        .select('metadata')
        .eq('id', documentId)
        .single();

      await supabase
        .from('documents')
        .update({ 
          status: 'failed' as DocumentStatus,
          metadata: {
            ...(document?.metadata || {}),
            pipelineError: error.message,
            failedAt: new Date().toISOString()
          }
        })
        .eq('id', documentId);
    } catch (err: any) {
      console.error('[PipelineOrchestrator] Error during failure handling:', err.message);
    }
  }
};