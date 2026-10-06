# SEO Implementation

What has been built into SnapHost for search engines and social crawlers, where each piece lives,
and how to maintain it.

Related: [seo-recommendations.md](./seo-recommendations.md) covers what is _not_ implemented yet.

---

## 1. Architecture

Two files do most of the work, so nothing is copy-pasted between routes.

| File                                                            | Role                                                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [lib/seo.ts](../lib/seo.ts)                                     | Single source of truth: site constants, keyword sets, `createPageMetadata()`, `NO_INDEX`, and every schema.org builder   |
| [components/shared/JsonLd.tsx](../components/shared/JsonLd.tsx) | Renders a `<script type="application/ld+json">` block; escapes `<` so user-facing strings cannot break out of the script |

Applying files:

| File                                                                                                           | Applies                                                                      |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [app/layout.tsx](../app/layout.tsx)                                                                            | Site-wide metadata, `metadataBase`, and the `Organization` + `WebSite` graph |
| [app/opengraph-image.tsx](../app/opengraph-image.tsx)                                                          | Generated 1200×630 OG image for any route that has no custom one             |
| [app/sitemap.ts](../app/sitemap.ts)                                                                            | XML sitemap                                                                  |
| [app/robots.ts](../app/robots.ts)                                                                              | Crawl rules + sitemap/host declaration                                       |
| [app/(auth)/layout.tsx](<../app/(auth)/layout.tsx>), [app/(product)/layout.tsx](<../app/(product)/layout.tsx>) | `noindex` for auth and dashboard routes (applies to client pages too)        |
| [lib/file-page-metadata.ts](../lib/file-page-metadata.ts)                                                      | Per-file metadata for the three share-link routes                            |
| [next.config.mjs](../next.config.mjs)                                                                          | `X-Robots-Tag` response headers                                              |
| [public/llms.txt](../public/llms.txt), [public/llms-full.txt](../public/llms-full.txt)                         | AI crawler entry points                                                      |
| [app/manifest.json](../app/manifest.json)                                                                      | PWA manifest                                                                 |

### Why route-group layouts hold `noindex`

`(auth)/reset-password` and `(auth)/forgot-password` are `'use client'` pages, and Next.js forbids
exporting `metadata` from a client component. Putting `robots` on the `(auth)` and `(product)`
layouts gives every page in the group a `noindex` without converting them to server components. The
server pages in those groups (sign-in, sign-up, profile, check-email, auth/sync) still export their
own `metadata` for titles and descriptions, which overrides the layout title while inheriting
`robots` unless they set their own.

---

## 2. `lib/seo.ts` API

### Constants

| Export                                             | Value / purpose                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| `SITE_NAME`                                        | `"SnapHost"`                                                                    |
| `SITE_LOCALE` / `SITE_LANG`                        | `en_US` (OG) / `en-US` (schema `inLanguage`)                                    |
| `DEFAULT_TITLE`                                    | `SnapHost — Instant File Sharing for Images & PDFs`                             |
| `DEFAULT_DESCRIPTION`                              | Site-wide meta description                                                      |
| `DEFAULT_KEYWORDS`                                 | 14 general terms (file hosting, image upload, PDF sharing, anonymous upload, …) |
| `PRO_FEATURE_KEYWORDS`                             | 9 terms for `/getpro`                                                           |
| `LEGAL_PAGE_KEYWORDS`                              | Terms/privacy terms for `/company/**`                                           |
| `OG_IMAGE_PATH` / `OG_IMAGE_SIZE` / `OG_IMAGE_ALT` | `/opengraph-image`, `1200×630`, alt text                                        |
| `MAX_FILE_SIZE_LABEL` / `SUPPORTED_FORMATS`        | `10 MB`, `PNG, JPG, WEBP, PDF`                                                  |
| `NO_INDEX`                                         | `robots` object: `noindex, nofollow, nocache` + `googleBot: noimageindex`       |
| `Crumb`                                            | `{ name, path }` breadcrumb tuple                                               |

### Functions

