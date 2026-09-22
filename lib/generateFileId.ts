import { CONFIG } from './config'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const ALPHABET_LENGTH = ALPHABET.length

/**
 * Generate random string using URL-safe base64 characters.
 * Works in both Node.js and browser environments.
 *
 * ALPHABET_LENGTH is a power of two (64), so `byte % 64` maps each byte value
 * to exactly one bucket — no modulo bias, unlike the previous base36 mapping.
 */
function generateRandomId(length: number): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)

  let result = ''
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i] % ALPHABET_LENGTH]
  }

  return result
}

/**
 * Generate a unique, non-guessable file ID.
 * 12 base64url chars = 72 bits of entropy; slugs pass the ^[a-zA-Z0-9_-]+$ pattern.
 */
export function createFileIdSync(): string {
  return generateRandomId(CONFIG.FILE_ID_LENGTH)
}
