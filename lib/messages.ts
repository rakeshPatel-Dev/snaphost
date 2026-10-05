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
  uploadFailed: "We couldn't upload that file. Check your connection and try again.",
  /** No file was included in the request */
  noFileProvided: 'No file was attached. Please select a file and try again.',
  /** Server-side file validation rejected the file */
  fileValidationFailed:
    "We couldn't read that file. Upload a PNG, JPG, WEBP, or PDF within the size limit.",
  /** MIME type not allowed */
  unsupportedFileType: "That file type isn't supported. Please upload a PNG, JPG, WEBP or PDF.",
  /** Image exceeds max bytes */
  imageTooLarge: (maxMb: number, gotMb: string) =>
    `Image too large — max allowed is ${maxMb} MB, but your file is ${gotMb} MB.`,
  /** PDF exceeds max bytes */
  pdfTooLarge: (maxMb: number, gotMb: string) =>
    `PDF too large — max allowed is ${maxMb} MB, but your file is ${gotMb} MB.`,
  /** Storage write failed */
  storageFailed: "Your file couldn't be saved. Please try again in a moment.",
  /** Upload rate limit hit */
  rateLimited: "You've tried to upload too many times. Wait a few minutes, then try again.",
  /** Expiration date is malformed or has already passed */
  invalidExpirationDate: 'Choose a valid expiration date in the future.',
  /** Free plan active-link cap hit */
  freePlanLimitReached:
    "You've reached your plan's link limit. Delete an old link or upgrade for more.",
} as const

// ─── Forms (bug reports via formly.email) ──────────────────
export const FORM_ERRORS = {
  /** Report request never reached formly.email, or it replied without a message */
  reportFailed: "We couldn't send your report. Check your connection and try again.",
  /** Access key missing from the deployment env */
  notConfigured: 'Forms are not configured on this deployment.',
} as const

// ─── Anonymous sessions ────────────────────────────────────
export const ANON_ERRORS = {
  /** No session cookie present */
  noSession: 'No anonymous session found. Upload a file to start one.',
  /** Session cookie is invalid or has expired */
  sessionExpired:
    'Your anonymous session has expired. Please upload a new file to start a fresh session.',
  /** Per-session link cap hit */
  linkLimitReached:
    "You've reached the 3-link limit for this anonymous session. Delete an existing link or sign up for more.",
  dailyUploadLimitReached:
    "You've reached the 3 anonymous uploads allowed today from this network. Try again tomorrow or sign in for more uploads.",
  /** Generic link load failure */
  failedToLoadLinks: "We couldn't load your anonymous links. Refresh the page to try again.",
  /** Generic link delete failure */
  failedToDeleteLink: "We couldn't delete that anonymous link. Try again.",
  /** Generic upload failure inside UploadMock */
  uploadFailed: "We couldn't create the anonymous link. Check your connection and try again.",
  /** Link copy failure */
  failedToCopyLink: "Couldn't copy the link to your clipboard. Please copy it manually.",
} as const

// ─── Authentication ────────────────────────────────────────
export const AUTH_ERRORS = {
  /** Generic sign-in / sign-up failure */
  authFailed: "We couldn't complete that authentication request. Please try again.",
  signInFailed: "We couldn't sign you in. Check your email and password, then try again.",
  signUpFailed: "We couldn't create your account. Check your details and try again.",
  /** Username too short */
  usernameTooShort: 'Username must be at least 3 characters long.',
  /** Username not yet confirmed as available */
  usernameNotAvailable:
    'That username is already taken — please pick a different one before creating your account.',
  /** Username not confirmed before save in profile */
  pickAvailableUsername: 'Please pick an available username before saving.',
  /** Failed to update username */
  failedToUpdateUsername: "We couldn't save your username. Try again.",
  /** Failed to sign out */
  failedToSignOut: "We couldn't sign you out. Check your connection and try again.",
  /** OAuth provider error */
  oauthFailed: 'Could not connect to that provider. Please try again or use email/password.',
} as const

// ─── Password reset ────────────────────────────────────────
export const PASSWORD_ERRORS = {
  /** Reset email send failure */
  failedToSendResetEmail: "We couldn't send a reset email. Check the address and try again.",
  /** Password update failure */
  failedToUpdatePassword:
    "We couldn't update your password. Your reset link may have expired; request a new one.",
} as const

// ─── Account management ────────────────────────────────────
export const ACCOUNT_ERRORS = {
  /** Not authenticated */
  unauthorized: 'You must be signed in to do that.',
  /** Profile row missing in DB */
  profileNotFound: "Your profile couldn't be found. Try signing out and back in.",
  /** Account deletion failure */
  failedToDeleteAccount:
    "We couldn't delete your account. Try again, and contact support if it keeps happening.",
  /** Storage cleanup failure during account delete */
  failedToDeleteStorage: (filename: string) =>
    `Couldn\'t remove "${filename}" from storage during account deletion. Please contact support.`,
} as const

// ─── File management (signed-in dashboard) ────────────────
export const FILE_ERRORS = {
  /** File not found (404) */
  fileNotFound: "That file doesn't exist or has already been deleted.",
  /** Forbidden (wrong owner) */
  forbidden: "You don't have permission to modify that file.",
  /** Failed to update slug / filename / expiry */
  failedToUpdateFile: "We couldn't save those link changes. Check the values and try again.",
  /** Failed to delete file */
  failedToDeleteFile: "We couldn't delete that link. Try again.",
  /** Link copy failure */
  failedToCopyLink: "Couldn't copy the link to your clipboard. Please copy it manually.",
  /** Storage delete failure */
  failedToDeleteFromStorage:
    "File was removed from the database but couldn't be deleted from storage. Contact support.",
} as const

// ─── API / server-side generics ────────────────────────────
export const SERVER_ERRORS = {
  /** 500 catch-all */
  internalError: 'Something went wrong on our side. Please try again in a moment.',
  /** Generic request failure fallback used in getApiErrorMessage */
  requestFailed: "We couldn't complete that request. Please try again.",
} as const

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
} as const
