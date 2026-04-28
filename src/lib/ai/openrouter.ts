import type { AIModel, ModelCategory, OpenRouterModelRaw } from '@/types';
import {
  POPULAR_MODEL_IDS,
  CODING_MODEL_IDS,
  FAST_MODEL_IDS,
  UNCENSORED_KEYWORDS,
  REASONING_MODEL_IDS,
} from './providers';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function deriveCategories(raw: OpenRouterModelRaw, createdCutoff: number): ModelCategory[] {
  const cats: ModelCategory[] = [];
  const idLower = raw.id.toLowerCase();
  const nameLower = raw.name.toLowerCase();

  if (POPULAR_MODEL_IDS.has(raw.id)) cats.push('popular');
  if (CODING_MODEL_IDS.has(raw.id)) cats.push('coding');
  if (FAST_MODEL_IDS.has(raw.id)) cats.push('fast');
  if (REASONING_MODEL_IDS.has(raw.id)) cats.push('reasoning');

  if (raw.created && raw.created > createdCutoff) cats.push('new');

  const pricingPrompt = parseFloat(raw.pricing?.prompt ?? '1');
  const pricingCompletion = parseFloat(raw.pricing?.completion ?? '1');
  if (pricingPrompt === 0 && pricingCompletion === 0) cats.push('free');

  const modalities = raw.architecture?.input_modalities ?? [];
  if (
    modalities.includes('image') ||
    idLower.includes('vision') ||
    idLower.includes('-vl') ||
    nameLower.includes('vision')
  ) {
    cats.push('vision');
  }

  if (raw.context_length > 100_000) cats.push('long-context');

  const isModerated = raw.top_provider?.is_moderated ?? true;
  const isUncensoredByName = UNCENSORED_KEYWORDS.some(
    (kw) => idLower.includes(kw) || nameLower.includes(kw)
  );
  if (!isModerated || isUncensoredByName) cats.push('uncensored');

  return cats;
}

export function parseOpenRouterModels(rawModels: OpenRouterModelRaw[]): AIModel[] {
  const thirtyDaysAgo = Date.now() / 1000 - 30 * 24 * 60 * 60;

  return rawModels
    .filter((m) => m.id && m.name)
    .map((raw) => {
      const promptPrice = parseFloat(raw.pricing?.prompt ?? '0') * 1_000_000;
      const completionPrice = parseFloat(raw.pricing?.completion ?? '0') * 1_000_000;
      const providerSlug = raw.id.split('/')[0] ?? raw.id;
      const categories = deriveCategories(raw, thirtyDaysAgo);

      return {
        id: raw.id,
        name: raw.name,
        provider: providerSlug,
        description: raw.description ?? '',
        contextLength: raw.context_length ?? 0,
        pricing: { prompt: promptPrice, completion: completionPrice },
        isFavorite: false,
        isModerated: raw.top_provider?.is_moderated ?? true,
        supportsVision: categories.includes('vision'),
        supportsReasoning: categories.includes('reasoning'),
        categories,
        createdAt: raw.created,
        architecture: raw.architecture?.tokenizer,
      } satisfies AIModel;
    })
    .sort((a, b) => {
      // Popular models first, then alphabetical within provider
      const aPopular = POPULAR_MODEL_IDS.has(a.id) ? 0 : 1;
      const bPopular = POPULAR_MODEL_IDS.has(b.id) ? 0 : 1;
      if (aPopular !== bPopular) return aPopular - bPopular;
      return a.name.localeCompare(b.name);
    });
}

export function filterModels(
  models: AIModel[],
  category: ModelCategory,
  search: string,
  favoriteIds: string[]
): AIModel[] {
  let filtered = models;

  if (category === 'favorites') {
    filtered = filtered.filter((m) => favoriteIds.includes(m.id));
  } else if (category !== 'all') {
    filtered = filtered.filter((m) => m.categories.includes(category));
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    );
  }

  return filtered;
}

export function isCacheExpired(lastFetched: number | null): boolean {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_TTL_MS;
}

export function formatPrice(pricePerMillion: number): string {
  if (pricePerMillion === 0) return 'Free';
  if (pricePerMillion < 0.01) return `$${(pricePerMillion * 1000).toFixed(3)}/1K`;
  if (pricePerMillion < 1) return `$${pricePerMillion.toFixed(3)}/1M`;
  return `$${pricePerMillion.toFixed(2)}/1M`;
}

export function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}K`;
  return String(tokens);
}

export const CATEGORY_LABELS: Record<ModelCategory, string> = {
  all: 'All Models',
  favorites: '★ Favorites',
  new: '🆕 New',
  popular: '🔥 Popular',
  uncensored: '🔓 Uncensored',
  free: '💚 Free',
  coding: '💻 Coding',
  fast: '⚡ Fast',
  vision: '👁 Vision',
  'long-context': '📜 Long Context',
  reasoning: '🧠 Reasoning',
};

export const ALL_CATEGORIES: ModelCategory[] = [
  'all', 'favorites', 'popular', 'new', 'free',
  'fast', 'coding', 'vision', 'long-context', 'reasoning', 'uncensored',
];
