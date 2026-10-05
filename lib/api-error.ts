import { ACCOUNT_ERRORS, AUTH_ERRORS, FILE_ERRORS, SERVER_ERRORS } from './messages'

type ApiErrorShape = {
  status?: number | string
  data?:
    | {
        error?: string
        details?: string | string[]
      }
    | string
  error?: string
  message?: string
}

function normalizeApiMessage(message: string, fallback: string): string {
  switch (message.trim().toLowerCase()) {
    case 'unauthorized':
      return ACCOUNT_ERRORS.unauthorized
    case 'profile not found':
      return ACCOUNT_ERRORS.profileNotFound
    case 'file not found':
      return FILE_ERRORS.fileNotFound
    case 'internal error':
    case 'internal server error':
      return SERVER_ERRORS.internalError
    case 'failed to update username':
      return AUTH_ERRORS.failedToUpdateUsername
    case 'unable to delete your account. please try again.':
      return ACCOUNT_ERRORS.failedToDeleteAccount
    default:
      return message || fallback
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string = SERVER_ERRORS.requestFailed
): string {
  if (!error) {
    return fallback
  }

  if (typeof error === 'string') {
    return normalizeApiMessage(error, fallback)
  }

  if (typeof error === 'object') {
    const typedError = error as ApiErrorShape
    const data = typedError.data

    if (typeof data === 'string') {
      return normalizeApiMessage(data, fallback)
    }

    if (data && typeof data === 'object') {
      if (Array.isArray(data.details)) {
        return data.details.map((detail) => normalizeApiMessage(detail, fallback)).join(', ')
      }

      if (typeof data.details === 'string' && data.details.trim()) {
        return normalizeApiMessage(data.details, fallback)
      }

      if (typeof data.error === 'string' && data.error.trim()) {
        return normalizeApiMessage(data.error, fallback)
      }
    }

    if (typeof typedError.error === 'string' && typedError.error.trim()) {
      return normalizeApiMessage(typedError.error, fallback)
    }

    if (typeof typedError.message === 'string' && typedError.message.trim()) {
      return normalizeApiMessage(typedError.message, fallback)
    }
  }

  return fallback
}
