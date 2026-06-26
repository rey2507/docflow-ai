import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type { Document, DocumentType } from '@/types/document';
import { LogService } from '@/services/logging/log.service';

export const DocumentUploadService = {
  async uploadDocument(
    supabase: SupabaseClient,
    file: File,
    userId: string
  ): Promise<{ data: Document | null; error: Error | null }> {
    let filePath: string | null = null;
    try {
      // 1. Determine document type based on MIME
      const type = this.mapMimeToType(file.type);

      // 2. Generate unique storage path: userId/timestamp_filename
      const sanitizedName = file.name.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '_');
      filePath = `${userId}/${Date.now()}_${sanitizedName}`;

      // 3. Upload file to 'documents' bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) throw storageError;

      // 4. Find workspaceId from subscriptions
      const { data: subscriptionRows, error: subError } = await supabase
        .from('subscriptions')
        .select('workspace_id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (subError) throw subError;
      const workspaceId = subscriptionRows?.[0]?.workspace_id;
      if (!workspaceId) {
        throw new Error('Unable to determine workspace for this user.');
      }

      // 5. Check for duplicate by name + size in metadata
      const { data: existingDocs } = await supabase
        .from('documents')
        .select('id, metadata')
        .eq('user_id', userId)
        .eq('name', file.name)
        .limit(1);

      const existingDoc = existingDocs?.[0];
      if (existingDoc) {
        const meta = (existingDoc.metadata as Record<string, any>) || {};
        if (meta.fileSize === file.size) {
          return { data: null, error: new Error('A document with the same name and size already exists.') };
        }
      }

      // 6. Create document record
      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          name: file.name,
          type,
          status: 'pending',
          storage_path: storageData.path,
          metadata: {
            fileSize: file.size,
            mimeType: file.type,
          },
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 7. Create workflow record directly via Supabase
      const workflowId = uuidv4();
      const firstStepId = uuidv4();
      const { error: wfError } = await supabase
        .from('workflows')
        .insert({
          id: workflowId,
          document_id: document.id,
          status: 'active',
          current_step_id: firstStepId,
          steps: [
            { id: firstStepId, name: 'Extraction', order: 1, status: 'pending' },
            { id: uuidv4(), name: 'Validation', order: 2, status: 'pending' },
            { id: uuidv4(), name: 'Finalization', order: 3, status: 'pending' },
          ],
          started_at: new Date().toISOString(),
        });

      if (wfError) {
        LogService.error('Workflow creation failed', wfError as Error, { documentId: document.id });
      }

      // 8. Trigger pipeline in background (fire-and-forget with safety catch)
      // Note: Full pipeline requires drizzle-backed services; this calls the orchestrator
      // which will skip drizzle-dependent steps if db is unavailable.
      // For now, we attempt it and ignore failures to avoid blocking the UI.
      try {
        const { PipelineOrchestrator } = await import('@/services/documents/orchestrator.service');
        PipelineOrchestrator.runPipeline({} as any, document.id, userId).catch((err) => {
          LogService.error('Background pipeline failed', err as Error, { documentId: document.id });
        });
      } catch (err) {
        LogService.error('Failed to start background pipeline', err as Error, { documentId: document.id });
      }

      return { data: document as unknown as Document, error: null };
    } catch (error: any) {
      if (filePath) {
        await supabase.storage.from('documents').remove([filePath]);
      }
      LogService.error('Document upload failed', error, { userId });
      return { data: null, error };
    }
  },

  mapMimeToType(mimeType: string): DocumentType {
    if (mimeType === 'application/pdf') return 'invoice';
    if (mimeType.startsWith('image/')) return 'image';
    if (
      mimeType.includes('spreadsheet') ||
      mimeType.includes('excel') ||
      mimeType.includes('csv')
    ) return 'spreadsheet';
    return 'other';
  },
};