| Signature                     | Returns                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `absoluteUrl(path?)`          | Absolute URL against `SITE_URL`; passes through `http(s)://` values unchanged                       |
| `createPageMetadata(opts)`    | A complete `Metadata` object — title, description, keywords, canonical, robots, Open Graph, Twitter |
| `graph(...nodes)`             | `{ '@context', '@graph: [...] }`, stripping each node's own `@context` so it is not duplicated      |
| `organizationSchema()`        | `Organization` with logo, slogan, and three `ContactPoint`s (support/billing/security)              |
| `websiteSchema()`             | `WebSite` linked to the organization by `@id`                                                       |
| `softwareApplicationSchema()` | `SoftwareApplication` with feature list + free-tier `Offer` at `0 USD`                              |
| `proPlanSchema()`             | `Service` describing the Pro tier                                                                   |
| `faqSchema(items)`            | `FAQPage` mapped from `FAQItem[]`                                                                   |
| `breadcrumbSchema(trail)`     | `BreadcrumbList`                                                                                    |
| `webPageSchema(opts)`         | `WebPage` with `isPartOf`/`about` cross-references                                                  |

`createPageMetadata` signature:

```ts
createPageMetadata({
  title,             // required
  description,       // required
  path,              // required — becomes og:url and alternates.canonical
  keywords?,         // array; omitted from output when empty
  type?,             // 'website' (default) | 'article'
  noIndex?,          // swaps in NO_INDEX
  ogImage?,          // defaults to the generated OG image
  publishedTime?,    // og:published_time
})
```

It emits the indexed `robots` directive with Googlebot `max-image-preview: large`,
`max-snippet: -1`, `max-video-preview: -1` so images and snippets are not truncated.

---

## 3. Site-wide metadata (root layout)

`app/layout.tsx` exports:

- `metadataBase: new URL(SITE_URL)` — makes every relative canonical, OG URL, and image absolute.
- `title.default` + `title.template` of `%s | SnapHost`.
- `description`, `keywords`, `applicationName`, `generator`, `category`, `authors`, `creator`,
  `publisher`, `referrer`.
- `formatDetection: { telephone: false, address: false, email: false }`.
- `manifest`, `icons`, `appleWebApp` (which generates `application-name` and
  `apple-mobile-web-app-title` automatically — do not add these by hand).
- `robots` with `index, follow` plus full Googlebot directives.
- `openGraph` (type, url, siteName, locale, title, description, image with dimensions and alt).
- `twitter` (`summary_large_image`, title, description, image with width/height/alt).

Because `app/opengraph-image.tsx` exists, Next.js also injects `og:image` (and `twitter:image`)
for **every** route without its own OG image, even if a page forgets to set one.

---

## 4. Per-route metadata

| Route                                                               | Title                                                          | Canonical                   | Robots                                   | Schema                                                                             |
| ------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| `/`                                                                 | Instant File Sharing for Images & PDFs                         | `/`                         | index, follow                            | `WebPage`, `BreadcrumbList`, `SoftwareApplication`, `HowTo`, `ItemList`, `FAQPage` |
| `/getpro`                                                           | Get SnapHost Pro — Unlimited Links, Custom URLs, 50 MB Uploads | `/getpro`                   | index, follow                            | `WebPage`, `BreadcrumbList`, `Service`, `FAQPage`                                  |
| `/company`                                                          | Legal, Privacy & Terms                                         | `/company`                  | index, follow                            | `WebPage`, `BreadcrumbList`                                                        |
| `/company/privacy-policy`                                           | Privacy Policy — What Data SnapHost Collects                   | `/company/privacy-policy`   | index, follow                            | `WebPage`, `BreadcrumbList`                                                        |
| `/company/terms-of-service`                                         | Terms of Service — Using SnapHost                              | `/company/terms-of-service` | index, follow                            | `WebPage`, `BreadcrumbList`                                                        |
| `/f/[fileId]`                                                       | `<filename> \| Snaphost — Instant file sharing`                | `/f/[fileId]`               | index while live; `noindex` when missing | —                                                                                  |
| `/anon/[slug]`                                                      | same, or "This snap link has expired"                          | `/anon/[slug]`              | `noindex` when expired                   | —                                                                                  |
| `/[username]/[slug]`                                                | `<filename> \| …`                                              | `/<username>/<slug>`        | index while live                         | —                                                                                  |
| `/sign-in`                                                          | Sign in                                                        | none                        | `noindex`                                | —                                                                                  |
| `/sign-up`                                                          | Create account                                                 | none                        | `noindex`                                | —                                                                                  |
| `/forgot-password`, `/reset-password`, `/check-email`, `/auth/sync` | route-specific                                                 | none                        | `noindex`                                | —                                                                                  |
| `/profile`                                                          | Dashboard                                                      | none                        | `noindex`                                | —                                                                                  |
| `/anon/links`                                                       | Anonymous links                                                | none                        | `noindex`                                | —                                                                                  |

Notes:

- Indexable marketing pages build metadata through `createPageMetadata`, so canonical, OG, and
  Twitter always stay in sync with title and description.
