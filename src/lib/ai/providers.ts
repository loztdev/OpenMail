import type { AIProvider, AIPersona, AppSettings, ProviderId } from '@/types';

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access 200+ models from every major lab via one key',
    color: '#7c3aed',
    textColor: '#ffffff',
    keyPrefix: 'sk-or-',
    keyPlaceholder: 'sk-or-v1-...',
    docsUrl: 'https://openrouter.ai/keys',
    apiBase: 'https://openrouter.ai/api/v1',
    models: [],
    isOpenRouterCompatible: true,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o mini, o1, o1-mini and more',
    color: '#10a37f',
    textColor: '#ffffff',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    apiBase: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini', 'gpt-4-turbo'],
    isOpenRouterCompatible: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude Opus, Sonnet, and Haiku models',
    color: '#d97706',
    textColor: '#ffffff',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    apiBase: 'https://api.anthropic.com/v1',
    models: [
      'claude-opus-4-5',
      'claude-sonnet-4-5',
      'claude-haiku-4-5-20251001',
    ],
    isOpenRouterCompatible: false,
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini 1.5 Pro, Flash, and Nano',
    color: '#4285f4',
    textColor: '#ffffff',
    keyPlaceholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    apiBase: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'],
    isOpenRouterCompatible: false,
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large, Medium, Small, and Codestral',
    color: '#ff7000',
    textColor: '#ffffff',
    keyPlaceholder: 'your-key-here',
    docsUrl: 'https://console.mistral.ai/api-keys',
    apiBase: 'https://api.mistral.ai/v1',
    models: ['mistral-large-latest', 'mistral-medium', 'mistral-small', 'codestral-latest'],
    isOpenRouterCompatible: true,
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference — Llama 3.1, Mixtral, Gemma',
    color: '#f54e42',
    textColor: '#ffffff',
    keyPrefix: 'gsk_',
    keyPlaceholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    apiBase: 'https://api.groq.com/openai/v1',
    models: [
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
    isOpenRouterCompatible: true,
  },
  {
    id: 'cohere',
    name: 'Cohere',
    description: 'Command R+ for RAG and long-context tasks',
    color: '#39d353',
    textColor: '#000000',
    keyPlaceholder: 'your-key-here',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
    apiBase: 'https://api.cohere.ai/v1',
    models: ['command-r-plus', 'command-r', 'command-light'],
    isOpenRouterCompatible: false,
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Open-source models at scale — Llama, Mistral, DBRX',
    color: '#0ea5e9',
    textColor: '#ffffff',
    keyPlaceholder: 'your-key-here',
    docsUrl: 'https://api.together.ai/settings/api-keys',
    apiBase: 'https://api.together.xyz/v1',
    models: [
      'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
      'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
    ],
    isOpenRouterCompatible: true,
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    description: 'Run models locally — complete privacy, no API cost',
    color: '#6b7280',
    textColor: '#ffffff',
    keyPlaceholder: 'not-required',
    docsUrl: 'https://ollama.ai',
    apiBase: 'http://localhost:11434/v1',
    models: ['llama3.1', 'mistral', 'gemma2', 'phi3', 'qwen2.5'],
    isOpenRouterCompatible: true,
  },
];

export const PROVIDER_MAP: Record<ProviderId, AIProvider> = Object.fromEntries(
  AI_PROVIDERS.map((p) => [p.id, p])
) as Record<ProviderId, AIProvider>;

// ─── Curated model category lists ────────────────────────────────────────────

export const POPULAR_MODEL_IDS = new Set([
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'openai/o1-mini',
  'google/gemini-flash-1.5',
  'google/gemini-pro-1.5',
  'meta-llama/llama-3.1-70b-instruct',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-large',
  'mistralai/codestral-mamba',
  'perplexity/llama-3.1-sonar-large-128k-online',
  'qwen/qwen-2.5-72b-instruct',
]);

export const CODING_MODEL_IDS = new Set([
  'anthropic/claude-3.5-sonnet',
  'openai/gpt-4o',
  'deepseek/deepseek-coder',
  'mistralai/codestral-mamba',
  'mistralai/codestral-latest',
  'qwen/qwen-2.5-coder-32b-instruct',
  'deepseek/deepseek-chat',
  'phind/phind-codellama-34b',
  'codellama/codellama-70b-instruct',
  'wizardlm/wizardcoder-15b',
]);

