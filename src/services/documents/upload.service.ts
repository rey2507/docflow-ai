import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import type { Document, DocumentType, DocumentMetadata } from '@/types/document';
import { LogService } from '@/services/logging/log.service';
import { computeFileHash } from '@/lib/utils';
import { detectFileType, validateFileSize } from './file-validation.service';

function mapSupabaseToDocument(row: Record<string, any>): Document {
  const metadata: DocumentMetadata = (row.metadata && typeof row.metadata === 'object') ? row.metadata : {};
  return {
    id: row.id,
    userId: row.user_id || row.userId || '',
    name: row.name,
    type: row.type,
    status: row.status,
    storagePath: row.storage_path || row.storagePath || '',
    metadata,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
  };
}

export const DocumentUploadService = {
  async uploadDocument(
    _supabase: any,
    file: File,
    userId: string
  ): Promise<{ data: Document | null; error: Error | null }> {
    let filePath: string | null = null;
    try {
      // 1. Validate file type and size before upload
      const detectedType = detectFileType(file);
      if (detectedType.type === 'unsupported') {
        return { data: null, error: new Error(`Unsupported file type. Allowed: PDF, PNG, JPG, DOC, DOCX.`) };
      }

      const sizeCheck = validateFileSize(file);
      if (!sizeCheck.valid) {
        return { data: null, error: new Error(sizeCheck.error) };
      }

      // 2. Determine document type based on MIME
      const type = detectedType.type === 'doc' ? 'other' : this.mapMimeToType(file.type);

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

      // 4. Resolve workspace for this user.
      //    1st: try via subscriptions
      //    2nd: try via workspace_members  
      //    3rd: create profile (if missing), then default workspace + membership
      let workspaceId: string | undefined;

      const { data: subRows, error: subError } = await supabase
        .from('subscriptions')
        .select('workspace_id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (!subError && subRows && subRows.length > 0) {
        workspaceId = subRows[0].workspace_id;
      } else {
        const { data: memberRows, error: memberError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', userId)
          .limit(1);

        if (!memberError && memberRows && memberRows.length > 0) {
          workspaceId = memberRows[0].workspace_id;
        } else {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

          if (!existingProfile) {
            const fallbackEmail = `${userId.slice(0, 8)}@local.workspace`;
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({ id: userId, email: fallbackEmail });

            if (profileError) {
              LogService.error('Profile creation failed', profileError as Error, { userId });
            }
          }

          const newWorkspaceId = uuidv4();
          const { error: wsError } = await supabase
            .from('workspaces')
            .insert({
              id: newWorkspaceId,
              name: 'My Workspace',
              slug: newWorkspaceId,
            });

          if (wsError) throw wsError;

          const { error: memberCreateError } = await supabase
            .from('workspace_members')
            .insert({
              workspace_id: newWorkspaceId,
              user_id: userId,
              role: 'admin',
            });

          if (memberCreateError) throw memberCreateError;

          workspaceId = newWorkspaceId;
        }
      }

      // 5. Check for duplicates
      const contentHash = await computeFileHash(file);
      
      // 5a. Check by content hash (exact content match)
      const { data: hashMatches } = await supabase
        .from('documents')
        .select('id, name, metadata')
        .eq('user_id', userId)
        .limit(1);

      const exactDuplicate = hashMatches?.find((d: any) => (d.metadata?.contentHash || '') === contentHash);
      if (exactDuplicate) {
        return { 
          data: null, 
          error: new Error(`This file is a duplicate of "${exactDuplicate.name}" uploaded earlier.`) 
        };
      }

      // 5b. Check by name + size (fast pre-insert heuristic)
      const { data: nameSizeMatches } = await supabase
        .from('documents')
        .select('id, metadata')
        .eq('user_id', userId)
        .eq('name', file.name)
        .limit(1);

      const nameSizeDuplicate = nameSizeMatches?.[0];
      if (nameSizeDuplicate) {
        const meta = (nameSizeDuplicate.metadata as Record<string, any>) || {};
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
            contentHash,
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
      try {
        const { PipelineOrchestrator } = await import('@/services/documents/orchestrator.service');
        PipelineOrchestrator.runPipeline({} as any, document.id, userId).catch((err) => {
          LogService.error('Background pipeline failed', err as Error, { documentId: document.id });
        });
      } catch (err) {
        LogService.error('Failed to start background pipeline', err as Error, { documentId: document.id });
      }

      return { data: mapSupabaseToDocument(document), error: null };
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
