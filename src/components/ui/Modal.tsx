'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const SIZE_CLASSES = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[95vw] w-full',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]',
            'shadow-2xl shadow-black/50 animate-slide-up',
            'focus:outline-none',
            SIZE_CLASSES[size],
            className
          )}
        >
          {(title || description) && (
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[var(--border)]">
              <div>
                {title && (
                  <Dialog.Title className="text-base font-semibold text-[var(--text-primary)]">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="overflow-y-auto max-h-[85vh]">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
