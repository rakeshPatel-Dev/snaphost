# Multi-File Upload — Published File Bundles

**Status:** Proposed
**Scope:** Authenticated, account-owned uploads only

## Summary

Authenticated users can collect multiple files into one bundle and publish them under one shareable link. The public bundle page lists active files. A visitor selects one file, and that file opens through the existing image or PDF preview flow.

Anonymous uploads remain single-file uploads.

The bundle remains editable after publishing. Users can add files, replace files, change each file's metadata and expiration, remove files, edit the bundle name, and change the slug.

## Product Rules

- Only authenticated users can create or manage bundles.
- Selecting files starts an unpublished draft upload. A draft has no public slug or public URL.
- The first successful file creates the draft bundle record. No empty bundle may be created.
- The user must publish after at least one file uploads successfully.
- Publishing generates the bundle slug and makes the bundle public.
- The slug remains stable unless the owner changes it.
- Changing the slug creates a permanent redirect from the previous slug.
- The bundle name is editable.
- Each file has its own expiration. There is no bundle-level expiration.
- An expired file disappears from the public bundle and is deleted from storage.
- Other files remain available when one expires.
- If the last active file is removed or expires, the bundle is automatically deleted and its URL returns `404`.
- Users can add files to published bundles.
- Updating a file replaces it completely: the old file record and object are removed, and the replacement is inserted as a new file.
- A replacement receives new metadata and a newly supplied expiration. Nothing is carried over from the old file.
- A replacement may change between image and PDF and appears as the newest file.
- A bundle counts as one active link, regardless of its number of files.
- Each file counts toward storage quota and upload limits.
- Anonymous users cannot create, publish, edit, or manage bundles.

## Bundle Limits

| Tier    | Maximum files per bundle | Maximum file size |
| ------- | -----------------------: | ----------------: |
| Free    |                        5 |             10 MB |
| Premium |                       20 |             10 MB |

Use names such as `MAX_BUNDLE_FILES_FREE` and `MAX_BUNDLE_FILES_PREMIUM`; these are file-count limits, not byte-size limits.

## Lifecycle

### Draft

A draft is an internal staging record owned by one user. It has no slug and cannot be accessed publicly. It is created only after at least one file upload has started or succeeded.

Drafts are automatically deleted, including files and storage objects, after a configurable period. The default is one hour. The cleanup period must be configurable through application configuration.

If the first file fails, no empty draft remains. If some files fail, successful files remain and failed items can be retried or removed.

### Publish

Publishing must verify ownership and at least one active file, then atomically:

1. Generate a unique slug.
2. Set the bundle status to `published`.
3. Set `published_at`.
4. Return the public URL.

The slug must not be exposed before publishing.

### Published bundle

Published bundles support:

- Add a file.
- Replace a file with new content and new metadata.
- Remove a file.
- Edit the bundle name.
- Change the slug.
- Delete the whole bundle.

## Data Model

### `bundles`

```sql
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
```

A draft has `slug IS NULL`; a published bundle has a slug and `published_at`. Status must support at least `draft` and `published`.

To support redirects after slug changes, retain old slugs:

```sql
CREATE TABLE bundle_slug_history (
  slug TEXT PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Old slugs must not be reusable while their history row exists.

### `files`

Add:

```sql
ALTER TABLE files
  ADD COLUMN bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE;
