export const expiredUploadCleanupSchedule = {
  id: 'snaphost-expired-upload-cleanup',
  cron: '0 */6 * * *',
  path: '/api/jobs/cleanup-expired',
  retries: 2,
  timeout: 60,
};
