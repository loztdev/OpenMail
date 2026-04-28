'use client';

import { Star, Zap, Eye, BookOpen, Code2, Brain, Unlock, Gift } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/app-store';
import { formatPrice, formatContext } from '@/lib/ai/openrouter';
import { getProviderDisplay } from '@/lib/ai/client';
import { Tooltip } from '@/components/ui/Tooltip';
import type { AIModel } from '@/types';

const CAT_ICONS: Record<string, React.ReactNode> = {
  fast:         <Zap size={10} />,
  vision:       <Eye size={10} />,
  'long-context': <BookOpen size={10} />,
  coding:       <Code2 size={10} />,
  reasoning:    <Brain size={10} />,
  uncensored:   <Unlock size={10} />,
  free:         <Gift size={10} />,
};

interface ModelCardProps {
  model: AIModel;
  onSelect?: (model: AIModel) => void;
  compact?: boolean;
}

export function ModelCard({ model, onSelect, compact }: ModelCardProps) {
  const { selectedModelId, selectModel, toggleFavorite } = useAppStore();
  const isSelected = selectedModelId === model.id;
  const providerInfo = getProviderDisplay(model.provider);

  const handleSelect = () => {
    if (onSelect) {
      onSelect(model);
    } else {
      selectModel(model.id);
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={cn(
        'relative flex flex-col gap-2.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-150',
        'hover:border-brand-500/40 hover:bg-[var(--bg-tertiary)]',
        isSelected
          ? 'border-brand-500/60 bg-[var(--accent-subtle)]'
          : 'border-[var(--border)] bg-[var(--bg-secondary)]',
        compact && 'p-2.5 gap-2'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: providerInfo.color }}
            />
            <span className="text-[10px] text-[var(--text-muted)] truncate">
              {providerInfo.label}
            </span>
          </div>
          <p className={cn(
            'font-semibold text-[var(--text-primary)] leading-snug truncate',
            compact ? 'text-xs' : 'text-sm'
          )}>
            {model.name}
          </p>
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(model.id); }}
          className={cn(
            'shrink-0 p-1 rounded-md transition-colors',
            model.isFavorite
              ? 'text-yellow-400'
              : 'text-[var(--text-muted)] hover:text-yellow-400 hover:bg-[var(--bg-hover)]'
          )}
        >
          <Star size={13} fill={model.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Description */}
      {!compact && model.description && (
        <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
          {model.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center gap-3 text-[11px]">
        <Tooltip content="Context window">
          <span className="text-[var(--text-secondary)]">
            📐 {formatContext(model.contextLength)}
          </span>
        </Tooltip>
        <Tooltip content="Input price per 1M tokens">
          <span className={cn(
            model.pricing.prompt === 0 ? 'text-emerald-400' : 'text-[var(--text-secondary)]'
          )}>
            ↑ {formatPrice(model.pricing.prompt)}
          </span>
        </Tooltip>
        <Tooltip content="Output price per 1M tokens">
          <span className={cn(
            model.pricing.completion === 0 ? 'text-emerald-400' : 'text-[var(--text-secondary)]'
          )}>
            ↓ {formatPrice(model.pricing.completion)}
          </span>
        </Tooltip>
      </div>

      {/* Category badges */}
      {model.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {model.categories
            .filter((c) => c !== 'all')
            .slice(0, compact ? 2 : 4)
            .map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-hover)] text-[var(--text-muted)]"
              >
                {CAT_ICONS[cat]}
                {cat}
              </span>
            ))}
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500" />
      )}
    </div>
  );
}
