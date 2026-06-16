import { supabase } from '../../lib/supabase/client';
import { ExtractService } from './extract.service';
import { ValidateService } from './validate.service';
import { FinalizationService } from './finalization.service';
import type { Document, DocumentStatus } from '../../types/document';
import { AIProvider } from '../ai/provider.service';
import { SubscriptionService } from '../../subscription/subscription.service';

/**
 * Temporary type declaration for Node.js process to resolve linting errors.
 */
declare const process: { env: Record<string, string | undefined> };

/**
 * PipelineOrchestrator
 * 
 * Manages the end-to-end processing of a document through its lifecycle:
 * Upload -> Extraction -> Validation -> Finalization.
 * Handles overall status updates and error recovery, including AI provider fallbacks.
 */
export const PipelineOrchestrator = {
  async runPipeline(documentId: string): Promise<{ success: boolean; error: Error | null }> {
    let document: Document | null = null;
    try {
      // 1. Fetch document
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (docError || !doc) throw docError || new Error('Document not found for orchestration.');
      document = doc as Document;

      // Ensure document status is 'pending' or 'processing' to start
      if (document.status === 'completed' || document.status === 'failed') {
        console.log(`[Orchestrator] Document ${documentId} already ${document.status}. Skipping pipeline.`);
        return { success: true, error: null };
      }

      // Set initial status to processing if not already
      await supabase.from('documents').update({ status: 'processing' as DocumentStatus }).eq('id', documentId);

      // --- Plan Limits Check (Task 9.2) ---
      const { allowed, reason } = await SubscriptionService.canProcessDocument(document.userId);
      if (!allowed) {
        throw new Error(reason || 'Subscription limit reached.');
      }

      // --- Extraction Phase with Fallback ---
      let extractionSuccess = false;
      let lastExtractionError: Error | null = null;

      // Determine the provider chain from environment variables or use a default fallback
      const providerChain: AIProvider[] = (
        process.env.AI_PROVIDER_CHAIN || 
        process.env.NEXT_PUBLIC_AI_PROVIDER_CHAIN || 
        'openai,gemini'
      ).split(',').map((p: string) => p.trim() as AIProvider);

      for (let i = 0; i < providerChain.length; i++) {
        const provider = providerChain[i];
        console.log(`[Orchestrator] Extraction attempt ${i + 1}/${providerChain.length} using ${provider}`);

        // We must destructure the error because processDocument catches internal errors
        const { error: extError } = await ExtractService.processDocument(document.id, provider);

        if (!extError) {
          extractionSuccess = true;
          break; // Success!
        }

        lastExtractionError = extError;
        console.warn(`[Orchestrator] Provider ${provider} failed for document ${documentId}: ${extError.message}`);

        // Update metadata so the UI can show which provider failed
        await supabase.from('documents').update({ 
          metadata: { 
            ...document.metadata, 
            lastExtractionError: extError.message,
            failedProvider: provider 
          } 
        }).eq('id', documentId);
      }

      if (!extractionSuccess) {
        throw lastExtractionError || new Error('AI extraction failed after exhausting all providers in the chain.');
      }

      // Re-fetch document to get updated metadata (especially extractedData and aiProvider/aiModel)
      const { data: updatedDoc, error: refetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      if (refetchError || !updatedDoc) throw refetchError || new Error('Failed to re-fetch document after extraction.');
      document = updatedDoc as Document; // Update the document reference

      // --- Validation Phase ---
      await ValidateService.validateData(document.id, document.metadata?.extractedData || {});

      // --- Finalization Phase ---
      await FinalizationService.finalizeDocument(document.id);

      // FinalizationService handles the terminal status updates for the document and workflow.
      return { success: true, error: null };
    } catch (error: any) {
      console.error(`[PipelineOrchestrator] Pipeline failed for document ${documentId}:`, error.message);
      // Update document and workflow status to failed
      if (document) {
        await supabase.from('documents').update({ status: 'failed' as DocumentStatus, metadata: { ...document.metadata, pipelineError: error.message } }).eq('id', documentId);
        await supabase.from('workflows').update({ status: 'failed' }).eq('documentId', documentId);
      }
      return { success: false, error };
    }
  }
};