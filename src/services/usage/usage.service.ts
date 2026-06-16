import { supabase } from '../../lib/supabase/client';
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
   * @param params Usage details including user, document, and token counts.
   */
  async logAIUsage(params: {
    userId: string;
    documentId: string;
    provider: AIProvider;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('usage_logs')
        .insert({
          userId: params.userId,
          documentId: params.documentId,
          provider: params.provider,
          model: params.model,
          promptTokens: params.promptTokens,
          completionTokens: params.completionTokens,
          totalTokens: params.totalTokens,
        });

      if (error) throw error;
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
   * @param userId The UUID of the user.
   */
  async getUserMonthlyTokenUsage(userId: string): Promise<{ totalTokens: number; error: Error | null }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data, error } = await supabase
        .from('usage_logs')
        .select('totalTokens')
        .eq('userId', userId)
        .gte('created_at', startOfMonth);

      if (error) throw error;

      const total = data?.reduce((acc, curr) => acc + (curr.totalTokens || 0), 0) || 0;
      return { totalTokens: total, error: null };
    } catch (error: any) {
      console.error('[UsageService] getUserMonthlyTokenUsage Error:', error.message);
      return { totalTokens: 0, error };
    }
  }
};