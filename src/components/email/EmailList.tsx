'use client';

import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Star, Paperclip, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/app-store';
import { getEmailsByFolder, searchEmails } from '@/lib/email/mock-data';
import { LabelBadge } from '@/components/ui/Badge';
import type { Email } from '@/types';

function EmailRow({ email }: { email: Email }) {
  const { selectedEmailId, selectEmail, toggleStar } = useAppStore();
  const selected = selectedEmailId === email.id;

  return (
    <button
      onClick={() => selectEmail(email.id)}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-[var(--border)] transition-colors',
        'hover:bg-[var(--bg-hover)]',
        selected && 'bg-[var(--bg-active)] border-l-2 border-l-brand-500',
        !email.read && !selected && 'bg-[var(--bg-tertiary)]'
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Unread indicator */}
        <div className="mt-1.5 shrink-0">
          {!email.read ? (
            <span className="block w-2 h-2 rounded-full bg-brand-500" />
          ) : (
            <span className="block w-2 h-2" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span
              className={cn(
                'text-sm truncate',
                email.read ? 'text-[var(--text-secondary)] font-normal' : 'text-[var(--text-primary)] font-semibold'
              )}
            >
              {email.from.name}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {email.attachments && email.attachments.length > 0 && (
                <Paperclip size={11} className="text-[var(--text-muted)]" />
              )}
              <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }}
                className={cn(
                  'p-0.5 rounded transition-colors',
                  email.starred
                    ? 'text-yellow-400'
                    : 'text-[var(--text-muted)] hover:text-yellow-400'
                )}
              >
                <Star size={12} fill={email.starred ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Subject */}
          <p
            className={cn(
              'text-xs truncate mb-1',
              email.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)] font-medium'
            )}
          >
            {email.subject}
          </p>

          {/* Preview + labels */}
          <div className="flex items-end justify-between gap-2">
            <p className="text-[11px] text-[var(--text-muted)] truncate flex-1">
              {email.body.slice(0, 80).replace(/\n/g, ' ')}…
            </p>
            <div className="flex gap-1 shrink-0">
              {email.labels.slice(0, 1).map((l) => (
                <LabelBadge key={l} label={l} />
              ))}
            </div>
          </div>

          {/* AI summary if available */}
          {email.aiSummary && (
            <div className="mt-1.5 flex items-start gap-1.5 p-1.5 rounded bg-[var(--accent-subtle)] text-[10px] text-[var(--accent)]">
              <span className="shrink-0">✦</span>
              <span className="line-clamp-2">{email.aiSummary}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export function EmailList() {
  const {
    emails, selectedFolder, searchQuery, setSearchQuery,
  } = useAppStore();

  const displayEmails = useMemo(() => {
    const base = getEmailsByFolder(selectedFolder, emails);
    if (!searchQuery.trim()) return base;
    return searchEmails(searchQuery, base);
  }, [emails, selectedFolder, searchQuery]);

  const FOLDER_LABELS: Record<string, string> = {
    inbox: 'Inbox',
    starred: 'Starred',
    sent: 'Sent',
    drafts: 'Drafts',
    spam: 'Spam',
    trash: 'Trash',
  };

  return (
    <div className="flex flex-col h-full border-r border-[var(--border)] bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {FOLDER_LABELS[selectedFolder] ?? selectedFolder}
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            {displayEmails.length} messages
          </span>
        </div>
        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-8 pr-3 py-1.5 text-xs rounded-md',
              'bg-[var(--bg-tertiary)] border border-[var(--border)]',
              'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'focus:outline-none focus:border-brand-500/60'
            )}
          />
        </div>
      </div>

      {/* Email rows */}
      <div className="flex-1 overflow-y-auto">
        {displayEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-3">
              <Search size={20} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-secondary)] font-medium">No messages</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {searchQuery ? 'Try a different search term' : 'This folder is empty'}
            </p>
          </div>
        ) : (
          displayEmails.map((email) => (
            <EmailRow key={email.id} email={email} />
          ))
        )}
      </div>
    </div>
  );
}
