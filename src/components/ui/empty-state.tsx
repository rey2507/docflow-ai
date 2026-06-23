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
  };
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border-dashed border-slate-300 bg-slate-50 p-8 text-center',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mx-auto mb-4 h-12 w-12 text-slate-400">
            {icon}
          </div>
        )}
        <p className="text-sm font-medium text-slate-900">{title}</p>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
        {action && (
          <Button
            variant="secondary"
            size="sm"
            onClick={action.onClick}
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };
export type { EmptyStateProps };