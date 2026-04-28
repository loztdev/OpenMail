import { NextRequest, NextResponse } from 'next/server';
import type { ProviderId } from '@/types';

export async function POST(req: NextRequest) {
  let body: { providerId: ProviderId; key: string };
  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { providerId, key } = body;
  if (!providerId || !key) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    if (providerId === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });
      if (!res.ok && res.status === 401) throw new Error('Invalid key');
      return NextResponse.json({ ok: true });
    }

    if (providerId === 'google') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
      );
      if (!res.ok) throw new Error('Invalid key');
      return NextResponse.json({ ok: true });
    }

    if (providerId === 'ollama') {
      const res = await fetch('http://localhost:11434/api/tags');
      if (!res.ok) throw new Error('Ollama not running');
      return NextResponse.json({ ok: true });
    }

    // OpenAI-compatible: list models
    const bases: Record<string, string> = {
      openrouter: 'https://openrouter.ai/api/v1',
      openai:     'https://api.openai.com/v1',
      mistral:    'https://api.mistral.ai/v1',
      groq:       'https://api.groq.com/openai/v1',
      together:   'https://api.together.xyz/v1',
      cohere:     'https://api.cohere.ai/compatibility/v1',
    };

    const base = bases[providerId];
    if (!base) return NextResponse.json({ ok: true }); // unknown provider, skip test

    const res = await fetch(`${base}/models`, {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (res.status === 401 || res.status === 403) throw new Error('Invalid API key');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Test failed' },
      { status: 401 }
    );
  }
}
