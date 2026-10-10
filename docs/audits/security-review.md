# SnapHost Deep Security and Reliability Review

**Review scope:** repository source, checked-in schema, API routes, server helpers, client data flows, configuration, and dependency manifest.

**Review date:** 2026-10-07

**Review style:** source-first review. Findings are separated into source-confirmed issues, deployment-dependent risks, functional bugs, and best-practice improvements. This document does not claim that a deployment has been penetration-tested.

## Executive summary

SnapHost has a good foundation: service-role code is mostly isolated under `lib/server`, bearer-token authentication is used for account APIs, uploads use server-side magic-byte validation, file sizes are bounded, object names are generated rather than trusted, public metadata is fetched server-side, and the application has CSP, HSTS, frame, MIME, referrer, and permissions headers.

The most important issue is in the checked-in Postgres policy:

```sql
CREATE POLICY "Service role manages all files"
  ON files FOR ALL
  USING (true)
  WITH CHECK (true);
```

Because the policy does not specify `TO service_role`, PostgreSQL applies it to `PUBLIC`. Combined with DML grants to Supabase `anon` and `authenticated` roles, this can allow direct clients to insert, update, or delete arbitrary `files` rows. The policy should be removed or restricted to `service_role`, and table DML should be explicitly revoked from browser roles.

Other high-priority areas are bundle upload rate-limit bypasses, storage cleanup ordering, bundle slug-history collisions, and schema drift between `database.sql` and the live database shape.

## Remediation status

The following findings were remediated during the follow-up implementation:

- `files` service-role policy is restricted to `service_role`; browser table privileges are revoked, and stale legacy public policies were removed from the configured live database.
- Bundle add and replacement routes now use IP-burst and account upload limits.
- Bundle creation has rate and per-tier count limits.
- Bundle slugs are validated and checked against active bundles, slug history, and the owner’s standalone file slugs.
- Bundle publish and file-count checks ignore expired files.
- Bundle deletion and replacement check Storage deletion before removing database rows.
- Bundle Storage object paths no longer contain user-provided filenames.
- Account deletion includes bundle files in its Storage cleanup set.
- Storage upload cacheControl reduced from 1 year to 1 hour to align with cleanup SLAs and limit cached exposure of expired blobs.
- Client IP resolution hardened to prioritize Vercel's platform-managed `x-forwarded-for` header.
- Empty draft bundle cleanup (`purgeEmptyBundles`) paginated and bounded in batches of 100.
- Failed storage cleanup on replacement surfaces structured `[ORPHAN]` log with path for observability.

The checked-in schema now uses the confirmed live BIGINT model for `users.id`, `files.id`, `files.user_id`, and `current_user_id()`. No destructive production migration was run; the live database already uses this model.

## Priority overview

| Priority   | Area                                                    | Status                                             | Why it matters                                                                         |
| ---------- | ------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Critical   | `files` RLS service-role policy applies to `PUBLIC`     | Remediated (scoped to `service_role`, DML revoked) | Browser roles may directly mutate arbitrary file metadata.                             |
| High       | Bundle add/replace routes bypass upload rate limits     | Remediated (IP burst + account limits enforced)    | Authenticated users can upload or replace repeatedly outside the account upload quota. |
| High       | Bundle slug history can be hijacked or collide          | Remediated (validated & atomic DB function)        | An old public URL can resolve to a different bundle after slug reuse.                  |
| Medium     | Bundle deletion/replacement can orphan public objects   | Remediated (storage checked first, orphan logged)  | Database rows disappear while public Storage objects remain.                           |
| Resolved   | Schema and live database types are inconsistent         | Remediated in checked-in schema                    | The checked-in schema now follows the confirmed live BIGINT identifier model.          |
| Medium     | Expiration is enforced by app lookup, not object access | Mitigated (1h cacheControl + cleanup SLA)          | Direct public Storage URLs can remain usable after an app link expires.                |
| Medium     | Request proxy headers are trusted for IP rate limits    | Remediated (trusted x-forwarded-for priority)      | A misconfigured edge proxy allows IP-limit bypass.                                     |
| Low/Medium | Unbounded slug/name inputs and cleanup scans            | Remediated (validated slugs + batched cleanup)     | Causes oversized metadata, broken links, or cleanup pressure.                          |

