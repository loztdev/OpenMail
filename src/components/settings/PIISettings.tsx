'use client';

import { useState } from 'react';
import { Shield, Eye, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
import { Switch } from '@/components/ui/Switch';
import { highlightPII } from '@/lib/ai/pii-scrubber';

const SCRUB_OPTIONS = [
  { key: 'scrubNames',     label: 'Names',           description: 'Person names (e.g. John Smith)' },
  { key: 'scrubEmails',    label: 'Email Addresses',  description: 'Any email address in the body' },
  { key: 'scrubPhones',    label: 'Phone Numbers',    description: 'US and international formats' },
  { key: 'scrubAddresses', label: 'Street Addresses', description: 'Physical mailing addresses' },
  { key: 'scrubDates',     label: 'Dates',            description: 'Calendar dates and timestamps' },
] as const;

const DEMO_TEXT = `Hi John Smith,

Please find the contract for review. You can reach me at sarah@example.com or call 415-555-0123.

My office is located at 123 Market Street, San Francisco, CA 94103.

The meeting is confirmed for January 15, 2024 at 3pm.

Best regards,
Sarah Johnson`;

export function PIISettings() {
  const { settings, updateSettings } = useAppStore();
  const [preview, setPreview] = useState(false);

  const pii = settings.pii;
  const updatePII = (patch: Partial<typeof pii>) =>
    updateSettings({ pii: { ...pii, ...patch } });

  const highlighted = preview ? highlightPII(DEMO_TEXT) : '';

  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="text-base font-bold text-[var(--text-primary)]">Privacy & PII</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          PII scrubbing removes personal information from emails before they're sent to AI providers.
          The AI processes a sanitized version; your data stays private.
        </p>
      </div>

      {/* Master toggle */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4">
        <Switch
          checked={pii.enabled}
          onCheckedChange={(v) => updatePII({ enabled: v })}
          label="Enable PII Scrubbing"
          description="Strip personal information before sending to AI providers"
        />
        {pii.enabled && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <Shield size={13} className="text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-400">
              PII scrubbing is active. Emails will be sanitized before AI processing.
            </p>
          </div>
        )}
      </div>

      {/* Per-type toggles */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 space-y-4">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          What to Scrub
        </h3>
        {SCRUB_OPTIONS.map(({ key, label, description }) => (
          <Switch
            key={key}
            checked={pii[key]}
            onCheckedChange={(v) => updatePII({ [key]: v })}
            label={label}
            description={description}
            disabled={!pii.enabled}
          />
        ))}
      </div>

      {/* Warning for dates */}
      {pii.scrubDates && pii.enabled && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
          <AlertTriangle size={13} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-400">
            Date scrubbing may reduce AI accuracy for scheduling and deadline-related queries.
          </p>
        </div>
      )}

      {/* Preview */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Preview
          </h3>
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
          >
            <Eye size={11} />
            {preview ? 'Hide' : 'Show'} highlights
          </button>
        </div>
        <div
          className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
          dangerouslySetInnerHTML={{ __html: preview ? highlighted : DEMO_TEXT }}
        />
        {preview && (
          <p className="text-[10px] text-[var(--text-muted)]">
            Highlighted text would be replaced with placeholders like [NAME_1], [EMAIL_1] when PII scrubbing is active.
          </p>
        )}
      </div>
    </div>
  );
}
