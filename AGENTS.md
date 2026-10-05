# AGENTS.md

**Project purpose:** SnapHost is a Next.js App Router file-sharing app that lets users upload images or PDFs and get shareable links (anonymous or custom) in seconds.

## Key commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint (with import boundaries; see [eslint.config.mjs](eslint.config.mjs))
- `npx tsc --noEmit` — TypeScript typecheck
- `npm run format` / `npm run format:check` — Prettier
- `npm run cleanup:expired` — remove expired custom files ([scripts/cleanup-expired-files.mjs](scripts/cleanup-expired-files.mjs), QStash-scheduled)
- `npm run purge:anon` — purge expired anon sessions/files ([scripts/purge-expired-anon-sessions.mjs](scripts/purge-expired-anon-sessions.mjs), QStash-scheduled)
- `npm run cleanup:provision` — provision/cleanup expired upload cleanup ([scripts/provision-expired-upload-cleanup.mjs](scripts/provision-expired-upload-cleanup.mjs))

## Architecture (key files & structure)

- **App Router:** [app/](app/) with route groups `(marketing)`, `(product)`, `(auth)`, plus API under `app/api/**` (route groups like `(uploads)`, `(anonymous)`, `(account)`, `(files)`, `(identity)`, `(internal)`).
- **Features:** [features/](features/) (landing, layout, upload, profile, auth) — feature-first.
- **Components:** [components/](components/) (shared UI, providers, motion, shared primitives; shadcn-style in `components/ui/`). [PostHogProvider](components/providers/posthog-provider.tsx) wraps the React tree for SPA pageview tracking.
- **State:** [state/](state/) — Redux Toolkit with slices (`state/slices/uploadSlice.ts`, `state/slices/fileSlice.ts`, `state/slices/authSlice.ts`) and RTK Query API (`state/api.ts`).
- **Lib:** [lib/](lib/) shared utilities (validation, sanitization, config, public URL helpers, API error helpers). [lib/posthog.ts](lib/posthog.ts) exports the shared `posthogEnabled` flag (client-safe). [lib/server/](lib/server/) contains service-role code with `import 'server-only'` (supabase admin, storage, auth helpers, file admin, rate limiting, DB access).
- **Types:** [types/app.ts](types/app.ts), [types/components.ts](types/components.ts).
- **Config/constants/messages:** [lib/config.ts](lib/config.ts), [lib/messages.ts](lib/messages.ts), [data/](data/), [validators/](validators/).
- **Database:** [database.sql](database.sql) (schema, RLS, indexes, global storage quota trigger/function).
- **Docs:** [docs/](docs/) (PRD, codebase audit, feature tickets, etc.). Progressive disclosure — prefer linking to docs over inlining.

## Data model (high level)

- `users` (auth-linked app users; free/premium tier; optional `username` for custom `/u/:username/:slug` links)
- `anon_sessions` (only `token_hash` SHA-256 stored; `expires_at`, `revoked_at`)
- `files` (owner `user_id` nullable, `anon_session_id` nullable, `upload_type` enum `anonymous|custom`, `slug`, filename, `file_type` enum `image|pdf`, `mime_type` verified, `size`, `storage_path`, `expires_at` nullable, `deleted_at` soft-delete). Constraints enforce ownership/type consistency and anon expiry ≤ 24h. Unique indexes: global unique `slug` for anonymous (`user_id IS NULL`), per-user unique `(user_id,slug)` for custom.
- `app_storage_quota` singleton (5 GiB default, `used_bytes` tracked; trigger `enforce_global_storage_quota()` prevents insert/update that would exceed quota; serialized via `FOR UPDATE`).
- See [database.sql](database.sql) and [docs/codebase-audit.md](docs/codebase-audit.md) for details/RLS.

## Flows

