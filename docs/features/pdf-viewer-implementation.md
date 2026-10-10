# PDF Viewer Implementation Plan

## Overview

Replace the current iframe-based `PdfPreview` with a fully branded, custom PDF viewer built on **@fileforge/pdfreader** (headless compound components powered by PDF.js). All PDFs in the app will use this single viewer.

## Brand Identity (from `app/globals.css` + existing components)

| Token      | Light                                                                   | Dark                    |
| ---------- | ----------------------------------------------------------------------- | ----------------------- |
| Accent     | `#059669` (emerald-600)                                                 | `#10b981` (emerald-500) |
| Background | `#ffffff`                                                               | `#09090b`               |
| Card       | `#ffffff`                                                               | `#09090b`               |
| Muted      | `#f8fafc`                                                               | `#18181b`               |
| Border     | `#e2e8f0`                                                               | `#27272a`               |
| Font       | Geist Sans                                                              | Geist Sans              |
| Radius     | rounded-full (buttons), rounded-4xl (cards)                             | same                    |
| Style      | Glassmorphism (backdrop-blur, bg-card/80), subtle shadows, emerald glow | same                    |

## Dependencies

```bash
npm install @fileforge/pdfreader pdfjs-dist
```

## Files to Create

### 1. `components/pdf/PdfViewer.tsx` — Main viewer component

```
Props: { url: string; filename: string; downloadUrl: string }
```

- Sticky header (h-14, border-b, backdrop-blur) matching `ImagePreview` header pattern
- Logo + filename + zoom controls + download button
- Uses `@fileforge/pdfreader` compound components:
  - `Root` — wraps viewer, takes `fileURL`
  - `Viewport` — scrollable page container
  - `Pages` — renders all pages
  - `Page` — individual page with `CanvasLayer` + `TextLayer`
- Loading spinner (Loader2, animate-spin, text-accent) while PDF loads
- Error state with icon + message
- All styling via Tailwind using design tokens (bg-background, text-foreground, text-muted-foreground, border-border, bg-accent, etc.)

### 2. `components/pdf/PdfToolbar.tsx` — Toolbar controls

- Zoom out / zoom % / zoom in (rounded-full button group, same pattern as ImagePreview)
- Fit-to-width button
- Page navigation (prev/next + current/total)
- Search toggle
- Download button (emerald accent, rounded-full)
- All buttons: `size-7`, `rounded-full`, `text-muted-foreground`, `hover:bg-background`, `hover:text-foreground`, `focus-visible:ring-3 focus-visible:ring-ring/50`

### 3. `components/pdf/PdfSearch.tsx` — Search bar

- Input with search icon
- Match count display
- Prev/next match navigation
- Styled: `rounded-full border border-input bg-transparent`, focus ring

### 4. `components/pdf/PdfThumbnails.tsx` — Thumbnail sidebar

- Toggleable sidebar (fixed width ~200px)
- Page thumbnails with active highlight
- `border-r border-border/60`, `bg-muted/35`

### 5. `components/pdf/PdfOutline.tsx` — Document outline/bookmarks

- Collapsible outline panel
- Click to navigate to page

### 6. `components/pdf/pdf-viewer.css` — PDF.js text layer overrides

- `.textLayer` styling for search highlights
- Selection color: `bg-accent/20`
- Text layer pointer-events for text selection

### 7. `components/pdf/index.ts` — Barrel export

```ts
export { default as PdfViewer } from './PdfViewer'
```

## Files to Modify

### `components/PdfPreview.tsx` — Replace iframe with new viewer

```tsx
// BEFORE: iframe-based
// AFTER: <PdfViewer url={url} filename={filename} downloadUrl={downloadUrl} />
```

### `components/FilePreview.tsx` — Pass downloadUrl to PdfViewer

Already passes `metadata.downloadUrl` — just update the `PdfPreview` usage to include it.

### `types/components.ts` — Update `PdfPreviewProps`

```ts
export type PdfPreviewProps = {
  url: string
  filename: string
  downloadUrl: string
}
```

### `app/globals.css` — Add PDF viewer CSS custom properties

```css
:root {
  --pdf-viewer-bg: var(--background);
  --pdf-viewer-toolbar-bg: var(--card);
  --pdf-viewer-border: var(--border);
  --pdf-viewer-text: var(--foreground);
  --pdf-viewer-text-muted: var(--muted-foreground);
  --pdf-viewer-accent: var(--accent);
  --pdf-viewer-highlight: rgba(5, 150, 105, 0.25);
}
```

## Feature Checklist

- [x] Page rendering (canvas + text layer)
- [x] Zoom in/out/reset/fit-width
- [x] Page navigation (prev/next, go-to-page)
- [x] Search with highlight + match navigation
- [x] Thumbnail sidebar
- [x] Document outline/bookmarks
- [x] Download button
- [x] Loading state
- [x] Error state
- [x] Keyboard shortcuts (arrows for pages, +/- for zoom, / for search)
- [x] Responsive (mobile: bottom toolbar, no sidebar)
- [x] Dark mode support (via design tokens)
- [x] Text selection
- [x] Print support (via PDF.js)

## Implementation Order

1. Install dependencies
2. Create `PdfViewer.tsx` with basic rendering (Root + Viewport + Pages + Page)
3. Create `PdfToolbar.tsx` with zoom + page nav
4. Wire into `PdfPreview.tsx` (replace iframe)
5. Add search (`PdfSearch.tsx`)
6. Add thumbnails (`PdfThumbnails.tsx`)
7. Add outline (`PdfOutline.tsx`)
8. Add keyboard shortcuts
9. Add CSS overrides for text layer
10. Test all PDF routes (`/f/:fileId`, `/anon/:slug`, `/:username/:slug`)

## Usage (all PDF routes)

```tsx
// components/PdfPreview.tsx
import PdfViewer from './pdf/PdfViewer'

export default function PdfPreview({ url, filename, downloadUrl }: PdfPreviewProps) {
  return <PdfViewer url={url} filename={filename} downloadUrl={downloadUrl} />
}
```

## Design Consistency Rules

- All buttons: `rounded-full`, `size-7` (icon) or `h-8 px-3` (with text)
- Active/accent state: `bg-accent/10 text-accent`
- Hover: `hover:bg-background hover:text-foreground`
- Focus: `focus-visible:ring-3 focus-visible:ring-ring/50`
- Borders: `border-border/60` or `border-border/70`
- Backgrounds: `bg-background`, `bg-muted/35`, `bg-card/80 backdrop-blur-xl`
- Shadows: `shadow-[0_24px_70px_-44px_rgba(15,23,42,0.28)]` (cards), `shadow-[0_12px_36px_-24px_rgba(15,23,42,0.45)]` (pages)
- Typography: `text-sm font-medium`, `text-xs text-muted-foreground`
- Icons: `lucide-react`, `size-3.5` or `size-4`
- Spacing: `gap-1.5`, `gap-2`, `p-1`, `px-2.5`
