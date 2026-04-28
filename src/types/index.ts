// ─── Email Types ────────────────────────────────────────────────────────────

export interface EmailAddress {
  name: string;
  email: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'starred' | 'trash' | 'spam';

export interface Email {
  id: string;
  threadId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  subject: string;
  body: string;
  htmlBody?: string;
  date: string; // ISO string
  read: boolean;
  starred: boolean;
  folder: EmailFolder;
  labels: string[];
  attachments?: Attachment[];
  aiSummary?: string;
  aiLabels?: string[];
}

export interface EmailThread {
  id: string;
  emails: Email[];
  subject: string;
  participants: EmailAddress[];
  lastDate: string;
  unreadCount: number;
}

// ─── AI / Model Types ────────────────────────────────────────────────────────

export type ModelCategory =
  | 'all'
  | 'favorites'
  | 'new'
  | 'popular'
  | 'uncensored'
  | 'free'
  | 'coding'
  | 'fast'
  | 'vision'
  | 'long-context'
  | 'reasoning';

export interface ModelPricing {
  prompt: number;      // cost per 1M tokens in USD
  completion: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;    // e.g. "anthropic", "openai", "meta-llama"
  description: string;
  contextLength: number;
  pricing: ModelPricing;
  isFavorite: boolean;
  isModerated: boolean;
  supportsVision: boolean;
  supportsReasoning: boolean;
  categories: ModelCategory[];
  createdAt?: number;  // unix timestamp
  architecture?: string;
}

// ─── Provider Types ──────────────────────────────────────────────────────────

export type ProviderId =
  | 'openrouter'
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'groq'
  | 'cohere'
  | 'together'
  | 'ollama';

export interface AIProvider {
  id: ProviderId;
  name: string;
  description: string;
  color: string;
  textColor: string;
  keyPrefix?: string;  // e.g. "sk-" for OpenAI
  keyPlaceholder: string;
  docsUrl: string;
  apiBase: string;
  models: string[];    // curated model IDs for direct providers
  isOpenRouterCompatible: boolean;
}

export interface APIKeyEntry {
  id: string;
  providerId: ProviderId;
  label: string;
  key: string;         // stored as-is; production would encrypt
  addedAt: string;     // ISO string
  usageLimitUsd?: number;
  currentUsageUsd: number;
  tokenCount: number;
  isActive: boolean;
}

// ─── Persona Types ───────────────────────────────────────────────────────────

export type PersonaUseCase = 'summarize' | 'draft' | 'classify' | 'search' | 'digest';

export interface AIPersona {
  id: string;
  name: string;
  emoji: string;
  description: string;
  systemPrompt: string;
  defaultModel: string;
  defaultProvider: ProviderId;
  useCases: PersonaUseCase[];
  tone: 'formal' | 'casual' | 'technical' | 'friendly' | 'concise';
  isBuiltIn: boolean;
}

// ─── Token Usage / Cost Tracking ─────────────────────────────────────────────

export type AIAction = 'summarize' | 'draft' | 'digest' | 'classify' | 'search' | 'chat';

export interface TokenUsageRecord {
  id: string;
  timestamp: string;   // ISO
  model: string;
  provider: ProviderId;
  action: AIAction;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  emailId?: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface PIISettings {
  enabled: boolean;
  scrubNames: boolean;
  scrubEmails: boolean;
  scrubPhones: boolean;
  scrubAddresses: boolean;
  scrubDates: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  defaultProvider: ProviderId;
  defaultModel: string;
  defaultPersonaId: string;
  pii: PIISettings;
  batchSummarizeEnabled: boolean;
  batchSummarizeHours: number;
  contextClippingEnabled: boolean;
  contextClippingMaxTokens: number;
  emailAccount?: {
    address: string;
    displayName: string;
    imapHost?: string;
    smtpHost?: string;
  };
}

// ─── OpenRouter API Response ──────────────────────────────────────────────────

export interface OpenRouterModelRaw {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  created?: number;
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
  };
  top_provider?: {
    is_moderated?: boolean;
    context_length?: number;
  };
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
    input_modalities?: string[];
    output_modalities?: string[];
  };
}

// ─── AI Completion ───────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  model: string;
  provider: ProviderId;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costUsd: number;
}