```

Bundle files retain their file ID, bundle ID, filename, file type, MIME type, size, storage path, expiration, and timestamps. They must not expose or use an independent public file slug.

The existing `files.slug NOT NULL` constraint and indexes must be adjusted safely so bundle files do not require a public slug while standalone files remain unchanged.

Order files by `created_at DESC, id DESC`. A replacement is a new row, so it appears as the newest file.

## File Expiration

Expiration belongs to each file:

- The user supplies expiration when adding a file.
- The user supplies a new expiration when replacing a file.
- Replacement never inherits the old expiration.
- Expired files are excluded from public and dashboard active-file queries.
- The expiration cleanup job deletes expired bundle files from storage and the database.
- If cleanup leaves no active files, it deletes the bundle and its remaining associated data.

## Storage

Use immutable paths:

```text
uploads/<bundle-id>/<file-id>/<sanitized-stem>-<revision-token>.<verified-extension>
```

The extension and content type come from server-side magic-byte validation. Never trust browser MIME types or filenames for security decisions.

Never overwrite an existing object. If database insertion fails after upload, remove the new object. On replacement, remove the old object only after the new file is active. Cleanup must be retryable, and storage paths must be collected before database rows are deleted.

## Server API

### Start a draft

```text
POST /api/me/bundles
```

Creates an owned draft after the client has selected files. It does not generate a slug or public URL. The server must not create a bundle without at least one upload attempt/success.

### Add a file

```text
POST /api/me/bundles/[bundleId]/files
Content-Type: multipart/form-data
```

Supports draft uploads and adding files to published bundles. Enforce ownership, lifecycle state, count limits, file validation, per-file expiration, rate limits, and quota.

### Publish

```text
POST /api/me/bundles/[bundleId]/publish
```

Requires at least one active file, generates the slug, publishes the bundle, and returns the public URL. Publishing an already published bundle should be idempotent or return a clear conflict.

### List owned bundles

```text
GET /api/me/bundles
```

Returns drafts and published bundles with active file count and total active size. Drafts are owner-only and have no public URL.

### Update bundle metadata

```text
PATCH /api/me/bundles/[bundleId]
```

Accepts `name` and, for published bundles, `slug`. A slug change records the old slug in `bundle_slug_history` and returns the new URL.

### Replace a file

```text
POST /api/me/bundles/[bundleId]/files/[fileId]
Content-Type: multipart/form-data
```

The request includes the replacement file and its new expiration. The server must validate ownership, upload a new immutable object, insert a new file record, remove the old record, and clean up the old object. If anything fails, the old file remains active.

The replacement receives a new file ID, metadata, storage path, expiration, and creation order.

### Remove a file

```text
DELETE /api/me/bundles/[bundleId]/files/[fileId]
```

Deletes the file and its storage object. If it was the last active file, automatically deletes the bundle and makes the public URL return `404`.

### Delete a bundle

```text
DELETE /api/me/bundles/[bundleId]
```

Deletes the bundle, child files, slug history, and associated storage objects. Return `404` for missing or non-owned bundles.

### Public bundle metadata

```text
GET /api/bundles/[slug]
```

Returns only published, non-deleted bundles with active files. Never expose ownership IDs or storage paths.

### Public page

The existing `/[username]/[slug]` route resolves either a standalone file or a published bundle. A historical slug permanently redirects to the current bundle URL. Deleted bundles, drafts, and bundles with no active files return `404`.

## Public Viewing

The bundle page shows the bundle name, owner, active file count, and active files with filename, type, size, and expiration state.

Selecting a file opens the existing image or PDF viewer. Individual bundle files do not receive public share URLs. Expired files do not appear.

## Dashboard and Link Card

The dashboard shows standalone files and bundles together, ordered by creation time.

A bundle card shows:

- Bundle name.
- Draft status or published URL.
- Active file count and total active size.
- Copy/share actions only after publishing.
- Edit name and slug actions.
- Delete bundle action.
- Expandable file list.
- Add-file action.

Each expanded file row shows filename, type, size, expiration, Replace, and Remove actions. Bundle files do not show independent copy-link or share actions.

## Client Upload Flow

1. User selects files and supplies expiration for each file.
2. Client validates count, duplicates, supported type, and size.
3. Client starts a draft.
4. Client uploads files with per-file progress and errors.
5. Failed files can be retried or removed.
6. Once at least one file succeeds, the user clicks `Publish`.
7. The server generates the slug and returns the public URL.
8. The dashboard card changes from Draft to Published.
9. The client invalidates bundle, file, and quota caches.

The public link must not be shown before publishing.

## Error Contract

| Status | Meaning                                                             |
| -----: | ------------------------------------------------------------------- |
|    400 | Invalid body, file, filename, expiration, or slug                   |
|    401 | Missing or invalid authentication                                   |
|    404 | Bundle/file is missing or not owned by the user                     |
|    409 | Slug conflict, invalid lifecycle transition, or concurrent mutation |
|    413 | File exceeds the configured size limit                              |
|    422 | No files to publish or bundle file limit reached                    |
|    429 | Account or IP rate limit reached                                    |
|    500 | Storage or database failure                                         |

Use `404`, rather than `403`, for non-owned bundle and file resources.

## Rate Limits and Quotas

- Count each file upload and replacement toward the account upload limit.
- Apply IP burst protection to each upload and replacement request.
- Count a published bundle as one active link, not one link per child file.
- Enforce the per-bundle file limit atomically on the server/database.
- Enforce global storage quota for every inserted or replacement file.
- Draft creation does not consume an active-link slot until publishing.

## Security Requirements

- Require authenticated ownership for every bundle operation.
- Never accept a client-provided owner ID.
- Do not expose drafts publicly.
- Do not expose `storage_path`, `user_id`, or service-role data to clients.
- Validate file contents from magic bytes on the server.
- Generate storage paths server-side from UUIDs, sanitized stems, verified extensions, and secure random tokens.
- Do not log filenames, tokens, cookies, or other sensitive user data.
- Anonymous-session cookies must never grant bundle access.

## Cleanup

Cleanup must handle:

- Abandoned drafts older than the configurable TTL, default one hour.
- Expired bundle files and their storage objects.
- Bundles with no active files.
- Objects left by failed uploads, replacements, or deletions.

Cleanup must be retryable and verify that an object is not still referenced before deleting it.

## Implementation Areas

1. Add the bundle schema, draft/published status, slug history, and `files.bundle_id`.
2. Adjust file slug constraints for bundle children.
3. Add bundle and child-file types and server data functions.
4. Add draft, publish, list, update, add, replace, remove, and delete APIs.
5. Update public slug resolution and bundle viewing.
6. Add bundle upload state and per-file expiration UI.
7. Add bundle and standalone-file link-card variants.
8. Add add/replace/remove controls to the bundle card.
9. Update active-link counting, quota handling, and cache invalidation.
10. Add configurable abandoned-draft and expired-file cleanup.

## Acceptance Criteria

- A logged-in user can select multiple files and upload them into a draft.
- A draft has no public slug or URL.
- A user can publish only after at least one file succeeds.
- Publishing creates one stable shareable slug.
- Visitors can select any active file and open it with the existing viewer.
- Each file has independent expiration.
- Expired files disappear from the bundle and storage.
- Users can add files to published bundles.
- Users can replace files with new content, type, metadata, and expiration.
- Replaced files appear newest.
- Users can remove individual files.
- Removing or expiring the last file deletes the bundle and causes `404`.
- Users can edit the bundle name and slug.
- Previous slugs redirect to the current slug.
- Abandoned drafts are cleaned after the configurable TTL.
- Anonymous users cannot access bundle operations.
- Existing standalone file links continue to work.
