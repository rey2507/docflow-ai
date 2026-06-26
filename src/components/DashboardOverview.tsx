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
  <Card>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`rounded-lg p-2 ${iconBg}`}>{icon}</div>
    </div>
  </Card>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatsCard
        title="Total Documents"
        value={stats.total}
        icon={<FileText className="h-4 w-4 text-slate-600" />}
        iconBg="bg-slate-100"
      />
      <StatsCard
        title="Processing"
        value={stats.processing}
        subtitle="Active workflows"
        icon={<Loader2 className="h-4 w-4 text-blue-600" />}
        iconBg="bg-blue-50"
      />
      <StatsCard
        title="Completed"
        value={stats.completed}
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        iconBg="bg-emerald-50"
      />
      <StatsCard
        title="Failed"
        value={stats.failed}
        icon={<AlertTriangle className="h-4 w-4 text-rose-600" />}
        iconBg="bg-rose-50"
      />
    </div>
  );
};

export default DashboardOverview;
export { StatsCard };
