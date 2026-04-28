import type { Email } from '@/types';

export const MOCK_EMAILS: Email[] = [
  {
    id: 'e1',
    threadId: 't1',
    from: { name: 'Sarah Chen', email: 'sarah.chen@nexacorp.com' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: 'Q3 Product Roadmap — Action Required by Friday',
    body: `Hi,

I wanted to loop you in on our Q3 roadmap planning session. We've finalized the key initiatives and need your sign-off before we present to the board on Friday.

Key highlights:
• AI-powered customer segmentation (kicks off July 1)
• Mobile app redesign — targeting 40% reduction in onboarding drop-off
• API v3 launch with new rate limiting and webhook support
• Partnership integrations: Salesforce, HubSpot, Zapier

Can you review the attached deck and confirm your availability for a 30-min sync on Thursday at 2pm PST?

Also, the engineering team is asking about headcount for Q4. I'll need a decision by EOD Thursday.

Thanks,
Sarah`,
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    starred: true,
    folder: 'inbox',
    labels: ['Work', 'Action Required'],
  },
  {
    id: 'e2',
    threadId: 't2',
    from: { name: 'GitHub', email: 'noreply@github.com' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: '[openmail/openmail] New pull request: feat/ai-email-byok-app',
    body: `A pull request has been opened in openmail/openmail.

PR #47 — feat/ai-email-byok-app
Author: claude-bot
Branch: claude/ai-email-byok-app → main

Changes: +2,847 lines, -12 lines
Files changed: 38

Summary:
This PR implements the BYOK (Bring Your Own Key) AI email app with full model browser, provider management, and all AI features.

View the pull request: https://github.com/openmail/openmail/pull/47

You can reply to this email to comment on the pull request.

—
GitHub • You're receiving this because you are subscribed to this repository.`,
    date: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    read: false,
    starred: false,
    folder: 'inbox',
    labels: ['Notification', 'Work'],
  },
  {
    id: 'e3',
    threadId: 't3',
    from: { name: 'Marcus Rivera', email: 'm.rivera@acmefinance.com' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: 'Invoice #INV-2024-0892 — Due in 7 days',
    body: `Dear Client,

Please find below the details for invoice #INV-2024-0892.

Services Rendered: Software Architecture Consulting — June 2024
Amount Due: $8,500.00
Due Date: July 15, 2024
Payment Terms: Net 30

Payment Options:
• ACH/Wire: Account ending in 4821
• Credit Card: Pay at invoice.acmefinance.com/INV-0892
• Check: Make payable to Acme Finance LLC

If you have any questions regarding this invoice, please don't hesitate to reach out.

Best regards,
Marcus Rivera
Acme Finance LLC`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    read: false,
    starred: false,
    folder: 'inbox',
    labels: ['Finance', 'Invoice'],
  },
  {
    id: 'e4',
    threadId: 't4',
    from: { name: 'The Morning Brew', email: 'newsletter@morningbrew.com' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: "☕ AI's $1 Trillion Moment + Markets React to Fed Decision",
    body: `MORNING BREW — Monday, July 8, 2024

GOOD MORNING. Big news in tech and finance today.

🤖 AI'S TRILLION-DOLLAR MILESTONE
OpenAI reportedly in talks to raise at $150B valuation — which would make it more valuable than Goldman Sachs. Meanwhile, Anthropic secured another $2.5B from Amazon, and Google is doubling down on Gemini with a $1B dedicated infrastructure investment.

What it means: The AI arms race is showing no signs of slowing down. The question is who captures the value — the model makers or the application layer?

📈 MARKETS
• S&P 500: +0.8% (record high)
• NASDAQ: +1.2%
• 10-Year Treasury: 4.28%
• Bitcoin: $67,400 (+3%)

💡 TODAY'S BIG IDEA
Why every SaaS company will be an AI company by 2026 — or won't exist.

Read the full issue at morningbrew.com →

Unsubscribe | Manage Preferences`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
    starred: false,
    folder: 'inbox',
    labels: ['Newsletter'],
  },
  {
    id: 'e5',
    threadId: 't5',
    from: { name: 'Priya Patel', email: 'priya@startupventures.vc' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: 'Follow-up: Series A term sheet discussion',
    body: `Hi,

It was great connecting with you at the AI Summit last week. I wanted to follow up on our conversation about your Series A.

We've been watching OpenMail closely and the traction metrics you shared were impressive — 340% MoM growth is hard to ignore.

Our thesis:
- BYOK models are the future of AI applications (privacy + cost control)
- Email is a $50B+ market ripe for AI disruption
- Your team's execution track record is strong

I'd love to set up a partner call next week to discuss a potential $5-8M seed extension or move directly to Series A conversation if the numbers support it.

Are you free for a 45-min call next Tuesday or Wednesday afternoon?

Best,
Priya Patel
Partner, Startup Ventures VC
Twitter: @priya_vc`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: false,
    starred: true,
    folder: 'inbox',
    labels: ['Work', 'Action Required'],
  },
  {
    id: 'e6',
    threadId: 't6',
    from: { name: 'Alex Kim', email: 'alex.kim@teammate.io' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: "Quick question about your BYOK implementation",
    body: `Hey!

Saw your talk at AI DevCon and loved the OpenMail demo. Super impressed by the PII scrubbing approach.

I have a quick technical question: how are you handling key rotation when a user wants to switch providers mid-conversation? Are you storing the mapping per-thread or per-action?

Also curious if you're using streaming or batched completions for the digest feature — we tried both and found streaming was actually worse UX for digests even though it feels faster for drafts.

Would love to grab coffee if you're in SF this month.

— Alex`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    read: true,
    starred: false,
    folder: 'inbox',
    labels: ['Personal', 'FYI'],
  },
  {
    id: 'e7',
    threadId: 't7',
    from: { name: 'Vercel', email: 'noreply@vercel.com' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: '🚀 Deployment successful: openmail-prod (2m 34s)',
    body: `Your deployment to production was successful!

Project: openmail
Branch: main → production
Commit: a8f3c2d "feat: add model browser with categories"
Duration: 2m 34s
Status: ✅ Ready

Deployment URL: https://openmail.vercel.app
Build Logs: Available in dashboard

Changes deployed:
+ Model browser with 200+ models from OpenRouter
+ Category tabs: Popular, New, Free, Vision, Long Context
+ Favorites system with persistence
+ PII scrubber with real-time preview

Vercel Team — openmail`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    starred: false,
    folder: 'inbox',
    labels: ['Notification'],
  },
  {
    id: 'e8',
    threadId: 't8',
    from: { name: 'Emma Walsh', email: 'emma@designsprint.co' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: 'UX Review: OpenMail Settings Flow',
    body: `Hi,

Finished the UX review you requested. Here's my assessment:

Overall: 8.5/10 — Really polished for a v0.1. A few friction points worth fixing before launch.

Critical Issues:
1. The API key input has no validation feedback — user doesn't know if key is valid until they try to use AI features. Add a "Test Key" button.
2. Model browser category tabs overflow on mobile (375px). Consider a dropdown on small screens.
3. No onboarding flow for first-time users — they land on an empty inbox with no guidance.

Nice-to-haves:
• Add model comparison view (side-by-side pricing/context)
• "Use this model for..." quick-assign from model card
• Keyboard shortcuts panel (users love discoverability)

The AI panel is *chef's kiss*. The PII toggle with the highlight preview was a last-minute addition right?

Let me know if you want me to create mockups for any of these.

Emma`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    read: false,
    starred: false,
    folder: 'inbox',
    labels: ['Work', 'FYI'],
  },
  {
    id: 'e9',
    threadId: 't9',
    from: { name: 'Stripe', email: 'receipts@stripe.com' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: 'Your receipt from Vercel — $20.00',
    body: `Receipt from Vercel

Date: July 8, 2024
Receipt #: 12847-A8F3
Amount: $20.00

Items:
  Vercel Pro Plan (Monthly)        $20.00
  ─────────────────────────────────────
  Subtotal:                        $20.00
  Tax:                              $0.00
  Total:                           $20.00

Payment: Visa ending in 4242

If you have questions about this receipt, please contact support@vercel.com.

Stripe • 354 Oyster Point Blvd, South San Francisco, CA 94080`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    read: true,
    starred: false,
    folder: 'inbox',
    labels: ['Finance', 'Receipt'],
  },
  {
    id: 'e10',
    threadId: 't10',
    from: { name: 'LinkedIn', email: 'messages-noreply@linkedin.com' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: 'You have 3 new connection requests',
    body: `You have new connection requests on LinkedIn

1. Jordan Lee — Senior ML Engineer at OpenAI
   "Hi, loved your post about BYOK architectures. Would love to connect!"

2. Natalie Torres — Founder at AI Startup Hub
   "Your OpenMail demo was fantastic. Let's connect!"

3. David Park — Product Manager at Anthropic
   "Always looking to connect with builders in the AI space."

View your pending invitations →

LinkedIn Corporation · 1000 West Maude Avenue, Sunnyvale, CA 94085`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    read: true,
    starred: false,
    folder: 'inbox',
    labels: ['Social', 'Notification'],
  },
  {
    id: 'e11',
    threadId: 't11',
    from: { name: 'You', email: 'me@example.com' },
    to: [{ name: 'Sarah Chen', email: 'sarah.chen@nexacorp.com' }],
    subject: 'Re: Q3 Product Roadmap — Action Required by Friday',
    body: `Hi Sarah,

Thanks for looping me in. I've reviewed the deck — looks great overall.

A few thoughts:
• The AI segmentation timeline looks aggressive. Can we add a 2-week buffer?
• For the mobile redesign, let's ensure we define "40% reduction" clearly (is that measured vs current baseline or industry average?)
• API v3 — I want to make sure we have backward compat for at least 6 months

I'm available Thursday at 2pm PST. Sending a hold now.

On headcount: I'll have numbers for you by Wednesday EOD.

Best,
—`,
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: true,
    starred: false,
    folder: 'sent',
    labels: ['Work'],
  },
  {
    id: 'e12',
    threadId: 't12',
    from: { name: 'Tyler Brooks', email: 'tyler@accel.com' },
    to: [{ name: 'You', email: 'me@example.com' }],
    subject: 'Intro: Tyler Brooks (Accel) <> OpenMail',
    body: `Hi,

I'm Tyler from Accel Partners. Priya from Startup Ventures mentioned you're building something exciting in the AI email space.

We've been tracking the B2B AI productivity space closely and OpenMail's BYOK model is exactly the kind of architecture enterprises are asking for (security, cost control, model flexibility).

Would love to learn more. Are you fundraising? Happy to share our thesis and see if there's a fit.

Best,
Tyler Brooks
Partner, Accel
tyler@accel.com | (415) 555-0142`,
    date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    read: false,
    starred: true,
    folder: 'inbox',
    labels: ['Work', 'Action Required'],
  },
];

export function getEmailsByFolder(folder: string, emails: Email[]): Email[] {
  if (folder === 'starred') return emails.filter((e) => e.starred);
  return emails.filter((e) => e.folder === folder);
}

export function searchEmails(query: string, emails: Email[]): Email[] {
  const q = query.toLowerCase();
  return emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(q) ||
      e.from.name.toLowerCase().includes(q) ||
      e.from.email.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q)
  );
}

export function getUnreadCount(emails: Email[], folder?: string): number {
  const filtered = folder ? emails.filter((e) => e.folder === folder) : emails;
  return filtered.filter((e) => !e.read).length;
}
