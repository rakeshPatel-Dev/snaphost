# Registered User File Replacement

**Status:** Proposed  
**Scope:** Authenticated, account-owned uploads only  
**Related source:** `app/api/(account)/me/files/[fileId]/route.ts`, `lib/server/storage.ts`, `lib/server/file-admin.ts`, `components/profile/components/LinkCard.tsx`

## Summary

Registered users should be able to replace the contents of any file they own at any time after its initial upload. Each replacement must use a new immutable storage object instead of overwriting the current object.

The public share URL remains unchanged. For example, replacing the content behind an existing link may move the active object from:

```text
uploads/<file-record-id>/bike-398dxu.png
```

to:

```text
uploads/<file-record-id>/bike-K9m2Qx.png
```

The random suffix is an internal storage revision token. The user-facing filename should remain the sanitized name from the newly selected file, such as `bike.png`.

## Product Rules

- Only authenticated users may replace files.
- Only files owned by the authenticated user may be replaced.
- Anonymous uploads must not support replacement through any API, dashboard, or anonymous-session cookie.
- The public URL and slug must not change.
- The original `created_at` and configured expiration must not change.
- The replacement does not create a new active-link record.
- Replacement is not blocked by the free tier's active-file count because it does not create a link.
- Replacements remain subject to abuse limits and the global storage quota.
- Allowed replacements remain PNG, JPEG, WebP, and PDF files up to the configured size limits.
- A replacement may change the content type, including image-to-PDF and PDF-to-image replacements.
- The first release does not expose previous versions or provide rollback.
- The previous object is removed only after the replacement is safely active.
- Open public previews may require a refresh before showing the new revision.

## Current State

- The existing `PATCH /api/me/files/[fileId]` endpoint updates metadata such as filename, slug, and expiration, but not file content.
- Supabase Storage objects are currently stored under paths such as `uploads/<slug>.<extension>`.
- Storage uploads already use `upsert: false`, which prevents existing objects from being silently overwritten.
- Storage objects receive a one-year cache lifetime, so replacing content at the same object URL could cause stale-cache problems.
- The `files` table already stores all content metadata needed for replacement: filename, MIME type, file type, size, storage path, expiration, and ownership.
- The global storage quota triggers already account for a change in `size` when an existing file row is updated.
- The dashboard has save and delete actions but no content-replacement action.

## Storage Naming

### Replacement Object Key

Use the stable database file UUID as the parent directory and append a random token to a sanitized filename stem:

```text
uploads/<file-record-id>/<sanitized-stem>-<revision-token>.<verified-extension>
```

Examples:

```text
uploads/550e8400-e29b-41d4-a716-446655440000/poster-K9m2Qx.png
uploads/550e8400-e29b-41d4-a716-446655440000/manual-x7Kp2Q.pdf
```

The revision token should:

- Use cryptographically secure randomness.
- Contain only URL-safe characters.
- Be six to eight characters long.
- Not be derived from predictable metadata such as timestamp or file size.
- Not be used for authorization or as the public slug.
- Be regenerated for every replacement.

The extension must come from the server-verified MIME type, not from the filename or browser-provided `File.type`.

### Existing Files

Existing storage paths do not need to be migrated. The database already stores each object's complete `storage_path`, so old and new naming formats can coexist.

### No In-Place Overwrite

Do not replace content at the current storage path and do not switch storage uploads to `upsert: true`.

Overwriting one URL would conflict with the current one-year cache policy and would make failure recovery unsafe. A new immutable object URL allows the database to act as the source of truth for which revision is active.

## Replacement Lifecycle

1. Authenticate the Supabase user.
2. Resolve the account record.
3. Load the requested file and verify `user_id` matches the account.
4. Reject replacement if the file is deleted or already expired.
5. Apply the appropriate upload and IP rate limits.
6. Parse the multipart request and validate the replacement file.
7. Sanitize the replacement filename.
8. Generate a random revision token and immutable storage key.
9. Upload the new object with `upsert: false`.
10. Update the database record only if its expected content revision is still current.
11. Increment the content revision and update content metadata in the same database update.
12. Mark or queue the previous storage object for deletion.
13. Return the updated file metadata without exposing `storage_path`.

