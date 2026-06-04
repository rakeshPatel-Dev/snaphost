export function formatFileSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) {
    return `${megabytes.toFixed(1)} MB`;
  }

  const kilobytes = bytes / 1024;
  return `${kilobytes.toFixed(0)} KB`;
}
