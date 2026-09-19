import { CONFIG } from './config';
import { UPLOAD_ERRORS } from './messages';

export interface ValidationError {
  field: string;
  message: string;
}

export type ValidatedMimeType = 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf';

interface FileValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ContentValidationResult extends FileValidationResult {
  mimeType: ValidatedMimeType | null;
}

const FILE_SIGNATURES: Array<{
  mimeType: ValidatedMimeType;
  matches: (header: Uint8Array) => boolean;
}> = [
  {
    mimeType: 'image/png',
    matches: (header) =>
      header.length >= 8 &&
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47 &&
      header[4] === 0x0d &&
      header[5] === 0x0a &&
      header[6] === 0x1a &&
      header[7] === 0x0a,
  },
  {
    mimeType: 'image/jpeg',
    matches: (header) =>
      header.length >= 3 && header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff,
  },
  {
    mimeType: 'image/webp',
    matches: (header) =>
      header.length >= 12 &&
      header[0] === 0x52 &&
      header[1] === 0x49 &&
      header[2] === 0x46 &&
      header[3] === 0x46 &&
      header[8] === 0x57 &&
      header[9] === 0x45 &&
      header[10] === 0x42 &&
      header[11] === 0x50,
  },
  {
    mimeType: 'application/pdf',
    matches: (header) =>
      header.length >= 5 &&
      header[0] === 0x25 &&
      header[1] === 0x50 &&
      header[2] === 0x44 &&
      header[3] === 0x46 &&
      header[4] === 0x2d,
  },
];

/**
 * Identify an allowed upload format from its binary signature, not request metadata.
 */
export async function detectFileMimeType(file: File): Promise<ValidatedMimeType | null> {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return FILE_SIGNATURES.find(({ matches }) => matches(header))?.mimeType ?? null;
}

function validateFileForMimeType(file: File, mimeType: string | null): FileValidationResult {
  const errors: ValidationError[] = [];

  const isImage = mimeType !== null && CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isPdf = mimeType !== null && CONFIG.ALLOWED_PDF_TYPES.includes(mimeType);

  if (!isImage && !isPdf) {
    errors.push({
      field: 'type',
      message: UPLOAD_ERRORS.unsupportedFileType,
    });
  }

  // Check file size based on type
  if (isImage && file.size > CONFIG.MAX_IMAGE_SIZE) {
    errors.push({
      field: 'size',
      message: UPLOAD_ERRORS.imageTooLarge(
        CONFIG.MAX_IMAGE_SIZE / 1024 / 1024,
        (file.size / 1024 / 1024).toFixed(2)
      ),
    });
  }

  if (isPdf && file.size > CONFIG.MAX_PDF_SIZE) {
    errors.push({
      field: 'size',
      message: UPLOAD_ERRORS.pdfTooLarge(
        CONFIG.MAX_PDF_SIZE / 1024 / 1024,
        (file.size / 1024 / 1024).toFixed(2)
      ),
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Client-side preflight only. The API performs authoritative signature validation.
 */
export function validateFile(file: File): FileValidationResult {
  return validateFileForMimeType(file, file.type);
}

/**
 * Server-side validation using the file's binary signature instead of File.type.
 */
export async function validateFileContent(file: File): Promise<ContentValidationResult> {
  const mimeType = await detectFileMimeType(file);
  const validation = validateFileForMimeType(file, mimeType);

  return {
    ...validation,
    mimeType,
  };
}

export function getFileType(mimeType: ValidatedMimeType): 'image' | 'pdf' {
  if (CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return 'image';
  }
  return 'pdf';
}
