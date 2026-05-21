import { CONFIG } from './config';

export interface ValidationError {
  field: string;
  message: string;
}

export interface FileValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateFile(file: File): FileValidationResult {
  const errors: ValidationError[] = [];

  // Check file type
  const isImage = CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type);
  const isPdf = CONFIG.ALLOWED_PDF_TYPES.includes(file.type);

  if (!isImage && !isPdf) {
    errors.push({
      field: 'type',
      message: `Unsupported file type: ${file.type}. Allowed: PNG, JPG, JPEG, WEBP, PDF`,
    });
  }

  // Check file size based on type
  if (isImage && file.size > CONFIG.MAX_IMAGE_SIZE) {
    errors.push({
      field: 'size',
      message: `Image too large. Max size: ${CONFIG.MAX_IMAGE_SIZE / 1024 / 1024}MB, Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  if (isPdf && file.size > CONFIG.MAX_PDF_SIZE) {
    errors.push({
      field: 'size',
      message: `PDF too large. Max size: ${CONFIG.MAX_PDF_SIZE / 1024 / 1024}MB, Got: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getFileType(mimeType: string): 'image' | 'pdf' | 'unknown' {
  if (CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return 'image';
  }
  if (CONFIG.ALLOWED_PDF_TYPES.includes(mimeType)) {
    return 'pdf';
  }
  return 'unknown';
}
