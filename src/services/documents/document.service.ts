import { supabase } from '../../lib/supabase/client';

/**
 * DocumentService
 * 
 * Handles general management operations for documents that aren't 
 * specific to the processing pipeline (e.g., Deletion, fetching by ID).
 */
export const DocumentService = {
  /**
   * Deletes a document record and its associated file in storage.
   * 
   * @param documentId The UUID of the document to delete.
   */
  async deleteDocument(documentId: string): Promise<{ error: Error | null }> {
    try {
      // 1. Get document details to find the storage path
      const { data: doc, error: fetchError } = await supabase
        .from('documents')
        .select('storagePath')
        .eq('id', documentId)
        .single();
      
      if (fetchError) throw fetchError;

      // 2. Delete the physical file from Supabase Storage
      if (doc?.storagePath) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([doc.storagePath]);
        if (storageError) console.warn('[DocumentService] Storage deletion warning:', storageError.message);
      }

      // 3. Delete the database record
      // Note: Foreign key constraints should be set to CASCADE for workflows/steps
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      return { error: null };
    } catch (error: any) {
      console.error('[DocumentService] deleteDocument Error:', error.message);
      return { error };
    }
  }
};