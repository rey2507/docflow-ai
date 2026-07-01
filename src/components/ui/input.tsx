import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  inline?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, inline, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    const wrapperClasses = inline ? 'flex-1 min-w-0' : 'space-y-1.5';

    return (
      <div className={wrapperClasses}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition-colors',
            'focus:border-slate-900 focus:ring-4 focus:ring-slate-100',
            'disabled:bg-slate-50 disabled:text-slate-500 placeholder:text-slate-400',
            error && 'border-rose-600 focus:border-rose-600',
            inline && 'h-9',
            className
          )}
          {...props}
        />
        {!inline && helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
        {!inline && error && (
          <p className="text-xs text-rose-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface SearchInputProps extends Omit<InputProps, 'type' | 'label'> {
  label?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <Input
          ref={ref}
          type="search"
          className={cn('pl-9', className)}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { Input, SearchInput };
export type { InputProps, SearchInputProps };