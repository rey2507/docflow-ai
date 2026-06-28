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
};