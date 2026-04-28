'use client';

import { useState } from 'react';
import { X, Minimize2, Maximize2, Send, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/app-store';
import { Button } from '@/components/ui/Button';

export function ComposeModal() {
  const { composeOpen, setComposeOpen } = useAppStore();
  const [minimized, setMinimized] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  if (!composeOpen) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-40 w-[520px] rounded-xl border border-[var(--border)]',
        'bg-[var(--bg-secondary)] shadow-2xl shadow-black/50 flex flex-col',
        'transition-all duration-200',
        minimized ? 'h-12' : 'h-[480px]'
      )}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)] shrink-0">
        <span className="text-sm font-medium text-[var(--text-primary)]">New Message</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
          </button>
          <button
            onClick={() => setComposeOpen(false)}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Fields */}
          <div className="border-b border-[var(--border)]">
            <input
              type="text"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none border-b border-[var(--border)]"
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
            />
          </div>

          {/* Body */}
          <textarea
            placeholder="Write your message… or use AI to draft it"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 w-full px-4 py-3 text-sm bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none"
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--border)] shrink-0">
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
                <Paperclip size={14} />
              </button>
              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-[var(--accent)] hover:bg-[var(--accent-subtle)]">
                <Sparkles size={13} />
                AI Draft
              </button>
            </div>
            <Button variant="primary" size="sm">
              <Send size={13} />
              Send
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
