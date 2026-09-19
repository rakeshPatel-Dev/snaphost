/**
 * Snaphost Error Messages
 * ─────────────────────────────────────────────────────────
 * Edit this file to update any user-facing error, toast,
 * loading, or success message across the entire app.
 *
 * Organized by feature domain so it's easy to find & update.
 */

// ─── Upload (anonymous + signed-in) ───────────────────────
export const UPLOAD_ERRORS = {
  /** Generic upload failure fallback */
  uploadFailed: 'Upload failed. Please check your connection and try again.',
  /** No file was included in the request */
  noFileProvided: 'No file was attached. Please select a file and try again.',
  /** Server-side file validation rejected the file */
  fileValidationFailed: 'Your file did not pass validation. Make sure it is a PNG, JPG, WEBP or PDF under the size limit.',
  /** MIME type not allowed */
  unsupportedFileType: 'That file type isn\'t supported. Please upload a PNG, JPG, WEBP or PDF.',
  /** Image exceeds max bytes */
  imageTooLarge: (maxMb: number, gotMb: string) =>
    `Image too large — max allowed is ${maxMb} MB, but your file is ${gotMb} MB.`,
  /** PDF exceeds max bytes */
  pdfTooLarge: (maxMb: number, gotMb: string) =>
    `PDF too large — max allowed is ${maxMb} MB, but your file is ${gotMb} MB.`,
  /** Storage write failed */
  storageFailed: 'We couldn\'t save your file to storage. Please try again in a moment.',
  /** Upload rate limit hit */
  rateLimited: 'Too many upload attempts. Please wait a few minutes and try again.',
  /** Free plan daily cap hit */
  freePlanLimitReached: 'You\'ve reached your plan\'s upload limit for today. Upgrade for more.',
} as const;

// ─── Anonymous sessions ────────────────────────────────────
export const ANON_ERRORS = {
  /** No session cookie present */
  noSession: 'No anonymous session found. Upload a file to start one.',
  /** Session cookie is invalid or has expired */
  sessionExpired: 'Your anonymous session has expired. Please upload a new file to start a fresh session.',
  /** Per-session link cap hit */
  linkLimitReached: 'You\'ve reached the 3-link limit for this anonymous session. Delete an existing link or sign up for more.',
  /** Generic link load failure */
  failedToLoadLinks: 'Couldn\'t load your anonymous links. Please refresh and try again.',
  /** Generic link delete failure */
  failedToDeleteLink: 'Couldn\'t delete that link. Please try again.',
  /** Generic upload failure inside UploadMock */
  uploadFailed: 'Anonymous upload failed. Please check your connection and try again.',
  /** Link copy failure */
  failedToCopyLink: 'Couldn\'t copy the link to your clipboard. Please copy it manually.',
} as const;

// ─── Authentication ────────────────────────────────────────
export const AUTH_ERRORS = {
  /** Generic sign-in / sign-up failure */
  authFailed: 'Authentication failed. Double-check your email and password and try again.',
  /** Username too short */
  usernameTooShort: 'Username must be at least 3 characters long.',
  /** Username not yet confirmed as available */
  usernameNotAvailable: 'That username is already taken — please pick a different one before creating your account.',
  /** Username not confirmed before save in profile */
  pickAvailableUsername: 'Please pick an available username before saving.',
  /** Failed to update username */
  failedToUpdateUsername: 'Couldn\'t update your username. Please try again.',
  /** Failed to sign out */
  failedToSignOut: 'Sign-out failed. Please try again or clear your cookies.',
  /** OAuth provider error */
  oauthFailed: 'Could not connect to that provider. Please try again or use email/password.',
} as const;

// ─── Password reset ────────────────────────────────────────
export const PASSWORD_ERRORS = {
  /** Reset email send failure */
  failedToSendResetEmail: 'Couldn\'t send the reset email. Make sure the address is correct and try again.',
  /** Password update failure */
  failedToUpdatePassword: 'Couldn\'t update your password. The reset link may have expired — request a new one.',
} as const;

// ─── Account management ────────────────────────────────────
export const ACCOUNT_ERRORS = {
  /** Not authenticated */
  unauthorized: 'You must be signed in to do that.',
  /** Profile row missing in DB */
  profileNotFound: 'Your profile couldn\'t be found. Try signing out and back in.',
  /** Account deletion failure */
  failedToDeleteAccount: 'Couldn\'t delete your account right now. Please contact support if this keeps happening.',
  /** Storage cleanup failure during account delete */
  failedToDeleteStorage: (filename: string) =>
    `Couldn\'t remove "${filename}" from storage during account deletion. Please contact support.`,
} as const;

// ─── File management (signed-in dashboard) ────────────────
export const FILE_ERRORS = {
  /** File not found (404) */
  fileNotFound: 'That file doesn\'t exist or has already been deleted.',
  /** Forbidden (wrong owner) */
  forbidden: 'You don\'t have permission to modify that file.',
  /** Failed to update slug / filename / expiry */
  failedToUpdateFile: 'Couldn\'t save your changes. Please try again.',
  /** Failed to delete file */
  failedToDeleteFile: 'Couldn\'t delete that file. Please try again.',
  /** Link copy failure */
  failedToCopyLink: 'Couldn\'t copy the link to your clipboard. Please copy it manually.',
  /** Storage delete failure */
  failedToDeleteFromStorage: 'File was removed from the database but couldn\'t be deleted from storage. Contact support.',
} as const;

// ─── API / server-side generics ────────────────────────────
export const SERVER_ERRORS = {
  /** 500 catch-all */
  internalError: 'Something went wrong on our end. Please try again in a moment.',
  /** Generic request failure fallback used in getApiErrorMessage */
  requestFailed: 'Request failed. Please try again.',
} as const;

// ─── Toast / loading / success labels ────────────────────────
export const TOAST_LABELS = {
  upload: {
    loading: 'Uploading your file…',
    success: 'File uploaded successfully!',
  },
  anonUpload: {
    loading: 'Uploading and generating anonymous link…',
    success: 'Anonymous link created — ready to share!',
  },
  copyLink: {
    loading: 'Copying…',
    success: 'Link copied to clipboard',
  },
  saveFile: {
    loading: 'Saving your changes…',
    success: 'Changes saved',
  },
  deleteFile: {
    loading: 'Deleting link…',
    success: 'Link deleted',
  },
  deleteAccount: {
    loading: 'Deleting your account…',
    success: 'Account deleted — goodbye!',
  },
  deleteAnonLink: {
    loading: 'Removing anonymous link…',
    success: 'Link removed',
  },
} as const;