## 1. Critical: `files` RLS policy grants universal DML

> **Status: ✅ RESOLVED**

### Evidence

- [`database.sql:548-552`](../database.sql#L548) creates an `FOR ALL` policy with `USING (true)` and `WITH CHECK (true)`.
- The policy has no `TO service_role` clause. PostgreSQL therefore treats it as applying to `PUBLIC`.
- The intended comment says it is for the service role, but comments do not constrain policy scope.
- The same schema revokes only `SELECT` from browser roles at [`database.sql:491-493`](../database.sql#L491), leaving DML privileges to be controlled by the permissive policy.
- The authenticated and anonymous policies are permissive policies. PostgreSQL combines permissive policies with OR, so a universal policy defeats their ownership conditions for operations it covers.

### Impact

If the live grants match the current database state, a caller using the public Supabase anon key can directly call PostgREST against `files` and attempt arbitrary inserts, updates, and deletes. Possible outcomes include:

- deleting another user’s file metadata;
- changing another user’s slug, expiry, owner, or bundle association;
- inserting rows that point at existing Storage objects;
- creating metadata rows that consume quota or interfere with cleanup;
- bypassing application-layer upload validation and rate limits.

The Storage object itself still requires separate Storage permissions, but metadata corruption and deletion are already a serious trust-boundary violation.

### Fix

Use one of these designs:

1. Remove the universal policy entirely. The backend already uses the service role, which bypasses RLS.
2. If an explicit policy is required, scope it explicitly:

```sql
CREATE POLICY "Service role manages all files"
  ON files FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

Then explicitly revoke `INSERT`, `UPDATE`, and `DELETE` on `files` from `anon` and `authenticated`, and grant only the browser operations that are intentionally supported. Re-run the live privilege query after migration.

**Resolution:** Policy was updated to `ON files FOR ALL TO service_role` and table DML was explicitly revoked via `REVOKE ALL PRIVILEGES ON TABLE files FROM anon, authenticated, PUBLIC;` in `database.sql:726-731`.

## 2. High: bundle file uploads bypass account and IP upload limits

> **Status: ✅ RESOLVED**

### Evidence

- The ordinary upload route applies `limitUploadIpBurst` and `limitAccountUploads` before parsing/uploading at [`app/api/(uploads)/upload/route.ts`](<../app/api/(uploads)/upload/route.ts>).
- The bundle add route authenticates and checks only ownership and file count at [`app/api/(account)/me/bundles/[bundleId]/files/route.ts:14-30`](<../app/api/(account)/me/bundles/[bundleId]/files/route.ts#L14>).
- The bundle add route parses and uploads the file at lines 33-75 without calling either upload limiter.
- The bundle replacement route follows the same pattern at [`app/api/(account)/me/bundles/[bundleId]/files/[fileId]/route.ts:29-77`](<../app/api/(account)/me/bundles/[bundleId]/files/[fileId]/route.ts#L29>).

### Impact

An authenticated user can repeatedly add files to different bundles and repeatedly replace files without consuming the normal account upload quota or IP burst budget. The global Storage quota is a backstop, not an account-level abuse control. Replacements also create a new object before deleting the old one, increasing temporary storage pressure.

### Fix

Create a shared authenticated upload guard and call it before every bundle add and replacement:

- IP burst limit;
- account daily upload limit by tier;
- a consistent per-operation retry response;
- quota/count enforcement in a transaction or database-backed counter where races matter.

Do not rely only on the client or bundle file-count limit.

**Resolution:** Added `limitUploadIpBurst` and `limitAccountUploads` rate limits before parsing/uploading in both bundle add (`app/api/(account)/me/bundles/[bundleId]/files/route.ts`) and bundle replacement (`app/api/(account)/me/bundles/[bundleId]/files/[fileId]/route.ts`).

## 3. High: bundle slug history permits public-link hijacking

> **Status: ✅ RESOLVED**

### Evidence

- Bundle updates write the new slug through [`app/api/(account)/me/bundles/[bundleId]/route.ts:31-44`](<../app/api/(account)/me/bundles/[bundleId]/route.ts#L31>).
- The old slug is added to history only after the current bundle update succeeds at lines 41-42.
- Current slug uniqueness is checked only by the `bundles.slug` unique constraint; it does not check `bundle_slug_history`.
- Public lookup checks the current bundle first at [`app/api/(files)/files/[fileId]/route.ts:20-24`](<../app/api/(files)/files/[fileId]/route.ts#L20>), then checks historical slugs.

### Attack/result path

1. Bundle A publishes slug `alpha`.
2. Bundle A changes its slug to `beta`; `alpha` is stored in history.
3. Another owner claims current slug `alpha`, because only current bundle rows are checked.
4. Requests to `/alpha` resolve the new current bundle before historical redirect logic runs.

Anyone holding Bundle A’s old public URL can therefore be shown a different owner’s bundle. This is especially practical for custom, human-readable slugs.

### Fix

Treat current and historical slugs as one namespace. The safest design is a single slug registry table with an active/current marker, or a transaction-safe database function that checks both tables and inserts history atomically. At minimum:

- reject a new slug if it exists in `bundle_slug_history`;
- perform the current update and history insert in one transaction;
- resolve historical mappings before current mappings when the request is explicitly an old URL, or use a canonical slug registry.

Also validate slug length and character set before writing it.

**Resolution:** Atomic database function `update_bundle_metadata()` in `database.sql` checks active bundles, `bundle_slug_history`, and owner file slugs under advisory locks before inserting history. The route strictly validates slug syntax with `/^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/`.

## 4. High/Medium: bundle deletion and replacement can leave public Storage objects

> **Status: ✅ RESOLVED**

### Evidence

- `deleteBundleForUser` deletes the bundle database row first at [`lib/server/bundle-admin.ts:189-198`](../lib/server/bundle-admin.ts#L189), relying on database cascade for file rows.
- The API then attempts Storage deletion afterward at [`app/api/(account)/me/bundles/[bundleId]/route.ts`](<../app/api/(account)/me/bundles/[bundleId]/route.ts>).
- Bundle file deletion removes the database row before deleting its object at [`app/api/(account)/me/bundles/[bundleId]/files/[fileId]/route.ts:120-129`](<../app/api/(account)/me/bundles/[bundleId]/files/[fileId]/route.ts#L120>).
- Replacement inserts the new row, deletes the old row, then calls `deleteFileFromStorage` but does not check its boolean result at [`app/api/(account)/me/bundles/[bundleId]/files/[fileId]/route.ts:64-81`](<../app/api/(account)/me/bundles/[bundleId]/files/[fileId]/route.ts#L64>).

### Impact

If Storage deletion fails, the database no longer contains the object path needed for retry. If the bucket is public, a previously returned object URL can remain accessible and the orphan consumes Storage. Replacement can report success even when the old object removal returned `false`.

### Fix

- Collect paths before deleting database rows.
- Delete Storage objects first; only remove rows after successful object deletion, or maintain a durable deletion/outbox record when deletion fails.
- Check every `deleteFileFromStorage` result.
- Run a periodic orphan scanner that compares Storage paths with database rows.

The account-deletion path was updated during this work to collect bundle files as well as standalone files, but it still needs retryable operational cleanup for Storage failures.

**Resolution:** Bundle and bundle file deletions now verify and remove storage objects before deleting database rows. File replacements log structured `[ORPHAN]` warnings with storage path upon deletion failure.

## 5. Resolved: checked-in schema aligned to the live BIGINT model

> **Status: ✅ RESOLVED**

### Evidence

- `database.sql` now defines `users.id` and `files.id` as BIGINT identity columns.
- `database.sql` now defines `files.user_id` and `current_user_id()` as BIGINT-compatible.
- `bundles.id`, `bundle_slug_history.bundle_id`, and anonymous-session identifiers remain UUIDs, matching the live database.
- Application IDs remain represented as strings at the API boundary; database responses may contain numeric BIGINT values.

### Impact

Running `database.sql` against a fresh database can fail or produce a schema different from the live database. RLS functions, foreign keys, API ID validation, and client cache keys can then behave differently between environments.

### Fix

Keep the live BIGINT model canonical. Treat `database.sql` as a fresh-install schema and use explicit migrations for future changes; do not use TypeScript casts to mask future database drift.

**Resolution:** `database.sql` was aligned with the live database using `BIGINT` identity columns for `users.id`, `files.id`, `files.user_id`, and `current_user_id()`.

## 6. Medium/deployment-dependent: app expiry does not protect direct Storage URLs

> **Status: ✅ MITIGATED**

### Evidence

- Public metadata responses return direct Storage URLs at [`lib/server/database.ts:69-77`](../lib/server/database.ts#L69) and [`lib/server/bundle-admin.ts:238-247`](../lib/server/bundle-admin.ts#L238).
- App-level expiry filters rows in database queries, but Storage access is controlled separately by bucket visibility and object deletion.
- Storage upload objects receive a one-year cache-control value in [`lib/server/storage.ts:47-52`](../lib/server/storage.ts#L47).

### Risk

After an app link expires, a direct object URL may continue to work until cleanup runs, while a cached copy may survive longer. This may be acceptable if the product explicitly defines expiry as link-level expiry, but it is not equivalent to immediate object access revocation.

### Fix/options

- Use private Storage objects and short-lived signed URLs.
- Enforce expiry at the signed-URL issuance layer.
- Define and document the exact cleanup SLA.
- Avoid one-year caching for objects with user-configurable expiry unless the privacy trade-off is intentional.

**Resolution:** Reduced upload `cacheControl` from 1 year (`31536000`) to 1 hour (`3600`) in `lib/server/storage.ts` so CDN caches evict deleted/expired blobs quickly after scheduled cleanup removes them, aligning cache duration with the cleanup SLA.

## 7. Medium/deployment-dependent: client-controlled proxy headers affect IP limits

> **Status: ✅ RESOLVED**

### Evidence

[`lib/server/upload-rate-limit.ts:64-67`](../lib/server/upload-rate-limit.ts#L64) trusts `cf-connecting-ip`, then the first `x-forwarded-for` value, then `x-real-ip`.

### Risk

The comment assumes the hosting proxy overwrites these headers. If the app is reachable through another ingress, or the proxy preserves client-supplied values, attackers can rotate fake IPs and bypass IP-based burst and anonymous limits.

### Fix

Use the platform’s authenticated/request-context client IP, or configure and verify a single trusted proxy. Strip incoming forwarding headers at the edge and add an owner-observed deployment check.

**Resolution:** Updated `getClientIp` in `lib/server/upload-rate-limit.ts` to strictly prioritize Vercel's platform-managed `x-forwarded-for` header and dropped unconfigured Cloudflare header fallbacks.

## 8. Medium: slug and bundle name inputs are under-validated

> **Status: ✅ RESOLVED**

### Evidence

- Bundle PATCH accepts any nonempty trimmed slug at [`app/api/(account)/me/bundles/[bundleId]/route.ts:31-38`](<../app/api/(account)/me/bundles/[bundleId]/route.ts#L31>).
- Bundle creation accepts any string name at [`app/api/(account)/me/bundles/route.ts:55-68`](<../app/api/(account)/me/bundles/route.ts#L55>).
- Public route validation accepts only `[a-zA-Z0-9_-]+` at [`app/api/(files)/files/[fileId]/route.ts:7-17`](<../app/api/(files)/files/[fileId]/route.ts#L7>), so a saved slug containing spaces, slashes, Unicode, or other characters can produce links that do not resolve consistently.

### Fix

Use one shared slug validator with a fixed maximum length, allowed alphabet, reserved-name list, and normalization rules. Bound bundle names and reject invalid JSON/body sizes with a 400 response.

**Resolution:** Bundle PATCH (`app/api/(account)/me/bundles/[bundleId]/route.ts`) strictly validates slugs via `/^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/`, bounds bundle names to 120 characters, and returns 400 on malformed JSON bodies.

## 9. Medium: bundle publish can publish only-expired content

> **Status: ✅ RESOLVED**

### Evidence

- Publish checks `countBundleFiles(bundleId) < 1` at [`app/api/(account)/me/bundles/[bundleId]/publish/route.ts:21-25`](<../app/api/(account)/me/bundles/[bundleId]/publish/route.ts#L21>).
- `countBundleFiles` counts non-deleted rows but does not exclude expired files.
- Public lookup later filters expired files and returns not found if no active files remain.

### Result

A bundle can be marked published even though it has no active file. It then occupies a published row, may appear inconsistently in the dashboard, and has no usable public content.

### Fix

Count active, non-deleted, non-expired files for publishing and automatically unpublish/delete bundles that lose their last active file.

**Resolution:** Bundle publish route (`app/api/(account)/me/bundles/[bundleId]/publish/route.ts`) checks `countActiveBundleFiles`, which strictly excludes expired files (`expires_at > NOW()`) and soft-deleted files before permitting publishing.

## 10. Medium: bundle file-count and active-bundle limits are race-prone

> **Status: ✅ RESOLVED**

### Evidence

- Add-file checks `countBundleFiles` and then inserts separately at [`app/api/(account)/me/bundles/[bundleId]/files/route.ts:27-75`](<../app/api/(account)/me/bundles/[bundleId]/files/route.ts#L27>).
- Bundle creation checks `countBundlesForUser` and then inserts separately at [`app/api/(account)/me/bundles/route.ts:50-68`](<../app/api/(account)/me/bundles/route.ts#L50>).

### Risk

Concurrent requests can both observe capacity and insert, exceeding plan limits. This is primarily an entitlement/resource-control issue.

### Fix

Use a transaction or database function with row locking/advisory locking, or enforce the limit through a database counter/constraint. Keep the API check for friendly errors but do not rely on it as the final control.

**Resolution:** File count limits are enforced at the database level by the `enforce_bundle_file_limit` trigger using `pg_advisory_xact_lock`. Mutations also use transactional functions `update_bundle_metadata` and `replace_bundle_file` with advisory locks.

## 11. Low/Medium: bundle upload object paths contain sanitized user filenames

> **Status: ✅ RESOLVED**

### Evidence

[`lib/server/storage.ts:57-64`](../lib/server/storage.ts#L57) places a sanitized filename in the public Storage object path.

### Risk

Object URLs and Storage logs can disclose filenames such as `passport-jane-doe.pdf`. Sanitization prevents traversal but does not make the filename non-sensitive.

### Fix

Use opaque object paths only, such as `uploads/<bundleId>/<fileId>/<random>.<verified-extension>`, and keep the user filename solely in database metadata or the download disposition.

**Resolution:** Bundle storage paths use opaque identifiers (`uploads/${bundleId}/${fileId}/${token}${ext}` with UUID tokens) in `uploadBundleFileToStorage` (`lib/server/storage.ts`), keeping user filenames solely in DB metadata.

## 12. Low/Medium: cleanup queries are broad and potentially expensive

> **Status: ✅ RESOLVED**

### Evidence

- [`lib/server/expired-upload-cleanup.ts:145-178`](../lib/server/expired-upload-cleanup.ts#L145) selects stale/empty bundles without a batch limit.
- It then loops through every matching bundle and Storage path in one request.
- The route has a 60-second max duration.

### Fix

Use keyset pagination and bounded batches for every cleanup category. Record a durable cleanup cursor/job state and emit metrics for scanned, deleted, failed, and remaining rows.

**Resolution:** Paginated and bounded `purgeEmptyBundles` using `BATCH_SIZE = 100` inside a `while` loop in `lib/server/expired-upload-cleanup.ts`, matching the safe batching pattern of file and session cleanup routines.

## 13. Functional/API correctness issues

These are not necessarily security vulnerabilities but should be fixed:

- Bundle PATCH parses JSON outside a `try/catch`; malformed JSON can become a framework 500 instead of a client-facing 400.
- Slug history insertion occurs after the slug update and is not transactional; a history insert failure leaves the new slug active without redirect history.
- `getPublicBundle` and standalone file lookup share URL namespaces without a cross-table slug registry. A bundle and a standalone custom file can collide for the same username/slug, causing one resource to shadow the other.
- `listBundlesForUser` uses an inner file relation, so empty draft bundles are omitted from the dashboard even though they still exist until cleanup.
- Expired files count toward bundle file limits until the cleanup worker removes them.
- Replacement and delete operations can leave stale UI/cache state if a mutation succeeds in the database but Storage cleanup fails.
- The single-file upload path and bundle upload path use different quota/accounting behavior; keep the product limits explicit and test both paths.
- The current frontend has no test suite covering publish, replace, expiry, account deletion, slug changes, or concurrent mutations.

## 14. Database and migration best practices

- Replace the monolithic `database.sql` with ordered, versioned migrations.
- Make every migration idempotent or explicitly fail with a clear version check. Current `CREATE TYPE`, repeated constraints, and several `CREATE POLICY` statements are not safely rerunnable.
- Add schema CI against a fresh database and a copy of the live schema.
- Add explicit `TO anon`, `TO authenticated`, and `TO service_role` clauses to every policy; never rely on PostgreSQL’s default `PUBLIC` role.
- Revoke table DML from browser roles by default, then grant only intended operations.
- Keep RLS policy tests for cross-user SELECT/INSERT/UPDATE/DELETE and bundle/file association.
- Verify Storage bucket visibility and `storage.objects` policies in the same migration/deployment process.

## 15. Authentication and authorization best practices

- Keep all account mutations on bearer-token authenticated routes; continue avoiding implicit cookie-only auth for APIs.
- Add authorization regression tests for every `{bundleId}` and `{fileId}` route using two dummy users.
- Centralize `getUser` and ownership handling to avoid route-by-route drift.
- Add rate limiting to bundle add/replace, username availability, bundle PATCH, and destructive mutations where abuse matters.
- Make account deletion and storage cleanup an auditable job rather than a best-effort inline operation.
- Invalidate user caches on every entitlement/tier change, not only username writes.

## 16. Upload and storage best practices

- Keep magic-byte validation, but consider safe image/PDF parsing or malware scanning before public exposure.
- Enforce request body limits at the edge before multipart parsing.
- Use private buckets with short-lived signed URLs when expiration is intended to be an access-control boundary.
- Never use user-controlled names in object paths.
- Maintain a database-backed object lifecycle state (`pending`, `active`, `deleting`, `deleted`) for retryable Storage operations.
- Add tests for failed Storage upload, failed DB insert, failed old-object delete, failed new-object delete, and cleanup retries.

## 17. Positive controls already present

- Server-side binary signature validation in [`lib/fileValidation.ts`](../lib/fileValidation.ts).
- `server-only` protection for service-role modules.
- Random URL-safe identifiers with 72 bits of entropy in [`lib/generateFileId.ts`](../lib/generateFileId.ts).
- Filename sanitization before persistence.
- Rate limiting before multipart parsing on the ordinary upload route.
- Owner predicates on application-level file and bundle mutations.
- CSP with nonces, HSTS, `nosniff`, frame denial, referrer policy, and restrictive permissions policy.
- QStash signature verification for scheduled cleanup.
- Expiration filtering in public database lookups.

## Recommended fix order

1. Fix the `files` RLS policy scope and revoke browser DML immediately.
2. Add rate limiting to bundle add and replace operations.
3. Make Storage deletion transactional/retryable and check every deletion result.
4. Unify current and historical slug ownership in one namespace.
5. Reconcile the schema with the live database and move to versioned migrations.
6. Decide whether expiry is link-level or object-level, then enforce that decision with private Storage/signed URLs if needed.
7. Add integration tests for tenant isolation, lifecycle cleanup, expiry, slug changes, and concurrent limits.
