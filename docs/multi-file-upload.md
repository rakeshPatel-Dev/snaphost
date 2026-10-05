# Multi-File Upload — Bundles

**Status:** Proposed
**Scope:** Authenticated, account-owned uploads only
**Related source:** `app/api/(account)/me/files/route.ts`, `app/api/(account)/me/bundles/`, `lib/server/database.ts`, `lib/server/storage.ts`, `lib/server/file-admin.ts`, `state/api.ts`, `state/slices/uploadSlice.ts`, `components/UploadBox.tsx`, `components/UploadForm.tsx`, `components/profile/ProfileDashboard.tsx`, `components/profile/components/LinkCard.tsx`

## Summary

Registered users should be able to upload multiple files at once and share them under a single link. The set of files shared together is called a **bundle**. A bundle has one public URL. Visitors who open a bundle link see an album-style page listing all files in the bundle and can choose which file to open or download.

Anonymous users are not affected. Anonymous uploads remain single-file only, exactly as they are today.

A bundle produces one link regardless of how many files it contains. It does not consume one link per file. Existing single-file uploads continue to work without change.

## Product Rules

- Only authenticated users may create bundles.
- A bundle must contain at least one file and at most the tier limit.
- The bundle has one slug and one public URL. Individual files inside it have no independent public URLs.
- The bundle's public URL does not change after creation.
- The bundle has a single configurable expiration that applies to all files inside it.
- The original `created_at` of the bundle does not change after creation.
- Adding or removing files from an existing bundle is out of scope for this release.
- Each file in a bundle remains subject to the existing file-type and size limits.
- A bundle counts as one link toward the free tier's active-link cap, regardless of how many files it contains.
- Bundles remain subject to the global storage quota. Each file's size counts toward the account total.
- Bundles remain subject to abuse limits.
- The bundle name defaults to the first file's sanitized filename but may be edited.
- Individual files within a bundle may be replaced later using the existing file-replacement flow.
- Anonymous uploads do not support bundles through any API, dashboard, or anonymous-session cookie.

## Bundle Limits

| Tier    | Max files per bundle | Max file size     |
| ------- | -------------------- | ----------------- |
| Free    | 5                    | 10 MB (unchanged) |
| Premium | 20                   | 10 MB (unchanged) |

Add `MAX_BUNDLE_SIZE_FREE` and `MAX_BUNDLE_SIZE_PREMIUM` to `lib/config.ts`.

## Current State

- The `files` table holds one row per upload with its own slug and public URL.
- The `POST /api/upload` endpoint handles one file and returns one shareable link.
- The public preview page at `app/[username]/[slug]/page.tsx` renders a single file.
- The dashboard renders each file as an independent `LinkCard`.
- Anonymous uploads use a session cookie and have no concept of grouping.

## Data Model

### New `bundles` table

```sql
CREATE TABLE bundles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug        TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX bundles_user_id_idx ON bundles (user_id);
CREATE INDEX bundles_slug_idx ON bundles (slug);
```

Migration to `database.sql`:

```sql
ALTER TABLE files
  ADD COLUMN IF NOT EXISTS bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS files_bundle_id_idx ON files (bundle_id);
```

Files that belong to a bundle have `bundle_id` set. Files that are standalone single uploads have `bundle_id NULL`. All existing rows remain valid without migration.

### File rows inside a bundle

Files in a bundle:

- Have their own `id`, `filename`, `mime_type`, `file_type`, `size`, `storage_path`, and `content_revision`.
- Have `bundle_id` set to the parent bundle's `id`.
- Do **not** have an independent public `slug` — access is always through the bundle.
- Inherit `expires_at` from the bundle. The file-level `expires_at` column should match the bundle's value and is set at insert time.
- Are ordered by `created_at` ascending for display.

### Storage path for bundle files

Use the bundle UUID as the parent directory and the file UUID as a subdirectory, following the same immutable naming pattern as file replacement:

```text
uploads/<bundle-id>/<file-id>/<sanitized-stem>-<revision-token>.<verified-extension>
```

Example:

```text
uploads/a1b2c3d4-…/e5f6g7h8-…/photo-K9m2Qx.jpg
uploads/a1b2c3d4-…/f1e2d3c4-…/brief-x7Kp2Q.pdf
```

## TypeScript Types

Add to `types/app.ts`:

```ts
export type AppBundle = {
  id: string
  slug: string
  name: string
  expires_at: string | null
  created_at: string
  updated_at: string
  fileCount: number
  totalSize: number
  publicUrl: string
}

export type AppBundleFile = {
  id: string
  filename: string
  file_type: FileType
  mime_type: string
  size: number
  content_revision: number
  order: number // position within bundle (created_at order)
}

export type AppBundleDetail = AppBundle & {
  files: AppBundleFile[]
}
```

Add to `AdminFileRow` and `AppFile` (nullable):

```ts
bundle_id?: string | null
```

## Upload Lifecycle

Bundle creation uses a two-step flow to support per-file progress reporting without requiring a single large multipart request.

```
1. Client selects N files
2. Client validates files client-side (validateBatch)
3. Client POSTs to /api/me/bundles (name, expiresAt) → receives bundle { id, slug }
4. Client uploads each file in parallel to POST /api/me/bundles/[bundleId]/files
     → each returns the created AppBundleFile
5. Client dispatches setItemStatus per file as results arrive
6. After all settle, client fetches the completed bundle link
7. Dashboard and quota caches are invalidated
```

### Failed file upload within a bundle

- The bundle record is created before any files are uploaded.
- If one or more files fail, the bundle still exists with whatever files succeeded.
- If all files fail, the empty bundle is deleted automatically by the client after the last failure.
- The client shows per-file error rows and a "Remove failed" or "Try again" prompt.
- Failed storage objects are cleaned up by the server immediately (same as single-file failure recovery).

### Atomicity

Each file upload within a bundle is independent. Storage and database follow the same safe order as single-file uploads:

```text
upload new object → insert file row with bundle_id → (no old object to delete)
```

If the database insert fails after a successful storage upload, the orphaned storage object is deleted before responding.

## Server API

### Create a bundle

```text
POST /api/me/bundles
```

Request body:

```json
{
  "name": "Project Assets",
  "expiresAt": "2026-10-27T00:00:00Z"
}
```

Response:

```http
HTTP/1.1 201 Created
```

```json
{
  "success": true,
  "bundle": {
    "id": "<uuid>",
    "slug": "<generated-slug>",
    "name": "Project Assets",
    "expires_at": "2026-10-27T00:00:00Z",
    "created_at": "…",
    "publicUrl": "https://snaphost.dev/<username>/<slug>"
  }
}
```

### Upload a file to a bundle

```text
POST /api/me/bundles/[bundleId]/files
Content-Type: multipart/form-data
```

Fields:

```text
file: <binary file>
```

Response:

```http
HTTP/1.1 201 Created
```

```json
{
  "success": true,
  "file": {
    "id": "<uuid>",
    "filename": "photo.jpg",
    "file_type": "image",
    "mime_type": "image/jpeg",
    "size": 123456,
    "content_revision": 1
  }
}
```

### Get bundle metadata (public)

```text
GET /api/bundles/[slug]
```

Returns `AppBundleDetail` including the ordered file list. Does not expose `storage_path`, `user_id`, or other internal fields. Returns `404` for deleted or expired bundles.

### Update bundle metadata

```text
PATCH /api/me/bundles/[bundleId]
```

Accepts `name`, `slug`, `expiresAt`. Same pattern as `PATCH /api/me/files/[fileId]`.

### Delete a bundle

```text
DELETE /api/me/bundles/[bundleId]
```

Deletes the bundle row and all child file rows. Queues or immediately attempts deletion of all associated storage objects. Does not expose whether the bundle existed to non-owners (returns `404` for missing or not-owned bundles).

### Error Contract

| Status | Meaning                                             |
| ------ | --------------------------------------------------- |
| `400`  | Missing or invalid request body or file             |
| `401`  | Missing or invalid authentication                   |
| `404`  | Bundle does not exist or is not owned by the user   |
| `409`  | Slug already taken                                  |
| `413`  | File exceeds the configured size limit              |
| `422`  | Bundle already contains the maximum number of files |
| `429`  | Account or IP upload rate limit reached             |
| `500`  | Storage or database operation failed                |

Use `404` rather than `403` when a user attempts to access another user's bundle.

## Public Preview Page — Album UI

The existing preview route `app/[username]/[slug]/page.tsx` resolves the slug and renders either a single-file preview or a bundle album depending on which the slug belongs to.

### Bundle detection

The server function that resolves the slug should query both `files` and `bundles`. If the slug belongs to a bundle, return `AppBundleDetail`. If it belongs to a file, return `FileMetadata` as today.

