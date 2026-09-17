import { CONFIG } from './config';
import { UPLOAD_ERRORS } from './messages';

export interface ValidationError {
  field: string;
  message: string;
}

interface FileValidationResult {
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

export function getFileType(mimeType: string): 'image' | 'pdf' | 'unknown' {
  if (CONFIG.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return 'image';
  }
  if (CONFIG.ALLOWED_PDF_TYPES.includes(mimeType)) {
    return 'pdf';
  }
  return 'unknown';
}
