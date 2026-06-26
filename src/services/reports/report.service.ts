import { supabase } from '../../lib/supabase/client';

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
        .eq('userId', userId);

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
      console.error('[ReportService] getUserDocumentStats Error:', error.message);
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
      // Filter workflows by document ownership via inner join
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          status,
          startedAt,
          completedAt,
          documents!inner(userId)
        `)
        .eq('userId', userId);

      if (error) throw error;

      const completed = data.filter((w: any) => w.status === 'completed' && w.completedAt);
      const activeCount = data.filter((w: any) => w.status === 'active').length;

      let avgProcessingTimeMinutes = null;
      if (completed.length > 0) {
        const totalDuration = completed.reduce((sum: number, w: any) => {
          const duration = new Date(w.completedAt).getTime() - new Date(w.startedAt).getTime();
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
      console.error('[ReportService] getWorkflowEfficiency Error:', error.message);
      return { data: null, error };
    }
  }
};