- Auth/dashboard routes have **no canonical** on purpose. A canonical pointing at the root would be
  incorrect for a `noindex` page.
- Expired or missing files get `noindex` plus a social card that still explains the state.

### File share pages

[lib/file-page-metadata.ts](../lib/file-page-metadata.ts) builds metadata from the live DB row:

- Title from the filename with the extension stripped, prefixed with the brand title.
- Description includes the detected type label and a human-readable size
  (`View this pdf (report.pdf, 2.4 MB) shared on SnapHost.`).
- Canonical comes from each route (`/f/[fileId]`, `/anon/[slug]`, `/<username>/<slug>`) via the
  `canonicalPath` option.
- `og:image` points at the stored Supabase file when it is an image, otherwise at the generated OG
  image; `og:type` is `article`.
- `noimageindex` for Googlebot when the file has no previewable image, so Google does not request
  images it cannot render.

---

## 5. Structured data

Every page emits one JSON-LD block. Pages that have their own nodes use `graph()` to wrap them in a
single `@graph` so nodes can cross-reference each other by `@id`
(`WebPage.isPartOf → WebSite`, `WebSite.publisher → Organization`, `SoftwareApplication.publisher →
Organization`). The root layout emits the `Organization` + `WebSite` pair on every page.

| Type                  | Where                         | Source of truth                 |
| --------------------- | ----------------------------- | ------------------------------- |
| `Organization`        | every page (root layout)      | `organizationSchema()`          |
| `WebSite`             | every page (root layout)      | `websiteSchema()`               |
| `WebPage`             | `/`, `/getpro`, `/company/**` | `webPageSchema()`               |
| `BreadcrumbList`      | `/`, `/getpro`, `/company/**` | `breadcrumbSchema()`            |
| `SoftwareApplication` | `/`                           | `softwareApplicationSchema()`   |
| `HowTo`               | `/` — 4-step upload flow      | `app/(marketing)/page.tsx`      |
| `ItemList`            | `/` — the 5 product features  | derived from `data/features.ts` |
| `FAQPage`             | `/`, `/getpro`                | derived from `data/faq.ts`      |
| `Service`             | `/getpro` — Pro tier          | `proPlanSchema()`               |

The two `FAQPage` nodes are built directly from `data/faq.ts` (`faqs` and `proFaqs`), so the
structured data cannot drift from the FAQ sections rendered on the page. Same for the `ItemList`,
which maps over `data/features.ts`.

---

## 6. Indexing controls

Three independent layers:

1. **Meta robots** — `<meta name="robots">` emitted by metadata (see the table above).
2. **`X-Robots-Tag` response headers** in `next.config.mjs` for `noindex` routes, which also covers
   non-HTML responses:
   - `/api/:path*`, `/auth/:path*`, `/profile`, `/anon/:path*`
   - `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/check-email`
3. **`app/robots.ts`** — crawler-specific rules:

   - Default group: `Allow: /`, `Disallow` for `/api/`, `/auth/`, `/profile`, `/anon/links`,
     `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/check-email`, `/monitoring`
   - AI group (`GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`,
     `Google-Extended`): allowed on public pages, blocked from API and account routes
   - `Sitemap:` and `Host:` both pointing at `https://snaphost.dev`

`/anon/links` is blocked but `/anon/[slug]` is not: the session-scoped management page must not be
indexed, while individual share links are public content.

---

## 7. Sitemap

[app/sitemap.ts](../app/sitemap.ts) returns five entries with `lastModified`, `changeFrequency`,
and `priority`, and exports `revalidate = 86400` so it refreshes daily:

| URL                         | changeFrequency | priority |
| --------------------------- | --------------- | -------- |
| `/`                         | weekly          | 1        |
| `/getpro`                   | monthly         | 0.8      |
| `/company`                  | monthly         | 0.5      |
| `/company/privacy-policy`   | yearly          | 0.3      |
| `/company/terms-of-service` | yearly          | 0.3      |

Share-link routes are excluded: they are user-generated, temporary, and many already `noindex`.

---

## 8. Social sharing image

[app/opengraph-image.tsx](../app/opengraph-image.tsx) renders the card with `ImageResponse`:

- 1200×630 PNG (the size Facebook, LinkedIn, Slack, and Discord render without cropping badly).
- Dark brand background with a green accent glow, `S` badge, wordmark, headline, and three proof
  points (`Images up to 10 MB`, `PDFs up to 10 MB`, `No signup required`).
- Alt text and dimensions exported from `lib/seo.ts`, so `og:image:width`, `og:image:height`, and
  `og:image:alt` are always emitted alongside the URL.

