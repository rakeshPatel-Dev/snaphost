# Snaphost — Codebase Audit

> **Date:** 2026-09-19 · **Stack:** Next.js 16 App Router, React 19, Supabase (Postgres + Storage + Auth), Redux Toolkit / RTK Query, framer-motion, Tailwind v4
>
> Findings graded by severity:
> **P0 – Critical** (exploitable / data loss) · **P1 – High** (real bug or clear risk) · **P2 – Medium** (fix soon) · **P3 – Low / hygiene**.

---

## Executive summary

The codebase is well organized along feature lines and follows modern App Router conventions (route handlers, `async params`, RSC + client islands). Theme switching and reduced-motion support are handled deliberately, and the anonymous-session design (hash-only token storage, httpOnly cookie) is solid.

The main gaps are around the **file-sharing security surface**:

1. An **unauthenticated DELETE handler** can grief-delete any anonymous file whose slug is known.
2. The **Supabase service-role key has no `server-only` guard**, so one accidental import would ship it to the browser.
3. File validation **trusts client MIME + client filename extension** with no magic-byte check.
4. **No rate limiting / quota abuse protection** on uploads.
5. **No security headers or CSP**; Next.js is on a stale patch line (16.2.6 vs patched 16.2.11).
6. RLS policies are **wider than needed** and leak row internals to the public anon key.

There is also a **documented-vs-enforced mismatch** (UI advertises free = 3 links/day / 10 MB, server enforces a permanent 5-active-file cap) and **zero automated tests**.

---

## P0 — Critical

### 1. Unauthenticated delete of anonymous files

> **Status: ✅ FIXED — 2026-09-19**

`app/api/files/[fileId]/route.ts` — `DELETE` required **no auth and no session cookie**, and permanently deleted any `upload_type = 'anonymous'` file by slug. The cookie-scoped handler `app/api/anon/files/[fileId]/route.ts:11` already exists, so this route was redundant *and* dangerous.

**Resolution:** removed the `DELETE` handler and the now-dead `getFileBySlug`/`deleteFileBySlug` helpers (`lib/file-admin.ts`), together with their imports. File deletion now only happens via the authenticated `/api/me/files/{id}` and the session-scoped `/api/anon/files/{id}`.

### 2. Service-role key can reach the browser bundle

> **Status: ✅ FIXED — 2026-09-19**

`lib/supabase-admin.ts` holds `SUPABASE_SERVICE_ROLE_KEY`; `lib/storage.ts` imports it. **No file in the repo uses `import 'server-only'`** (verified via grep). Today these modules are only imported from route handlers, but any accidental import from a client component ships the secret into the public JS bundle, bypassing RLS entirely.

**Resolution:** moved admin-capable modules into `lib/server/` and added `import 'server-only'` to each one. Route handlers import from that server-only namespace. ESLint now blocks `components/` and shared `lib/` modules from importing `lib/server/`, and blocks `app` UI files from doing so; Next.js' `server-only` package remains the runtime/build-time backstop.

### 3. File validation trusts the client for MIME and extension

> **Status: ✅ FIXED — 2026-09-19**

- `lib/fileValidation.ts:18-27` accepts any file whose **browser-supplied** `file.type` is in the allowlist (png/jpeg/webp/pdf).
- `lib/storage.ts:16-17` derives the stored object extension from the **client-supplied filename** (`uploads/{id}{ext}`).

An attacker can upload arbitrary content (e.g. an HTML/JS payload) named `x.png` with a forged MIME. The object is served from the CDN with a content type influenced by the filename, creating a content-sniffing / stored-content risk.

**Resolution:** server-side validation now identifies PNG, JPEG, WEBP, and PDF uploads from their magic bytes, ignores browser-provided MIME metadata, and persists the verified MIME type. Storage object extensions and upload `contentType` are derived from that verified value rather than the client filename. `X-Content-Type-Options: nosniff` remains part of P0 #5.

### 4. No rate limiting or per-IP/account upload quota

> **Status: ✅ FIXED — 2026-09-19**