### Album layout

When the slug resolves to a bundle, the page renders an album view:

```
┌────────────────────────────────────────────────────────┐
│  Project Assets                                        │
│  5 files · Expires Oct 27                             │
│  Shared by username                                    │
├──────────┬──────────┬──────────┬──────────┬──────────  │
│ [thumb]  │ [thumb]  │ [thumb]  │ [thumb]  │ [thumb]   │
│ photo.jpg│ brief.pdf│ logo.png │ data.pdf │ notes.png  │
│ 1.2 MB   │ 340 KB   │ 89 KB    │ 2.1 MB   │ 450 KB    │
└──────────┴──────────┴──────────┴──────────┴──────────  │
```

Each file card:

- Shows a thumbnail for images (using the storage public URL) or a document icon for PDFs.
- Shows the filename and human-readable file size.
- Is clickable and opens a full-screen preview or direct download depending on file type.
- Has an individual download button.

The album page does not have a single "Download all" button in this release.

### Opening an individual file

Clicking a file card within the album opens either:

- An inline preview modal (image lightbox or PDF viewer) using the existing `ImagePreview` and `PdfPreview` components.
- A direct download if the browser cannot preview the type.

The individual file URL is an internal storage public URL and is not a permanent shareable link.

## Upload UI Changes

### `UploadForm.tsx`

No change for anonymous users (single file only).

For authenticated users, add:

- A toggle or tab to switch between **Single file** and **Bundle** mode.
- In Bundle mode, the file input accepts `multiple` files.
- In Bundle mode, a text field for the optional bundle name (placeholder: first selected filename).
- The drop zone label changes to "Drop files here" in Bundle mode.

### `UploadBox.tsx`

Add a `mode: 'single' | 'bundle'` state.

In `bundle` mode:

1. Call `validateBatch(files, maxBundleSize)` (see Validation).
2. Dispatch `setBatch(validItems)` to show the pending queue.
3. `POST /api/me/bundles` → receive `bundleId` and `slug`.
4. For each file in parallel, `POST /api/me/bundles/[bundleId]/files`.
5. Dispatch `setItemStatus` per file as results arrive.
6. On all settled, show the final bundle link and per-file results.
7. If all files failed, send `DELETE /api/me/bundles/[bundleId]` to clean up.

### New: `UploadBatchPanel.tsx`

A panel rendered during and after a bundle upload:

```
┌─────────────────────────────────────────────────────┐
│  Uploading 4 files…  (or "Bundle ready")            │
│  snaphost.dev/username/project-assets  [Copy] [Share]│
├─────────────────────────────────────────────────────┤
│ ✓  design-final.png      1.2 MB                     │
│ ✓  brief.pdf              340 KB                    │
│ ⏳  photo-3.jpg           uploading…                │
│ ✕  huge-video.mp4        File type not allowed      │
├─────────────────────────────────────────────────────┤
│         [Upload another bundle]                     │
└─────────────────────────────────────────────────────┘
```

- The bundle link is shown at the top as soon as the bundle record is created (Step 3), before all files finish uploading.
- Per-file rows show live status.
- Copy and Share act on the bundle link, not individual file links.
- "Upload another bundle" calls `resetBatch()`.

## Upload Slice Changes

**File:** `state/slices/uploadSlice.ts`

Replace the current single-success state with a batch model:

```ts
// Before
{
  isDragging: boolean
  error: string | null
  success: UploadSuccess | null
}

// After
{
  isDragging: boolean
  mode: 'single' | 'bundle'
  bundleId: string | null
  bundleSlug: string | null
  bundlePublicUrl: string | null
  batch: FileUploadItem[]
}
```

New actions:

| Action                                            | Effect                                |
| ------------------------------------------------- | ------------------------------------- |
| `setMode(mode)`                                   | Switch between single and bundle mode |
| `setBundleMeta({ id, slug, publicUrl })`          | Set after bundle record is created    |
| `setBatch(items)`                                 | Initialize the file queue             |
| `setItemStatus(localId, status, result?, error?)` | Update one file's status              |
| `resetBatch()`                                    | Clear all batch and bundle state      |
| `setDragging(bool)`                               | Unchanged                             |

## Client State — RTK Query

**File:** `state/api.ts`

Add the following endpoints:

