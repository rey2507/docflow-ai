import React from 'react';
import {
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from './ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, iconBg }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between gap-2 sm:gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[0.6875rem] sm:text-xs font-medium text-slate-500 mb-0.5 sm:mb-1">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">{value}</p>
        {subtitle && <p className="text-[0.625rem] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-tight">{subtitle}</p>}
      </div>
      <div className={`rounded-lg p-2 sm:p-2.5 shrink-0 ${iconBg} transition-transform group-hover:scale-105`}>
        {icon}
      </div>
    </div>
  </div>
);

interface DashboardOverviewProps {
  stats: {
    total: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
      <StatsCard
        title="Total Documents"
        value={stats.total}
        icon={<FileText className="h-5 w-5 text-slate-600" />}
        iconBg="bg-slate-100"
      />
      <StatsCard
        title="Processing"
        value={stats.processing}
        subtitle={stats.processing > 0 ? 'Active workflows' : 'All caught up'}
        icon={<Loader2 className={`h-5 w-5 ${stats.processing > 0 ? 'text-blue-600 animate-spin' : 'text-slate-400'}`} />}
        iconBg={stats.processing > 0 ? 'bg-blue-50' : 'bg-slate-100'}
      />
      <StatsCard
        title="Completed"
        value={stats.completed}
        icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        iconBg="bg-emerald-50"
      />
      <StatsCard
        title="Failed"
        value={stats.failed}
        icon={<AlertTriangle className="h-5 w-5 text-rose-600" />}
        iconBg="bg-rose-50"
      />
    </div>
  );
};

export default DashboardOverview;
export { StatsCard };
