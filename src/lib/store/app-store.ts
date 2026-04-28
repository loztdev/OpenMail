'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Email,
  APIKeyEntry,
  AIModel,
  AIPersona,
  AppSettings,
  TokenUsageRecord,
  ProviderId,
  ModelCategory,
} from '@/types';
import { BUILT_IN_PERSONAS, DEFAULT_SETTINGS } from '@/lib/ai/providers';

// ─── Email Slice ─────────────────────────────────────────────────────────────

interface EmailSlice {
  emails: Email[];
  selectedEmailId: string | null;
  selectedFolder: string;
  searchQuery: string;
  setEmails: (emails: Email[]) => void;
  selectEmail: (id: string | null) => void;
  setFolder: (folder: string) => void;
  setSearchQuery: (q: string) => void;
  markRead: (id: string) => void;
  toggleStar: (id: string) => void;
  updateEmailAI: (id: string, summary: string, labels: string[]) => void;
  moveToTrash: (id: string) => void;
}

// ─── AI Slice ────────────────────────────────────────────────────────────────

interface AISlice {
  models: AIModel[];
  favoriteModelIds: string[];
  selectedModelId: string;
  modelSearchQuery: string;
  modelCategory: ModelCategory;
  modelsLastFetched: number | null;
  activePersonaId: string;
  personas: AIPersona[];
  isLoadingModels: boolean;
  setModels: (models: AIModel[]) => void;
  toggleFavorite: (modelId: string) => void;
  selectModel: (id: string) => void;
  setModelSearch: (q: string) => void;
  setModelCategory: (cat: ModelCategory) => void;
  setModelsLastFetched: (ts: number) => void;
  setActivePersona: (id: string) => void;
  addPersona: (p: AIPersona) => void;
  updatePersona: (id: string, patch: Partial<AIPersona>) => void;
  deletePersona: (id: string) => void;
  setLoadingModels: (v: boolean) => void;
}

// ─── Keys Slice ──────────────────────────────────────────────────────────────

interface KeysSlice {
  apiKeys: APIKeyEntry[];
  addKey: (entry: Omit<APIKeyEntry, 'id' | 'addedAt' | 'currentUsageUsd' | 'tokenCount'>) => void;
  removeKey: (id: string) => void;
  updateKeyUsage: (id: string, usd: number, tokens: number) => void;
  setKeyActive: (id: string, active: boolean) => void;
  getKeyForProvider: (provider: ProviderId) => string | null;
}

// ─── Usage Slice ─────────────────────────────────────────────────────────────

interface UsageSlice {
  usageRecords: TokenUsageRecord[];
  addUsageRecord: (r: TokenUsageRecord) => void;
  clearUsageHistory: () => void;
  totalCostUsd: () => number;
  todayCostUsd: () => number;
}

// ─── Settings Slice ───────────────────────────────────────────────────────────