Anonymous uploads are capped only per session (3 links, `database.sql:224`), and sessions are cheap to mint. Free accounts are unlimited in *requests* (capped at 5 active files permanently). `/api/upload` is thus open to storage-abuse and compute DoS.

**Resolution:** uploads are rate-limited with Upstash Redis before multipart parsing: 5 requests/IP per 10 minutes, 3 anonymous uploads/IP/day, 5 free-account uploads/day, and 50 premium-account uploads/day. A Supabase-backed global storage quota ledger/trigger (5 GiB by default, configurable in `database.sql`) rejects metadata inserts that would exceed the capacity. The hosting proxy must overwrite client-IP headers for the IP limit to be trustworthy.

### 5. Missing security headers and CSP

> **Status: ✅ FIXED — 2026-09-19**

`next.config.js` configures only `images.remotePatterns`. There is **no** `headers()` block: no CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, or `Referrer-Policy`. The theme bootstrap uses `dangerouslySetInnerHTML` (`app/layout.tsx:85-100`) which would demand `'unsafe-inline'` under a naive CSP.

**Resolution:** `next.config.js` now applies HSTS, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive permissions policy. `proxy.ts` generates a per-request nonce and CSP; Next.js applies it to framework assets while the theme bootstrap and Umami use nonce-aware `next/script`. CSP permits only the Supabase storage origin, Umami, and Vercel analytics endpoints required by the app. Pages are dynamically rendered to support the request-bound nonce.

### 6. Stale Next.js patch line

> **Status: ✅ FIXED — 2026-09-19**

`next@16.2.6` was installed. The July 2026 security release resolved CVE-2026-64641…64646 in **16.2.11** (Server Action DoS, middleware/proxy bypass, SSRF in rewrites, unbounded payloads, internal-endpoint disclosure). Server Actions aren't used here, but the RSC/router surface is still in scope.

**Resolution:** upgraded and exactly pinned `next` and `eslint-config-next` to **16.3.3**, the subsequent August 2026 Active LTS security release that includes the July fixes and patches two additional critical vulnerabilities. Lint and typechecking pass. Production build compilation reached font processing but cannot finish in this offline environment because `next/font/google` cannot fetch Geist from Google Fonts.

---

## P1 — High

### 7. RLS policy exposes full rows and custom-file metadata publicly

> **Status: ✅ FIXED — 2026-09-20**

`database.sql:268-276` — `"Public read active files"` lets the **anon key** `SELECT` every active row, including `storage_path`, `user_id`, `anon_session_id`, `filename`, `mime_type`, and `size` — for signed-in users' custom files too. `lib/database.ts:11` queries through the public anon client.

**Fix:** narrow the public-read policy or (better) expose a **view** / `SECURITY DEFINER` function that returns only `slug, filename, file_type, size, created_at, expires_at`. Never expose `storage_path` / `user_id` to the anon role.

**Resolution:** the public-read policies were dropped and `SELECT` was revoked from `anon`/`authenticated` on `files` (`database.sql:398-400`). Public share metadata is now fetched server-side via the service-role admin client (`lib/server/database.ts:16-22`), selecting only the fields a preview needs.

### 8. Documented limits diverge from enforced limits

- UI + `data/pricing.ts`: free = **3 links/day**, **10 MB**, "custom URL / dashboard false".
- Server (`app/api/upload/route.ts:68-73`): free users capped at **5 active files**, and `countActiveFilesForUser` counts rows with `deleted_at IS NULL` regardless of expiry (`lib/file-admin.ts:57-69`) — a *permanent* cap, contradicting the "for today" copy in `lib/messages.ts:29`.
- `database.sql:224` caps anonymous sessions at **3** links.

**Fix:** pick one contract and enforce it consistently (daily window query + DB constraint + copy in `messages.ts` and `data/pricing.ts`).

### 9. Slug collisions break `getFileBySlug`

`lib/file-admin.ts:145-157` uses `.maybeSingle()` on `slug`. Slugs are only unique **per user** for custom uploads (`database.sql:155-157`). If two users reuse the same slug, `GET/DELETE /api/files/{slug}` throws PostgREST PGRST116 ("multiple rows"), surfacing as a 500. The route param is a slug but the handler treats it as a globally-unique id.

