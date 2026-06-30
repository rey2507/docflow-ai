import { supabase } from '../../lib/supabase/client';
import { LogService } from '@/services/logging/log.service';

/**
 * ReportService
 * 
 * Provides analytical data and summaries for the DocFlow AI system.
 * Aggregates document processing statuses and workflow performance metrics.
 */
export const ReportService = {
  /**
   * Retrieves document distribution statistics for a specific user.
   * 
   * @param userId The ID of the owner.
   */
  async getUserDocumentStats(userId: string): Promise<{ 
    data: { total: number; breakdown: Record<string, number> } | null; 
    error: Error | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('status')
        .eq('user_id', userId);

      if (error) throw error;

      const breakdown = (data || []).reduce((acc: Record<string, number>, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      }, {});

      return { 
        data: { total: data?.length || 0, breakdown }, 
        error: null 
      };
    } catch (error: any) {
      LogService.error('getUserDocumentStats failed', error, { userId });
      return { data: null, error };
    }
  },

  /**
   * Calculates efficiency metrics for workflows.
   * This joins workflows with documents to ensure user-specific filtering.
   * 
   * @param userId The ID of the owner.
   */
  async getWorkflowEfficiency(userId: string): Promise<{ 
    data: { 
      activeCount: number; 
      completedCount: number; 
      avgProcessingTimeMinutes: number | null 
    } | null; 
    error: Error | null 
  }> {
    try {
      // Get user's document IDs first, then fetch their workflows
      const { data: userDocs, error: docsError } = await supabase
        .from('documents')
        .select('id')
        .eq('user_id', userId);

      if (docsError) throw docsError;

      const docIds = (userDocs || []).map((d: any) => d.id);
      if (docIds.length === 0) {
        return { data: { activeCount: 0, completedCount: 0, avgProcessingTimeMinutes: null }, error: null };
      }

      const { data, error } = await supabase
        .from('workflows')
        .select('status, started_at, completed_at')
        .in('document_id', docIds);

      if (error) throw error;

      const completed = data.filter((w: any) => w.status === 'completed' && w.completed_at);
      const activeCount = data.filter((w: any) => w.status === 'active').length;

      let avgProcessingTimeMinutes = null;
      if (completed.length > 0) {
        const totalDuration = completed.reduce((sum: number, w: any) => {
          const duration = new Date(w.completed_at).getTime() - new Date(w.started_at).getTime();
          return sum + duration;
        }, 0);
        avgProcessingTimeMinutes = Math.round((totalDuration / completed.length) / (1000 * 60));
      }

      return {
        data: {
          activeCount,
          completedCount: completed.length,
          avgProcessingTimeMinutes
        },
        error: null
      };
    } catch (error: any) {
      LogService.error('getWorkflowEfficiency failed', error, { userId });
      return { data: null, error };
    }
  }
  ,

  /**
   * Aggregates AI usage and quality metrics for the user's workspace.
   *
   * - usage: counts usage log rows from the last 30 days
   * - success rate: completed extractions divided by completed + failed documents
   * - avg confidence: average confidence score from completed extractions
   * - failed count: failed document count in the user's documents
   */
  async getAIInsights(userId: string): Promise<{
    data: {
      usage: { used: number; limit: number };
      successRate: number;
      avgConfidence: number;
      failedCount: number;
    } | null;
    error: Error | null;
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: userDocs, error: docsError } = await supabase
        .from('documents')
        .select('id, status, workspace_id')
        .eq('user_id', userId);

      if (docsError) throw docsError;

      const documentIds = (userDocs || []).map((doc: any) => doc.id);
      const workspaceId = userDocs?.[0]?.workspace_id || null;

      const [usageResult, extractionsResult] = await Promise.all([
        workspaceId
          ? supabase
              .from('usage_logs')
              .select('id', { count: 'exact', head: true })
              .eq('workspace_id', workspaceId)
              .gte('created_at', thirtyDaysAgo.toISOString())
          : Promise.resolve({ count: 0, error: null }),
        documentIds.length > 0
          ? supabase
              .from('document_extractions')
              .select('confidence_score, document_id')
              .in('document_id', documentIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (usageResult.error) throw usageResult.error;
      if (extractionsResult.error) throw extractionsResult.error;

      const usageCount = usageResult.count || 0;
      const extractionRows = extractionsResult.data || [];

      const confidenceValues = extractionRows
        .map((row: any) => Number(row.confidence_score))
        .filter((value: number) => Number.isFinite(value));

      const avgConfidence = confidenceValues.length > 0
        ? confidenceValues.reduce((sum: number, value: number) => sum + value, 0) / confidenceValues.length
        : 0;

      const completedCount = (userDocs || []).filter((doc: any) => doc.status === 'completed').length;
      const failedCount = (userDocs || []).filter((doc: any) => doc.status === 'failed').length;
      const totalCompletedOrFailed = completedCount + failedCount;
      const successRate = totalCompletedOrFailed > 0 ? Math.round((completedCount / totalCompletedOrFailed) * 100) : 0;

      return {
        data: {
          usage: { used: usageCount, limit: 2000 },
          successRate,
          avgConfidence: Number(avgConfidence.toFixed(2)),
          failedCount,
        },
        error: null,
      };
    } catch (error: any) {
      LogService.error('getAIInsights failed', error, { userId });
      return { data: null, error };
    }
  },
};