## Atomicity and Concurrency

Storage and Supabase cannot participate in one shared transaction. The safe order is therefore:

```text
upload new object -> switch database pointer -> delete old object
```

### Successful Switch

- The database points to the new object before the old object is deleted.
- The response returns the new filename, type, size, and revision.
- The old object can be cleaned up afterward.

### Failed New Upload

- Do not change the database.
- Keep the old object and metadata active.
- Return a storage or upload error.

### Failed Database Update

- Delete the newly uploaded object.
- Keep the old object and metadata active.
- Return an internal or quota error.

### Concurrent Replacements

Add an optimistic concurrency token to the `files` row:

```sql
content_revision INTEGER NOT NULL DEFAULT 1
```

A replacement reads the current revision and updates the row only when that value still matches. If two replacements start together:

- One update succeeds.
- The stale request receives `409 Conflict`.
- The losing request deletes its newly uploaded object.
- The successful revision cannot be silently overwritten by the losing request.

### Previous-Object Cleanup

After the database switch succeeds:

1. Attempt to delete the previous object.
2. If deletion fails, keep the new object active.
3. Record the old path for a retryable cleanup job.
4. Never roll back a successful replacement only because old-object cleanup failed.

A durable cleanup queue is recommended for production. Before deleting a queued object, the worker must confirm that no current `files.storage_path` still references it.

## Database Changes

Add the following migration to `database.sql`:

```sql
ALTER TABLE files
ADD COLUMN IF NOT EXISTS content_revision INTEGER NOT NULL DEFAULT 1;

ALTER TABLE files
ADD CONSTRAINT files_content_revision_positive
CHECK (content_revision > 0);
```

Update the TypeScript database types:

- Add `content_revision` to `AdminFileRow`.
- Add `content_revision` to `AppFile`.
- Include size and updated timestamp in the dashboard-facing `AppFile` contract.

No storage path backfill is required.

## Server API

### Endpoint

Create an authenticated endpoint:

```text
POST /api/me/files/[fileId]/replace
```

The `[fileId]` route parameter must be the stable database UUID, not the public slug.

### Request

```text
Content-Type: multipart/form-data
```

Fields:

```text
file: <binary file>
```

### Response

```http
HTTP/1.1 200 OK
```

```json
{
  "success": true,
  "file": {
    "id": "<database-uuid>",
    "slug": "<existing-public-slug>",
    "filename": "bike.png",
    "file_type": "image",
    "size": 12345,
    "content_revision": 2,
    "publicUrl": "https://snaphost.dev/<username>/<slug>"
  }
}
```

The response must not include `storage_path`, `user_id`, or other internal fields.

### Error Contract

| Status | Meaning                                               |
| ------ | ----------------------------------------------------- |
| `400`  | Missing file, invalid filename, or invalid request    |
| `401`  | Missing or invalid authentication                     |
| `404`  | File does not exist or is not owned by the user       |
| `409`  | A concurrent replacement already changed the revision |
| `413`  | Replacement exceeds the configured size limit         |
| `429`  | Account or IP upload rate limit reached               |
| `500`  | Storage or database operation failed                  |

Use `404`, rather than `403`, when a user attempts to replace another user's file so the endpoint does not reveal whether the file ID exists.

### Authorization

The endpoint must:

- Require a valid Supabase bearer token.
- Resolve the corresponding application user.
- Query the file with both `id` and `user_id`.
- Verify the file is not deleted.
- Verify the file is not expired.
- Use the service role only on the server.
- Never accept a client-provided owner ID.

The existing `PATCH` endpoint must remain metadata-only. Content replacement should stay in a separate route to keep authorization and multipart-processing behavior explicit.

## Anonymous Upload Exclusion

No anonymous replacement endpoint may be added.

Specifically, do not add replacement support to:

- `app/api/(anonymous)/anon/files/[fileId]/route.ts`
- `components/anon/AnonLinks.tsx`
- `components/sections/upload-mock/AnonymousLinkCard.tsx`
- Anonymous-session mutation helpers

Anonymous-session cookies must never grant replacement permission. If a replacement request uses the registered-user endpoint without a valid authenticated owner, it must be rejected.