interface SettingsSlice {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

// ─── UI Slice ─────────────────────────────────────────────────────────────────

interface UISlice {
  sidebarCollapsed: boolean;
  aiPanelOpen: boolean;
  modelBrowserOpen: boolean;
  composeOpen: boolean;
  settingsOpen: boolean;
  settingsTab: string;
  toggleSidebar: () => void;
  setAIPanelOpen: (v: boolean) => void;
  setModelBrowserOpen: (v: boolean) => void;
  setComposeOpen: (v: boolean) => void;
  setSettingsOpen: (v: boolean) => void;
  setSettingsTab: (tab: string) => void;
}

// ─── Combined Store ───────────────────────────────────────────────────────────

type AppStore = EmailSlice & AISlice & KeysSlice & UsageSlice & SettingsSlice & UISlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── Email ──────────────────────────────────────────────────────────────
      emails: [],
      selectedEmailId: null,
      selectedFolder: 'inbox',
      searchQuery: '',
      setEmails: (emails) => set({ emails }),
      selectEmail: (id) => {
        set({ selectedEmailId: id });
        if (id) get().markRead(id);
      },
      setFolder: (folder) => set({ selectedFolder: folder, selectedEmailId: null }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      markRead: (id) =>
        set((s) => ({
          emails: s.emails.map((e) => (e.id === id ? { ...e, read: true } : e)),
        })),
      toggleStar: (id) =>
        set((s) => ({
          emails: s.emails.map((e) =>
            e.id === id ? { ...e, starred: !e.starred } : e
          ),
        })),
      updateEmailAI: (id, summary, labels) =>
        set((s) => ({
          emails: s.emails.map((e) =>
            e.id === id ? { ...e, aiSummary: summary, aiLabels: labels } : e
          ),
        })),
      moveToTrash: (id) =>
        set((s) => ({
          emails: s.emails.map((e) =>
            e.id === id ? { ...e, folder: 'trash' } : e
          ),
        })),

      // ── AI ─────────────────────────────────────────────────────────────────
      models: [],
      favoriteModelIds: [],
      selectedModelId: 'anthropic/claude-3.5-sonnet',
      modelSearchQuery: '',
      modelCategory: 'all',
      modelsLastFetched: null,
      activePersonaId: 'professional',
      personas: BUILT_IN_PERSONAS,
      isLoadingModels: false,
      setModels: (models) =>
        set((s) => ({
          models: models.map((m) => ({
            ...m,
            isFavorite: s.favoriteModelIds.includes(m.id),
          })),
        })),
      toggleFavorite: (modelId) =>
        set((s) => {
          const favs = s.favoriteModelIds.includes(modelId)
            ? s.favoriteModelIds.filter((id) => id !== modelId)
            : [...s.favoriteModelIds, modelId];
          return {
            favoriteModelIds: favs,
            models: s.models.map((m) =>
              m.id === modelId ? { ...m, isFavorite: !m.isFavorite } : m
            ),
          };
        }),
      selectModel: (id) => set({ selectedModelId: id }),
      setModelSearch: (q) => set({ modelSearchQuery: q }),
      setModelCategory: (cat) => set({ modelCategory: cat }),
      setModelsLastFetched: (ts) => set({ modelsLastFetched: ts }),
      setActivePersona: (id) => set({ activePersonaId: id }),
      addPersona: (p) => set((s) => ({ personas: [...s.personas, p] })),
      updatePersona: (id, patch) =>
        set((s) => ({
          personas: s.personas.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deletePersona: (id) =>
        set((s) => ({ personas: s.personas.filter((p) => p.id !== id) })),
      setLoadingModels: (v) => set({ isLoadingModels: v }),

      // ── Keys ───────────────────────────────────────────────────────────────
      apiKeys: [],
      addKey: (entry) =>
        set((s) => ({
          apiKeys: [
            ...s.apiKeys,
            {
              ...entry,
              id: crypto.randomUUID(),
              addedAt: new Date().toISOString(),
              currentUsageUsd: 0,
              tokenCount: 0,
            },
          ],
        })),
      removeKey: (id) =>
        set((s) => ({ apiKeys: s.apiKeys.filter((k) => k.id !== id) })),
      updateKeyUsage: (id, usd, tokens) =>
        set((s) => ({
          apiKeys: s.apiKeys.map((k) =>
            k.id === id
              ? {
                  ...k,
                  currentUsageUsd: k.currentUsageUsd + usd,
                  tokenCount: k.tokenCount + tokens,
                }
              : k
          ),
        })),
      setKeyActive: (id, active) =>
        set((s) => ({
          apiKeys: s.apiKeys.map((k) => (k.id === id ? { ...k, isActive: active } : k)),
        })),
      getKeyForProvider: (provider) => {
        const key = get().apiKeys.find(
          (k) => k.providerId === provider && k.isActive
        );
        return key?.key ?? null;
      },

      // ── Usage ──────────────────────────────────────────────────────────────
      usageRecords: [],
      addUsageRecord: (r) =>
        set((s) => ({ usageRecords: [r, ...s.usageRecords].slice(0, 500) })),
      clearUsageHistory: () => set({ usageRecords: [] }),
      totalCostUsd: () =>
        get().usageRecords.reduce((sum, r) => sum + r.costUsd, 0),
      todayCostUsd: () => {
        const today = new Date().toDateString();
        return get()
          .usageRecords.filter((r) => new Date(r.timestamp).toDateString() === today)
          .reduce((sum, r) => sum + r.costUsd, 0);
      },

      // ── Settings ───────────────────────────────────────────────────────────
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      // ── UI ─────────────────────────────────────────────────────────────────
      sidebarCollapsed: false,
      aiPanelOpen: true,
      modelBrowserOpen: false,
      composeOpen: false,
      settingsOpen: false,
      settingsTab: 'keys',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setAIPanelOpen: (v) => set({ aiPanelOpen: v }),
      setModelBrowserOpen: (v) => set({ modelBrowserOpen: v }),
      setComposeOpen: (v) => set({ composeOpen: v }),
      setSettingsOpen: (v) => set({ settingsOpen: v }),
      setSettingsTab: (tab) => set({ settingsTab: tab }),
    }),
    {
      name: 'openmail-storage',
      partialize: (s) => ({
        favoriteModelIds: s.favoriteModelIds,
        selectedModelId: s.selectedModelId,
        apiKeys: s.apiKeys,
        usageRecords: s.usageRecords,
        settings: s.settings,
        personas: s.personas,
        activePersonaId: s.activePersonaId,
        modelsLastFetched: s.modelsLastFetched,
      }),
    }
  )
);
