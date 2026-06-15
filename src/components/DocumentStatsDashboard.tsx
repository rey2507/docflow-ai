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

  if (loading) {
    return <div className="p-4 text-gray-600">Loading reports...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Document Processing Dashboard</h2>

      {documentStats && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Document Statistics</h3>
          <p className="text-gray-700">Total Documents: <span className="font-medium">{documentStats.total}</span></p>
          <div className="mt-2">
            <h4 className="text-lg font-medium">Status Breakdown:</h4>
            <ul className="list-disc list-inside ml-4">
              {Object.entries(documentStats.breakdown).map(([status, count]) => (
                <li key={status}>{status}: <span className="font-medium">{count}</span></li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {workflowEfficiency && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Workflow Efficiency</h3>
          <p className="text-gray-700">Active Workflows: <span className="font-medium">{workflowEfficiency.activeCount}</span></p>
          <p className="text-gray-700">Completed Workflows: <span className="font-medium">{workflowEfficiency.completedCount}</span></p>
          <p className="text-gray-700">Average Processing Time (minutes): <span className="font-medium">{workflowEfficiency.avgProcessingTimeMinutes !== null ? workflowEfficiency.avgProcessingTimeMinutes : 'N/A'}</span></p>
        </div>
      )}

      {!documentStats && !workflowEfficiency && (
        <p className="text-gray-600">No report data available for this user.</p>
      )}
    </div>
  );
};

export default DocumentStatsDashboard;