| Hook                          | Method   | URL                               | Notes                               |
| ----------------------------- | -------- | --------------------------------- | ----------------------------------- |
| `useCreateBundleMutation`     | `POST`   | `/api/me/bundles`                 | Returns bundle id, slug, publicUrl  |
| `useUploadBundleFileMutation` | `POST`   | `/api/me/bundles/:bundleId/files` | FormData, single file               |
| `useGetMeBundlesQuery`        | `GET`    | `/api/me/bundles`                 | Returns `AppBundle[]` for dashboard |
| `useGetBundleQuery`           | `GET`    | `/api/bundles/:slug`              | Public, returns `AppBundleDetail`   |
| `useUpdateBundleMutation`     | `PATCH`  | `/api/me/bundles/:bundleId`       | Name, slug, expiresAt               |
| `useDeleteBundleMutation`     | `DELETE` | `/api/me/bundles/:bundleId`       |                                     |

Add cache tags: `MeBundles`, `PublicBundle`.

After a bundle is created and all files uploaded, invalidate: `MeBundles`, `MeUploadQuota`.

## File Validation

**File:** `lib/fileValidation.ts`

Add a multi-file preflight validator:

```ts
export type BatchValidationResult = {
  valid: File[]
  rejected: { file: File; reason: string }[]
}

export function validateBatch(files: File[], maxCount: number): BatchValidationResult
```

Rules:

- Truncate to `maxCount`, reject the rest with `"Bundle limit exceeded"`.
- Run the existing `validateFile(file)` on each remaining file.
- Reject duplicates (same `name` + `size` + `lastModified`) with `"Duplicate file"`.

Server-side binary validation still runs per-file in the bundle file upload route.

## Dashboard Changes

**File:** `components/profile/ProfileDashboard.tsx`, `components/profile/components/LinkCard.tsx`

The dashboard shows both standalone files and bundles in the same list, ordered by `created_at` descending.

### Bundle card

A bundle renders as a `LinkCard` variant with:

- Bundle name as the primary heading.
- A badge showing the file count (e.g., "5 files").
- Total bundle size.
- The bundle's public URL (read-only, with copy and share actions).
- Editable name, slug, and expiration (same inline edit pattern as file cards).
- A Delete action that shows a confirmation noting all files will be deleted.
- An expand control to show the individual file list inside the bundle.

### Expanded bundle file list

When expanded, each file row shows:

- Filename, type icon, size.
- A Replace action (opens the existing file-replacement dialog from `registered-user-file-replacement.md`).
- No independent copy-link or share button (the bundle link is the shareable unit).

### Active link count

Each bundle counts as one link toward the free tier's active-link cap, not one per file.

## Rate Limits and Quotas

- Count each file upload to a bundle toward the existing per-account daily upload limit.
- Apply the existing IP burst protection per file upload request.
- Count the bundle itself (creation request) toward a separate bundle-creation rate limit (recommended: same as the existing upload rate limit, or slightly lower).
- The database quota trigger enforces the global 5 GiB storage limit per file insert.
- The free active-link cap applies at bundle creation time, not per file.

## Security Requirements

- Perform ownership checks on the server for all write operations.
- Never trust a client-provided user ID or bundle ID from an unverified source.
- Never overwrite existing storage objects.
- Prevent path traversal in generated storage names.
- Keep storage paths internal to server responses.
- Do not log original filenames.
- Return `404` rather than `403` for bundles not owned by the requesting user.
- Do not add an anonymous bundle creation path.
- Verify the bundle's `user_id` matches the authenticated user before adding files to it.

## Implementation Steps

### 1. Database and Types

1. Add the `bundles` table and the `bundle_id` column on `files`.
2. Add the check constraint and indexes.
3. Add `AppBundle`, `AppBundleFile`, `AppBundleDetail` to `types/app.ts`.
4. Add `bundle_id` (nullable) to `AdminFileRow` and `AppFile`.
5. Verify the migration on a database containing existing files.

### 2. Storage Utilities

1. Add a bundle-aware storage key builder: `uploads/<bundleId>/<fileId>/<stem>-<token>.<ext>`.
2. Reuse the existing revision token generator.
3. Keep `upsert: false` and immutable object behavior.

### 3. Server Data Layer

