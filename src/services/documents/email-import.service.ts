import { SupabaseClient } from '@supabase/supabase-js';
import { DbClient } from 'docs/client';
import { DocumentUploadService } from '@/services/documents/upload.service';
import { LogService } from '@/services/logging/log.service';

/**
 * EmailImportService
 * 
 * Handles processing of inbound emails from Cloudflare Email Workers.
 * Extracts attachments and initiates the processing pipeline.
 */
export const EmailImportService = {
  /**
   * Processes an inbound email message.
   * 
   * @param db Drizzle database client
   * @param supabase Supabase client (configured for storage)
   * @param userId User ID to associate the documents with
   * @param attachments Array of attachment objects from the email
   */
  async processEmailInbound(
    db: DbClient, 
    supabase: SupabaseClient,
    userId: string, 
    attachments: Array<{ name: string; content: ArrayBuffer; mimeType: string }>
  ): Promise<{ success: boolean; processedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let processedCount = 0;

    for (const attachment of attachments) {
      try {
        // Convert ArrayBuffer to File-like object for UploadService
        const file = new File([attachment.content], attachment.name, { type: attachment.mimeType });
        
        LogService.info(`Importing email attachment`, { attachmentName: attachment.name, userId });
        
        const { data, error } = await DocumentUploadService.uploadDocument(supabase, file, userId);
        
        if (error) {
          errors.push(`Failed to upload ${attachment.name}: ${error.message}`); // Keep for return value
        } else {
          processedCount++;
        }
      } catch (err: any) {
        LogService.error(`Unexpected error processing email attachment`, err, { attachmentName: attachment.name, userId });
        errors.push(`Unexpected error processing ${attachment.name}: ${err.message}`); // Keep for return value
      }
    }

    return {
      success: errors.length === 0,
      processedCount,
      errors
    };
  }
};

/**
 * Example Cloudflare Email Worker implementation:
 * 
 * import PostalMime from 'postal-mime';
 * import { createClient } from '@supabase/supabase-js';
 * import { createDbClient } from 'docs/client';
 * 
 * export default {
 *   async email(message, env, ctx) {
 *     const userId = message.to.split('@')[0]; // Simple routing logic
 *     const parser = new PostalMime(); // Common library for parsing emails in Workers
 *     const email = await parser.parse(message.raw);
 *     
 *     if (email.attachments.length > 0) {
 *       const attachments = email.attachments.map(a => ({
 *         name: a.filename,
 *         content: a.content,
 *         mimeType: a.mimeType
 *       }));
 *       
 *       // Bindings and secrets are accessed via the 'env' object in Cloudflare Workers
 *       const db = createDbClient(env.DB);
 *       const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
 *       await EmailImportService.processEmailInbound(db, supabase, userId, attachments);
 *     }
 *   }
 * }
 */