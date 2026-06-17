import { supabase } from '../lib/supabase/client';
import { DbClient } from '../../docs/client';
import { subscriptions, documents } from '../../docs/schema';
import { eq, count, and } from 'drizzle-orm';

export const SubscriptionService = {
  /**
   * Checks if a user is allowed to process a document based on their subscription plan.
   * This is a placeholder and should be implemented based on actual subscription logic.
   * @param userId The ID of the user.
   * @returns An object indicating if processing is allowed and a reason if not.
   */
  async canProcessDocument(db: DbClient, userId: string): Promise<{ allowed: boolean; reason?: string }> {
    // Placeholder for actual subscription logic.
    // In a real application, this would check the user's active subscription
    // and its associated limits (e.g., AI token usage, processing time, etc.).
    // For now, we'll assume all processing is allowed.
    return { allowed: true };
  },

  /**
   * Checks if a user has reached their document upload limit based on their subscription.
   * Assumes a 'subscriptions' table with 'user_id', 'status', and 'document_limit' columns.
   * A 'document_limit' of 0 or null implies no limit.
   * @param userId The ID of the user.
   * @returns An object indicating if upload is allowed and a reason if not.
   */
  async canUploadDocument(db: DbClient, userId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // 1. Fetch the user's active subscription details to get the document limit
      const subscription = await db.query.subscriptions.findFirst({
        columns: { documentLimit: true },
        where: and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')),
      });

      // Access property as defined in schema (camelCase)
      const documentLimit = subscription?.documentLimit || 0;

      // If there's no limit (0 or null), allow upload
      if (documentLimit === 0 || documentLimit === null) {
        return { allowed: true };
      }

      // 2. Count the number of documents already uploaded by the user
      const documentCountResult = await db.select({ value: count(documents.id) })
        .from(documents)
        .where(eq(documents.userId, userId));

      // Rename local variable to avoid shadowing the 'count' function from drizzle-orm
      // and ensure it is assigned before being used.
      const totalCount = parseInt(String(documentCountResult[0]?.value || '0'), 10);

      const currentDocumentCount = totalCount || 0;

      // 3. Compare current count with the limit
      if (currentDocumentCount >= documentLimit) {
        return { allowed: false, reason: `Document upload limit (${documentLimit}) reached.` };
      }

      return { allowed: true };
    } catch (error: any) {
      console.error('[SubscriptionService] canUploadDocument unexpected error:', error.message);
      return { allowed: false, reason: 'An unexpected error occurred during limit check.' };
    }
  },
};