import { supabase } from '@/lib/supabase/client';
import { LogService } from '@/services/logging/log.service';
import type { Document } from '../../types/document';

export const DocumentService = {
  async getDocumentById(
    _db: any,
    documentId: string
  ): Promise<{ data: Document | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();

      if (error) throw error;
      return { data: data as Document | null, error: null };
    } catch (error: any) {
      LogService.error('getDocumentById failed', error, { documentId });
      return { data: null, error };
    }
  },

  async updateMetadata(
    _db: any,
    documentId: string,
    metadata: Record<string, any>
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      LogService.error('updateMetadata failed', error, { documentId });
      return { error };
    }
  },

  async deleteDocument(
    _db: any,
    documentId: string
  ): Promise<{ error: Error | null }> {
    try {
      // 1. Get document to find storage path
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', documentId)
        .maybeSingle();

      if (docError || !doc) throw docError || new Error('Document not found');

      // 2. Delete physical file from storage
      if (doc.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([doc.storage_path]);

        if (storageError) {
          LogService.warn('Storage deletion warning', { message: storageError.message, documentId });
        }
      }

      // 3. Delete database record
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      return { error: null };
    } catch (error: any) {
      LogService.error('deleteDocument failed', error, { documentId });
      return { error };
    }
  },
};
