import { SERVER_ERRORS } from './messages';

type ApiErrorShape = {
  status?: number | string;
  data?:
    | {
        error?: string;
        details?: string | string[];
      }
    | string;
  error?: string;
  message?: string;
};

export function getApiErrorMessage(error: unknown, fallback: string = SERVER_ERRORS.requestFailed): string {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object') {
    const typedError = error as ApiErrorShape;
    const data = typedError.data;

    if (typeof data === 'string') {
      return data;
    }

    if (data && typeof data === 'object') {
      if (Array.isArray(data.details)) {
        return data.details.join(', ');
      }

      if (typeof data.details === 'string' && data.details.trim()) {
        return data.details;
      }

      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
    }

    if (typeof typedError.error === 'string' && typedError.error.trim()) {
      return typedError.error;
    }

    if (typeof typedError.message === 'string' && typedError.message.trim()) {
      return typedError.message;
    }
  }

  return fallback;
}