**Fix:** look up files by a composite key (`username + slug` for custom, or by file UUID), or make slugs globally unique. Also validate the param against `^[a-zA-Z0-9_-]+$` in `GET` (the `DELETE` already does).

### 10. Invalid `expiresAt` throws and leaks a 500

`app/api/upload/route.ts:80-82` — a non-date string like `expiresAt=foo` makes `new Date('foo')` an `Invalid Date`, then `.toISOString()` **throws**, and the catch returns `details: String(error)` probing internal error text.

**Fix:** validate/normalize the date before use; return `400` on invalid input; stop echoing `String(error)` to clients (`app/api/upload/route.ts:235`, `app/api/me/route.ts:44`).

### 11. Account deletion aborts if a file was already deleted

`app/api/me/account/route.ts:25-38` calls `listFilesForUser` (which does **not** filter `deleted_at`) and tries to delete storage + rows for *every* row. A previously soft-deleted or already-purged file makes storage removal fail → whole account deletion fails with 500.

**Fix:** filter active files (`deleted_at IS NULL` and not expired); delete the `users` row first, then handle storage asynchronously/best-effort.

### 12. `pg_notify` has no listener

`database.sql:332-355` — `delete_expired_files()` raises `NOTIFY snaphost_expired_file` for each expired file, but **nothing in the repo subscribes** to that channel. The actual cleanup runs only via the scheduled scripts. The notify is dead weight and misleading.

**Fix:** either subscribe (pg `LISTEN` worker) or drop the `pg_notify` calls to avoid implying reactive cleanup exists.

---

## P2 — Medium

### 13. Frame/file URL config mismatch risk
`lib/config.ts:8` falls back to `https://sh.rakeshpatel.me` for `BASE_URL`, while the canonical site is `snaphost.dev` (`data/emails.ts`). If `NEXT_PUBLIC_BASE_URL` is ever unset in an environment, generated share links point at the wrong domain. `.env.example` is **0 bytes**, so the required env contract is undocumented.

**Fix:** derive `BASE_URL` from `SITE_URL`; populate `.env.example` with all required keys and comments.

### 14. Anonymous slug entropy is weak for a "secret" URL
`lib/generateFileId.ts` produces 8 base36 chars (~41 bits) using `bytes[i] % 36`, which also introduces **modulo bias** (256 % 36 = 8 skewed outputs). For long-lived or sensitive anonymous links, 41 bits is brute-forcible at scale.

**Fix:** use `crypto.randomBytes` + base64url without bias, and bump length to ~12+ chars for anonymous links (custom slugs can stay short).

### 15. `#dropzone` anchor navigation vs FilePreview page
CTA / Pricing / Hero "Upload anonymously" now link to `#dropzone` (a scroll anchor on the home hero mock). On non-home pages this anchor does not exist, so the CTA does nothing. Confirm this is intentional; otherwise deep-link to `/upload` or keep an id on the real upload surface.

### 16. `getpro` renders a second footer
`/getpro` is **not** excluded in `SiteChrome` (`components/layout/SiteChrome.tsx`), so the global `Header`/`Footer` wrap it — yet the page also renders its own `<footer>` (`app/getpro/page.tsx:227-229`). Result: two footers on the Pro page.

**Fix:** remove the inline footer or exclude `/getpro` from `SiteChrome`.

### 17. Duplicate session/list clients and state inconsistency
Anon links are fetched two ways, with competing state: RTK Query hooks (`state/api.ts`) vs local `useState` + `services/anonymous-links.ts` dispatching RTK actions manually (`components/anon/AnonLinks.tsx`). This makes cache invalidation (`invalidatesTags`) unreliable and error handling inconsistent.

**Fix:** standardize on RTK Query hooks; keep the service layer as thin wrappers or drop it.

### 18. Hydration-mismatch risk in demo scene data
`components/motion/scenes/sample.ts:7-13` builds `demoAnonymousLink` at **module scope** with `new Date().toISOString()` / `Date.now() + 24h`. Server and client render slightly different timestamps → potential React hydration warnings in motion previews.

