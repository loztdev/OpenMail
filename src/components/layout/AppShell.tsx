'use client';

import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useAppStore } from '@/lib/store/app-store';
import { MOCK_EMAILS } from '@/lib/email/mock-data';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { emails, setEmails } = useAppStore();

  // Seed mock emails on first load
  useEffect(() => {
    if (emails.length === 0) {
      setEmails(MOCK_EMAILS);
    }
  }, [emails.length, setEmails]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
