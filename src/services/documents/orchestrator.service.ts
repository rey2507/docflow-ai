import { eq, and } from 'drizzle-orm';
import type { DbClient } from 'docs/client';
import { documents, workflows } from 'docs/schema';
import { ExtractService } from './extract.service';
import { AIProviderService, type AIProvider } from '../ai/provider.service';
import { providerCooldown } from '../ai/provider-cooldown.service';
import { ValidateService } from './validate.service';
import { FinalizationService } from './finalization.service';
import { SubscriptionService } from '../../subscription/subscription.service';
import { WorkflowService } from '../workflow/workflow.service';
import { LogService } from '../logging/log.service';
import type { WorkflowStep } from '../../types/workflow';
import { supabase } from '../../lib/supabase/client';

/**
 * PipelineOrchestrator
 */
export const PipelineOrchestrator = {
  async runPipeline(db: DbClient, documentId: string, userId: string): Promise<{ success: boolean; error: Error | null }> {
    const startTime = Date.now();
    try {
      LogService.logPipelineStart(documentId, userId);
      
      const docQuery = typeof (db as unknown as { query?: { documents?: { findFirst: Function } } }).query?.documents?.findFirst === 'function';
      const doc = docQuery
        ? await db.query.documents.findFirst({
            where: and(eq(documents.id, documentId), eq(documents.userId, userId))
          })
        : null;

      // Re-fetch from Supabase if drizzle returned nothing or capability is absent
      let resolvedDoc = doc;
      if (!resolvedDoc) {
        const { data, error: docError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .eq('user_id', userId)
          .maybeSingle();
        if (docError) throw docError;
        resolvedDoc = data;
      }

      if (!resolvedDoc) throw new Error('Document not found.');

      // If document is already completed, skip.
      if (resolvedDoc.status === 'completed') {
        LogService.info(`Document already completed. Skipping pipeline.`, { documentId });
        return { success: true, error: null };
      }

      // If document is failed, it's a retry attempt. Reset its state.
      if (resolvedDoc.status === 'failed') {
        const wfQuery = typeof (db as unknown as { query?: { workflows?: { findFirst: Function } } }).query?.workflows?.findFirst === 'function';
        const workflow = wfQuery
          ? await db.query.workflows.findFirst({
              where: eq(workflows.documentId, documentId),
            })
          : null;

        if (workflow) {
          await WorkflowService.resetWorkflow(db, workflow.id);
        }


        // Clear error metadata and set status to processing
        const canUpdate = typeof (db as unknown as { update: Function }).update === 'function';
        if (canUpdate) {
          await (db as unknown as { update: (table: unknown) => { set: (values: unknown) => { where: (cond: unknown) => Promise<unknown> } } })
            .update(documents)
            .set({
              status: 'processing',
              metadata: {
                ...(typeof resolvedDoc.metadata === 'object' && resolvedDoc.metadata ? (resolvedDoc.metadata as Record<string, unknown>) : {}),
                pipelineError: undefined,
                failedAt: undefined,
              },
              updatedAt: new Date()
            })
            .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
        } else {
          await supabase
            .from('documents')
            .update({ status: 'processing' })
            .eq('id', documentId);
        }

        // Update 'doc' object to reflect new status for subsequent checks
        resolvedDoc.status = 'processing';
        const docMetadataObj = (resolvedDoc.metadata && typeof resolvedDoc.metadata === 'object') ? (resolvedDoc.metadata as Record<string, unknown>) : {};
        resolvedDoc.metadata = { ...docMetadataObj, pipelineError: undefined, failedAt: undefined };
      }
      // If doc.status is 'pending' or 'validating', ensure it's 'processing' for the pipeline start.
      else if (resolvedDoc.status !== 'processing') {
        const canUseDrizzleUpdate = typeof (db as unknown as { update: Function }).update === 'function' 
          && typeof (db as unknown as { update: (table: unknown) => { set: (values: unknown) => unknown } }).update(documents)?.set === 'function';
        if (canUseDrizzleUpdate) {
          await (db as unknown as { update: (table: unknown) => { set: (values: unknown) => { where: (cond: unknown) => Promise<unknown> } } })
            .update(documents)
            .set({ status: 'processing', updatedAt: new Date() })
            .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
        } else {
          await supabase
            .from('documents')
            .update({ status: 'processing' })
            .eq('id', documentId);
        }

        resolvedDoc.status = 'processing'; // Update local doc object
      }


      // --- Plan Limits Check (Task 9.2) ---
      // Skip when db is a browser stub (upload path) — subscription checks run server-side
      let allowed = true;
      let planReason: string | undefined;
      if (typeof db?.query?.subscriptions?.findFirst === 'function') {
        try {
          const limitCheck = await SubscriptionService.canProcessDocument(db, resolvedDoc.userId);
          allowed = limitCheck.allowed;
          planReason = limitCheck.reason;
        } catch (err) {
          LogService.error('Subscription check failed, allowing upload', err as Error, { documentId });
          allowed = true;
        }
      }
      if (!allowed) {
        throw new Error(planReason || 'Subscription limit reached.');
      }

// 2. Extraction Phase
      // Implement Task 12.2: Provider Failover Chain
      const providerChain: AIProvider[] = ['openai', 'gemini'];
      let lastError: Error | null = null;
      let extractionSuccessful = false;
      const failoverAttempts: {
        provider: string;
        error: string;
        timestamp: string;
      }[] = [];

      for (const provider of providerChain) {
        if (!providerCooldown.isCooledDown(provider)) {
          LogService.info(`Skipping provider due to cooldown`, { documentId, provider });
          continue;
        }

        LogService.info(`Attempting extraction`, { documentId, provider });
        const { error: extractError } = await ExtractService.processDocument(db, documentId, userId, provider);
        
        if (!extractError) {
          extractionSuccessful = true;
          providerCooldown.clearCooldown(provider);
          break;
        }
        
        LogService.logProviderFailure(documentId, provider, extractError);
        
        failoverAttempts.push({
          provider,
          error: extractError.message,
          timestamp: new Date().toISOString()
        });

        const isRateLimit = extractError.message?.toLowerCase().includes('429') || extractError.message?.toLowerCase().includes('rate limit');
        if (isRateLimit) {
          const retryAfterMatch = extractError.message.match(/retry after (\d+)/i);
          const retryAfterMs = retryAfterMatch ? parseInt(retryAfterMatch[1], 10) * 1000 : undefined;
          providerCooldown.setCooldown(provider, retryAfterMs);
          LogService.warn(`Provider ${provider} rate-limited. Setting cooldown.`, { documentId, retryAfterMs });
        }

        await supabase
          .from('documents')
          .update({
            metadata: {
              ...(typeof resolvedDoc.metadata === 'object' && resolvedDoc.metadata ? (resolvedDoc.metadata as Record<string, unknown>) : {}),
              failedProvider: provider,
            },
          })
          .eq('id', documentId);

        lastError = extractError;
      }

      // Note: extraction may fail if no AI providers configured - document still stored successfully
      // AI extraction can be triggered later via AI chat interface
      if (!extractionSuccessful) {
        LogService.warn(`Extraction unavailable - document stored without AI processing`, { documentId, error: lastError?.message });
        // Mark document as completed so it's still accessible
        await supabase
          .from('documents')
          .update({
            status: 'completed',
            metadata: {
          ...(typeof resolvedDoc.metadata === 'object' && resolvedDoc.metadata ? (resolvedDoc.metadata as Record<string, unknown>) : {}),
               extractionError: lastError?.message,
              extractionAttempted: true,
            },
          })
          .eq('id', documentId);
      } else {
        // 3. Generate Embedding for Semantic Search (Task 11.3) - only on successful extraction
        const embCapability = typeof (db as unknown as { query?: { documents?: { findFirst: Function } } }).query?.documents?.findFirst === 'function';
        const updatedDoc = embCapability
          ? await db.query.documents.findFirst({
              where: and(eq(documents.id, documentId), eq(documents.userId, userId)),
            })
          : null;

        const updatedMetadata: Record<string, unknown> =
          typeof updatedDoc?.metadata === 'object' && updatedDoc.metadata
            ? (updatedDoc.metadata as Record<string, unknown>)
            : {};

        if (typeof updatedMetadata.summary === 'string') {
          LogService.info(`Generating semantic embedding`, { documentId });
          const { embedding, error: embedError } = await AIProviderService.embed(updatedMetadata.summary);
          
           if (!embedError && embedding) {
             const canUseDrizzleUpdate = typeof (db as unknown as { update: Function }).update === 'function' 
               && typeof (db as unknown as { update: (table: unknown) => { set: (values: unknown) => unknown } }).update(documents)?.set === 'function';
             if (canUseDrizzleUpdate) {
               await (db as unknown as { update: (table: unknown) => { set: (values: unknown) => { where: (cond: unknown) => Promise<unknown> } } })
                 .update(documents)
                 .set({ 
                   metadata: {
                     ...updatedMetadata,
                     embedding
                   },
                   updatedAt: new Date() 
                 })
                 .where(and(eq(documents.id, documentId), eq(documents.userId, userId)));
            } else {
              await supabase
                .from('documents')
                .update({
                  metadata: {
                    ...updatedMetadata,
                    embedding
                  },
                })
                .eq('id', documentId);
            }
          } else if (embedError) {
            LogService.error(`Embedding generation failed`, embedError, { documentId });
          }
        }

        // 4. Validation Phase
        const extractedData = (updatedMetadata.extractedData && typeof updatedMetadata.extractedData === 'object') ? updatedMetadata.extractedData : {};
        await ValidateService.validateData(db, documentId, extractedData);

        // 5. Finalization Phase  
        await FinalizationService.finalizeDocument(db, documentId);
      }

      LogService.logPipelineSuccess(documentId, Date.now() - startTime);
      return { success: true, error: null };
    } catch (error: any) {
      LogService.error(`Pipeline failed`, error, { documentId });

      // 1. Mark the active workflow step as failed for better debugging visibility
      const wfCapability = typeof (db as unknown as { query?: { workflows?: { findFirst: Function } } }).query?.workflows?.findFirst === 'function';
      const workflow = wfCapability
        ? await db.query.workflows.findFirst({
            where: eq(workflows.documentId, documentId),
          })
        : null;

      if (workflow) {
        const steps = workflow.steps as unknown as WorkflowStep[];
        const activeStep = steps.find(s => s.id === workflow.currentStepId);
        if (activeStep) {
          await WorkflowService.updateStepStatus(db, workflow.id, activeStep.name, 'failed');
        }
      }

      // 2. Re-fetch current doc to ensure we don't overwrite existing metadata
      const docCapability = typeof (db as unknown as { query?: { documents?: { findFirst: Function } } }).query?.documents?.findFirst === 'function';
      const currentDoc = docCapability
        ? await db.query.documents.findFirst({
            where: eq(documents.id, documentId)
          })
        : null;


      const canUseDrizzleUpdate = typeof (db as unknown as { update: Function }).update === 'function'
        && typeof (db as unknown as { update: (table: unknown) => { set: (values: unknown) => unknown } }).update(documents)?.set === 'function';

      if (canUseDrizzleUpdate) {
        await (db as unknown as { update: (table: unknown) => { set: (values: unknown) => { where: (cond: unknown) => Promise<unknown> } } })
          .update(documents)
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

        await (db as unknown as { update: (table: unknown) => { set: (values: unknown) => { where: (cond: unknown) => Promise<unknown> } } })
          .update(workflows)
          .set({ status: 'failed' })
          .where(eq(workflows.documentId, documentId));
      } else {
        await supabase
          .from('documents')
          .update({ 
            status: 'failed', 
            metadata: { 
              ...(currentDoc?.metadata || {}), 
              pipelineError: error.message,
              failedAt: new Date().toISOString()
            },
          })
          .eq('id', documentId);

        await supabase
          .from('workflows')
          .update({ status: 'failed' })
          .eq('document_id', documentId);
      }



      return { success: false, error };
    }
  }
};