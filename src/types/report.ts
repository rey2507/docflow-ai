export type ReportType = 'extraction_summary' | 'workflow_performance' | 'usage_stats';

export interface ReportFilter {
  startDate: string;
  endDate: string;
  userId?: string;
  docType?: string;
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  data: Record<string, any>;
  filters: ReportFilter;
  generatedById: string;
  createdAt: string;
}