import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'HTTP-Referer': 'https://openmail.app',
        'X-Title': 'OpenMail',
      },
      next: { revalidate: 1800 }, // cache 30 min
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `OpenRouter returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[models/openrouter]', err);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}
