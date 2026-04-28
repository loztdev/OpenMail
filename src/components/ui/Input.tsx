'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, suffix, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center rounded-md border bg-[var(--bg-tertiary)] border-[var(--border)]',
            'focus-within:border-brand-500/60 focus-within:ring-1 focus-within:ring-brand-500/20',
            'transition-colors',
            error && 'border-red-500/60 focus-within:border-red-500/60 focus-within:ring-red-500/20'
          )}
        >
          {prefix && (
            <span className="pl-3 text-[var(--text-muted)] shrink-0">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex-1 min-w-0 px-3 py-2 text-sm bg-transparent text-[var(--text-primary)]',
              'placeholder:text-[var(--text-muted)] outline-none',
              prefix && 'pl-2',
              suffix && 'pr-2',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="pr-3 text-[var(--text-muted)] shrink-0">{suffix}</span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 rounded-md border bg-[var(--bg-tertiary)] border-[var(--border)]',
            'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/20',
            'resize-none transition-colors',
            error && 'border-red-500/60',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
