/**
 * Sanitize filename to prevent path traversal and other issues
 * Removes/replaces dangerous characters while keeping the filename readable
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\.\//g, '').replace(/\.\.\\/g, '');

  // Remove leading slashes and backslashes
  sanitized = sanitized.replace(/^[\/\\]+/, '');

  // Replace dangerous characters with underscore
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '_');

  // Remove leading/trailing spaces and dots
  sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '');

  // Limit length to 255 characters (filesystem limit)
  if (sanitized.length > 255) {
    // Keep extension
    const lastDot = sanitized.lastIndexOf('.');
    if (lastDot > 0) {
      const ext = sanitized.substring(lastDot);
      sanitized = sanitized.substring(0, 255 - ext.length) + ext;
    } else {
      sanitized = sanitized.substring(0, 255);
    }
  }

  // Ensure it's not empty
  return sanitized || 'file';
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot);
}

/**
 * Get filename without extension
 */
export function getFilenameWithoutExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return filename;
  return filename.substring(0, lastDot);
}
