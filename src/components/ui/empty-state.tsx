import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 text-center shadow-sm sm:p-8',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 shadow-inner">
            {icon}
          </div>
        )}
        <p className="text-base font-semibold tracking-tight text-slate-900">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
        {action && (
          <Button
            variant={action.variant || 'secondary'}
            size="sm"
            onClick={action.onClick}
            className="mt-5"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

interface ErrorStateProps {
  title?: string;
  message?: string;
  errorCode?: string;
  onReport?: () => void;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ title = 'Something went wrong', message = 'Unable to process your request. Please try again.', errorCode, onReport }, ref) => {
    return (
      <div
        ref={ref}
        className="rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-center shadow-sm"
      >
        <p className="text-sm font-semibold text-rose-800">{title}</p>
        <p className="mt-1 text-xs text-rose-700">{message}</p>
        {onReport && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onReport}
            className="mt-3"
          >
            Send report
          </Button>
        )}
      </div>
    );
  }
);
ErrorState.displayName = 'ErrorState';

export { EmptyState, ErrorState };
export type { EmptyStateProps, ErrorStateProps };