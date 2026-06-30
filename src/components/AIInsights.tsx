import React, { useState } from 'react';
import { Zap, Activity, BarChart3, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardBody } from './ui/card';

interface AIInsightsProps {
  usage?: { used: number; limit: number };
  successRate?: number;
  avgConfidence?: number;
  failedCount?: number;
}

const AIInsights: React.FC<AIInsightsProps> = ({
  usage = { used: 0, limit: 0 },
  successRate = 0,
  avgConfidence = 0,
  failedCount = 0,
}) => {
  const usagePct = Math.round((usage.used / Math.max(1, usage.limit)) * 100);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const toggleDetails = () => setDetailsOpen((open) => !open);

  return (
    <Card>
      <CardHeader className="px-4 py-3 sm:px-6">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          onClick={toggleDetails}
          aria-controls="ai-insights-details"
        >
          <h3 className="text-sm font-semibold text-slate-900">AI Insights</h3>
          <span className="text-[11px] font-medium text-slate-500 sm:hidden">
            {detailsOpen ? 'Hide' : 'Show'}
          </span>
        </button>
      </CardHeader>
      <CardBody className="px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-violet-50 p-1.5">
                  <Zap className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <span className="text-xs font-medium text-slate-700">Monthly Usage</span>
              </div>
              <span className="text-xs font-medium text-slate-900 sm:text-right">
                {usage.used} / {usage.limit}
              </span>
            </div>
            <progress
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-slate-100 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-violet-600 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-violet-600"
              max={100}
              value={Math.min(100, usagePct)}
            />
            <p className="mt-1 text-[11px] text-slate-500">{usagePct}% of monthly limit used</p>
          </div>

          <div
            id="ai-insights-details"
            className={`${detailsOpen ? 'grid' : 'hidden'} grid-cols-1 gap-2 sm:grid sm:grid-cols-3 sm:gap-3`}
          >
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-medium text-slate-500">Success rate</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{successRate}%</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[11px] font-medium text-slate-500">Avg confidence</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{Math.round(avgConfidence * 100)}%</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                <span className="text-[11px] font-medium text-slate-500">Failed</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{failedCount}</p>
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 sm:hidden"
            onClick={toggleDetails}
          >
            {detailsOpen ? 'Collapse metrics' : 'View metrics'}
          </button>
        </div>
      </CardBody>
    </Card>
  );
};

export default AIInsights;
