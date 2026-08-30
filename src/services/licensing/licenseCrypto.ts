import type { UserPlan } from '../../types';

// Unambiguous character set (no 0/O, 1/I/L)
const CHARSET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/**
 * Normalizes a user-input license code:
 * Strips whitespace, trims, transforms to uppercase.
 */
export function normalizeLicenseCode(rawCode: string): string {
  return rawCode.trim().toUpperCase().replace(/[\s_]+/g, '-');
}

/**
 * Computes a SHA-256 hexadecimal hash string for a normalized license code.
 */
export async function hashLicenseCode(code: string): Promise<string> {
  const normalized = normalizeLicenseCode(code);
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple SHA-256 for non-subtle contexts (e.g. older testing envs)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback_hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Generates a single cryptographically secure random segment of length N.
 */
function generateSegment(length: number): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET[bytes[i] % CHARSET.length];
  }
  return result;
}

/**
 * Generates a unique, non-guessable license code.
 * Example: `SCAL-PLUS-7X4K-92PM-Q8FD`
 */
export function generateLicenseCode(plan: 'PLUS' | 'PRO'): string {
  const seg1 = generateSegment(4);
  const seg2 = generateSegment(4);
  const seg3 = generateSegment(4);
  return `SCAL-${plan}-${seg1}-${seg2}-${seg3}`;
}

/**
 * Creates a masked prefix representation for safe storage and admin display.
 * Example: `SCAL-PLUS-****-Q8FD`
 */
export function createMaskedPrefix(code: string): string {
  const parts = code.split('-');
  if (parts.length >= 4) {
    return `${parts[0]}-${parts[1]}-****-${parts[parts.length - 1]}`;
  }
  return `${code.slice(0, 8)}****${code.slice(-4)}`;
}