## File Validation

Reuse the server-authoritative validation already used by initial uploads:

- Verify the binary signature.
- Derive the MIME type from the signature.
- Derive `file_type` from the verified MIME type.
- Derive the storage extension from the verified MIME type.
- Enforce the image and PDF size limits.
- Sanitize the user-facing filename before writing metadata.

Browser-provided file types and extensions must not be trusted.

## Metadata Update

A successful replacement should update:

- `filename`
- `file_type`
- `mime_type`
- `size`
- `storage_path`
- `content_revision`
- `updated_at` through the existing trigger

A successful replacement must preserve:

- `id`
- `user_id`
- `upload_type`
- `slug`
- `created_at`
- `expires_at`
- `deleted_at`
- The active-link count

## Dashboard UX

### Entry Point

Add a `Replace` action to each file card in:

```text
components/profile/components/LinkCard.tsx
```

Place the action near Save and Delete. Do not add it to anonymous-link cards.

### Replacement Dialog

Create a dedicated replacement dialog using the existing upload UI patterns.

The dialog should:

- Open from the selected file card.
- Display the current filename.
- Explain that the existing share link will point to the new file.
- Support click-to-select and drag-and-drop.
- Accept the same formats and size limits as initial uploads.
- Show the selected replacement filename.
- Prevent duplicate submissions.
- Display a loading state while uploading.
- Reset the native file input after each attempt so the same file can be selected again.
- Keep the existing file unchanged while the request is in progress.
- Show an actionable error if the request fails.
- Close or reset only after an appropriate success or cancellation state.

Do not optimistically replace the card because the new storage object and database update must succeed first.

### Unsaved Metadata Changes

A replacement updates the content filename. If the user has unsaved filename, slug, or expiration edits on the same card:

- Disable Replace and ask the user to save first, or
- Require explicit confirmation that those unsaved metadata changes will be discarded.

The safer default is to disable Replace until the metadata is saved.

### Success State

After success:

- Update both the current and saved file state from the server response.
- Show a success toast.
- Display the new filename, type, and size.
- Display the updated timestamp.
- Keep the existing public URL unchanged.

## Client State

Add a `replaceFile` mutation to `state/api.ts` with an input similar to:

```ts
type ReplaceFileInput = {
  fileId: string
  file: File
}
```

The mutation should:

- Build multipart `FormData`.
- Call `/api/me/files/[fileId]/replace`.
- Invalidate `MeFiles`.
- Invalidate `MeUploadQuota` if replacements consume the account upload rate limit.
- Invalidate the matching `PublicFile` cache entry.
- Return the updated `AppFile` from the server.

Wire the mutation through `components/profile/ProfileDashboard.tsx` and pass the replace action into `LinkCard`.

## Cache and Freshness

Storage objects can continue receiving a one-year cache lifetime because each replacement receives a new object URL.

The public metadata endpoint should return:

```http
Cache-Control: no-store
```

This ensures a newly loaded public page resolves the current database `storage_path` instead of cached metadata from an older revision.

The first release does not need live updates for already-open public previews. Those users can refresh the share page to load the new immutable object URL.

## Rate Limits and Quotas

Recommended policy:

- Count replacement requests toward the existing account daily upload limit.
- Apply the existing IP burst protection.
- Do not apply the active-link count because no link is created.
- Let the database quota trigger enforce the global 5 GiB limit during the metadata update.
- Delete the newly uploaded object if the quota update fails.

“Anytime replacement” means users are not limited to one upload attempt during the life of a file. It does not mean replacement requests bypass abuse controls or storage limits.

## Security Requirements

- Perform ownership checks on the server.
- Never trust a client-provided user ID.
- Never overwrite an existing storage object.
- Prevent path traversal in generated storage names.
- Keep storage paths internal to server responses.
- Do not log original filenames because they may contain sensitive information.
- Keep the old object until the database points to the replacement.
- Use conditional database updates to prevent concurrent request conflicts.
- Do not add an anonymous-session replacement path.

## Implementation Steps

### 1. Database and Types