**Fix:** compute timestamps inside `useEffect`/client render, or use fixed demo dates.

### 19. Accessibility: non-semantic clickable `div`s
`components/ShareModal.tsx`: the QR toggle (`:200`) and every social-share tile (`:229`) are `div`s with `onClick` — not keyboard-focusable, no `role`, no Enter/Space handling. The same pattern appears for share tiles in `components/ShareLinkInput.tsx`/`UploadSuccessCard.tsx`-adjacent code.

**Fix:** use `<button>` (or add `role="button"` + `tabIndex` + key handlers), and add `prefers-reduced-motion` gating for non-essential animation (the shared share sheet uses framer-motion elsewhere).

### 20. Clipboard use without fallback
`navigator.clipboard.writeText` is used in several places with no fallback for insecure/non-HTTPS contexts (e.g. `ShareModal.tsx:40,191,278`), and copy promises are not awaited/caught.

**Fix:** wrap in a helper with `execCommand('copy')` fallback and catch errors.

### 21. Theme script + analytics loading
Theme bootstrapping via inline script is fine for FOUC prevention, but it hard-codes light/dark token logic. The Umami script is a raw `<script defer>` (`app/layout.tsx:102`) — prefer `next/script` (`afterInteractive`) and consider self-hosting; the website-id is public by design but should live in an env var.

**Fix:** move the script to `next/script`, keep the data-website-id in `NEXT_PUBLIC_*`.

### 22. Account/profile queries run per request with no caching
Every `getCurrentAppUser` (`lib/auth-user.ts:27`) does a DB round-trip + possible row insert on *every* API call and on `useGetMeQuery`. Fine now at small scale, but plan for caching (short TTL, in-memory cache keyed by `authUserId`).

### 23. OAuth/email error handling mixes product messages with raw errors
`app/components/auth/AuthForm.tsx:102` surfaces raw `err.message` (Supabase text) to users instead of the curated `AUTH_ERRORS` map. Same in `handleOAuth`. Inconsistent with the rest of the app's message strategy.

**Fix:** map known codes to friendly messages; log raw errors.

### 24. No global error boundary / 500 experience
No `app/error.tsx` or `app/global-error.tsx` — failures fall through to the default Next error page. `app/not-found.tsx` exists but file-view 404s render inline text (`FilePreview.tsx:25-33`).

**Fix:** add `error.tsx` (+ `global-error.tsx`), and a proper not-found page for file routes.

---

## P3 — Low / hygiene

### 25. Dead code and leftovers
- `components/motion/scenes/CustomLinkScene.tsx:38` — removed `activeKey` variable already gone (fine), but `components/landing/FeatureShowcase.tsx:50-52,54-55` has a commented-out block and an eyebrow rendered via `<Button>`.
- `app/signup/page.tsx` — legacy redirect shim for `/signup`; consider a `redirect()` in `next.config.js` instead.
- `scripts/purge-expired-anon-sessions.mjs:24-27` — nested select `(files(id, storage_path))` is a PostgREST convention that is easy to get wrong; prefer an explicit join/filter.

### 26. Formatting / lint gaps
Missing trailing newline in: `app/getpro/page.tsx`, `components/shared/SectionHeading.tsx`, `components/landing/FAQ.tsx`, `components/landing/Pricing.tsx`, `lib/generateFileId.ts`, `data/faq.ts`, `data/footer.ts`, `data/pricing.ts`, `components/motion/Reveal.tsx`, and others. No `prettier`/`format` script in `package.json`.

**Fix:** add Prettier + `npm run format`, and run ESLint + `tsc --noEmit` in CI.

### 27. Redundant CSS
`app/globals.css:169-185` defines the `::view-transition` rules twice (once inside `@supports`, once outside). Consolidate.

### 28. Icon/favicon payload
`app/icon0.svg` is ~164 KB — disproportionately large for a favicon-metadata asset. Consider a compressed PNG (or `sprite`/text) icon.

