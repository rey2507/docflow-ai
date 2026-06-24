import React from 'react';
import { cn } from '../../lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'narrow' | 'medium';
}

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const variantClasses = {
      default: 'max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8',
      narrow: 'max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8',
      medium: 'max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8',
    };

    return (
      <div ref={ref} className={cn(variantClasses[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);
PageContainer.displayName = 'PageContainer';

interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg';
}

const SectionContainer = React.forwardRef<HTMLDivElement, SectionContainerProps>(
  ({ spacing = 'md', className, children, ...props }, ref) => {
    const spacingClasses = {
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
    };

    return (
      <div ref={ref} className={cn(spacingClasses[spacing], className)} {...props}>
        {children}
      </div>
    );
  }
);
SectionContainer.displayName = 'SectionContainer';

export { PageContainer, SectionContainer };
export type { PageContainerProps, SectionContainerProps };