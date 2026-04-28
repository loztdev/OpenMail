'use client';

import { Key, Users, BarChart3, Shield, Settings } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/store/app-store';
import { APIKeySettings } from './APIKeySettings';
import { PersonaSettings } from './PersonaSettings';
import { TokenDashboard } from './TokenDashboard';
import { PIISettings } from './PIISettings';

const TABS = [
  { id: 'keys',    label: 'API Keys',  icon: Key },
  { id: 'personas', label: 'Personas', icon: Users },
  { id: 'usage',   label: 'Usage',     icon: BarChart3 },
  { id: 'privacy', label: 'Privacy',   icon: Shield },
];

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen, settingsTab, setSettingsTab } = useAppStore();

  return (
    <Modal
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      size="xl"
      className="max-h-[85vh]"
    >
      <div className="flex h-full" style={{ minHeight: '60vh' }}>
        {/* Sidebar */}
        <div className="w-44 border-r border-[var(--border)] p-3 shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 mb-3">
            <Settings size={14} className="text-[var(--text-muted)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">Settings</span>
          </div>
          <nav className="space-y-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSettingsTab(id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                  settingsTab === id
                    ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Icon size={14} className="shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {settingsTab === 'keys'    && <APIKeySettings />}
          {settingsTab === 'personas' && <PersonaSettings />}
          {settingsTab === 'usage'   && <TokenDashboard />}
          {settingsTab === 'privacy' && <PIISettings />}
        </div>
      </div>
    </Modal>
  );
}
