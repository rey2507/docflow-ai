import React, { useEffect, useState } from 'react';
import { ReportService } from '../services/reports/report.service';
import DocumentStatsDashboard from '../components/DocumentStatsDashboard';

interface ReportsPageProps {
  userId: string;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ userId }) => {
  const [stats, setStats] = useState<{ total: number; breakdown: Record<string, number> } | null>(null);
  const [efficiency, setEfficiency] = useState<{ activeCount: number; completedCount: number; avgProcessingTimeMinutes: number | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, efficiencyRes] = await Promise.all([
          ReportService.getUserDocumentStats(userId),
          ReportService.getWorkflowEfficiency(userId),
        ]);

        if (statsRes.error) throw statsRes.error;
        if (efficiencyRes.error) throw efficiencyRes.error;

        setStats(statsRes.data);
        setEfficiency(efficiencyRes.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-5xl">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-48 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Reports</h2>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p className="text-sm font-semibold text-rose-900">Unable to load reports</p>
          <p className="mt-1 text-sm text-rose-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
        <p className="mt-1 text-sm text-slate-600">
          Document processing statistics and workflow efficiency metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Document Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total documents</span>
              <span className="text-3xl font-bold text-slate-900">{stats?.total ?? 0}</span>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Status breakdown</p>
              <div className="space-y-2">
                {stats?.breakdown && Object.keys(stats.breakdown).length > 0 ? (
                  Object.entries(stats.breakdown).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-slate-700">{status}</span>
                      <span className="font-semibold text-slate-900">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No documents yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Workflow Efficiency</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Active workflows</span>
              <span className="text-3xl font-bold text-slate-900">{efficiency?.activeCount ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Completed workflows</span>
              <span className="text-3xl font-bold text-slate-900">{efficiency?.completedCount ?? 0}</span>
            </div>
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-sm text-slate-600">Avg processing time</span>
              <span className="text-lg font-semibold text-slate-900">
                {efficiency?.avgProcessingTimeMinutes != null
                  ? `${efficiency.avgProcessingTimeMinutes} min`
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
