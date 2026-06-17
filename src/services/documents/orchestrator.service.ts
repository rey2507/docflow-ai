import { eq, and, ne } from 'drizzle-orm';
import { DbClient } from 'docs/client';
import { documents, workflows } from 'docs/schema';
import { ExtractService } from './extract.service';
import { AIProviderService } from '@/services/ai/provider.service';
import { ValidateService } from './validate.service';
import { FinalizationService } from './finalization.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { WorkflowService } from '@/services/workflow/workflow.service';
import type { WorkflowStep } from '@/types/workflow';

/**
 * PipelineOrchestrator
 */
export const PipelineOrchestrator = {
  async runPipeline(db: DbClient, documentId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // 1. Fetch document - Drizzle automatically knows the type
      const doc = await db.query.documents.findFirst({
        where: eq(documents.id, documentId)
      });

      if (!doc) throw new Error('Document not found.');

      // If document is already completed, skip.
      if (doc.status === 'completed') {
        console.log(`[Orchestrator] Document ${documentId} already ${doc.status}. Skipping pipeline.`);
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
              ...doc.metadata,
              pipelineError: undefined,
              failedAt: undefined,
            },
            updatedAt: new Date()
          })
          .where(eq(documents.id, documentId));
        // Update 'doc' object to reflect new status for subsequent checks
        doc.status = 'processing';
        doc.metadata = { ...doc.metadata, pipelineError: undefined, failedAt: undefined };
      }
      // If doc.status is 'pending' or 'validating', ensure it's 'processing' for the pipeline start.
      else if (doc.status !== 'processing') {
         await db.update(documents)
          .set({ status: 'processing', updatedAt: new Date() })
          .where(eq(documents.id, documentId));
         doc.status = 'processing'; // Update local doc object
      }

      // --- Plan Limits Check (Task 9.2) ---
      const { allowed, reason } = await SubscriptionService.canProcessDocument(db, doc.userId);
      if (!allowed) {
        throw new Error(reason || 'Subscription limit reached.');
      }

      // 2. Extraction Phase
      const { error: extractError } = await ExtractService.processDocument(db, documentId);
      if (extractError) throw extractError;

      // 3. Generate Embedding for Semantic Search (Task 11.3)
      // Fetch the updated document to get the summary generated during extraction
      const updatedDoc = await db.query.documents.findFirst({
        where: eq(documents.id, documentId)
      });

      if (updatedDoc?.metadata?.summary) {
        console.log(`[Orchestrator] Generating semantic embedding for document: ${documentId}`);
        const { embedding, error: embedError } = await AIProviderService.embed(updatedDoc.metadata.summary);
        
        if (!embedError && embedding) {
          await db.update(documents)
            .set({ 
              metadata: { 
                ...updatedDoc.metadata, 
                embedding 
              },
              updatedAt: new Date() 
            })
            .where(eq(documents.id, documentId));
        } else if (embedError) {
          console.warn(`[Orchestrator] Embedding generation failed: ${embedError.message}`);
        }
      }

      // 4. Validation Phase
      await ValidateService.validateData(db, documentId, updatedDoc?.metadata?.extractedData || {});

      // 5. Finalization Phase
      await FinalizationService.finalizeDocument(db, documentId);

      return { success: true, error: null };
    } catch (error: any) {
      console.error(`[PipelineOrchestrator] Pipeline failed for ${documentId}:`, error.message);

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
        .where(eq(documents.id, documentId));

      await db.update(workflows)
        .set({ status: 'failed' })
        .where(eq(workflows.documentId, documentId));

      return { success: false, error };
    }
  }
};