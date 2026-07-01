import { supabase } from '@/lib/supabase/client';
import { WorkflowService } from '@/services/workflow/workflow.service';
import { AIProviderService, type AIProvider } from '@/services/ai/provider.service';
import { PromptService } from '@/services/ai/prompt.service';
import { UsageService } from '@/services/usage/usage.service';
import { LogService } from '@/services/logging/log.service';

import type { Document } from '@/types/document';

export const ExtractService = {
  async processDocument(
    _db: any,
    documentId: string,
    userId: string,
    providerOverride?: AIProvider
  ): Promise<{ data: Record<string, any> | null; error: Error | null }> {
    try {
      // 1. Fetch the document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', userId)
        .maybeSingle();

      if (docError || !document) throw docError || new Error('Document not found');

      // 2. Fetch workflow
      const { data: workflow, error: wfError } = await WorkflowService.getWorkflowByDocumentId(null, documentId);
      if (wfError || !workflow) throw wfError || new Error('Workflow not found');

      // 3. Update document status to 'processing'
      const { error: updateError } = await supabase
        .from('documents')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', documentId)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // 4. Update the 'Extraction' step to 'in_progress'
      const { error: stepError } = await WorkflowService.updateStepStatus(null, workflow.id, 'Extraction', 'in_progress');
      if (stepError) throw stepError;

      // 5. Generate the prompt for AI extraction
      const prompt = PromptService.getExtractionPrompt(document.type);
      let fileContent: string | undefined;

      const lowerName = document.name?.toLowerCase() || '';

      // Images: provide base64 image payload to AI when needed
      if (document.type === 'image' || lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
        const { data: blob, error: downloadError } = await supabase.storage
          .from('documents')
          .download(document.storage_path);

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

      // PDFs: extract text server-side and persist as `textPreview` to be used for preview and prompt context
      if (lowerName.endsWith('.pdf') || (document?.metadata?.mimeType === 'application/pdf')) {
        try {
          const { data: blob, error: downloadError } = await supabase.storage
            .from('documents')
            .download(document.storage_path);

          if (!downloadError && blob) {
            const arrayBuffer = await blob.arrayBuffer();
            // Load pdf-parse only in a Node/server environment to avoid bundling it into the browser build
            let pdfParse: any = null;
            try {
              if (typeof window === 'undefined') {
                pdfParse = eval('require')('pdf-parse');
              }
            } catch (e) {
              LogService.warn('pdf-parse not available in this runtime', { error: (e as any)?.message || String(e), documentId });
            }

            const parsed = pdfParse ? await pdfParse(Buffer.from(arrayBuffer)) : null;
            const text = (parsed && parsed.text) ? String(parsed.text).trim().slice(0, 20000) : '';
            fileContent = text;

            // Persist textPreview for viewer and prompt augmentation
            const existingMetadata = (document.metadata as Record<string, any>) || {};
            await supabase
              .from('documents')
              .update({
                metadata: {
                  ...existingMetadata,
                  textPreview: text,
                },
                updated_at: new Date().toISOString(),
              })
              .eq('id', documentId)
              .eq('user_id', userId);
          }
        } catch (pdfErr) {
          LogService.warn('PDF text extraction failed', { error: (pdfErr as any)?.message || String(pdfErr), documentId });
        }
      }

      // 6. Call AI Provider
      const { data: aiResult, error: aiError } = await AIProviderService.analyze(prompt, {
        provider: providerOverride,
        image: fileContent,
      });

      if (aiError || !aiResult) throw aiError || new Error('AI extraction failed');

      // 7. Log usage
      await UsageService.logAIUsage(null, {
        userId: document.user_id,
        documentId: document.id,
        provider: aiResult.provider,
        model: aiResult.model,
        promptTokens: aiResult.usage.promptTokens,
        completionTokens: aiResult.usage.completionTokens,
        totalTokens: aiResult.usage.totalTokens,
      });

      // 8. Normalize data with confidence scores
      const normalizedData: Record<string, any> = {};
      if (aiResult.structuredData) {
        Object.entries(aiResult.structuredData).forEach(([key, content]) => {
          if (typeof content !== 'object' || content === null || !('confidence' in content)) {
            normalizedData[key] = { value: content, confidence: 0.7 };
          } else {
            normalizedData[key] = content;
          }
        });
      }

      // 9. Update document metadata
      const existingMetadata = (document.metadata as Record<string, any>) || {};
      const { error: metaUpdateError } = await supabase
        .from('documents')
        .update({
          metadata: {
            ...existingMetadata,
            extractedData: normalizedData,
            validationSuggestions: aiResult.suggestions || [],
            summary: aiResult.summary,
            keyPoints: aiResult.keyPoints || [],
            extractedAt: new Date().toISOString(),
            aiProvider: aiResult.provider,
            aiModel: aiResult.model,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .eq('user_id', userId);

      if (metaUpdateError) throw metaUpdateError;

      // 10. Mark Extraction step completed
      const { error: completeStepError } = await WorkflowService.updateStepStatus(null, workflow.id, 'Extraction', 'completed');
      if (completeStepError) throw completeStepError;

      return { data: aiResult.structuredData, error: null };
    } catch (error: any) {
      LogService.error('Extraction phase failed', error, { documentId });
      // Persist extraction error to document metadata for debugging and admin actions
      try {
        const { data: doc } = await supabase.from('documents').select('metadata').eq('id', documentId).maybeSingle();
        const existingMetadata = (doc?.metadata as Record<string, any>) || {};
        await supabase
          .from('documents')
          .update({
            metadata: {
              ...existingMetadata,
              extractionError: error?.message || String(error),
              extractionErrorStack: error?.stack || undefined,
              extractionAttemptedAt: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', documentId);
      } catch (metaErr) {
        LogService.warn('Failed to persist extraction error metadata', { error: (metaErr as any)?.message || String(metaErr), documentId });
      }

      return { data: null, error };
    }
  },
};
