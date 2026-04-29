'use client';

import { useState, useMemo } from 'react';
import {
  Sparkles, FileText, PenLine, Layers, Tags, Zap,
  ChevronDown, Copy, Check, Bot, Shield, ShieldOff,
  AlertTriangle, X, Settings, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/app-store';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Tabs } from '@/components/ui/Tabs';
import { Tooltip } from '@/components/ui/Tooltip';
import { getProviderDisplay } from '@/lib/ai/client';
import { scrubPII } from '@/lib/ai/pii-scrubber';
import { BUILT_IN_PERSONAS } from '@/lib/ai/providers';
import { completeDirectly, IS_MOBILE } from '@/lib/ai/complete-direct';
import type { AIPersona, ProviderId, TokenUsageRecord } from '@/types';

type AIPanelTab = 'actions' | 'persona' | 'model';

const PANEL_TABS = [
  { id: 'actions', label: 'Actions' },
  { id: 'persona', label: 'Persona' },
  { id: 'model',   label: 'Model' },
];

function useAI() {
  const {
    selectedModelId, models, activePersonaId, personas,
    settings, apiKeys,
    addUsageRecord, updateKeyUsage,
    updateEmailAI,
  } = useAppStore();

  const model = models.find((m) => m.id === selectedModelId);
  const persona = personas.find((p) => p.id === activePersonaId) ?? BUILT_IN_PERSONAS[0];

  const getKey = (provider: ProviderId): string | null => {
    const key = apiKeys.find((k) => k.providerId === provider && k.isActive);
    return key?.key ?? null;
  };

  const runAction = async (
    action: string,
    prompt: string,
    emailId?: string
  ): Promise<string> => {
    const provider = settings.defaultProvider;
    const apiKey = getKey(provider) ?? getKey('openrouter');

    if (!apiKey) {
      throw new Error('No API key configured. Go to Settings → API Keys to add one.');
    }

    let processedPrompt = prompt;
    if (settings.pii.enabled) {
      const { text } = scrubPII(prompt, settings.pii);
      processedPrompt = text;
    }

    const requestPayload = {
      model: selectedModelId,
      provider,
      apiKey,
      messages: [
        { role: 'system' as const, content: persona.systemPrompt },
        { role: 'user' as const, content: processedPrompt },
      ],
      maxTokens: 1024,
    };

    // Inside Capacitor the Next.js server doesn't exist — call providers directly.
    const data = IS_MOBILE
      ? await completeDirectly(requestPayload)
      : await (async () => {
          const res = await fetch('/api/ai/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload),
          });
          if (!res.ok) {
            const err = await res.text();
            throw new Error(err || `Request failed (${res.status})`);
          }
          return res.json() as Promise<{
            content: string;
            usage: { promptTokens: number; completionTokens: number; totalTokens: number };
            costUsd: number;
          }>;
        })();

    const record: TokenUsageRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      model: selectedModelId,
      provider,
      action: action as TokenUsageRecord['action'],
      promptTokens: data.usage.promptTokens,
      completionTokens: data.usage.completionTokens,
      totalTokens: data.usage.totalTokens,
      costUsd: data.costUsd,
      emailId,
    };
    addUsageRecord(record);

    const key = apiKeys.find((k) => k.providerId === provider && k.isActive);
    if (key) updateKeyUsage(key.id, data.costUsd, data.usage.totalTokens);

    return data.content;
  };

  return { model, persona, runAction };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function ResultBox({ content, onClear }: { content: string; onClear: () => void }) {
  return (
    <div className="rounded-xl border border-brand-500/20 bg-brand-600/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-brand-400" />
          <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wide">Result</span>
        </div>
        <div className="flex items-center gap-1">
          <CopyButton text={content} />
          <button onClick={onClear} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
            <X size={12} />
          </button>
        </div>
      </div>
      <div className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
        {content}
      </div>
    </div>
  );
}

