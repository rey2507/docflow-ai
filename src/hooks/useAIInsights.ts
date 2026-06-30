import { useQuery } from '@tanstack/react-query';
import { ReportService } from '../services/reports/report.service';

export function useAIInsights(userId: string) {
  return useQuery({
    queryKey: ['ai-insights', userId],
    queryFn: async () => {
      const { data, error } = await ReportService.getAIInsights(userId);
      if (error || !data) throw new Error(error?.message || 'Failed to fetch AI insights');
      return data;
    },
    enabled: !!userId,
  });
}