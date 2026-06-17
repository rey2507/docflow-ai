import { eq, gte, and, sql } from 'drizzle-orm';
import { DbClient } from 'docs/client';
import { usageLogs } from 'docs/schema';
import { v4 as uuidv4 } from 'uuid';
import { AIProvider } from '../ai/provider.service';

/**
 * UsageService
 * 
 * Responsible for tracking resource consumption across the platform.
 * This includes AI token usage and document processing counts for 
 * quota enforcement and analytics.
 */
export const UsageService = {
  /**
   * Logs detailed AI usage for an extraction event.
   * 
   * @param db The Drizzle database client.
   * @param params Usage details including user, document, and token counts.
   */
  async logAIUsage(db: DbClient, params: {
    userId: string;
    documentId: string;
    provider: AIProvider;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }): Promise<{ success: boolean; error: Error | null }> {
    try {
      await db.insert(usageLogs).values({
        id: uuidv4(),
        userId: params.userId,
        documentId: params.documentId,
        provider: params.provider,
        model: params.model,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens: params.totalTokens,
        createdAt: new Date(),
      });

      return { success: true, error: null };
    } catch (error: any) {
      console.error('[UsageService] logAIUsage Error:', error.message);
      return { success: false, error };
    }
  },

  /**
   * Retrieves the total token consumption for a specific user within the current calendar month.
   * This is used to enforce plan limits and display usage analytics.
   * 
   * @param db The Drizzle database client.
   * @param userId The UUID of the user.
   */
  async getUserMonthlyTokenUsage(db: DbClient, userId: string): Promise<{ totalTokens: number; error: Error | null }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const result = await db
        .select({ total: sql<number>`sum(${usageLogs.totalTokens})` })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            gte(usageLogs.createdAt, startOfMonth)
          )
        );

      return { totalTokens: result[0]?.total || 0, error: null };
    } catch (error: any) {
      console.error('[UsageService] getUserMonthlyTokenUsage Error:', error.message);
      return { totalTokens: 0, error };
    }
  }
};