function ActionsTab() {
  const { emails, selectedEmailId, settings, updateSettings, updateEmailAI } = useAppStore();
  const { runAction } = useAI();
  const email = emails.find((e) => e.id === selectedEmailId);

  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [draftBullets, setDraftBullets] = useState('');
  const [error, setError] = useState<string | null>(null);

  const run = async (key: string, prompt: string, emailId?: string) => {
    setLoading(key);
    setError(null);
    try {
      const result = await runAction(key, prompt, emailId);
      setResults((r) => ({ ...r, [key]: result }));
      if (key === 'summarize' && emailId) {
        updateEmailAI(emailId, result, []);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(null);
    }
  };

  const hasEmail = !!email;
  const emailContext = email
    ? `Subject: ${email.subject}\nFrom: ${email.from.name} <${email.from.email}>\n\n${email.body}`
    : '';

  return (
    <div className="space-y-3">
      {/* PII toggle */}
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)]">
        <div className="flex items-center gap-2">
          {settings.pii.enabled ? (
            <Shield size={13} className="text-emerald-400" />
          ) : (
            <ShieldOff size={13} className="text-[var(--text-muted)]" />
          )}
          <span className="text-xs font-medium text-[var(--text-secondary)]">PII Scrubbing</span>
        </div>
        <Switch
          size="sm"
          checked={settings.pii.enabled}
          onCheckedChange={(v) => updateSettings({ pii: { ...settings.pii, enabled: v } })}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {!hasEmail && (
        <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-center">
          <p className="text-xs text-[var(--text-muted)]">Select an email to use AI features</p>
        </div>
      )}

      {/* Summarize */}
      <div className="space-y-1.5">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={!hasEmail}
          loading={loading === 'summarize'}
          onClick={() => run('summarize', `Summarize this email concisely in 2-4 bullet points:\n\n${emailContext}`, email?.id)}
        >
          <FileText size={13} />
          Summarize Email
        </Button>
        {results.summarize && (
          <ResultBox content={results.summarize} onClear={() => setResults((r) => { const n = { ...r }; delete n.summarize; return n; })} />
        )}
      </div>

      {/* Extract action items */}
      <div className="space-y-1.5">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={!hasEmail}
          loading={loading === 'actions'}
          onClick={() => run('actions', `Extract all action items and deadlines from this email as a numbered list:\n\n${emailContext}`, email?.id)}
        >
          <Tags size={13} />
          Extract Action Items
        </Button>
        {results.actions && (
          <ResultBox content={results.actions} onClear={() => setResults((r) => { const n = { ...r }; delete n.actions; return n; })} />
        )}
      </div>

      {/* Draft Reply */}
      <div className="space-y-1.5">
        <Textarea
          placeholder="Your key points… (e.g. 'confirm Thursday 2pm, ask about Q4 budget')"
          value={draftBullets}
          onChange={(e) => setDraftBullets(e.target.value)}
          className="text-xs h-20"
        />
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={!hasEmail || !draftBullets.trim()}
          loading={loading === 'draft'}
          onClick={() =>
            run('draft',
              `Write a professional email reply.\n\nOriginal email:\n${emailContext}\n\nKey points to include in my reply:\n${draftBullets}\n\nWrite a complete, ready-to-send reply:`,
              email?.id
            )
          }
        >
          <PenLine size={13} />
          Draft Reply
        </Button>
        {results.draft && (
          <ResultBox content={results.draft} onClear={() => setResults((r) => { const n = { ...r }; delete n.draft; return n; })} />
        )}
      </div>

      {/* Classify */}
      <div className="space-y-1.5">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          disabled={!hasEmail}
          loading={loading === 'classify'}
          onClick={() =>
            run('classify',
              `Classify this email with 1-3 labels from: Newsletter, Work, Personal, Finance, Shopping, Travel, Promotion, Social, Notification, Action Required, FYI, Meeting, Invoice, Receipt.\nReply with ONLY a comma-separated list of labels.\n\n${emailContext}`,
              email?.id
            )
          }
        >
          <Tags size={13} />
          Auto-Classify
        </Button>
        {results.classify && (
          <ResultBox content={results.classify} onClear={() => setResults((r) => { const n = { ...r }; delete n.classify; return n; })} />
        )}
      </div>

      {/* Digest */}
      <div className="space-y-1.5">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          loading={loading === 'digest'}
          onClick={() => {
            const { emails: allEmails } = useAppStore.getState();
            const inboxEmails = allEmails.filter((e) => e.folder === 'inbox').slice(0, 10);
            const digest = inboxEmails
              .map((e) => `Subject: ${e.subject}\nFrom: ${e.from.name}\n${e.body.slice(0, 300)}`)
              .join('\n\n---\n\n');
            run('digest', `Create a concise daily email digest from these inbox messages. Group by topic, highlight action items, note deadlines:\n\n${digest}`);
          }}
        >
          <Layers size={13} />
          Daily Digest
        </Button>
        {results.digest && (
          <ResultBox content={results.digest} onClear={() => setResults((r) => { const n = { ...r }; delete n.digest; return n; })} />
        )}
      </div>
    </div>
  );
}

