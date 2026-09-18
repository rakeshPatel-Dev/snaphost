import { CONFIG } from './config';

/**
 * Generate random string using base36 characters
 * Works in both Node.js and browser environments
 */
function generateRandomId(length: number): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}

/**
 * Generate a unique, non-guessable file ID
 */
export function createFileIdSync(): string {
  return generateRandomId(CONFIG.FILE_ID_LENGTH);
}


