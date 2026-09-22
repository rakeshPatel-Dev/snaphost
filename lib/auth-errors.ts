import { AUTH_ERRORS } from './messages'

const AUTH_CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email or password is incorrect.',
  email_not_confirmed: 'Please confirm your email address before signing in.',
  user_already_exists: 'An account with that email already exists.',
  email_exists: 'An account with that email already exists.',
  weak_password: 'Please choose a stronger password (at least 8 characters).',
  same_password: 'Your new password must be different from your old one.',
  invalid_email: 'Please enter a valid email address.',
  over_email_send_rate_limit: 'Too many email requests. Please wait a moment and try again.',
  rate_limit_exceeded: 'Too many attempts. Please wait a moment and try again.',
  signup_disabled: 'New signups are currently disabled.',
  access_denied: 'That sign-in method is not available right now.',
  provider_email_needs_verification: 'Please verify your email before signing in.',
  session_not_found: 'Your session has expired. Please sign in again.',
  refresh_token_not_found: 'Your session has expired. Please sign in again.',
  flow_state_not_found: 'That sign-in link has expired. Please try again.',
  validation_failed: 'Please check your details and try again.',
}

function messageFingerprint(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) return 'invalid_credentials'
  if (normalized.includes('email not confirmed')) return 'email_not_confirmed'
  if (normalized.includes('already registered')) return 'email_exists'
  if (normalized.includes('password should be at least')) return 'weak_password'
  if (normalized.includes('new password should be different')) return 'same_password'
  if (normalized.includes('email requests are too frequent')) return 'over_email_send_rate_limit'
  if (normalized.includes('signups not allowed')) return 'signup_disabled'

  return ''
}

/**
 * Map a Supabase auth error to a friendly product message and log the raw
 * error so real failures are still observable.
 */
export function getAuthErrorMessage(
  error: unknown,
  fallback: string = AUTH_ERRORS.authFailed
): string {
  if (!error || typeof error !== 'object') {
    return fallback
  }

  const maybe = error as { code?: unknown; message?: unknown }

  const code = typeof maybe.code === 'string' ? maybe.code.toLowerCase() : ''
  if (code && AUTH_CODE_MESSAGES[code]) {
    return AUTH_CODE_MESSAGES[code]
  }

  const message = typeof maybe.message === 'string' ? maybe.message : ''
  if (message) {
    const fingerprint = messageFingerprint(message)
    if (fingerprint && AUTH_CODE_MESSAGES[fingerprint]) {
      return AUTH_CODE_MESSAGES[fingerprint]
    }
    console.error('Unmapped auth error:', message)
  }

  return fallback
}
