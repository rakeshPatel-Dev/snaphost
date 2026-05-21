import { CONFIG } from './config';

/**
 * Generate random string using base36 characters
 * Works in both Node.js and browser environments
 */
function generateRandomId(length: number): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';

  if (typeof window === 'undefined') {
    // Node.js environment (server-side)
    const crypto = require('crypto');
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  } else {
    // Browser environment (client-side)
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  }

  return result;
}

/**
 * Generate a unique, non-guessable file ID
 */
export function createFileIdSync(): string {
  return generateRandomId(CONFIG.FILE_ID_LENGTH);
}

/**
 * Generate multiple unique file IDs
 */
export function generateMultipleFileIds(count: number): string[] {
  return Array.from({ length: count }, () => createFileIdSync());
}
