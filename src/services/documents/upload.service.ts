import { supabase } from '../../lib/supabase/client';
import type { Document, DocumentType } from '../../types/document';
import { WorkflowService } from '../workflow/workflow.service';
import { PipelineOrchestrator } from './orchestrator.service';

/**
 * DocumentUploadService
 * 
 * Handles the logic for uploading files to Supabase storage and 
 * registering the metadata in the database.
 */
export const DocumentUploadService = {
  /**
   * Uploads a file and creates a database record.
   * @param file The File object from the user input.
   * @param userId The ID of the authenticated user.
   */
  async uploadDocument(file: File, userId: string): Promise<{ data: Document | null; error: Error | null }> {
    try {
      // 1. Determine the document type based on MIME
      const type = this.mapMimeToType(file.type);
      
      // 2. Generate a unique storage path: userId/timestamp_filename
      const sanitizedName = file.name.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, "_");
      const filePath = `${userId}/${Date.now()}_${sanitizedName}`;

      // 3. Upload file to 'documents' bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // 4. Create document record in database
      const { data: dbData, error: dbError } = await supabase
        .from('documents')
        .insert({
          userId: userId,
          name: file.name,
          type: type,
          status: 'pending',
          storagePath: storageData.path,
          metadata: {
            fileSize: file.size,
            mimeType: file.type,
          }
        })
        .select()
        .single();

      if (dbError) {
        // Rollback: remove file from storage if DB record creation fails
        await supabase.storage.from('documents').remove([filePath]);
        throw dbError;
      }

      const document = dbData as Document;

      // 5. Initialize Workflow
      const { error: wfError } = await WorkflowService.createWorkflow(document.id);
      if (wfError) {
        console.error('[DocumentUploadService] Workflow creation error:', wfError.message);
      } else {
        // 6. Trigger Pipeline (Background process)
        // We do not await this to return the document record to the UI immediately
        PipelineOrchestrator.runPipeline(document.id);
      }

      return { data: document, error: null };
    } catch (error: any) {
      console.error('[DocumentUploadService] Error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Maps file MIME types to DocumentType enum
   */
  mapMimeToType(mimeType: string): DocumentType {
    if (mimeType === 'application/pdf') return 'invoice';
    if (mimeType.startsWith('image/')) return 'image';
    if (
      mimeType.includes('spreadsheet') || 
      mimeType.includes('excel') || 
      mimeType.includes('csv')
    ) return 'spreadsheet';
    return 'other';
  }
};