import React from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Clock,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardBody } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { EmptyState } from './ui/empty-state';

interface ActivityItem {
  id: string;
  type: 'upload' | 'extracted' | 'validation' | 'failed' | 'finalized';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface WorkflowActivityProps {
  activities?: ActivityItem[];
  loading?: boolean;
}

const WorkflowActivity: React.FC<WorkflowActivityProps> = ({ activities = [], loading = false }) => {
  const getIcon = (type: string, status: string) => {
    if (status === 'error') return <XCircle className="h-4 w-4 text-rose-600" />;
    if (status === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    switch (type) {
      case 'upload':
        return <Upload className="h-4 w-4 text-blue-600" />;
      case 'extracted':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'finalized':
        return <FileCheck className="h-4 w-4 text-emerald-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  const getRowBg = (status: string) => {
    switch (status) {
      case 'error':
        return 'bg-rose-50/50';
      case 'warning':
        return 'bg-amber-50/50';
      case 'success':
        return 'bg-emerald-50/30';
      default:
        return 'bg-white';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
        </CardHeader>
        <CardBody>
          <EmptyState
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="No activity yet"
            description="Processed documents and workflow events will appear here."
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
      </CardHeader>
      <CardBody>
        <div className="divide-y divide-slate-100">
          {activities.map((item) => (
            <div key={item.id} className={`py-3 flex items-start gap-3 ${getRowBg(item.status)}`}>
              <div className="mt-0.5 shrink-0">{getIcon(item.type, item.status)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{item.timestamp}</span>
            </div>
          ))}
        </div>
        {activities.length > 0 && (
          <div className="pt-2.5 mt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm">
              View all activity
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default WorkflowActivity;
