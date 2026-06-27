import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { AIProvider } from '../ai/provider.service';
import { LogService } from '@/services/logging/log.service';

export const UsageService = {
  async logAIUsage(_db: any, params: {
    userId: string;
    documentId: string;
    provider: AIProvider;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Look up workspaceId from the document
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .select('workspace_id')
        .eq('id', params.documentId)
        .maybeSingle();

      if (docError || !doc) {
        LogService.warn('Could not find document for usage log', { error: docError?.message, documentId: params.documentId });
        return { success: false, error: docError || new Error('Document not found') };
      }

      const { error: insertError } = await supabase
        .from('usage_logs')
        .insert({
          id: uuidv4(),
          workspace_id: doc.workspace_id,
          user_id: params.userId,
          document_id: params.documentId,
          provider: params.provider,
          model: params.model,
          prompt_tokens: params.promptTokens,
          completion_tokens: params.completionTokens,
          total_tokens: params.totalTokens,
        });

      if (insertError) throw insertError;
      return { success: true, error: null };
    } catch (error: any) {
      LogService.error('logAIUsage failed', error, { documentId: params.documentId });
      return { success: false, error };
    }
  },

  async getUserMonthlyTokenUsage(_db: any, userId: string): Promise<{ totalTokens: number; error: Error | null }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data, error } = await supabase
        .from('usage_logs')
        .select('total_tokens')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (error) throw error;

      const totalTokens = (data || []).reduce((sum: number, row: any) => sum + (row.total_tokens || 0), 0);
      return { totalTokens, error: null };
    } catch (error: any) {
      LogService.error('getUserMonthlyTokenUsage failed', error, { userId });
      return { totalTokens: 0, error };
    }
  },
};
