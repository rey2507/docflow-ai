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
  const defaultActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'finalized',
      title: 'Invoice_2024_001.pdf finalized',
      description: 'Document passed all validation checks',
      timestamp: '2 min ago',
      status: 'success',
    },
    {
      id: '2',
      type: 'extracted',
      title: 'Contract_v2.png extraction completed',
      description: 'AI extracted 12 fields with 94% confidence',
      timestamp: '15 min ago',
      status: 'success',
    },
    {
      id: '3',
      type: 'validation',
      title: 'Receipt_March.pdf validation warning',
      description: '2 fields need manual review',
      timestamp: '1 hour ago',
      status: 'warning',
    },
    {
      id: '4',
      type: 'failed',
      title: 'Scan_2024.tif processing failed',
      description: 'OCR could not read scanned document',
      timestamp: '3 hours ago',
      status: 'error',
    },
  ];

  const items = activities.length > 0 ? activities : defaultActivities;

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

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
      </CardHeader>
      <CardBody>
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
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
        {items.length > 0 && (
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
