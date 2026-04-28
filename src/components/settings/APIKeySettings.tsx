'use client';

import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, CheckCircle, XCircle, ExternalLink, Key } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/app-store';
import { AI_PROVIDERS } from '@/lib/ai/providers';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { format } from 'date-fns';
import type { ProviderId } from '@/types';

function ProviderBadge({ providerId }: { providerId: ProviderId }) {
  const p = AI_PROVIDERS.find((x) => x.id === providerId);
  if (!p) return null;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${p.color}20`, color: p.color, border: `1px solid ${p.color}30` }}
    >
      {p.name}
    </span>
  );
}

function AddKeyForm({ onAdd }: { onAdd: () => void }) {
  const { addKey } = useAppStore();
  const [providerId, setProviderId] = useState<ProviderId>('openrouter');
  const [key, setKey] = useState('');
  const [label, setLabel] = useState('');
  const [limitUsd, setLimitUsd] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);

  const provider = AI_PROVIDERS.find((p) => p.id === providerId)!;

  const testKey = async () => {
    if (!key.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, key }),
      });
      setTestResult(res.ok ? 'ok' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  };

  const handleAdd = () => {
    if (!key.trim()) return;
    addKey({
      providerId,
      key: key.trim(),
      label: label.trim() || provider.name,
      usageLimitUsd: limitUsd ? parseFloat(limitUsd) : undefined,
      isActive: true,
    });
    setKey('');
    setLabel('');
    setLimitUsd('');
    setTestResult(null);
    onAdd();
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Add New API Key</h3>

      {/* Provider selector */}
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Provider</label>
        <div className="grid grid-cols-3 gap-2">
          {AI_PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setProviderId(p.id)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all',
                providerId === p.id
                  ? 'border-[color:var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              <span
                className="w-5 h-5 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Key input */}
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          API Key
          <a
            href={provider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-[var(--accent)] hover:underline inline-flex items-center gap-0.5"
          >
            Get key <ExternalLink size={10} />
          </a>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder={provider.keyPlaceholder}
              value={key}
              onChange={(e) => { setKey(e.target.value); setTestResult(null); }}
              className={cn(
                'w-full px-3 py-2 pr-9 text-sm rounded-lg border bg-[var(--bg-secondary)]',
                'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none focus:border-brand-500/60',
                'transition-colors',
                testResult === 'ok' ? 'border-emerald-500/60' : testResult === 'fail' ? 'border-red-500/60' : 'border-[var(--border)]'
              )}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <Button
            variant="outline"
            size="md"
            loading={testing}
            disabled={!key.trim()}
            onClick={testKey}
            className="shrink-0"
          >
            {testResult === 'ok' ? (
              <CheckCircle size={13} className="text-emerald-400" />
            ) : testResult === 'fail' ? (
              <XCircle size={13} className="text-red-400" />
            ) : (
              'Test'
            )}
          </Button>
        </div>
        {testResult === 'ok' && (
          <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle size={10} /> Key is valid
          </p>
        )}
        {testResult === 'fail' && (
          <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
            <XCircle size={10} /> Invalid key or request failed
          </p>
        )}
      </div>

      {/* Label + limit */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Label (optional)</label>
          <input
            type="text"
            placeholder={provider.name}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-brand-500/60"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Spend limit (USD)</label>
          <input
            type="number"
            placeholder="No limit"
            value={limitUsd}
            onChange={(e) => setLimitUsd(e.target.value)}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-brand-500/60"
          />
        </div>
      </div>

      <Button variant="primary" size="md" disabled={!key.trim()} onClick={handleAdd} className="w-full">
        <Plus size={14} />
        Add Key
      </Button>
    </div>
  );
}

export function APIKeySettings() {
  const { apiKeys, removeKey, setKeyActive } = useAppStore();
  const [showForm, setShowForm] = useState(apiKeys.length === 0);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleVisible = (id: string) => {
    setVisibleKeys((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="text-base font-bold text-[var(--text-primary)]">API Keys</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Keys are stored in your browser and never sent to our servers. They are used directly to call AI provider APIs.
        </p>
      </div>

      {/* Existing keys */}
      {apiKeys.length > 0 && (
        <div className="space-y-2">
          {apiKeys.map((k) => {
            const isVisible = visibleKeys.has(k.id);
            const maskedKey = k.key.slice(0, 8) + '•••••••••' + k.key.slice(-4);
            const usagePct = k.usageLimitUsd ? (k.currentUsageUsd / k.usageLimitUsd) * 100 : null;

            return (
              <div
                key={k.id}
                className={cn(
                  'rounded-xl border p-4 transition-colors',
                  k.isActive ? 'border-[var(--border)] bg-[var(--bg-tertiary)]' : 'border-[var(--border)] bg-[var(--bg-secondary)] opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ProviderBadge providerId={k.providerId} />
                      <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {k.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-muted)]">
                      <span>{isVisible ? k.key : maskedKey}</span>
                      <button onClick={() => toggleVisible(k.id)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                        {isVisible ? <EyeOff size={11} /> : <Eye size={11} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                      <span>Added {format(new Date(k.addedAt), 'MMM d')}</span>
                      <span>{k.tokenCount.toLocaleString()} tokens</span>
                      <span className={k.currentUsageUsd > 0 ? 'text-[var(--text-secondary)]' : ''}>
                        ${k.currentUsageUsd.toFixed(4)} used
                      </span>
                      {k.usageLimitUsd && <span>/ ${k.usageLimitUsd} limit</span>}
                    </div>
                    {usagePct !== null && (
                      <div className="mt-2">
                        <div className="h-1 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              usagePct > 80 ? 'bg-red-500' : usagePct > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(usagePct, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch size="sm" checked={k.isActive} onCheckedChange={(v) => setKeyActive(k.id, v)} />
                    <button
                      onClick={() => removeKey(k.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add key form */}
      {showForm ? (
        <AddKeyForm onAdd={() => setShowForm(false)} />
      ) : (
        <Button variant="outline" size="md" onClick={() => setShowForm(true)}>
          <Plus size={14} />
          Add API Key
        </Button>
      )}

      {apiKeys.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-3">
            <Key size={20} className="text-[var(--text-muted)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">No API keys yet</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Add a key to start using AI features</p>
        </div>
      )}
    </div>
  );
}
