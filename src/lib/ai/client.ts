import type {
  AICompletionRequest,
  AICompletionResponse,
  ProviderId,
} from '@/types';

// Route all completions through our Next.js API proxy to keep keys server-side.
// The proxy reads the provider/key from the request body and routes accordingly.

export async function complete(
  req: AICompletionRequest,
  apiKey: string
): Promise<AICompletionResponse> {
  const res = await fetch('/api/ai/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...req, apiKey }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI request failed (${res.status}): ${err}`);
  }

  return res.json() as Promise<AICompletionResponse>;
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

export function buildSummarizePrompt(emailBody: string, systemPrompt: string) {
  return {
    system: `${systemPrompt}\n\nYou are summarizing emails. Be concise — 2-4 bullet points max. Start directly with the bullets, no preamble.`,
    user: `Summarize this email:\n\n${emailBody}`,
  };
}

export function buildDraftPrompt(
  originalEmail: string,
  bulletPoints: string,
  systemPrompt: string
) {
  return {
    system: `${systemPrompt}\n\nYou are drafting email replies. Write a complete, ready-to-send email reply based on the bullet points provided. Include a greeting and sign-off.`,
    user: `Original email:\n${originalEmail}\n\nKey points to include in my reply:\n${bulletPoints}\n\nWrite the reply:`,
  };
}

export function buildDigestPrompt(emails: string[], systemPrompt: string) {
  const emailList = emails
    .map((e, i) => `--- Email ${i + 1} ---\n${e}`)
    .join('\n\n');
  return {
    system: `${systemPrompt}\n\nYou are creating a daily email digest. Group related items, highlight action items, and present key information in a scannable format.`,
    user: `Create a daily digest from these ${emails.length} emails:\n\n${emailList}`,
  };
}

export function buildClassifyPrompt(emailBody: string) {
  return {
    system:
      'Classify the email with 1-3 short labels from: Newsletter, Work, Personal, Finance, Shopping, Travel, Promotion, Social, Notification, Action Required, FYI, Meeting, Invoice, Receipt. Reply with ONLY a comma-separated list of labels, no explanation.',
    user: emailBody,
  };
}

export function buildExtractActionsPrompt(emailBody: string, systemPrompt: string) {
  return {
    system: `${systemPrompt}\n\nExtract action items from emails as a numbered list. Include deadlines when mentioned. If no action items, respond with "No action items."`,
    user: `Extract action items from this email:\n\n${emailBody}`,
  };
}

// ─── Cost estimation ──────────────────────────────────────────────────────────

export function estimateCost(
  promptTokens: number,
  completionTokens: number,
  promptPricePerMillion: number,
  completionPricePerMillion: number
): number {
  return (
    (promptTokens * promptPricePerMillion +
      completionTokens * completionPricePerMillion) /
    1_000_000
  );
}

// ─── Provider display helpers ─────────────────────────────────────────────────

export const PROVIDER_DISPLAY: Record<string, { label: string; color: string }> = {
  anthropic:  { label: 'Anthropic',  color: '#d97706' },
  openai:     { label: 'OpenAI',     color: '#10a37f' },
  google:     { label: 'Google',     color: '#4285f4' },
  'meta-llama': { label: 'Meta',    color: '#0866ff' },
  mistralai:  { label: 'Mistral',    color: '#ff7000' },
  groq:       { label: 'Groq',       color: '#f54e42' },
  cohere:     { label: 'Cohere',     color: '#39d353' },
  perplexity: { label: 'Perplexity', color: '#1d9bf0' },
  deepseek:   { label: 'DeepSeek',   color: '#1a56db' },
  qwen:       { label: 'Qwen',       color: '#6366f1' },
  microsoft:  { label: 'Microsoft',  color: '#0078d4' },
  'nous-research': { label: 'Nous',  color: '#9333ea' },
  nvidia:     { label: 'NVIDIA',     color: '#76b900' },
};

export function getProviderDisplay(provider: string) {
  return PROVIDER_DISPLAY[provider] ?? { label: provider, color: '#6b7280' };
}
