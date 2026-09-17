import { validateFile } from '@/lib/fileValidation';
import { store } from '@/state/store';
import { snaphostApi } from '@/state/api';
import { formatFileSize } from '@/shared/utils/file-format';
import type { AnonymousLink } from '@/types/app';
import { UPLOAD_ERRORS } from '@/lib/messages';

const AUTO_CLEANUP_INTERVAL_MS = 60 * 1000;

export function getAutoCleanupIntervalMs() {
  return AUTO_CLEANUP_INTERVAL_MS;
}

export function getAnonymousUploadAcceptValue() {
  return 'image/png,image/jpeg,image/webp,.pdf,application/pdf';
}

export function validateAnonymousFile(file: File): string | null {
  const validation = validateFile(file);

  if (!validation.valid) {
    return validation.errors[0]?.message || UPLOAD_ERRORS.fileValidationFailed;
  }

  return null;
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function getTimeRemaining(value: string) {
  const remaining = new Date(value).getTime() - Date.now();

  if (remaining <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours >= 24) {
    return `${Math.ceil(hours / 24)} day${Math.ceil(hours / 24) === 1 ? '' : 's'} left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${Math.max(1, minutes)}m left`;
}

export { formatFileSize };

function isMissingAnonSessionError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeStatus = (error as { status?: unknown }).status;
  const maybeData = (error as { data?: unknown }).data;

  if (maybeStatus !== 401 || !maybeData || typeof maybeData !== 'object') {
    return false;
  }

  const message = (maybeData as { error?: unknown }).error;
  if (typeof message !== 'string') {
    return false;
  }

  const normalized = message.toLowerCase();
  return normalized.includes('no anon session') || normalized.includes('invalid or expired session');
}

export async function uploadAnonymousFile(file: File): Promise<AnonymousLink> {
  const validationError = validateAnonymousFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  return store.dispatch(snaphostApi.endpoints.uploadAnonymousFile.initiate(file)).unwrap();
}

export async function fetchAnonymousLinks() {
  try {
    return await store.dispatch(snaphostApi.endpoints.getAnonymousLinks.initiate()).unwrap();
  } catch (error) {
    if (isMissingAnonSessionError(error)) {
      return [];
    }

    throw error;
  }
}

export async function deleteAnonymousLink(id: string) {
  await store.dispatch(snaphostApi.endpoints.deleteAnonymousLink.initiate(id)).unwrap();
  return true;
}