function PersonaTab() {
  const { personas, activePersonaId, setActivePersona, updateSettings } = useAppStore();

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-muted)]">
        AI personas shape tone, style, and behavior across all features.
      </p>
      {personas.map((persona) => (
        <button
          key={persona.id}
          onClick={() => { setActivePersona(persona.id); updateSettings({ defaultPersonaId: persona.id }); }}
          className={cn(
            'w-full text-left p-3 rounded-xl border transition-all',
            activePersonaId === persona.id
              ? 'border-brand-500/60 bg-[var(--accent-subtle)]'
              : 'border-[var(--border)] bg-[var(--bg-tertiary)] hover:border-brand-500/30'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{persona.emoji}</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{persona.name}</span>
            {activePersonaId === persona.id && (
              <span className="ml-auto text-[10px] font-medium text-brand-400 bg-brand-600/20 px-1.5 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)]">{persona.description}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {persona.useCases.map((uc) => (
              <span key={uc} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-muted)]">
                {uc}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}

function ModelTab() {
  const { models, selectedModelId, selectModel, setModelBrowserOpen, favoriteModelIds } = useAppStore();
  const currentModel = models.find((m) => m.id === selectedModelId);
  const favoriteModels = models.filter((m) => favoriteModelIds.includes(m.id));

  return (
    <div className="space-y-3">
      {/* Current model */}
      {currentModel && (
        <div className="p-3 rounded-xl border border-brand-500/30 bg-[var(--accent-subtle)]">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={11} className="text-brand-400" />
            <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wide">Active Model</span>
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{currentModel.name}</p>
          <p className="text-xs text-[var(--text-muted)]">
            {currentModel.contextLength.toLocaleString()} ctx ·{' '}
            {currentModel.pricing.prompt === 0 ? 'Free' : `$${(currentModel.pricing.prompt / 1000).toFixed(4)}/1K`}
          </p>
        </div>
      )}

      <Button
        variant="primary"
        size="sm"
        className="w-full"
        onClick={() => setModelBrowserOpen(true)}
      >
        <Bot size={13} />
        Browse All Models
      </Button>

      {/* Favorite models */}
      {favoriteModels.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
            ★ Favorites
          </p>
          <div className="space-y-1">
            {favoriteModels.slice(0, 6).map((m) => (
              <button
                key={m.id}
                onClick={() => selectModel(m.id)}
                className={cn(
                  'w-full text-left flex items-center gap-2 p-2 rounded-lg border text-xs transition-all',
                  selectedModelId === m.id
                    ? 'border-brand-500/50 bg-[var(--accent-subtle)] text-brand-300'
                    : 'border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:border-brand-500/30'
                )}
              >
                <Star size={11} fill="currentColor" className="text-yellow-400 shrink-0" />
                <span className="truncate font-medium">{m.name}</span>
                {selectedModelId === m.id && (
                  <span className="ml-auto text-[10px] text-brand-400">active</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {favoriteModels.length === 0 && (
        <p className="text-xs text-[var(--text-muted)] text-center py-2">
          Open Model Browser and ★ your favorite models to pin them here
        </p>
      )}
    </div>
  );
}

export function AIPanel() {
  const { aiPanelOpen, setAIPanelOpen, models, selectedModelId } = useAppStore();
  const [tab, setTab] = useState<AIPanelTab>('actions');
  const currentModel = models.find((m) => m.id === selectedModelId);

  if (!aiPanelOpen) return null;

  return (
    <div className="flex flex-col h-full w-72 border-l border-[var(--border)] bg-[var(--bg-secondary)] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-brand-400" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">AI Panel</span>
        </div>
        <button
          onClick={() => setAIPanelOpen(false)}
          className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        >
          <X size={14} />
        </button>
      </div>

      {/* Active model pill */}
      {currentModel && (
        <div className="px-4 py-2 border-b border-[var(--border)] flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: getProviderDisplay(currentModel.provider).color }}
          />
          <span className="text-xs text-[var(--text-muted)] truncate">{currentModel.name}</span>
          <Zap size={10} className="text-[var(--text-muted)] shrink-0" />
        </div>
      )}

      {/* Tabs */}
      <div className="px-3 py-2 border-b border-[var(--border)]">
        <Tabs
          tabs={PANEL_TABS}
          active={tab}
          onChange={(t) => setTab(t as AIPanelTab)}
          variant="default"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {tab === 'actions' && <ActionsTab />}
        {tab === 'persona' && <PersonaTab />}
        {tab === 'model'   && <ModelTab />}
      </div>
    </div>
  );
}
