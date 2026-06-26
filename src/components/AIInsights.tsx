import React from 'react';
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

  const usageBarStyle: React.CSSProperties = {
    height: '100%',
    width: `${Math.min(100, usagePct)}%`,
    backgroundColor: '#8b5cf6',
    borderRadius: '9999px',
    transition: 'width 0.3s ease',
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-slate-900">AI Insights</h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-violet-50">
                  <Zap className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <span className="text-xs font-medium text-slate-700">Monthly Usage</span>
              </div>
              <span className="text-xs font-medium text-slate-900">
                {usage.used} / {usage.limit}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div style={usageBarStyle} />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{usagePct}% of monthly limit used</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-medium text-slate-500">Success rate</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{successRate}%</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[11px] font-medium text-slate-500">Avg confidence</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{Math.round(avgConfidence * 100)}%</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                <span className="text-[11px] font-medium text-slate-500">Failed</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{failedCount}</p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AIInsights;
