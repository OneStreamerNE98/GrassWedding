# Reference teardown — Getty *Tracing Art*

**URL:** https://www.getty.edu/tracingart/
**Role:** the framework reference. Jason picked it; our build mimics its structure,
navigation, and motion closely (PLAN.md v5 §2 maps its patterns to our content).
This document records how the reference actually works — from its live HTML, CSS,
and JS bundle — so every review can bump our build against specifics instead of
memory. Class names quoted below are the site's own.

## Stack (verified from source)

- **Nuxt (Vue) SSR** — one JS bundle (`_nuxt/*.js`, ~432 KB) + one CSS file. We copy
  the *rendered result*, not the tooling: our build stays vanilla ES modules.
- **Lenis** smooth scroll wrapping a `scrollContent` div; `hideScrollBar` /
  `disableScroll` utility classes.
- **GSAP + ScrollTrigger** — pinning + a small number of scrubbed timelines,
  `matchMedia` for responsive gating; lerped values throughout (`lerp`, `velocity`
  appear in the bundle).
- **Images only** — no video anywhere; one small canvas (`gl`) used sparingly.
- `dvh`/`svh` viewport units; `landscapeWarning` overlay for phones in landscape.

## Navigation system (copy wholesale)

| Their piece | Behavior | Our implementation |
|---|---|---|
| `navDots` (`__dot`, `__dotBg`, `__dotProgress`) | Fixed vertical dot rail, one dot per chapter; the current dot is a ring that fills with that chapter's scroll progress; dots are jump buttons | `js/core/nav.js` dot rail, SVG ring `stroke-dashoffset` |
| `navChapter` (`__title`, `__progressBar`) | Fixed readout of the current chapter title + thin progress bar; crossfades on chapter change | `.chrome--readout` |
| `navPanel--chapters` / `navPanel--about` (`btnAbout`) | Slide-in panels: chapter directory + about/credits; close button, backdrop | `.navPanel` pair with focus trap + Esc |
| `sectionAnchors` (`section-N-anchor`) | Invisible anchors for jumps/deep links | chapter `id="ch-*"` + hash deep links |
| `pageLoader` → `introTitle` (`__logo`, `__text`) | Loader resolves into an oversized intro title | `.pageLoader` → intro chapter |

## Scene vocabulary (the patterns, with their class names)

| Pattern | Their classes | What it does | Ours |
|---|---|---|---|
| Full-bleed image room | `bgImage` (`__inner`, `__img`), `blurredBg`, `fillFixed` | Artwork fills the viewport; inner element gently scales/parallaxes on scrub; text sits over a gradient | `bgRoom` scene |
| Scrolly steps | `section1..3`, `step2/3/4`, `stepList`, `textBlock(s)`, `textBlockBg` | Pinned background while short text blocks step through — the storytelling core | `steps` scene |
| Artwork zoom | `assetZoom` (`__imgOuter/__imgInner/__imgWrap`, `__gradient`, `__textBlock`) | Slow scroll-driven zoom into a painting; scrim + caption arrive late | `zoom` scene |
| Timeline | `timelineBar` (`__line`, `__lineStart/End`, `__year`, `__yearText`) | A year-line advances with the story | `steps` scene's hour-line |
| Split reveal | `husbandAndWife` (`__husband`, `__wife`, `__textStart`, `__textEnd`) | Two portraits + framing text before/after | `pair` scene |
| Handover | `assetTransaction` (`__img1`, `__img2`), `transactionTitle`, `transaction2/3` | One image yields to another (art changing hands) | reserved (then→now moment, Checkpoint C) |
| Expandable document | `ledger` (`__img`, `__expand`, `__overlay`, `__close`), `minBtnRing` | A document opens full-screen from the page | `pair` scene's ledger dialog |
| Credits | `creditsPopup`, `imageCredits` | Per-image credit popup | optional later |
| Footer resources | `footerResources`, `footerResourceImage`, `follow-mouse` | Link list; hovering floats a preview image after the cursor | reading scene footer |
| Reveal utils | `js-animEl`, `useFade`, `indexNumber`, `endPad`, `ellipsis` | Generic fade/rise entrances, numbered wayfinding, scroll breathing room | `smoothE` reveals, `.endPad` |

## Typography & palette

- Display serif **Bardford** at enormous scale — `textH1` = 15rem, `textH2` = 6rem,
  `textBodyL` = 5rem (all weight 400); labels/UI in grotesque **Graphik**
  (`textLabelS` = 1.4rem). Two families, one weight — scale does the hierarchy.
  *Ours:* Cormorant Garamond ↔ Bardford, Inter ↔ Graphik.
