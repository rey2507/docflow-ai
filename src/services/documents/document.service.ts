import { supabase } from '../../lib/supabase/client';
import { eq } from 'drizzle-orm';
import { DbClient } from '../../../docs/client';
import { documents } from '../../../docs/schema';
import type { Document } from '../../types/document';

/**
 * DocumentService
 * 
 * Handles general management operations for documents that aren't 
 * specific to the processing pipeline (e.g., Deletion, fetching by ID).
 */
export const DocumentService = {
  /**
   * Fetches a single document by its ID.
   * 
   * @param db The Drizzle database client.
   * @param documentId The UUID of the document.
   */
  async getDocumentById(db: DbClient, documentId: string): Promise<{ data: Document | null; error: Error | null }> {
    try {
      const data = await db.query.documents.findFirst({
        where: eq(documents.id, documentId)
      });
      return { data: data as unknown as Document, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Updates the metadata of a document.
   * 
   * @param db The Drizzle database client.
   * @param documentId The UUID of the document.
   * @param metadata The new metadata object.
   */
  async updateMetadata(db: DbClient, documentId: string, metadata: any): Promise<{ error: Error | null }> {
    try {
      await db.update(documents)
        .set({ 
          metadata, 
          updatedAt: new Date() 
        })
        .where(eq(documents.id, documentId));
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  /**
   * Deletes a document record and its associated file in storage.
   * 
   * @param db The Drizzle database client.
   * @param documentId The UUID of the document to delete.
   */
  async deleteDocument(db: DbClient, documentId: string): Promise<{ error: Error | null }> {
    try {
      // 1. Get document details to find the storage path
      const doc = await db.query.documents.findFirst({
        columns: { storagePath: true },
        where: eq(documents.id, documentId)
      });
      
      if (!doc) throw new Error('Document not found');

      // 2. Delete the physical file from Supabase Storage
      if (doc?.storagePath) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([doc.storagePath]);
        if (storageError) console.warn('[DocumentService] Storage deletion warning:', storageError.message);
      }

      // 3. Delete the database record
      await db.delete(documents)
        .where(eq(documents.id, documentId));

      return { error: null };
    } catch (error: any) {
      console.error('[DocumentService] deleteDocument Error:', error.message);
      return { error };
    }
  }
};