1. Add `createBundleRecord`, `getBundleForUser`, `listBundlesForUser`, `updateBundleForUser`, `deleteBundleForUser` to `lib/server/file-admin.ts`.
2. Add `createBundleFileRecord(bundleId, userId, fileInput)` that inserts into `files` with `bundle_id` set.
3. Add `listFilesForBundle(bundleId)` (server and public variants).
4. Add `getBundleMetadata(slug, username)` to `lib/server/database.ts` for the public preview page.
5. Update the slug-resolution function in the public preview loader to check bundles alongside files.

### 4. Authenticated API Routes

1. Create `app/api/(account)/me/bundles/route.ts` — `GET` (list) and `POST` (create).
2. Create `app/api/(account)/me/bundles/[bundleId]/route.ts` — `PATCH` (update) and `DELETE`.
3. Create `app/api/(account)/me/bundles/[bundleId]/files/route.ts` — `POST` (upload one file).
4. Apply authentication, ownership checks, rate limits, and quota enforcement to each route.

### 5. Public API Route

1. Create `app/api/(files)/bundles/[slug]/route.ts` — `GET` (public bundle metadata with file list).
2. Return `404` for deleted or expired bundles.
3. Apply `Cache-Control: no-store` to the metadata response.

### 6. Public Preview Page

1. Update the slug-resolution logic in `app/[username]/[slug]/page.tsx` to detect bundles.
2. Create `components/BundlePreview.tsx` — the album grid layout.
3. Create `components/BundleFileCard.tsx` — individual file card with thumbnail and download.
4. Reuse `ImagePreview` and `PdfPreview` in a modal opened from the card.

### 7. Upload UI

1. Add `mode` toggle to `UploadBox.tsx`.
2. Update `UploadForm.tsx` to accept `multiple` in bundle mode.
3. Implement two-step bundle upload orchestration in `UploadBox`.
4. Create `components/UploadBatchPanel.tsx`.
5. Wire success and error state through the new slice actions.

### 8. Upload Slice and RTK Query

1. Refactor `uploadSlice.ts` to the batch and bundle-meta model.
2. Add `createBundle`, `uploadBundleFile`, `getMeBundles`, `getBundle`, `updateBundle`, `deleteBundle` endpoints to `state/api.ts`.
3. Add `MeBundles` and `PublicBundle` cache tags.
4. Add cache invalidation after batch settles.

### 9. Dashboard

1. Add `useGetMeBundlesQuery` to `ProfileDashboard`.
2. Merge bundles and files into one list sorted by `created_at`.
3. Add bundle `LinkCard` variant with expand, edit, delete, and per-file replace controls.
4. Update the active-link count display to count bundles as one.

### 10. File Validation

1. Add `validateBatch` to `lib/fileValidation.ts`.
2. Add duplicate-detection logic.

### 11. Tests and CI

Recommended coverage:

- Bundle creation, file upload, and public metadata retrieval.
- Bundle file count limit enforcement (free and premium).
- Per-file failures within a bundle — remaining files succeed.
- All files fail — empty bundle cleanup.
- Concurrent file uploads to the same bundle — all succeed independently.
- Slug uniqueness across bundles and files.
- Public preview page renders album view for a bundle slug.
- Public preview page renders single-file view for a file slug.
- Unauthorized and non-owner requests returning `401` or `404`.
- Anonymous requests to bundle creation endpoints being rejected.
- Active-link cap: bundle counts as one.
- Storage quota enforcement per file.
- Dashboard shows bundles and files in one list.
- Expand bundle card to see individual files.
- Replace a file within a bundle (existing replacement flow).

## Acceptance Criteria

- A registered user can upload multiple files as a bundle from a single upload interaction.
- A bundle produces one shareable link regardless of how many files it contains.
- Visitors to a bundle link see an album page listing all files and can open or download any file individually.
- A bundle counts as one link toward the active-link cap.
- Failing to upload one file in a bundle does not cancel other files.
- An empty bundle is cleaned up if all file uploads fail.
- A registered user can delete a bundle and all its files from the dashboard.
- A registered user can edit the bundle name, slug, and expiration.
- A registered user can replace individual files within a bundle using the existing replacement flow.
- Anonymous users cannot create bundles.
- Existing standalone file links continue to work unchanged.
- The dashboard shows bundles and standalone files together.

## Out of Scope

- Anonymous bundle uploads
- Adding or removing files from an existing bundle after creation
- User-visible version history per file within a bundle
- Batch file download (zip)
- Live-updating open album previews
- Nested bundles
- Reordering files within a bundle after creation
- Bundle-level file replacement (replace stays one file at a time)