- **Upload (anonymous/custom):** `POST /api/(uploads)/upload/route.ts`. Steps: IP burst + tier/account/anon rate limits (before multipart parsing); extract file; determine `uploadType` (force anonymous or auth user); validate content via magic bytes (`validateFileContent`, sets `verifiedMimeType`, fileType); sanitize filename; generate slug (`createFileIdSync`, base64url, bias-free, 12 chars → ~72 bits entropy); enforce free-tier active file cap (custom free ≤ 5); set `expiresAt` (anon → +24h; custom optional future date); upload to Supabase storage with verified contentType/derived ext; handle/create anon session (issue httpOnly `anon_session` cookie if new, storing only SHA-256 hash); insert file record (service-role via `lib/server/*`); return `{ success, fileId(slug), filename, url, expiresAt }`. Cleans up storage on errors (including trigger-rejected anon session limit). Max duration 60s.
- **Anonymous links management:** session-scoped routes in `app/api/(anonymous)/anon/files/**` and UI [AnonLinks](components/anon/AnonLinks.tsx); list/delete scoped to `anon_session_id` (cookie → hash lookup). Anon links expire after 24h.
- **Custom/user files:** account-scoped under `app/api/(account)/me/**` (profile, files CRUD, account deletion). User links use `/u/:username/:slug` when username exists, else short `/f/:slug`/share URL; [public-file-url.ts](lib/public-file-url.ts)/[buildFileUrl](lib/server/file-admin.ts) handle building.
- **File metadata/preview:** share metadata fetched server-side (service-role) where needed; anon/public read of raw rows is not exposed to anon/authenticated roles ([docs/codebase-audit.md#7](docs/codebase-audit.md#7)).
- **Auth:** Supabase Auth (email/password, Google, GitHub). `getAuthUserFromRequest` and `getCurrentAppUser` create/lookup app user; in-memory 30s TTL cache keyed by `authUserId` with invalidation on writes ([lib/server/auth-user.ts](lib/server/auth-user.ts)).

## Security, abuse protection & headers

- **Server-only guard:** all service-role modules in `lib/server/*` include `import 'server-only'`. ESLint boundaries prevent `client|shared` from importing `lib/server/*`, and `app/**/*.tsx` from importing `@/lib/server/*`.
- **Magic-byte validation:** [lib/fileValidation.ts](lib/fileValidation.ts) detects PNG/JPEG/WEBP/PDF by magic bytes; verified MIME used for storage/upload `contentType` and object extension (never trust browser MIME/filename).
- **Rate limiting (Upstash Redis):** before multipart parsing — IP burst `limitUploadIpBurst`, anonymous daily `limitAnonymousUploads`, account daily by tier `limitAccountUploads`. Responses include `Retry-After`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. See [lib/server/upload-rate-limit.ts](lib/server/upload-rate-limit.ts). Requires correct client-IP header.
- **Global quota:** DB trigger enforces 5 GiB cap; uses `SELECT ... FOR UPDATE` on singleton row ([database.sql](database.sql)).
- **Anon token:** random 32-byte hex stored only as SHA-256 hash in `anon_sessions`; httpOnly, secure (https), SameSite lax, 24h cookie.
- **Security headers & CSP with nonce:** [next.config.mjs](next.config.mjs) sets HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive Permissions-Policy. [proxy.ts](proxy.ts) generates per-request nonce; root layout applies nonce to theme bootstrap (beforeInteractive) and Umami (afterInteractive); pages render dynamically to support request-bound nonce.
- **Sentry:** configured via [instrumentation.ts](instrumentation.ts), [instrumentation-client.ts](instrumentation-client.ts), [sentry.server.config.ts](sentry.server.config.ts), [sentry.edge.config.ts](sentry.edge.config.ts).
- **PostHog:** product analytics. Client SDK initialised in [instrumentation-client.ts](instrumentation-client.ts) (`capture_pageview: false`; SPA pageviews handled by [PostHogProvider](components/providers/posthog-provider.tsx)). User identify/reset in [auth-provider.tsx](components/providers/auth-provider.tsx). Client events guarded behind `posthogEnabled` from [lib/posthog.ts](lib/posthog.ts). Server-side structured logs shipped via OTLP in [instrumentation.ts](instrumentation.ts) (upload success/failure events in the upload route). CSP allows `https://*.posthog.com` for `script-src` and `connect-src` ([proxy.ts](proxy.ts)).

## Code style rules the agent can't guess

- **Path alias:** `@/*` only.
- **Feature-first structure:** `app/`, `features/`, `components/`, `state/`, `lib/`, `lib/server/`. Expose via feature `index.ts` where present ([features/upload/index.ts](features/upload/index.ts)).
- **Import boundaries (ESLint):** enforced by `eslint-plugin-boundaries` and `no-restricted-imports`. Violations fail lint ([eslint.config.mjs](eslint.config.mjs)).
- **Server-only discipline:** any new module under `lib/server/` **must** include `import 'server-only'`. Never import `lib/server/*` from client components/shared client-eligible code or `app/**/*.tsx` UI files.
- **State/data fetching:** use RTK Query hooks from [state/api.ts](state/api.ts); keep service layers thin.
- **No comments unless explicitly requested.** Do not add explanatory comments.
- **Prefer editing existing files.** Never create docs unless explicitly requested by user.
- **TypeScript strict:** see [tsconfig.json](tsconfig.json). Run `npx tsc --noEmit` after changes.
- **Formatting:** Prettier via `format`/`format:check`.

## Testing conventions

- **No test suite exists.** Do not assume any test framework/scripts. Check [README.md](README.md) and [docs/](docs/) before proposing tests. If unclear, **ask** before adding tests, test configs, or dependencies. ([docs/codebase-audit.md](docs/codebase-audit.md))

## Environment & config

- **Required env (typical):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_AUTH_PROVIDERS` (comma-separated), `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_POSTHOG_HOST` (PostHog ingestion host, e.g. `https://us.i.posthog.com`), `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (optional), Upstash/QStash/Sentry vars as configured. See [.env.example](.env.example) if present, and [README.md](README.md#setup).
- **BASE_URL:** derived from `SITE_URL` in [data/emails.ts](data/emails.ts).
- **File limits:** images/PDFs up to 10MB each ([lib/config.ts](lib/config.ts)). Free tier active links: 5 (custom); anonymous session: up to 3 links; see [data/pricing.ts](data/pricing.ts).
- **CSP origins:** allow Supabase storage, PostHog (`*.posthog.com`), Umami, Vercel analytics as needed; nonce-based script injection.

## Clipboard & UX helpers

- [lib/clipboard.ts](lib/clipboard.ts) provides `copyTextToClipboard()` with Clipboard API + hidden textarea fallback; returns boolean, never throws. Use this for all copy actions.

## Boundaries (always/ask/never)

- **Always:** validate with magic bytes server-side; keep service-role keys only in `lib/server/*`; respect RLS; use RTK Query for data fetching; run `npm run lint && npx tsc --noEmit` after changes; clean up uploaded storage on DB/validation failures in upload paths; handle `anon session link limit reached` trigger case gracefully.
- **Ask:** before adding tests, changing env vars, modifying DB schema/RLS/triggers/functions, altering rate limits/quotas, adding new dependencies, or changing security headers/CSP.
- **Never:** import `lib/server/*` from client/app UI; log secrets/tokens/PII; commit secrets; trust browser MIME/filename for security checks; delete files outside session-scoped or authenticated endpoints; echo raw internal errors to clients (return generic messages via [lib/messages.ts](lib/messages.ts), log details server-side).
