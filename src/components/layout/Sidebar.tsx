'use client';

import {
  Inbox, Send, FileText, Star, Trash2, AlertCircle,
  Settings, PenSquare, ChevronLeft, ChevronRight,
  Sparkles, Bot, BarChart3, Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/store/app-store';
import { Tooltip } from '@/components/ui/Tooltip';
import { getUnreadCount } from '@/lib/email/mock-data';

const FOLDERS = [
  { id: 'inbox',   label: 'Inbox',   icon: Inbox },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'sent',    label: 'Sent',    icon: Send },
  { id: 'drafts',  label: 'Drafts',  icon: FileText },
  { id: 'spam',    label: 'Spam',    icon: AlertCircle },
  { id: 'trash',   label: 'Trash',   icon: Trash2 },
];

export function Sidebar() {
  const {
    sidebarCollapsed, toggleSidebar,
    selectedFolder, setFolder,
    emails,
    setComposeOpen, setSettingsOpen, setSettingsTab,
    setModelBrowserOpen, setAIPanelOpen, aiPanelOpen,
  } = useAppStore();

  const collapsed = sidebarCollapsed;

  const NavItem = ({
    id, label, icon: Icon, count, onClick,
  }: {
    id: string; label: string; icon: React.ElementType;
    count?: number; onClick?: () => void;
  }) => {
    const active = selectedFolder === id && !onClick;
    const btn = (
      <button
        onClick={onClick ?? (() => setFolder(id))}
        className={cn(
          'w-full flex items-center rounded-lg transition-colors',
          collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2',
          active
            ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
        )}
      >
        <Icon size={16} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-sm font-medium">{label}</span>
            {count !== undefined && count > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-brand-600 text-white text-[10px] font-medium px-1">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip content={count ? `${label} (${count})` : label} side="right">
          {btn}
        </Tooltip>
      );
    }
    return btn;
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)]',
        'transition-all duration-200 shrink-0',
        collapsed ? 'w-12' : 'w-52'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center border-b border-[var(--border)] h-12', collapsed ? 'justify-center px-2' : 'px-3 gap-2')}>
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-brand-600 shrink-0">
          <Mail size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-[var(--text-primary)]">OpenMail</span>
        )}
      </div>

      {/* Compose button */}
      <div className={cn('p-2', collapsed ? '' : 'px-2.5')}>
        {collapsed ? (
          <Tooltip content="Compose" side="right">
            <button
              onClick={() => setComposeOpen(true)}
              className="w-full flex items-center justify-center p-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors"
            >
              <PenSquare size={15} />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={() => setComposeOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
          >
            <PenSquare size={15} />
            Compose
          </button>
        )}
      </div>

      {/* Folder nav */}
      <nav className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5">
        {FOLDERS.map((f) => (
          <NavItem
            key={f.id}
            id={f.id}
            label={f.label}
            icon={f.icon}
            count={f.id === 'inbox' ? getUnreadCount(emails, 'inbox') : undefined}
          />
        ))}

        <div className="my-2 border-t border-[var(--border)]" />

        <NavItem
          id="ai-panel"
          label="AI Panel"
          icon={Sparkles}
          onClick={() => setAIPanelOpen(!aiPanelOpen)}
        />
        <NavItem
          id="models"
          label="Model Browser"
          icon={Bot}
          onClick={() => setModelBrowserOpen(true)}
        />
        <NavItem
          id="usage"
          label="Usage & Cost"
          icon={BarChart3}
          onClick={() => { setSettingsOpen(true); setSettingsTab('usage'); }}
        />
      </nav>

      {/* Bottom: settings + collapse */}
      <div className="p-1.5 border-t border-[var(--border)] space-y-0.5">
        <NavItem
          id="settings"
          label="Settings"
          icon={Settings}
          onClick={() => setSettingsOpen(true)}
        />
        <button
          onClick={toggleSidebar}
          className={cn(
            'w-full flex items-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors',
            collapsed ? 'justify-center p-2' : 'gap-2.5 px-2.5 py-2'
          )}
        >
          {collapsed ? <ChevronRight size={15} /> : (
            <>
              <ChevronLeft size={15} />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