### 29. Dependency duplication
Both `lucide-react` and `react-icons` are present. Consolidating on one icon set reduces bundle surface. Also consider the lighter `motion` package (`motion/react`) or `LazyMotion` to trim the framer-motion bundle now that reveal animations are used broadly on the landing page.

### 30. Missing metadata for shared file pages
`app/[username]/[slug]/page.tsx` and `app/anon/[slug]/page.tsx` are client-rendered previews with no `generateMetadata` — shared links get generic OG/title. Add dynamic `metadata` for nicer link previews (title = filename, og:image for images).

---

## Best practices (with sources)

### Next.js 16 — security checklist (from Next.js / Arcjet 2026 guidance)
- **Patch and lock dependencies** — stay on the active-LTS line (16.2.x, currently 16.2.11+). [Next.js security releases](https://nextjs.org/blog/july-2026-security-release)
- **Validate every untrusted value server-side** — MIME, size, slug, dates, usernames. Do not mirror client checks. (Findings 3, 9, 10.)
- **Keep secrets off the client** — `NEXT_PUBLIC_` only for public values; `server-only` guard on anything touching Supabase admin. (Finding 2.)
- **Set security headers on every response** — CSP, HSTS, nosniff, frame-options, referrer-policy via `next.config.js headers()`. (Finding 5.)
- **Centralize auth** — every route handler must re-verify the user (already the pattern here via `getAuthUserFromRequest`); never rely on middleware/proxy alone (Next renamed `middleware` → `proxy` and patched a bypass CVE). Keep authz in-handler. (Finding 6.)
- **CI = lint + typecheck + build** — run `eslint`, `tsc --noEmit`, and `next build` on every PR.

### Supabase — RLS & storage (from Supabase docs)
- Enable RLS on every table and **minimize grants** — `anon` should get the least privilege. Service role bypasses RLS and must live server-side only.
- Use `auth.uid()` in policies (not JWT `user_metadata`, which clients can control); write per-op policies rather than `FOR ALL`; always include `WITH CHECK` on INSERT/UPDATE.
- **Test policies** with `supabase test db` / `SET LOCAL ROLE anon/authenticated` so the editor doesn't lie to you.
- Avoid exposing `storage_path`, `user_id`, `anon_session_id` to public roles — use views or definer functions. (Finding 7.)
- Store only hashed session tokens (already done — good), use `ON DELETE CASCADE` for anon→file cleanup (done), and never trust the client for content types. (Finding 3.)

### Performance & UX
- Respect `prefers-reduced-motion` (already via `MotionConfig reducedMotion="user"` + the CSS `@media` block — keep it; WCAG 2.3.1/2.2.2).
- Lazy-load below-fold content (`loading="lazy"` on images, dynamic import of QR/share modals) — `ShareModal`, `react-qr-code`, and `react-icons` are good candidates for `next/dynamic`.
- Keep route handlers lean and cache `keepUnusedDataFor` (already tuned in `state/api.ts`) — 60/300s values are reasonable.

### Testing (missing today)
There is no test runner in `package.json`. Recommended baseline:

- Unit: `vitest` for `lib/*` (validation, url building, filename sanitization, availability logic).
- API/route: `@testing-library` + route-handler tests, or Playwright for upload → share → delete E2E.
- Policy tests: `supabase test db` to lock RLS behavior.

### Suggested commit sequence
Since the repo uses conventional commits, a good order to tackle the above without breakage:

1. `fix(security): remove unauthenticated delete handler`
2. `fix(security): add server-only guards and secret-safe headers`
3. `fix(security): validate file magic bytes and derive extension from MIME`
4. `fix(deps): bump next to 16.2.11`
5. `fix(db): restrict public file view and add rate-limit table`
6. `fix(limits): align advertised and enforced tier limits`
7. `refactor(getpro): drop duplicate footer`
8. `test: add vitest + supabase policy tests`

---

*Sources: Next.js security release notes (July 2026) and CSP guide; Arcjet Next.js security checklist (2026); Supabase RLS docs & policy tests guide; Motion for React accessibility docs; Tailwind v4 upgrade guide.*
