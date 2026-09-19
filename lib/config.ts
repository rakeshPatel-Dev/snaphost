export const CONFIG = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PDF_SIZE: 10 * 1024 * 1024,   // 10MB
  ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/webp'],
  ALLOWED_PDF_TYPES: ['application/pdf'],
  FILE_ID_LENGTH: 8,
  STORAGE_BUCKET: process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'files',
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://snaphost.dev',
};
