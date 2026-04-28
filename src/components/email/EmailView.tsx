'use client';

import { format } from 'date-fns';
import {
  Star, Trash2, ArchiveX, Reply, ReplyAll, Forward,
  MoreHorizontal, Sparkles, ChevronDown, ChevronUp, Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/app-store';
import { Button } from '@/components/ui/Button';
import { LabelBadge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

export function EmailView() {
  const {
    emails, selectedEmailId, toggleStar, moveToTrash,
    aiPanelOpen, setAIPanelOpen,
  } = useAppStore();

  const email = emails.find((e) => e.id === selectedEmailId);

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-[var(--bg-primary)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4 border border-[var(--border)]">
          <Mail size={24} className="text-[var(--text-muted)]" />
        </div>
        <p className="text-base font-semibold text-[var(--text-secondary)]">No message selected</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Click a message to read it, or use AI to summarize your inbox
        </p>
        <Button
          className="mt-4"
          variant="secondary"
          size="sm"
          onClick={() => setAIPanelOpen(true)}
        >
          <Sparkles size={13} />
          Open AI Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)] shrink-0 bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-1">
          <Tooltip content={email.starred ? 'Unstar' : 'Star'}>
            <button
              onClick={() => toggleStar(email.id)}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                email.starred
                  ? 'text-yellow-400'
                  : 'text-[var(--text-muted)] hover:text-yellow-400 hover:bg-[var(--bg-hover)]'
              )}
            >
              <Star size={15} fill={email.starred ? 'currentColor' : 'none'} />
            </button>
          </Tooltip>
          <Tooltip content="Move to trash">
            <button
              onClick={() => moveToTrash(email.id)}
              className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </Tooltip>
          <Tooltip content="Archive">
            <button className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
              <ArchiveX size={15} />
            </button>
          </Tooltip>
          <div className="w-px h-4 bg-[var(--border)] mx-1" />
          <Tooltip content="Reply">
            <button className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
              <Reply size={15} />
            </button>
          </Tooltip>
          <Tooltip content="Reply all">
            <button className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
              <ReplyAll size={15} />
            </button>
          </Tooltip>
          <Tooltip content="Forward">
            <button className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
              <Forward size={15} />
            </button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content={aiPanelOpen ? 'Hide AI Panel' : 'Show AI Panel'}>
            <button
              onClick={() => setAIPanelOpen(!aiPanelOpen)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                aiPanelOpen
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              )}
            >
              <Sparkles size={13} />
              AI
            </button>
          </Tooltip>
          <button className="p-1.5 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors">
            <MoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-6">
          {/* Subject */}
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-4 leading-snug">
            {email.subject}
          </h1>

          {/* Labels */}
          {email.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {email.labels.map((l) => <LabelBadge key={l} label={l} />)}
              {email.aiLabels?.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-subtle)] text-[var(--accent)]"
                >
                  ✦ {l}
                </span>
              ))}
            </div>
          )}

          {/* Sender info */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-[var(--border)]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {email.from.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {email.from.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{email.from.email}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  To: {email.to.map((t) => t.email).join(', ')}
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] shrink-0 mt-1">
              {format(new Date(email.date), 'MMM d, yyyy, h:mm a')}
            </p>
          </div>

          {/* AI Summary */}
          {email.aiSummary && (
            <div className="mb-5 p-4 rounded-xl border border-brand-500/20 bg-brand-600/5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={13} className="text-brand-400" />
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wide">
                  AI Summary
                </span>
              </div>
              <div className="text-sm text-[var(--text-secondary)] whitespace-pre-line">
                {email.aiSummary}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="email-body text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
            {email.body}
          </div>
        </div>
      </div>

      {/* Quick reply bar */}
      <div className="px-8 py-3 border-t border-[var(--border)] bg-[var(--bg-secondary)] shrink-0">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          {['👍 Thanks!', '📅 Let me check my calendar', '✉️ I\'ll follow up shortly'].map((q) => (
            <button
              key={q}
              className="px-3 py-1.5 rounded-full border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors"
            >
              {q}
            </button>
          ))}
          <div className="flex-1" />
          <Button size="sm" variant="primary">
            <Reply size={13} /> Reply
          </Button>
        </div>
      </div>
    </div>
  );
}
