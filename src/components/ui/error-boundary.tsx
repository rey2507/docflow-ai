import React from 'react';
import { cn } from '../../lib/utils';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onReset?: () => void;
}

const DefaultErrorFallback = ({ error, reset }: { error: Error; reset: () => void }) => (
  <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
    <h3 className="text-sm font-semibold text-rose-900 mb-2">Something went wrong</h3>
    <p className="text-xs text-rose-700 mb-4">{error.message || 'An unexpected error occurred'}</p>
    <button
      type="button"
      onClick={reset}
      className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors"
    >
      Try again
    </button>
  </div>
);

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    const { hasError, error } = this.state;

    if (hasError && error) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={error} reset={this.resetError} />;
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
export type { ErrorBoundaryProps, ErrorBoundaryState };