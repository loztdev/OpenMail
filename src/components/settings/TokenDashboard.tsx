'use client';

import { useMemo } from 'react';
import { Trash2, TrendingUp, Zap, DollarSign, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/app-store';
import { Button } from '@/components/ui/Button';

const ACTION_COLORS: Record<string, string> = {
  summarize: '#5a78f2',
  draft:     '#10b981',
  digest:    '#f59e0b',
  classify:  '#8b5cf6',
  search:    '#ec4899',
  chat:      '#06b6d4',
};

export function TokenDashboard() {
  const { usageRecords, clearUsageHistory, totalCostUsd, todayCostUsd } = useAppStore();

  const stats = useMemo(() => {
    const total = usageRecords.reduce((s, r) => s + r.totalTokens, 0);
    const prompt = usageRecords.reduce((s, r) => s + r.promptTokens, 0);
    const completion = usageRecords.reduce((s, r) => s + r.completionTokens, 0);

    // Usage by action
    const byAction: Record<string, { tokens: number; cost: number; count: number }> = {};
    for (const r of usageRecords) {
      if (!byAction[r.action]) byAction[r.action] = { tokens: 0, cost: 0, count: 0 };
      byAction[r.action].tokens += r.totalTokens;
      byAction[r.action].cost += r.costUsd;
      byAction[r.action].count += 1;
    }

    // Usage by model
    const byModel: Record<string, { tokens: number; cost: number }> = {};
    for (const r of usageRecords) {
      if (!byModel[r.model]) byModel[r.model] = { tokens: 0, cost: 0 };
      byModel[r.model].tokens += r.totalTokens;
      byModel[r.model].cost += r.costUsd;
    }

    return { total, prompt, completion, byAction, byModel };
  }, [usageRecords]);

  const StatCard = ({
    label, value, sub, icon: Icon, color,
  }: {
    label: string; value: string; sub?: string;
    icon: React.ElementType; color: string;
  }) => (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[var(--text-muted)] font-medium">{label}</span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-6 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Usage & Cost</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {usageRecords.length} API calls tracked locally
          </p>
        </div>
        {usageRecords.length > 0 && (
          <Button variant="danger" size="sm" onClick={clearUsageHistory}>
            <Trash2 size={13} /> Clear History
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Cost"
          value={`$${totalCostUsd().toFixed(4)}`}
          sub="all time"
          icon={DollarSign}
          color="#f59e0b"
        />
        <StatCard
          label="Today's Cost"
          value={`$${todayCostUsd().toFixed(4)}`}
          sub={format(new Date(), 'MMM d')}
          icon={TrendingUp}
          color="#5a78f2"
        />
        <StatCard
          label="Total Tokens"
          value={stats.total.toLocaleString()}
          sub={`${stats.prompt.toLocaleString()} in / ${stats.completion.toLocaleString()} out`}
          icon={Zap}
          color="#10b981"
        />
        <StatCard
          label="API Calls"
          value={usageRecords.length.toString()}
          sub="requests made"
          icon={BarChart3}
          color="#8b5cf6"
        />
      </div>

      {/* Usage by action */}
      {Object.keys(stats.byAction).length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Usage by Action
          </h3>
          <div className="space-y-2.5">
            {Object.entries(stats.byAction)
              .sort((a, b) => b[1].tokens - a[1].tokens)
              .map(([action, data]) => {
                const pct = stats.total > 0 ? (data.tokens / stats.total) * 100 : 0;
                const color = ACTION_COLORS[action] ?? '#6b7280';
                return (
                  <div key={action}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium capitalize text-[var(--text-secondary)]">
                        {action}
                        <span className="ml-1.5 text-[var(--text-muted)]">({data.count}×)</span>
                      </span>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span>{data.tokens.toLocaleString()} tok</span>
                        <span className="text-[var(--text-secondary)]">${data.cost.toFixed(4)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Usage by model */}
      {Object.keys(stats.byModel).length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Usage by Model
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.byModel)
              .sort((a, b) => b[1].cost - a[1].cost)
              .slice(0, 8)
              .map(([model, data]) => (
                <div key={model} className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)] truncate flex-1 mr-4" title={model}>
                    {model.split('/').pop() ?? model}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] shrink-0">
                    <span>{data.tokens.toLocaleString()}</span>
                    <span className="text-[var(--text-secondary)] w-16 text-right">${data.cost.toFixed(4)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent requests */}
      {usageRecords.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Recent Requests
          </h3>
          <div className="space-y-2">
            {usageRecords.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: ACTION_COLORS[r.action] ?? '#6b7280' }}
                  />
                  <span className="text-xs font-medium capitalize text-[var(--text-secondary)]">{r.action}</span>
                  <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[120px]">
                    {r.model.split('/').pop()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)] shrink-0">
                  <span>{r.totalTokens.toLocaleString()} tok</span>
                  <span>${r.costUsd.toFixed(4)}</span>
                  <span>{format(new Date(r.timestamp), 'h:mm a')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {usageRecords.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart3 size={32} className="text-[var(--text-muted)] mb-3" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">No usage data yet</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Usage stats appear here after you use AI features
          </p>
        </div>
      )}
    </div>
  );
}
