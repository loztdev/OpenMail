'use client';

import { AppShell } from '@/components/layout/AppShell';
import { EmailList } from '@/components/email/EmailList';
import { EmailView } from '@/components/email/EmailView';
import { AIPanel } from '@/components/ai/AIPanel';
import { ModelBrowser } from '@/components/ai/ModelBrowser';
import { ComposeModal } from '@/components/email/ComposeModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { useAppStore } from '@/lib/store/app-store';

export default function Home() {
  const { aiPanelOpen } = useAppStore();

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Email list — fixed width */}
        <div className="w-72 shrink-0">
          <EmailList />
        </div>

        {/* Email content — grows */}
        <div className="flex-1 overflow-hidden">
          <EmailView />
        </div>

        {/* AI panel — conditional */}
        {aiPanelOpen && <AIPanel />}
      </div>

      {/* Overlays */}
      <ModelBrowser />
      <ComposeModal />
      <SettingsModal />
    </AppShell>
  );
}
