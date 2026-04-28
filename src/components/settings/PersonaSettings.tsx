'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/app-store';
import { AI_PROVIDERS } from '@/lib/ai/providers';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import type { AIPersona, PersonaUseCase, ProviderId } from '@/types';

const USE_CASES: PersonaUseCase[] = ['summarize', 'draft', 'classify', 'search', 'digest'];
const TONES = ['formal', 'casual', 'technical', 'friendly', 'concise'] as const;
const EMOJIS = ['💼', '😊', '🔬', '⚡', '🤖', '🎯', '💡', '🧠', '✍️', '📧', '🚀', '💎'];

const DEFAULT_FORM: Omit<AIPersona, 'id' | 'isBuiltIn'> = {
  name: '',
  emoji: '🤖',
  description: '',
  systemPrompt: '',
  defaultModel: 'anthropic/claude-3.5-sonnet',
  defaultProvider: 'openrouter',
  useCases: ['summarize', 'draft'],
  tone: 'formal',
};

function PersonaForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<typeof DEFAULT_FORM>;
  onSave: (p: typeof DEFAULT_FORM) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initial });

  const update = (patch: Partial<typeof DEFAULT_FORM>) =>
    setForm((f) => ({ ...f, ...patch }));

  const toggleUseCase = (uc: PersonaUseCase) => {
    update({
      useCases: form.useCases.includes(uc)
        ? form.useCases.filter((u) => u !== uc)
        : [...form.useCases, uc],
    });
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 space-y-4">
      {/* Emoji + Name */}
      <div className="flex gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Icon</label>
          <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => update({ emoji: e })}
                className={cn(
                  'text-lg p-1 rounded transition-colors',
                  form.emoji === e ? 'bg-brand-600' : 'hover:bg-[var(--bg-hover)]'
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Name</label>
          <input
            type="text"
            placeholder="My Persona"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-brand-500/60"
          />
          <label className="block text-xs font-medium text-[var(--text-secondary)] mt-2 mb-1.5">Description</label>
          <input
            type="text"
            placeholder="Short description"
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-brand-500/60"
          />
        </div>
      </div>

      {/* System prompt */}
      <Textarea
        label="System Prompt"
        placeholder="You are a helpful email assistant…"
        value={form.systemPrompt}
        onChange={(e) => update({ systemPrompt: e.target.value })}
        className="h-28 text-xs"
      />

      {/* Tone */}
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Tone</label>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button
              key={t}
              onClick={() => update({ tone: t })}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors',
                form.tone === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Use cases */}
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Use For</label>
        <div className="flex flex-wrap gap-1.5">
          {USE_CASES.map((uc) => (
            <button
              key={uc}
              onClick={() => toggleUseCase(uc)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors',
                form.useCases.includes(uc)
                  ? 'bg-brand-600 text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]'
              )}
            >
              {uc}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={!form.name.trim() || !form.systemPrompt.trim()}
          onClick={() => onSave(form)}
        >
          <Check size={13} /> Save Persona
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X size={13} /> Cancel
        </Button>
      </div>
    </div>
  );
}

export function PersonaSettings() {
  const { personas, addPersona, updatePersona, deletePersona, activePersonaId, setActivePersona } = useAppStore();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = (form: typeof DEFAULT_FORM) => {
    addPersona({ ...form, id: crypto.randomUUID(), isBuiltIn: false });
    setCreating(false);
  };

  const handleUpdate = (id: string, form: typeof DEFAULT_FORM) => {
    updatePersona(id, form);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="text-base font-bold text-[var(--text-primary)]">AI Personas</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Personas control the AI's tone and system prompt. Mix and match for different tasks.
        </p>
      </div>

      <div className="space-y-3">
        {personas.map((p) => (
          editingId === p.id ? (
            <PersonaForm
              key={p.id}
              initial={p}
              onSave={(form) => handleUpdate(p.id, form)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={p.id}
              className={cn(
                'rounded-xl border p-4 transition-all',
                activePersonaId === p.id
                  ? 'border-brand-500/50 bg-[var(--accent-subtle)]'
                  : 'border-[var(--border)] bg-[var(--bg-tertiary)]'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  className="flex-1 text-left"
                  onClick={() => setActivePersona(p.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{p.emoji}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</span>
                    {p.isBuiltIn && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-muted)]">
                        Built-in
                      </span>
                    )}
                    {activePersonaId === p.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-600/20 text-brand-400 font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{p.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.useCases.map((uc) => (
                      <span key={uc} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-muted)] capitalize">
                        {uc}
                      </span>
                    ))}
                  </div>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  {!p.isBuiltIn && (
                    <>
                      <button
                        onClick={() => setEditingId(p.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => deletePersona(p.id)}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {creating ? (
        <PersonaForm onSave={handleCreate} onCancel={() => setCreating(false)} />
      ) : (
        <Button variant="outline" size="md" onClick={() => setCreating(true)}>
          <Plus size={14} /> Create Persona
        </Button>
      )}
    </div>
  );
}