Verified: returns `200` with `content-type: image/png`, a valid PNG signature, and `1200 × 630`
dimensions.

---

## 9. AI crawler files

| File                                            | Size    | Contents                                                                                                                   |
| ----------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| [public/llms.txt](../public/llms.txt)           | ~2.4 KB | What SnapHost does, the plans table, page index, technical notes, indexing policy                                          |
| [public/llms-full.txt](../public/llms-full.txt) | ~5.6 KB | Full prose: features, plan details, both FAQ sets, privacy/terms summaries, note on link URL patterns and `noindex` policy |

`llms.txt` links to `llms-full.txt` as an optional full-text version. Both are served as
`text/plain` from `public/` with no build step.

---

## 10. PWA manifest

[app/manifest.json](../app/manifest.json) now includes `description`, `id`, `start_url`, `scope`,
`lang`, `dir`, `categories`, `display_override`, `orientation`, and three `shortcuts`
(Upload, Anonymous links, Get Pro), in addition to the existing icons and theme colors. Served as
`application/manifest+json`.

---

## 11. Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

Then spot-check:

```bash
curl -s localhost:3000/robots.txt
curl -s localhost:3000/sitemap.xml
curl -s localhost:3000/opengraph-image -o og.png && file og.png
curl -s localhost:3000/llms.txt
curl -sD - -o /dev/null localhost:3000/sign-in | grep -i x-robots-tag
```

Observed results from the last implementation pass (production build):

| Check                                                                          | Result                                                                                                |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `npm run lint`, `npx tsc --noEmit`, `npm run build`                            | all exit 0                                                                                            |
| `/`, `/getpro`, `/company/**`                                                  | unique title, description, canonical; `index, follow`; 2 JSON-LD blocks (layout graph + page graph)   |
| `/sign-in`, `/sign-up`, `/profile`                                             | `noindex, nofollow, nocache`; no canonical; `X-Robots-Tag: noindex, nofollow`                         |
| `/f/nope`                                                                      | `Link not found \| Snaphost — Instant file sharing`, `noindex`, canonical `/f/nope`, default OG image |
| `/opengraph-image`                                                             | `200`, `image/png`, 86 KB, 1200×630                                                                   |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt`, `/manifest.json` | all `200`                                                                                             |
| Duplicate `<meta name>` on home                                                | none (only the intentional light/dark `theme-color` pair)                                             |

For richer validation, paste page URLs into the Rich Results Test and the Social Media Sharing
Debugger after deploying.

---

## 12. Adding a new page

1. Build metadata with `createPageMetadata({ title, description, path, keywords })` — do not write
   the Open Graph or Twitter objects by hand.
2. Render a `JsonLd` block. If the page has a breadcrumb, pass the same trail to both
   `webPageSchema({ breadcrumbTrail })` and `breadcrumbSchema()`.
3. Add the URL to `ENTRIES` in [app/sitemap.ts](../app/sitemap.ts).
4. If it should not be indexed: `robots: NO_INDEX` in metadata, plus an `X-Robots-Tag` entry in
   `next.config.mjs` if it is not an HTML route.
5. Skip `app/opengraph-image.tsx` unless the page needs its own artwork; the site default applies
   automatically.

---

## 13. Issues found and fixed during implementation

Recorded because they are the kind of thing that silently breaks SEO:

| Issue                                        | Symptom                                                                    | Fix                                                                     |
| -------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Root layout referenced `/og-image.png`       | File never existed → every social preview had a broken image               | Replaced with the generated `app/opengraph-image.tsx`                   |
| `'use client'` pages exported `metadata`     | **Production build failed** (`reset-password`, `forgot-password`)          | Moved `noindex` to `(auth)` and `(product)` layouts                     |
| Twitter images passed as `"url alt"` strings | Alt text URL-encoded into the image URL: `/opengraph-image%20SnapHost%20…` | Switched to object form `{ url, alt, width, height }`                   |
| Manual `<meta>` duplicates in `<head>`       | `author`, `keywords`, `application-name` rendered twice                    | Dropped the manual tags; Next derives them from metadata                |
| Title template applied twice                 | `… \| SnapHost \| SnapHost` on `/` and `/company`                          | Shortened those page titles so the template adds the brand once         |
| Auth pages inherited root canonical          | `noindex` pages declared `canonical=/`                                     | Removed the root-level `alternates`; only indexable pages set canonical |
| Nested `@context` inside `@graph`            | Redundant context per node                                                 | `graph()` now strips `@context` from each child node                    |
