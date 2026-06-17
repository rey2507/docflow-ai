import { SupabaseClient } from '@supabase/supabase-js';
import { eq, and, sql } from 'drizzle-orm';
import { DbClient } from 'docs/client';
import { documents } from 'docs/schema';
import { v4 as uuidv4 } from 'uuid';
import type { Document, DocumentType } from '../../types/document';
import { WorkflowService } from '../workflow/workflow.service';
import { PipelineOrchestrator } from './orchestrator.service';
import { SubscriptionService } from '../../subscription/subscription.service'; // Import the SubscriptionService

/**
 * DocumentUploadService
 * 
 * Handles the logic for uploading files to Supabase storage and 
 * registering the metadata in the database.
 */
export const DocumentUploadService = {
  /**
   * Uploads a file and creates a database record.
   * @param db Drizzle database client.
   * @param supabase Supabase client (configured for storage).
   * @param file The File object from the user input.
   * @param userId The ID of the authenticated user.
   */
  async uploadDocument(db: DbClient, supabase: SupabaseClient, file: File, userId: string): Promise<{ data: Document | null; error: Error | null }> {
    let filePath: string | null = null;
    try {
      // --- NEW: Check document upload limit ---
      const { allowed, reason } = await SubscriptionService.canUploadDocument(db, userId);
      if (!allowed) {
        return { data: null, error: new Error(reason || 'Document upload limit reached.') };
      }
      // --- END NEW ---

      // --- NEW: Duplicate Upload Detection (Task 10.3) ---
      const existingDoc = await db.query.documents.findFirst({
        where: and(
          eq(documents.userId, userId),
          eq(documents.name, file.name),
          sql`${documents.metadata}->>'$.fileSize' = ${file.size}`
        )
      });

      if (existingDoc) {
        return { data: null, error: new Error('A document with the same name and size already exists.') };
      }

      // 1. Determine the document type based on MIME
      const type = this.mapMimeToType(file.type);
      
      // 2. Generate a unique storage path: userId/timestamp_filename
      const sanitizedName = file.name.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, "_");
      filePath = `${userId}/${Date.now()}_${sanitizedName}`;

      // 3. Upload file to 'documents' bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // 4. Create document record in database
      const [document] = await db.insert(documents).values({
        id: uuidv4(),
        userId: userId,
        name: file.name,
        type: type,
        status: 'pending',
        storagePath: storageData.path,
        metadata: {
          fileSize: file.size,
          mimeType: file.type,
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // 5. Initialize Workflow
      const { error: wfError } = await WorkflowService.createWorkflow(db, document.id);
      if (wfError) {
        console.error('[DocumentUploadService] Workflow creation error:', wfError.message);
      } else {
        // 6. Trigger Pipeline (Background process)
        PipelineOrchestrator.runPipeline(db, document.id);
      }

      return { data: document as unknown as Document, error: null };
    } catch (error: any) {
      if (filePath) {
        await supabase.storage.from('documents').remove([filePath]);
      }
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