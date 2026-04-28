'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils/cn';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  size = 'md',
  disabled,
  className,
}: SwitchProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-brand-600' : 'bg-[var(--bg-hover)]',
          size === 'sm' ? 'h-4 w-7' : 'h-5 w-9'
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block rounded-full bg-white shadow-lg ring-0',
            'transition-transform duration-200 ease-in-out',
            size === 'sm'
              ? cn('h-3 w-3', checked ? 'translate-x-3' : 'translate-x-0')
              : cn('h-4 w-4', checked ? 'translate-x-4' : 'translate-x-0')
          )}
        />
      </SwitchPrimitive.Root>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
          )}
          {description && (
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
