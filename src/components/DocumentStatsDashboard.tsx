import React, { useEffect, useState } from 'react';
import { ReportService } from '../services/reports/report.service';

interface DocumentStats {
  total: number;
  breakdown: Record<string, number>;
}

interface WorkflowEfficiency {
  activeCount: number;
  completedCount: number;
  avgProcessingTimeMinutes: number | null;
}

interface DocumentStatsDashboardProps {
  userId: string;
}

const DASHBOARD_CARD_BASE = 'p-6 bg-white shadow rounded-lg border border-slate-200';
const STAT_CARD_BASE = 'rounded-lg p-4 border';
const DOCUMENT_STATS_CARD = `${STAT_CARD_BASE} bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200`;
const WORKFLOW_EFFICIENCY_CARD = `${STAT_CARD_BASE} bg-gradient-to-br from-green-50 to-green-100 border-green-200`;

/**
 * DocumentStatsDashboard Component
 * 
 * A React component that fetches and displays document processing statistics
 * and workflow efficiency metrics for a specific user using the ReportService.
 */
const DocumentStatsDashboard: React.FC<DocumentStatsDashboardProps> = ({ userId }) => {
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [workflowEfficiency, setWorkflowEfficiency] = useState<WorkflowEfficiency | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);
      try {
        // Fetch reports in parallel for better performance
        const [statsRes, efficiencyRes] = await Promise.all([
          ReportService.getUserDocumentStats(userId),
          ReportService.getWorkflowEfficiency(userId)
        ]);

        if (statsRes.error) throw statsRes.error;
        if (efficiencyRes.error) throw efficiencyRes.error;

        setDocumentStats(statsRes.data);
        setWorkflowEfficiency(efficiencyRes.data);
      } catch (err: any) {
        console.error('Failed to fetch report data:', err);
        setError(err.message || 'An unknown error occurred while fetching reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId]); // Dependency array ensures effect re-runs if userId changes

  // Loading state
  if (loading) {
    return (
      <div className={DASHBOARD_CARD_BASE}>
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded animate-pulse w-1/3"></div>
          <div className="space-y-3">
            <div className="h-24 bg-slate-100 rounded animate-pulse"></div>
            <div className="h-24 bg-slate-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-white shadow rounded-lg border border-red-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800">Failed to Load Reports</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  const hasData = (documentStats && documentStats.total > 0) || (workflowEfficiency && (workflowEfficiency.activeCount > 0 || workflowEfficiency.completedCount > 0));
  
  if (!hasData) {
    return (
      <div className={DASHBOARD_CARD_BASE}>
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">No report data available</h3>
          <p className="mt-1 text-sm text-slate-500">Start processing documents to see statistics and efficiency metrics.</p>
        </div>
      </div>
    );
  }

  // Data rendering state
  return (
    <div className={DASHBOARD_CARD_BASE}>
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document Statistics Card */}
        {documentStats && (
          <div className={DOCUMENT_STATS_CARD}>
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Document Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Total Documents</span>
                <span className="text-2xl font-bold text-blue-900">{documentStats.total}</span>
              </div>
              {Object.keys(documentStats.breakdown).length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm font-medium text-blue-700 mb-2">Status Breakdown</p>
                  <div className="space-y-1">
                    {Object.entries(documentStats.breakdown).map(([status, count]) => (
                      <div key={status} className="flex justify-between text-sm">
                        <span className="text-blue-700 capitalize">{status}</span>
                        <span className="font-medium text-blue-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workflow Efficiency Card */}
        {workflowEfficiency && (
          <div className={WORKFLOW_EFFICIENCY_CARD}>
            <h3 className="text-lg font-semibold text-green-900 mb-4">Workflow Efficiency</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-700">Active Workflows</span>
                <span className="text-2xl font-bold text-green-900">{workflowEfficiency.activeCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-700">Completed Workflows</span>
                <span className="text-2xl font-bold text-green-900">{workflowEfficiency.completedCount}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700">Avg Processing Time</span>
                  <span className="text-lg font-semibold text-green-900">
                    {workflowEfficiency.avgProcessingTimeMinutes !== null 
                      ? `${workflowEfficiency.avgProcessingTimeMinutes} min` 
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentStatsDashboard;