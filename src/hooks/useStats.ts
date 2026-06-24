import { useQuery } from '@tanstack/react-query';
import { ReportService } from '../services/reports/report.service';

export function useStats(userId: string) {
  return useQuery({
    queryKey: ['stats', userId],
    queryFn: async () => {
      const { data, error } = await ReportService.getUserDocumentStats(userId);
      if (error || !data) throw new Error(error?.message || 'Failed to fetch stats');
      return data;
    },
    enabled: !!userId,
  });
}
