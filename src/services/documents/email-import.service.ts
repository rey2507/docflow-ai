import { DbClient } from '../../../docs/client';
import { DocumentUploadService } from './upload.service';
import { supabase } from '../../lib/supabase/client';

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
   * @param userId User ID to associate the documents with
   * @param attachments Array of attachment objects from the email
   */
  async processEmailInbound(
    db: DbClient, 
    userId: string, 
    attachments: Array<{ name: string; content: ArrayBuffer; mimeType: string }>
  ): Promise<{ success: boolean; processedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let processedCount = 0;

    for (const attachment of attachments) {
      try {
        // Convert ArrayBuffer to File-like object for UploadService
        const file = new File([attachment.content], attachment.name, { type: attachment.mimeType });
        
        console.log(`[EmailImportService] Importing attachment: ${attachment.name} for user: ${userId}`);
        
        const { data, error } = await DocumentUploadService.uploadDocument(file, userId);
        
        if (error) {
          errors.push(`Failed to upload ${attachment.name}: ${error.message}`);
        } else {
          processedCount++;
        }
      } catch (err: any) {
        errors.push(`Unexpected error processing ${attachment.name}: ${err.message}`);
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
 *       const db = createDbClient(env.D1_DB);
 *       await EmailImportService.processEmailInbound(db, userId, attachments);
 *     }
 *   }
 * }
 */