import { NextRequest, NextResponse } from 'next/server';
import type { AIMessage, ProviderId } from '@/types';

interface CompleteRequest {
  model: string;
  provider: ProviderId;
  apiKey: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

// Anthropic direct API (not OpenAI-compatible)
async function callAnthropic(
  model: string,
  messages: AIMessage[],
  apiKey: string,
  maxTokens = 1024
) {
  const systemMsg = messages.find((m) => m.role === 'system')?.content;
  const userMessages = messages.filter((m) => m.role !== 'system');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemMsg,
      messages: userMessages,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error (${res.status}): ${err}`);
  }

  const data = await res.json() as {
    content: { text: string }[];
    usage: { input_tokens: number; output_tokens: number };
    model: string;
  };

  return {
    content: data.content[0]?.text ?? '',
    usage: {
      promptTokens: data.usage.input_tokens,
      completionTokens: data.usage.output_tokens,
      totalTokens: data.usage.input_tokens + data.usage.output_tokens,
    },
  };
}

// Google Gemini direct API
async function callGoogle(
  model: string,
  messages: AIMessage[],
  apiKey: string,
  maxTokens = 1024
) {
  const systemMsg = messages.find((m) => m.role === 'system')?.content;
  const userMessages = messages.filter((m) => m.role !== 'system');

  const geminiMessages = userMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const modelId = model.replace('google/', '');
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: systemMsg ? { parts: [{ text: systemMsg }] } : undefined,
        contents: geminiMessages,
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google error (${res.status}): ${err}`);
  }

  const data = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
    usageMetadata: { promptTokenCount: number; candidatesTokenCount: number };
  };

  const text = data.candidates[0]?.content?.parts[0]?.text ?? '';
  const usage = data.usageMetadata;

  return {
    content: text,
    usage: {
      promptTokens: usage?.promptTokenCount ?? 0,
      completionTokens: usage?.candidatesTokenCount ?? 0,
      totalTokens: (usage?.promptTokenCount ?? 0) + (usage?.candidatesTokenCount ?? 0),
    },
  };
}

// OpenAI-compatible API (covers OpenRouter, OpenAI, Groq, Mistral, Together, Ollama)
async function callOpenAICompat(
  apiBase: string,
  model: string,
  messages: AIMessage[],
  apiKey: string,
  maxTokens = 1024
) {
  const res = await fetch(`${apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://openmail.app',
      'X-Title': 'OpenMail',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error (${res.status}): ${err}`);
  }

  const data = await res.json() as {
    choices: { message: { content: string } }[];
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    model: string;
  };

  return {
    content: data.choices[0]?.message?.content ?? '',
    usage: {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens: data.usage?.total_tokens ?? 0,
    },
  };
}

const PROVIDER_BASES: Record<string, string> = {
  openrouter: 'https://openrouter.ai/api/v1',
  openai:     'https://api.openai.com/v1',
  mistral:    'https://api.mistral.ai/v1',
  groq:       'https://api.groq.com/openai/v1',
  together:   'https://api.together.xyz/v1',
  cohere:     'https://api.cohere.ai/compatibility/v1',
  ollama:     'http://localhost:11434/v1',
};

function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  // Simple cost estimation — real pricing fetched from OpenRouter
  const pricing: Record<string, [number, number]> = {
    'gpt-4o':                        [5, 15],
    'gpt-4o-mini':                   [0.15, 0.6],
    'claude-opus-4-5':               [15, 75],
    'claude-sonnet-4-5':             [3, 15],
    'claude-haiku-4-5-20251001':     [0.25, 1.25],
    'anthropic/claude-3.5-sonnet':   [3, 15],
    'anthropic/claude-3-haiku':      [0.25, 1.25],
    'openai/gpt-4o':                 [5, 15],
    'openai/gpt-4o-mini':            [0.15, 0.6],
    'google/gemini-flash-1.5':       [0.075, 0.3],
    'meta-llama/llama-3.1-70b-instruct': [0.52, 0.75],
  };

  const [promptPer1M, completionPer1M] = pricing[model] ?? [1, 3];
  return (promptTokens * promptPer1M + completionTokens * completionPer1M) / 1_000_000;
}

export async function POST(req: NextRequest) {
  let body: CompleteRequest;
  try {
    body = await req.json() as CompleteRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { model, provider, apiKey, messages, maxTokens = 1024 } = body;

  if (!model || !provider || !apiKey || !messages?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    let result: { content: string; usage: { promptTokens: number; completionTokens: number; totalTokens: number } };

    if (provider === 'anthropic' && !model.includes('/')) {
      result = await callAnthropic(model, messages, apiKey, maxTokens);
    } else if (provider === 'google' && !model.startsWith('google/')) {
      result = await callGoogle(model, messages, apiKey, maxTokens);
    } else {
      // For OpenRouter, pass the full model ID; for others, strip provider prefix
      const modelId = provider === 'openrouter' ? model : (model.split('/').pop() ?? model);
      const base = PROVIDER_BASES[provider] ?? PROVIDER_BASES.openrouter;
      result = await callOpenAICompat(base, modelId, messages, apiKey, maxTokens);
    }

    const costUsd = estimateCost(model, result.usage.promptTokens, result.usage.completionTokens);

    return NextResponse.json({
      content: result.content,
      usage: result.usage,
      model,
      costUsd,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ai/complete]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
