'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, ChevronDown, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/app-store';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ModelCard } from './ModelCard';
import {
  filterModels, isCacheExpired, CATEGORY_LABELS, ALL_CATEGORIES,
  parseOpenRouterModels,
} from '@/lib/ai/openrouter';
import type { ModelCategory, AIModel } from '@/types';

export function ModelBrowser() {
  const {
    modelBrowserOpen, setModelBrowserOpen,
    models, setModels, setModelsLastFetched, modelsLastFetched,
    modelSearchQuery, setModelSearch,
    modelCategory, setModelCategory,
    favoriteModelIds,
    selectedModelId, selectModel,
    isLoadingModels, setLoadingModels,
  } = useAppStore();

  const [error, setError] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState<string>('all');

  // Fetch models on open if cache is stale
  useEffect(() => {
    if (!modelBrowserOpen) return;
    if (!isCacheExpired(modelsLastFetched) && models.length > 0) return;
    fetchModels();
  }, [modelBrowserOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchModels = async () => {
    setLoadingModels(true);
    setError(null);
    try {
      // In Capacitor (no server) fetch OpenRouter directly; in web use proxy.
      const url =
        typeof window !== 'undefined' &&
        (window as unknown as { Capacitor?: { isNative?: boolean } }).Capacitor?.isNative
          ? 'https://openrouter.ai/api/v1/models'
          : '/api/models/openrouter';
      const res = await fetch(url, {
        headers: url.startsWith('https://openrouter')
          ? { 'HTTP-Referer': 'https://openmail.app', 'X-Title': 'OpenMail' }
          : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { data: Parameters<typeof parseOpenRouterModels>[0] };
      const parsed = parseOpenRouterModels(data.data ?? []);
      setModels(parsed);
      setModelsLastFetched(Date.now());
    } catch (e) {
      setError('Failed to load models. Using cached data if available.');
      console.error(e);
    } finally {
      setLoadingModels(false);
    }
  };

  // Derive unique providers from current models
  const providers = useMemo(() => {
    const provSet = new Set(models.map((m) => m.provider));
    return ['all', ...Array.from(provSet).sort()];
  }, [models]);

  const filtered = useMemo(() => {
    let list = filterModels(models, modelCategory, modelSearchQuery, favoriteModelIds);
    if (providerFilter !== 'all') {
      list = list.filter((m) => m.provider === providerFilter);
    }
    return list;
  }, [models, modelCategory, modelSearchQuery, favoriteModelIds, providerFilter]);

  const currentModel = models.find((m) => m.id === selectedModelId);

  const handleSelect = (model: AIModel) => {
    selectModel(model.id);
    setModelBrowserOpen(false);
  };

  return (
    <Modal
      open={modelBrowserOpen}
      onClose={() => setModelBrowserOpen(false)}
      title="Model Browser"
      description={`${models.length} models available${currentModel ? ` · Active: ${currentModel.name}` : ''}`}
      size="full"
      className="max-h-[90vh]"
    >
      <div className="flex flex-col h-full" style={{ maxHeight: 'calc(90vh - 72px)' }}>
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              placeholder="Search models…"
              value={modelSearchQuery}
              onChange={(e) => setModelSearch(e.target.value)}
              className={cn(
                'w-full pl-8 pr-3 py-2 text-sm rounded-lg',
                'bg-[var(--bg-tertiary)] border border-[var(--border)]',
                'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                'focus:outline-none focus:border-brand-500/60'
              )}
            />
          </div>

          {/* Provider filter */}
          <div className="relative">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className={cn(
                'appearance-none pl-3 pr-7 py-2 text-sm rounded-lg cursor-pointer',
                'bg-[var(--bg-tertiary)] border border-[var(--border)]',
                'text-[var(--text-primary)] focus:outline-none focus:border-brand-500/60'
              )}
            >
              {providers.slice(0, 20).map((p) => (
                <option key={p} value={p}>
                  {p === 'all' ? 'All Providers' : p}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            loading={isLoadingModels}
            onClick={fetchModels}
          >
            <RefreshCw size={13} />
            {isLoadingModels ? 'Fetching…' : 'Refresh'}
          </Button>
        </div>

        {/* Category tabs */}
        <div className="px-5 py-2 border-b border-[var(--border)] overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {ALL_CATEGORIES.map((cat) => {
              const count = cat === 'favorites'
                ? favoriteModelIds.length
                : cat === 'all'
                ? models.length
                : models.filter((m) => m.categories.includes(cat)).length;

              return (
                <button
                  key={cat}
                  onClick={() => setModelCategory(cat as ModelCategory)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                    modelCategory === cat
                      ? 'bg-brand-600 text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  )}
                >
                  {CATEGORY_LABELS[cat as ModelCategory]}
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] px-1',
                      modelCategory === cat ? 'bg-white/20' : 'bg-[var(--bg-hover)]'
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Model grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoadingModels && models.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <p className="text-sm text-[var(--text-secondary)]">
                Fetching models from OpenRouter…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Bot size={32} className="text-[var(--text-muted)]" />
              <p className="text-sm text-[var(--text-secondary)] font-medium">No models found</p>
              <p className="text-xs text-[var(--text-muted)]">Try a different search or category</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--text-muted)] mb-3">
                {filtered.length} model{filtered.length !== 1 ? 's' : ''}
                {modelSearchQuery && ` matching "${modelSearchQuery}"`}
              </p>
              <div className="model-card-grid">
                {filtered.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer: active model */}
        {currentModel && (
          <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg-tertiary)]">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-brand-400" />
              <span className="text-xs text-[var(--text-secondary)]">Active model:</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {currentModel.name}
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setModelBrowserOpen(false)}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
