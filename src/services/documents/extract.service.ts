import { supabase } from '@/lib/supabase/client';
import { eq, and } from 'drizzle-orm';
import { DbClient } from 'docs/client';
import { documents, workflows } from 'docs/schema';
import { WorkflowService } from '@/services/workflow/workflow.service';
import { AIProviderService, type AIProvider } from '@/services/ai/provider.service';
import { PromptService } from '@/services/ai/prompt.service';
import { UsageService } from '@/services/usage/usage.service';
import { LogService } from '@/services/logging/log.service';

import type { Document, DocumentStatus } from '@/types/document';

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
   * @param db The Drizzle database client.
   * @param documentId The UUID of the document to process.
   */
  async processDocument(db: DbClient, documentId: string, userId: string, providerOverride?: AIProvider): Promise<{ data: Record<string, any> | null; error: Error | null }> {
    try {
      // 1. Fetch the document and its associated workflow
      const document = await db.query.documents.findFirst({
        where: and(eq(documents.id, documentId), eq(documents.userId, userId))
      });
      const { data: workflow, error: wfError } = await WorkflowService.getWorkflowByDocumentId(db, documentId);

      if (!document) throw new Error('Document not found');
      if (wfError || !workflow) throw wfError || new Error('Workflow not found');

      // 2. Update document status to 'processing'
      await db.update(documents)
        .set({ status: 'processing', updatedAt: new Date() })
        .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

      // 3. Update the 'Extraction' step to 'in_progress'
      await WorkflowService.updateStepStatus(db, workflow.id, 'Extraction', 'in_progress');

      // 4. Generate the prompt for AI extraction
      const prompt = PromptService.getExtractionPrompt((document as Document).type);
      let fileContent: string | undefined;

      // --- NEW: OCR / Vision Support (Task 11.2) ---
      // If image, fetch file from storage and convert to base64 for Vision models
      if (document.type === 'image' || document.name.toLowerCase().endsWith('.png') || document.name.toLowerCase().endsWith('.jpg')) {
        const { data: blob, error: downloadError } = await supabase.storage
          .from('documents')
          .download(document.storagePath);
        
        if (!downloadError && blob) {
          const arrayBuffer = await blob.arrayBuffer();
          const uint8 = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < uint8.length; i++) {
            binary += String.fromCharCode(uint8[i]);
          }
          fileContent = btoa(binary);
        }
      }

      // 5. Call the AI Provider Service to perform extraction, using providerOverride if provided
      const { data: aiResult, error: aiError } = await AIProviderService.analyze(prompt, {
        provider: providerOverride,
        image: fileContent // Task 11.2: Pass base64 content for Vision models
      });

      if (aiError || !aiResult) throw aiError || new Error('AI extraction failed');
      
      // 6. Log usage details (Task 9.1)
      // We log this as soon as we have a successful AI response
      await UsageService.logAIUsage(db, {
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
      await db.update(documents)
        .set({
          metadata: {
            ...document.metadata,
            extractedData: normalizedData,
            validationSuggestions: aiResult.suggestions || [],
            summary: aiResult.summary,
            keyPoints: aiResult.keyPoints || [],
            extractedAt: new Date().toISOString(),
            aiProvider: aiResult.provider,
            aiModel: aiResult.model
          },
          updatedAt: new Date()
        })
        .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

      // 8. Mark the 'Extraction' step as completed
      const { error: stepError } = await WorkflowService.updateStepStatus(db, workflow.id, 'Extraction', 'completed');
      if (stepError) throw stepError;

      return { data: aiResult.structuredData, error: null };
    } catch (error: any) {
      LogService.error('Extraction phase failed', error, { documentId });
      return { data: null, error };
    }
  }
};