1. Add `content_revision` to the `files` table.
2. Add the positive-revision check constraint.
3. Add the field to `AdminFileRow` and `AppFile`.
4. Verify the migration on a database containing existing files.

### 2. Storage Utilities

1. Add a revision-token generator.
2. Add a sanitized storage-stem builder.
3. Add a builder that combines record ID, filename stem, token, and verified extension.
4. Update the storage upload helper to accept a full object key.
5. Keep `upsert: false` and immutable object behavior.
6. Add cleanup helpers for failed and superseded objects.

### 3. Server Data Layer

1. Add a content-update function scoped by file ID and owner ID.
2. Include the expected content revision in the update condition.
3. Update all content fields in one database request.
4. Return no row on a stale revision so the route can return `409`.
5. Preserve slug, expiration, creation time, and upload type.

### 4. Authenticated API

1. Create `app/api/(account)/me/files/[fileId]/replace/route.ts`.
2. Authenticate the user.
3. Verify ownership, active status, and expiration.
4. Apply rate limits before expensive multipart processing where possible.
5. Validate the uploaded bytes.
6. Upload the new immutable object.
7. Commit the conditional database update.
8. Clean up or queue deletion of the previous object.
9. Clean up the new object if the database update fails.
10. Return only safe dashboard metadata.

### 5. Client Integration

1. Add response and mutation types.
2. Add the RTK Query replacement mutation.
3. Export the mutation hook.
4. Add cache invalidation.
5. Build the replacement dialog.
6. Add the dashboard action.
7. Wire success and error state.
8. Handle same-file reselection and unsaved metadata.

### 6. Cleanup and Caching

1. Add retryable cleanup for superseded objects.
2. Ensure cleanup jobs never delete an object still referenced by a current file row.
3. Add `Cache-Control: no-store` to public metadata responses.
4. Extend the existing scheduled cleanup mechanism if needed.

### 7. Tests and CI

The project currently has no test runner. Add a focused test setup rather than relying only on manual verification.

Recommended coverage:

- Random token format and uniqueness behavior.
- Storage stem sanitization and path traversal prevention.
- Extension selection from verified MIME type.
- Image-to-PDF and PDF-to-image replacement.
- Same public URL before and after replacement.
- Correct filename, MIME type, file type, size, and revision updates.
- Preservation of slug, expiration, and creation timestamp.
- Active-link count remaining unchanged.
- Failure before storage upload.
- Failure after storage upload but before the database update.
- Database quota rejection preserving the old object.
- Concurrent replacements producing one success and one `409`.
- Previous-object cleanup failure not rolling back the new object.
- Unauthorized and non-owner requests returning `401` or `404`.
- Anonymous-session requests being rejected.
- Replacements counting toward rate limits.
- Dashboard loading, success, failure, same-file reselection, and unsaved-metadata states.

Extend CI to run the new test command in addition to:

```text
npm run lint
npx tsc --noEmit
npm run format:check
```

## Acceptance Criteria

- A registered user can replace an owned file from the dashboard.
- A registered user cannot replace another user's file.
- Anonymous users and anonymous sessions cannot replace any file.
- The public share URL remains unchanged.
- A hard refresh loads the replacement content.
- Each replacement uses a new storage object with a random suffix.
- No active storage object is overwritten.
- Allowed replacements can change between image and PDF.
- Failed replacements leave the old file active and unchanged.
- Concurrent replacements cannot silently overwrite one another.
- Replacement does not consume an additional active-link slot.
- Replacement is subject to configured upload limits and global storage quota.
- Previous storage objects are deleted or retried for deletion after success.
- Existing uploaded files continue to work without a storage migration.

## Rollout

1. Apply the database migration.
2. Deploy storage naming and authenticated replacement APIs.
3. Deploy the dashboard replacement dialog.
4. Verify replacement and failure recovery in staging.
5. Monitor replacement failures, conflicts, quota failures, and cleanup backlog.
6. Keep anonymous APIs and anonymous-link UI unchanged.

## Out of Scope

- Anonymous file replacement
- Anonymous-session replacement permission
- User-visible version history
- Undo or restore
- Creating a new public link for each revision
- Live-updating already-open public previews
- Batch replacement
- Replacing files outside a registered user's dashboard
