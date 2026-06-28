import { supabase } from '../../lib/supabase/client';
import { LogService } from '@/services/logging/log.service';

/**
 * DocumentStorageService
 * 
 * Handles management of physical files in Supabase Storage.
 * Provides methods for retrieving access links and removing files.
 */
export const DocumentStorageService = {
  /**
   * Generates a temporary signed URL for a document.
   * Required for documents stored in private buckets.
   * 
   * @param path The storage path of the document (e.g., 'userId/filename')
   * @param expiresIn Seconds until the link expires (default 3600s / 1 hour)
   */
  async getDownloadUrl(path: string, expiresIn: number = 3600): Promise<{ url: string | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(path, expiresIn);

      if (error) throw error;
      
      return { url: data.signedUrl, error: null };
    } catch (error: any) {
      LogService.error('[DocumentStorageService] getDownloadUrl Error:', error);
      return { url: null, error };
    }
  },

  /**
   * Removes a file from the 'documents' storage bucket.
   * 
   * @param path The storage path of the document.
   */
  async deleteFile(path: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([path]);

      if (error) throw error;
      
      return { error: null };
    } catch (error: any) {
      LogService.error('[DocumentStorageService] deleteFile Error:', error);
      return { error };
    }
  }
};