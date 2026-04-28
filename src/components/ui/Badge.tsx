import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, color = '#6b7280', className, dot }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', className)}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  );
}

const LABEL_COLORS: Record<string, string> = {
  'Work':             '#5a78f2',
  'Action Required':  '#ef4444',
  'Newsletter':       '#8b5cf6',
  'Finance':          '#f59e0b',
  'Invoice':          '#f59e0b',
  'Receipt':          '#10b981',
  'Personal':         '#ec4899',
  'Notification':     '#6b7280',
  'Social':           '#3b82f6',
  'FYI':              '#14b8a6',
  'Meeting':          '#f97316',
  'Shopping':         '#84cc16',
  'Travel':           '#06b6d4',
  'Promotion':        '#a855f7',
};

export function LabelBadge({ label }: { label: string }) {
  const color = LABEL_COLORS[label] ?? '#6b7280';
  return <Badge color={color}>{label}</Badge>;
}
