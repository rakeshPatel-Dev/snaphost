# Features Section Redesign — Animated Showcase

Replaces the bento/mock-heavy `BentoGrid` on the homepage with an alternating
showcase: a **living demo** built from the real product components, choreographed
by framer-motion, on one side and its explanation on the other.

## Confirmed decisions

- Playback: scenes start when scrolled into view (`whileInView`), then loop.
- No sound. No gating — content is free-tier.
- The entire bento is ditched, including the `FileDeliverySlider` original-file
  delivery card. If that capability still needs surfacing, fold its copy into
  an explanation bullet.
- Every button inside a scene is visually intact but inert (`pointer-events-none`,
  `tabIndex={-1}`). Only a small `ReplayPill` actually works (restarts the loop).
- Accessibility: scenes are `aria-hidden`; the visible headings/copy next to them
  are the real content. `prefers-reduced-motion` renders the final frame statically.

## Content mapping (Features.txt → rows)

| #   | Feature                   | Scene                                                                           | Real components reused                                                       |
| --- | ------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Instant sharing (primary) | Dropzone → file lands → success card scales in → copy flashes → link row pulses | `UploadDropzone`, `UploadSuccessCard` (`FileDetailsCard` + `ShareLinkInput`) |
| 2   | No account required       | Tabs auto-switch Upload → Created links; anon card staggers in                  | `UploadMockTabs`, `AnonymousLinkCard`                                        |
| 3   | Auto-expiring links       | Live countdown ticks in the anon card footer                                    | `AnonymousLinkCard` + existing `getTimeRemaining`                            |
| 4   | Custom links              | Slug morphs `8xK3pQ → rakesh/resume`; field highlights                          | `LinkCard` input/slug patterns, `Select` chip styles                         |
| 5   | Flexible expiration       | Preset chips cycle 1d → 7d → 30d → Never; countdown updates                     | `LinkCard` presets + countdown copy                                          |
| 6   | File management           | Rows stagger in, one flashes "Copied", one exits, count updates                 | `LinkCard` file-row layout                                                   |

## New `components/motion/` folder

```
components/motion/
├── index.ts                 # sceneId → component map (barrel)
├── MotionPreview.tsx        # shared card chrome ("window"),
│                            # pointer-events-none, aria-hidden, ReplayPill
├── useSequence.ts           # choreography engine
└── scenes/
    ├── InstantShareScene.tsx
    ├── NoAccountScene.tsx
    ├── AutoExpireScene.tsx
    ├── CustomLinkScene.tsx
    ├── FlexibleExpiryScene.tsx
    └── FileManagerScene.tsx
```

### `useSequence.ts` — choreography engine

- `useSequence(steps, duration)` returns the current step index; loops every ~8s.
- Deterministic timestamps, no wall-clock drift.
- `prefers-reduced-motion` → static final frame, no loop.

### `MotionPreview.tsx` — scene chrome

- `rounded-4xl border bg-card shadow`, consistent with the landing look.
- Hosts the scene, the ReplayPill, and the inert-frame wrapper.

### Scenes (each ~60–100 lines)

1. **InstantShareScene** — dropzone → uploading pulse → `UploadSuccessCard` fades/scales in → copy button shows "Copied".
2. **NoAccountScene** — `UploadMockTabs` auto-toggles to "Created links" → `AnonymousLinkCard` staggers in.
3. **AutoExpireScene** — `AnonymousLinkCard` with ticking `getTimeRemaining` countdown.
4. **CustomLinkScene** — slug string types out char-by-char; URL row highlights.
5. **FlexibleExpiryScene** — preset chips cycle; countdown chip updates per preset.
6. **FileManagerScene** — file rows `staggerChildren` in, one flashes copied, one exits via `AnimatePresence`, count `2 / ∞` updates.

## New section — `components/landing/FeatureShowcase.tsx`

- Data-driven from `data/features.ts`: eyebrow number, title, description, bullets, `requiresAuth` pill, scene id.
- Rows: `md:grid-cols-2`, scene vs text **alternating** via `md:order`.
- Text side fades up on scroll (`whileInView`, once).
- Keeps `Container`, `SectionHeading`, `id="features"`, `scroll-mt-16`, `py-20 sm:py-24` so it stays visually contiguous with Hero/Pricing.

## Wiring / cleanup

- `features/landing/index.ts`: swap `BentoGrid` export → `FeatureShowcase`; `app/page.tsx` unchanged.
- Delete `components/landing/BentoGrid.tsx`.
- Delete `components/landing/FileDeliverySlider.tsx` (now orphaned).
- `components/sections/upload-mock/` stays — Hero's `UploadMock` remains fully interactive.

## Build steps

1. `useSequence.ts` + `MotionPreview.tsx`.
2. The six scenes, reusing the real components.
3. `data/features.ts` + `FeatureShowcase.tsx`.
4. Swap export; delete `BentoGrid` + `FileDeliverySlider`.
5. Verify: `tsc`, `lint`, manual audit of `/` (plays on scroll, loops cleanly, stacks on mobile, reduced-motion shows final frame).

## Out of scope (not in this change)

- Real screen-recording GIFs (previous approach, dropped).
- Any premium gating on the section.
- Changing the Hero `UploadMock` interactivity.