- Near-black stage `#0c0c0c` with white text; grays `#bbbcc4`, `#454754`; artwork
  supplies all color. *Ours:* limestone light palette by Jason's choice
  (`TUNING.palette` — `'dark'` restores the full mimicry).

## Behavior details worth matching

- The page **never scrolls horizontally natively** — all motion is vertical scroll
  driving transforms.
- Entrances resolve early — text is readable well before a section's scroll ends.
- Chapter progress is always visible somewhere (dot ring + progress bar).
- Panels and popups are focus-managed, Esc-closable.
- Everything works reduced-motion and keyboard-only (semantic sections + anchors).
- Images: responsive `@sm` variants (e.g. `zoom-img@sm.webp`) — mobile gets smaller
  files. Ours should do the same when real photos land (Chunk 4).

## Complete capture inventory (audited against the source)

Every structural element and overlay found in the reference, with its status in our
framework. "Captured" = implemented in the specimen build; "Reserved" = planned,
waiting on content; "Skipped" = deliberate omission with reason.

| Reference element | Status | Where / why |
|---|---|---|
| `pageLoader` | ✅ Captured | `.pageLoader` |
| `introTitle` (landing: mark → title → subtitle → framing → scroll cue) | ✅ Captured | intro scene, same order |
| Per-chapter `introTitle` title cards | ✅ Captured | `.titleCard` (steps scene demonstrates) |
| `gettyLogoCenter` → corner logo move | ✅ Captured | intro mono + `.chrome--brand.is-visible` |
| `navDots` + progress rings | ✅ Captured | dot rail |
| `navChapter` title + progress bar | ✅ Captured | `.chrome--readout` |
| `navPanel--chapters` / `--about` overlays | ✅ Captured | slide-in panels, focus-trapped |
| `sectionAnchors` / deep links | ✅ Captured | `#ch-*` + `_redirects` |
| `bgImage` full-bleed rooms | ✅ Captured | bgRoom scene |
| `stepList` text-block steps over pinned bg | ✅ Captured | steps scene |
| `assetZoom` (+ credit line) | ✅ Captured | zoom scene + `.zoom__credit` |
| `timelineBar` | ✅ Captured | hour-line in steps |
| `husbandAndWife` split reveal | ✅ Captured | pair scene |
| `ledger` full-screen document overlay | ✅ Captured | pair scene's dialog |
| `creditsPopup` + `minBtnRing` credit button | ✅ Captured | `.creditBtn` → fixed `.creditsPopup` |
| `breakoutBtn` external CTA pill | ✅ Captured | `.breakoutBtn` |
| Numbered data lists (`textListItem`, `subList`, `step4__list*`) | ✅ Captured | `.dataList` |
| `ellipsis` continuation pill | ✅ Captured | `.ellipsis` |
| `finalText` closing line | ✅ Captured | `.finalText` |
| `footerResources` + `follow-mouse` previews | ✅ Captured | reading footer |
| `endPad` | ✅ Captured | `.endPad` |
| `landscapeWarning` | ✅ Captured | `.landscapeWarning` |
| `js-animEl`/`useFade` reveals, `indexNumber` | ✅ Captured | `smoothE` reveals, chapter numbering |
| `assetTransaction` img1→img2 handover | ⏳ Reserved | then→now moment; needs Checkpoint C photos |
| `segmentInfos` interactive network diagram | ⏳ Reserved | provenance-data-specific; no wedding equivalent yet — revisit if a seating-chart/guest-map idea lands |
| `descriptions__block` centered description over bg | ✅ Captured | covered by wallText/caption variants |
| `gl` (single small WebGL canvas) | ✖ Skipped | orn­amental; PLAN v4 review banned shader effects for this site |
| Video | ✖ Skipped | the reference itself ships none |
| Responsive `@sm` image variants | ⏳ Reserved | generated when real photos land (Chunk 4) |

## Bump-against checklist (use at every framework review)

Open the reference and ours side by side; compare:

1. **Loader → intro**: does ours resolve with the same unhurried confidence?
2. **Scroll feel**: their Lenis glide vs ours (`TUNING.lerp`).
3. **Dot rail**: ring fill smoothness, jump behavior, active-dot legibility.
4. **Chapter readout**: crossfade on room change; progress bar sync.
5. **Steps pacing**: one thought per step, readable dwell time, no dead scroll.
6. **Zoom**: starts slow, lands on a detail, caption arrives late — no rush.
7. **Panels**: slide-in speed, backdrop, close affordances.
8. **Footer**: follow-mouse preview lag (~0.14 lerp) and restraint.
9. **Mobile**: portrait-first; landscape warning; nothing pinned fights the thumb.
10. **Quietness**: their pages hold long moments of nothing but image — resist
    adding more ornament than the reference itself uses.