export const FAST_MODEL_IDS = new Set([
  'meta-llama/llama-3.1-8b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemini-flash-1.5',
  'google/gemini-flash-1.5-8b',
  'anthropic/claude-3-haiku',
  'openai/gpt-4o-mini',
  'mistralai/mistral-7b-instruct',
  'groq/llama-3.1-8b-instant',
  'groq/mixtral-8x7b-32768',
  'qwen/qwen-2.5-7b-instruct',
]);

export const UNCENSORED_KEYWORDS = [
  'uncensored', 'abliterated', 'dolphin', 'hermes', 'wizard', 'nous-hermes',
  'goliath', 'lzlv', 'toppy', 'midnight', 'pygmalion', 'mythomax',
];

export const REASONING_MODEL_IDS = new Set([
  'openai/o1',
  'openai/o1-mini',
  'openai/o1-preview',
  'openai/o3-mini',
  'anthropic/claude-3.5-sonnet',
  'google/gemini-pro-1.5',
  'deepseek/deepseek-r1',
  'qwq-32b-preview',
]);

// ─── Built-in AI Personas ─────────────────────────────────────────────────────

export const BUILT_IN_PERSONAS: AIPersona[] = [
  {
    id: 'professional',
    name: 'Professional',
    emoji: '💼',
    description: 'Formal, concise, business-appropriate tone',
    systemPrompt:
      'You are a professional email assistant. Write in a formal, clear, and concise manner. Use proper business email conventions. Be respectful and direct.',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    defaultProvider: 'openrouter',
    useCases: ['summarize', 'draft', 'classify', 'digest'],
    tone: 'formal',
    isBuiltIn: true,
  },
  {
    id: 'casual',
    name: 'Casual Friend',
    emoji: '😊',
    description: 'Warm, friendly, conversational tone',
    systemPrompt:
      'You are a friendly email assistant. Write in a warm, casual, and conversational tone. Be helpful and approachable. Use natural language.',
    defaultModel: 'openai/gpt-4o-mini',
    defaultProvider: 'openrouter',
    useCases: ['draft', 'summarize'],
    tone: 'casual',
    isBuiltIn: true,
  },
  {
    id: 'technical',
    name: 'Tech Expert',
    emoji: '🔬',
    description: 'Precise, technical, detail-oriented',
    systemPrompt:
      'You are a technical expert email assistant. Use precise technical language, be detail-oriented, and include relevant technical context when helpful. Avoid unnecessary jargon but do not oversimplify.',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    defaultProvider: 'openrouter',
    useCases: ['summarize', 'draft', 'classify'],
    tone: 'technical',
    isBuiltIn: true,
  },
  {
    id: 'negotiator',
    name: 'Tough Negotiator',
    emoji: '⚡',
    description: 'Assertive, strategic, results-focused',
    systemPrompt:
      'You are an assertive email assistant specialized in negotiations. Be strategic, firm but professional, and always focus on achieving favorable outcomes. Use persuasive language and anticipate objections.',
    defaultModel: 'openai/gpt-4o',
    defaultProvider: 'openrouter',
    useCases: ['draft'],
    tone: 'formal',
    isBuiltIn: true,
  },
  {
    id: 'concise',
    name: 'Ultra Concise',
    emoji: '⚡',
    description: 'Maximum brevity — bullets and short sentences only',
    systemPrompt:
      'You are an ultra-concise email assistant. Use bullet points, keep sentences under 10 words, eliminate all filler. Every word must earn its place.',
    defaultModel: 'google/gemini-flash-1.5',
    defaultProvider: 'openrouter',
    useCases: ['summarize', 'draft', 'digest'],
    tone: 'concise',
    isBuiltIn: true,
  },
];

// ─── Default Settings ─────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  defaultProvider: 'openrouter',
  defaultModel: 'anthropic/claude-3.5-sonnet',
  defaultPersonaId: 'professional',
  pii: {
    enabled: false,
    scrubNames: true,
    scrubEmails: true,
    scrubPhones: true,
    scrubAddresses: true,
    scrubDates: false,
  },
  batchSummarizeEnabled: false,
  batchSummarizeHours: 24,
  contextClippingEnabled: true,
  contextClippingMaxTokens: 8000,
};
