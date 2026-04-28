import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenMail — AI Email with BYOK',
  description: 'Privacy-first AI email client. Bring your own keys from OpenRouter, OpenAI, Anthropic, Google, Mistral, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
