import { validateFile } from '@/lib/fileValidation';
import type { AnonymousLink, UploadResponse } from '@/types/app';

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
    return validation.errors[0]?.message || 'Invalid file';
  }

  return null;
}

async function parseAnonymousLinksResponse(response: Response) {
  const data = (await response.json().catch(() => null)) as { files?: AnonymousLink[]; error?: string } | null;

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to load links');
  }

  return data?.files ?? [];
}

export function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} MB`;
  }

  const kilobytes = bytes / 1024;
  return `${kilobytes.toFixed(0)} KB`;
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

function normalizeErrorMessage(data: UploadResponse | null) {
  if (!data) {
    return 'Upload failed';
  }

  if (Array.isArray(data.details)) {
    return data.details.join(', ');
  }

  if (typeof data.details === 'string' && data.details.trim()) {
    return data.details;
  }

  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }

  return 'Upload failed';
}

export async function uploadAnonymousFile(file: File): Promise<AnonymousLink> {
  const validationError = validateAnonymousFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as UploadResponse | null;
    throw new Error(normalizeErrorMessage(data));
  }

  const data = (await response.json()) as UploadResponse;
  const url = data.url || `${window.location.origin}/anon/${data.fileId}`;

  return {
    id: data.fileId,
    filename: file.name,
    fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
    fileSize: formatFileSize(file.size),
    url,
    createdAt: new Date().toISOString(),
    expiresAt: data.expiresAt || new Date().toISOString(),
  };
}

export async function fetchAnonymousLinks() {
  const response = await fetch('/api/anon/files', { credentials: 'same-origin' });
  return parseAnonymousLinksResponse(response);
}

export async function deleteAnonymousLink(id: string) {
  const response = await fetch(`/api/anon/files/${id}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || 'Failed to delete link');
  }

  return true;
}
