import { eq, and, ne } from 'drizzle-orm';
import { DbClient } from 'docs/client';
import { documents, workflows } from 'docs/schema';
import { ExtractService } from './extract.service';
import { AIProviderService, type AIProvider } from '@/services/ai/provider.service';
import { ValidateService } from './validate.service';
import { FinalizationService } from './finalization.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { WorkflowService } from '@/services/workflow/workflow.service';
import { LogService } from '@/services/logging/log.service';
import type { WorkflowStep } from '@/types/workflow';

/**
 * PipelineOrchestrator
 */
export const PipelineOrchestrator = {
  async runPipeline(db: DbClient, documentId: string, userId: string): Promise<{ success: boolean; error: Error | null }> {
    const startTime = Date.now();
    try {
      LogService.logPipelineStart(documentId, userId);
      const doc = await db.query.documents.findFirst({
        where: and(eq(documents.id, documentId), eq(documents.userId, userId))
      });

      if (!doc) throw new Error('Document not found.');

      // If document is already completed, skip.
      if (doc.status === 'completed') {
        LogService.info(`Document already completed. Skipping pipeline.`, { documentId });
        return { success: true, error: null };
      }

      // If document is failed, it's a retry attempt. Reset its state.
      if (doc.status === 'failed') {
        // Fetch workflow to reset it
        const workflow = await db.query.workflows.findFirst({
          where: eq(workflows.documentId, documentId),
        });
        if (workflow) {
          await WorkflowService.resetWorkflow(db, workflow.id);
        }

        // Clear error metadata and set status to processing
        await db.update(documents)
          .set({
            status: 'processing',
            metadata: { 
              ...(typeof doc.metadata === 'object' && doc.metadata ? (doc.metadata as Record<string, any>) : {}),
              pipelineError: undefined,
              failedAt: undefined,
            },
            updatedAt: new Date()
          })
          .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
        // Update 'doc' object to reflect new status for subsequent checks
        doc.status = 'processing';
        const docMetadataObj = (doc.metadata && typeof doc.metadata === 'object') ? (doc.metadata as Record<string, any>) : {};
        doc.metadata = { ...docMetadataObj, pipelineError: undefined, failedAt: undefined };
      }
      // If doc.status is 'pending' or 'validating', ensure it's 'processing' for the pipeline start.
      else if (doc.status !== 'processing') {
         await db.update(documents)
          .set({ status: 'processing', updatedAt: new Date() })
          .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
         doc.status = 'processing'; // Update local doc object
      }

      // --- Plan Limits Check (Task 9.2) ---
      const { allowed, reason } = await SubscriptionService.canProcessDocument(db, doc.userId);
      if (!allowed) {
        throw new Error(reason || 'Subscription limit reached.');
      }

      // 2. Extraction Phase
      // Implement Task 12.2: Provider Failover Chain
      const providerChain: AIProvider[] = ['openai', 'gemini', 'anthropic'];
      let lastError: Error | null = null;
      let extractionSuccessful = false;
      const failoverAttempts: {
        provider: string;
        error: string;
        timestamp: string;
      }[] = [];

      for (const provider of providerChain) {
        LogService.info(`Attempting extraction`, { documentId, provider });
        const { error: extractError } = await ExtractService.processDocument(db, documentId, userId, provider);
        
        if (!extractError) {
          extractionSuccessful = true;
          break;
        }
        
        LogService.logProviderFailure(documentId, provider, extractError);
        
        // Capture failure stats for Task 12.2
        failoverAttempts.push({
          provider,
          error: extractError.message,
          timestamp: new Date().toISOString()
        });

        // Persist failure history immediately in case the entire pipeline fails
        await db.update(documents)
          .set({
            metadata: {
              ...(doc.metadata && typeof doc.metadata === 'object' ? (doc.metadata as Record<string, any>) : {}),
              failoverHistory: failoverAttempts
            },
            updatedAt: new Date()
          })
          .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

        lastError = extractError;
      }

      if (!extractionSuccessful) {
        throw lastError || new Error('Extraction failed across all providers.');
      }

      // 3. Generate Embedding for Semantic Search (Task 11.3)
      // Fetch the updated document to get the summary generated during extraction
      const updatedDoc = await db.query.documents.findFirst({
        where: and(eq(documents.id, documentId), eq(documents.userId, userId))
      });

const updatedMetadata = (updatedDoc?.metadata && typeof updatedDoc.metadata === 'object') ? (updatedDoc.metadata as Record<string, any>) : ({} as Record<string, any>);
      if ((updatedMetadata as any).summary) {
        LogService.info(`Generating semantic embedding`, { documentId });
        const { embedding, error: embedError } = await AIProviderService.embed((updatedMetadata as any).summary as string);
        
        if (!embedError && embedding) {
          await db.update(documents)
            .set({ 
            metadata: {
                ...updatedMetadata,
                embedding
              },
              updatedAt: new Date() 
            })
            .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
        } else if (embedError) {
          LogService.error(`Embedding generation failed`, embedError, { documentId });
        }
      }

      // 4. Validation Phase
      const extractedData = (updatedMetadata.extractedData && typeof updatedMetadata.extractedData === 'object') ? updatedMetadata.extractedData : {};
      await ValidateService.validateData(db, documentId, extractedData);

      // 5. Finalization Phase
      await FinalizationService.finalizeDocument(db, documentId);

      LogService.logPipelineSuccess(documentId, Date.now() - startTime);
      return { success: true, error: null };
    } catch (error: any) {
      LogService.error(`Pipeline failed`, error, { documentId });

      // 1. Mark the active workflow step as failed for better debugging visibility
      const workflow = await db.query.workflows.findFirst({
        where: eq(workflows.documentId, documentId),
      });

      if (workflow) {
        const steps = workflow.steps as any as WorkflowStep[];
        const activeStep = steps.find(s => s.id === workflow.currentStepId);
        if (activeStep) {
          await WorkflowService.updateStepStatus(db, workflow.id, activeStep.name, 'failed');
        }
      }

      // 2. Re-fetch current doc to ensure we don't overwrite existing metadata
      const currentDoc = await db.query.documents.findFirst({
        where: eq(documents.id, documentId)
      });

      await db.update(documents)
        .set({ 
          status: 'failed', 
          metadata: { 
            ...(currentDoc?.metadata || {}), 
            pipelineError: error.message,
            failedAt: new Date().toISOString()
          },
          updatedAt: new Date()
        })
        .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));

      await db.update(workflows)
        .set({ status: 'failed' })
        .where(eq(workflows.documentId, documentId));

      return { success: false, error };
    }
  }
};