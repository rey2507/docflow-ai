import { supabase } from '@/lib/supabase/client';
import { DbClient } from 'docs/client';
import { subscriptions, documents } from 'docs/schema';
import { eq, count, and, gte, desc } from 'drizzle-orm';
import { LogService } from '@/services/logging/log.service';

export const SubscriptionService = {
  /**
   * Checks if a user is allowed to process a document based on their subscription plan.
   * @param userId The ID of the user.
   * @returns An object indicating if processing is allowed and a reason if not.
   */
  async canProcessDocument(db: DbClient, userId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // 1. Fetch user's latest subscription
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
        orderBy: [desc(subscriptions.updatedAt)],
      });

      // If no subscription found, we deny processing
      if (!subscription) {
        return { allowed: false, reason: 'No subscription found. Please subscribe to process documents.' };
      }

      // Task 12.4: Enforce Billing Status (Block delinquent accounts)
      if (!['active', 'trialing'].includes(subscription.status)) {
        const statusLabel = subscription.status.replace('_', ' ');
        return { 
          allowed: false, 
          reason: `Your subscription is ${statusLabel}. Platform access is restricted until billing is resolved.` 
        };
      }

      // 2. Calculate current billing period's usage
      let billingPeriodStart: Date;
      if (subscription.currentPeriodEnd) {
        // Assuming a monthly cycle, calculate start by subtracting ~30 days from currentPeriodEnd
        billingPeriodStart = new Date(subscription.currentPeriodEnd);
        billingPeriodStart.setDate(billingPeriodStart.getDate() - 30);
      } else {
        // Fallback for subscriptions without a defined period end (e.g., new trials)
        billingPeriodStart = new Date();
        billingPeriodStart.setDate(billingPeriodStart.getDate() - 30);
      }

      const [usageResult] = await db.select({ value: count(documents.id) })
        .from(documents)
        .where(and(eq(documents.userId, userId), gte(documents.createdAt, billingPeriodStart)));

      const processedCount = parseInt(String(usageResult?.value || '0'), 10);
      const limit = subscription.documentLimit || 0;

      if (limit > 0 && processedCount >= limit) {
        return { allowed: false, reason: `Monthly processing limit (${limit}) reached.` };
      }

      return { allowed: true };
    } catch (error: any) {
      LogService.error('Error verifying processing credits', error, { userId });
      return { allowed: false, reason: 'Error verifying processing credits.' };
    }
  },

  /**
   * Fetches usage statistics for the user's dashboard.
   * @param db The Drizzle database client.
   * @param userId The ID of the user.
   */
  async getUsageStats(db: DbClient, userId: string) {
    try {
      const subscription = await db.query.subscriptions.findFirst({
        where: and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')),
      });

      let billingPeriodStart: Date;
      if (subscription?.currentPeriodEnd) {
        // Assuming a monthly cycle, calculate start by subtracting ~30 days from currentPeriodEnd
        billingPeriodStart = new Date(subscription.currentPeriodEnd);
        billingPeriodStart.setDate(billingPeriodStart.getDate() - 30);
      } else {
        // Fallback for subscriptions without a defined period end (e.g., new trials)
        billingPeriodStart = new Date();
        billingPeriodStart.setDate(billingPeriodStart.getDate() - 30);
      }

      const [usageResult] = await db.select({ value: count(documents.id) })
        .from(documents)
        .where(and(eq(documents.userId, userId), gte(documents.createdAt, billingPeriodStart)));

      const processedCount = parseInt(String(usageResult?.value || '0'), 10);
      const limit = subscription?.documentLimit || 0;

      return {
        used: processedCount,
        limit: limit,
        remaining: Math.max(0, limit - processedCount),
        percentage: limit > 0 ? Math.min(100, (processedCount / limit) * 100) : 0,
        nextResetDate: subscription?.currentPeriodEnd
          ? subscription.currentPeriodEnd.toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error: any) {
      LogService.error('Error fetching usage stats', error, { userId });
      return {
        used: 0, limit: 0, remaining: 0, percentage: 0
      };
    }
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
      // 1. Fetch the user's latest subscription details
      const subscription = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.userId, userId),
        orderBy: [desc(subscriptions.updatedAt)],
      });

      // If no subscription found, block upload
      if (!subscription) {
        return { allowed: false, reason: 'No subscription found. Please subscribe to upload documents.' };
      }

      // Task 12.4: Enforce Billing Status (Block delinquent accounts)
      if (!['active', 'trialing'].includes(subscription.status)) {
        const statusLabel = subscription.status.replace('_', ' ');
        return { 
          allowed: false, 
          reason: `Your subscription is ${statusLabel}. Uploads are restricted until billing is resolved.` 
        };
      }

      const documentLimit = subscription.documentLimit || 0;

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
      LogService.error('Unexpected error during upload limit check', error, { userId });
      return { allowed: false, reason: 'An unexpected error occurred during limit check.' };
    }
  },
};