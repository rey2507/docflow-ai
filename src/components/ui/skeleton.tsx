import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'card';
  animate?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = 'rectangular', animate = true, className, ...props }, ref) => {
    const baseClasses = 'bg-slate-200';
    const animationClasses = animate ? 'animate-pulse' : '';

    const variantClasses = {
      rectangular: 'rounded',
      circular: 'rounded-full',
      card: 'rounded-2xl',
    };

    return (
      <div
        ref={ref}
        className={cn(baseClasses, animationClasses, variantClasses[variant], className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';

const SkeletonCard = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
  </div>
);

const SkeletonTable = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-4 py-3 border-b border-slate-100">
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex items-center gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" style={{ maxWidth: `${120 + j * 20}px` }} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export { Skeleton, SkeletonCard, SkeletonTable };
export type { SkeletonProps };