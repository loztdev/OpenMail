/**
 * Client-side AI completion — used in the Capacitor (mobile) build where
 * Next.js API routes don't exist.  Capacitor's native HTTP plugin handles
 * requests so CORS is never an issue.
 */

import type { AIMessage, ProviderId } from '@/types';

interface DirectCompleteRequest {
  model: string;
  provider: ProviderId;
  apiKey: string;
  messages: AIMessage[];
  maxTokens?: number;
}

interface DirectCompleteResponse {
  content: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  costUsd: number;
}

const OPENAI_COMPAT_BASES: Partial<Record<ProviderId, string>> = {
  openrouter: 'https://openrouter.ai/api/v1',
  openai:     'https://api.openai.com/v1',
  mistral:    'https://api.mistral.ai/v1',
  groq:       'https://api.groq.com/openai/v1',
  together:   'https://api.together.xyz/v1',
  cohere:     'https://api.cohere.ai/compatibility/v1',
  ollama:     'http://localhost:11434/v1',
};

async function callOpenAICompat(
  base: string,
  model: string,
  messages: AIMessage[],
  apiKey: string,
  maxTokens: number
) {
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://openmail.app',
      'X-Title': 'OpenMail',
    },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err}`);
  }
  const d = await res.json() as {
    choices: { message: { content: string } }[];
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };
  return {
    content: d.choices[0]?.message?.content ?? '',
    usage: {
      promptTokens: d.usage?.prompt_tokens ?? 0,
      completionTokens: d.usage?.completion_tokens ?? 0,
      totalTokens: d.usage?.total_tokens ?? 0,
    },
  };
}

async function callAnthropic(
  model: string,
  messages: AIMessage[],
  apiKey: string,
  maxTokens: number
) {
  const system = messages.find((m) => m.role === 'system')?.content;
  const userMsgs = messages.filter((m) => m.role !== 'system');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: userMsgs }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const d = await res.json() as {
    content: { text: string }[];
    usage: { input_tokens: number; output_tokens: number };
  };
  return {
    content: d.content[0]?.text ?? '',
    usage: {
      promptTokens: d.usage.input_tokens,
      completionTokens: d.usage.output_tokens,
      totalTokens: d.usage.input_tokens + d.usage.output_tokens,
    },
  };
}

async function callGoogle(
  model: string,
  messages: AIMessage[],
  apiKey: string,
  maxTokens: number
) {
  const system = messages.find((m) => m.role === 'system')?.content;
  const userMsgs = messages.filter((m) => m.role !== 'system').map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const modelId = model.replace(/^google\//, '');
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents: userMsgs,
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    }
  );
  if (!res.ok) throw new Error(`Google ${res.status}`);
  const d = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
    usageMetadata: { promptTokenCount: number; candidatesTokenCount: number };
  };
  const pt = d.usageMetadata?.promptTokenCount ?? 0;
  const ct = d.usageMetadata?.candidatesTokenCount ?? 0;
  return {
    content: d.candidates[0]?.content?.parts[0]?.text ?? '',
    usage: { promptTokens: pt, completionTokens: ct, totalTokens: pt + ct },
  };
}

// Rough cost table (USD per 1M tokens) — same as the server route
const PRICING: Record<string, [number, number]> = {
  'anthropic/claude-3.5-sonnet': [3, 15],
  'anthropic/claude-3-haiku':    [0.25, 1.25],
  'openai/gpt-4o':               [5, 15],
  'openai/gpt-4o-mini':          [0.15, 0.6],
  'google/gemini-flash-1.5':     [0.075, 0.3],
};

function estimateCost(model: string, prompt: number, completion: number) {
  const [p, c] = PRICING[model] ?? [1, 3];
  return (prompt * p + completion * c) / 1_000_000;
}

export async function completeDirectly(
  req: DirectCompleteRequest
): Promise<DirectCompleteResponse> {
  const { model, provider, apiKey, messages, maxTokens = 1024 } = req;

  let result: { content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } };

  if (provider === 'anthropic' && !model.includes('/')) {
    result = await callAnthropic(model, messages, apiKey, maxTokens);
  } else if (provider === 'google' && !model.startsWith('google/')) {
    result = await callGoogle(model, messages, apiKey, maxTokens);
  } else {
    const base = OPENAI_COMPAT_BASES[provider] ?? OPENAI_COMPAT_BASES.openrouter!;
    const modelId = provider === 'openrouter' ? model : (model.split('/').pop() ?? model);
    result = await callOpenAICompat(base, modelId, messages, apiKey, maxTokens);
  }

  return {
    ...result,
    costUsd: estimateCost(model, result.usage.promptTokens, result.usage.completionTokens),
  };
}

/** True when running inside a Capacitor shell (no server-side API routes). */
export const IS_MOBILE =
  typeof window !== 'undefined' &&
  !!(window as unknown as { Capacitor?: { isNative?: boolean } }).Capacitor?.isNative;
