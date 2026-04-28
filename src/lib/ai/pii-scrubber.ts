import type { PIISettings } from '@/types';

// Regex patterns for common PII types
const PATTERNS = {
  email:   /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,
  phone:   /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn:     /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  zipCode: /\b\d{5}(?:-\d{4})?\b/g,
  // Simple name patterns — first + last capitalized words
  name:    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})\b/g,
  // Street addresses
  address: /\d{1,5}\s(?:[A-Za-z]+\s){1,4}(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Ct|Pl|Terr|Ter|Circle|Cir|Court|Boulevard|Street|Avenue|Drive|Road|Lane)\.?\b/gi,
  // Dates like "January 15, 2024", "01/15/2024", "2024-01-15"
  date:    /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/gi,
};

export interface ScrubResult {
  text: string;
  replacements: { original: string; placeholder: string; type: string }[];
}

export function scrubPII(text: string, settings: PIISettings): ScrubResult {
  if (!settings.enabled) return { text, replacements: [] };

  let result = text;
  const replacements: ScrubResult['replacements'] = [];
  let counter = 1;

  const replace = (pattern: RegExp, type: string, label: string) => {
    result = result.replace(pattern, (match) => {
      const placeholder = `[${label}_${counter++}]`;
      replacements.push({ original: match, placeholder, type });
      return placeholder;
    });
  };

  // Always scrub SSN and credit cards
  replace(PATTERNS.ssn, 'ssn', 'SSN');
  replace(PATTERNS.creditCard, 'card', 'CARD');

  if (settings.scrubEmails) replace(PATTERNS.email, 'email', 'EMAIL');
  if (settings.scrubPhones) replace(PATTERNS.phone, 'phone', 'PHONE');
  if (settings.scrubAddresses) replace(PATTERNS.address, 'address', 'ADDR');
  if (settings.scrubDates) replace(PATTERNS.date, 'date', 'DATE');
  // Names last as they're most likely to create false positives
  if (settings.scrubNames) replace(PATTERNS.name, 'name', 'NAME');

  return { text: result, replacements };
}

export function restorePII(
  text: string,
  replacements: ScrubResult['replacements']
): string {
  let result = text;
  // Restore in reverse order to preserve placeholder numbering
  for (const r of [...replacements].reverse()) {
    result = result.replaceAll(r.placeholder, r.original);
  }
  return result;
}

export function highlightPII(text: string): string {
  let result = text;

  const highlight = (pattern: RegExp, color: string) => {
    result = result.replace(
      pattern,
      (match) =>
        `<mark style="background:${color};color:#000;border-radius:2px;padding:0 2px">${match}</mark>`
    );
  };

  highlight(PATTERNS.email, '#fef08a');
  highlight(PATTERNS.phone, '#bbf7d0');
  highlight(PATTERNS.ssn, '#fecaca');
  highlight(PATTERNS.creditCard, '#fecaca');
  highlight(PATTERNS.address, '#ddd6fe');

  return result;
}
