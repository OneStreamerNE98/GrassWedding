# NICOLE + JASON — THE WEDDING EXHIBITION
## Production Build Plan (v1)

**Source of truth:** `docs/brief/` (Fable master brief, June 12 2027 · The Barnes Foundation · Philadelphia).
This plan translates that brief into buildable, agent-assignable tasks and locks the
engineering decisions the brief left open.

> North star: **"The information is the exhibition. The architecture is the navigation.
> The scroll is the walk."**

---

## 1 · Locked engineering decisions

| Decision | Choice | Why |
|---|---|---|
| Stack | **Static, no build step.** Vanilla ES modules + GSAP ScrollTrigger + Lenis (vendored in `/vendor`) | The existing Cloudflare Pages project deploys this repo with *no build command, output = root*. Keeping that contract means push → deployed, no CI secrets, no pipeline to break. The brief's Next.js suggestion buys nothing for a single-page scroll experience. |
| Camera model | One master document scroll (tall body). Each exhibit is a **pinned ScrollTrigger scene** that maps its local progress (0–1) to transforms on its layer stack. | Matches "one normalized progress value; each Exhibition owns a range." |
| Markup | `index.html` holds semantic `<section>` shells + persistent UI + `<noscript>` essentials. Each exhibit module renders its own interior markup from a template string at init. | Gives each agent exclusive file ownership (no merge collisions) while keeping DOM semantic. |
| Fonts | Self-hosted woff2: **Cormorant Garamond** (editorial serif — names, titles, dates) + **Inter** (labels, numbering, captions, nav) | Brief: elegant editorial serif + clean neutral sans. Self-hosting avoids third-party requests. |
| Smoothing | Lenis with light lerp; **disabled** on touch devices and under reduced motion | Brief: "scroll must feel directly connected; avoid excessive smoothing." |
| RSVP backend | Cloudflare **Pages Function** `functions/api/rsvp.js` writing to a **D1** database when the `RSVP_DB` binding exists; graceful "RSVP by email" fallback when it doesn't | Works inside the existing no-build Pages deployment. One-time D1 setup documented in `DEPLOYMENT.md`. |
| Photography | No real photos supplied yet → **curated placeholder frame system** driven by `assets/gallery/manifest.json`. Swapping in real images requires zero code changes. | Brief forbids inventing content; prefers real photography later. |
| Old site | Deleted from working tree (recoverable from git history). `PhiladelphiaSkyline*.png/jpg` retained under `assets/` for possible reuse in Exhibit 04. | "Start the website over." |

---

## 2 · Master timeline (locked ranges, from brief §16)

The page body is ~`1400vh` of scroll (tunable in `js/core/config.js`). Every exhibit
registers against these normalized ranges:

| Range | ID | Exhibition | Spatial behavior |
|---|---|---|---|
| 0–6% | 00a | Loader | Signal → data → construction → perspective → materialization → title. **Scroll-controlled, never a blocking pre-roll.** |
| 6–11% | 00b | Entrance + Lobby | Slow forward approach to directory wall; menu vocabulary established |
| 11–30% | 01 | Our Story | ↓ → ↓ ← ↓ varied narrative choreography |
| 30–46% | 02 | The Wedding | Long horizontal gallery → (Ceremony · Cocktails · Reception) |
| 46–55% | 03 | The Weekend | World moves visually ↑ (Fri/Sat/Sun pause at center) |
| 55–70% | 04 | Philadelphia | Route/map camera journey (right, down, diagonal) |
| 70–84% | 05 | Gallery | Horizontal photo exhibition + approach/pull-back focus |
| 84–92% | 06 | Details | Static quiet reading room |
| 92–100% | 07 | RSVP | Point/line returns → monogram → form → "See you at the Barnes" |

**Transition rule:** every directional change is motivated by architecture (doorway,
corner, wall, corridor, floor seam, route line) and hidden behind **foreground occlusion**
where scenes swap.

**Recurring line motif:** loader construction line → First Date drawing stroke →
Walk Home street seam → Wedding architecture edge → Weekend timeline spine →
Philadelphia route → Gallery detail rule → RSVP monogram. Implemented as an SVG
stroke vocabulary shared via `js/core/line.js` helpers.

---

## 3 · Architecture & module contract

```
/index.html              ← section shells, persistent UI, <noscript>, meta/OG
/styles/tokens.css       ← palette, type scale, spacing, z-layers, motion tokens
/styles/base.css         ← reset, typography, persistent UI, focus states
/styles/exhibits/<id>.css
/js/main.js              ← boot: Lenis, master ScrollTrigger, module registry
/js/core/config.js       ← timeline ranges, breakpoints, layer speed table
/js/core/engine.js       ← createExhibit() – pins a section, exposes local progress
/js/core/line.js         ← SVG path draw-on helpers (dashoffset), line motif utils
/js/core/motion.js       ← reduced-motion + device-tier gates, parallax helper
/js/exhibits/entrance.js ← 00 loader + lobby        (Agent A)
/js/exhibits/story.js    ← 01 Our Story             (Agent B)
/js/exhibits/wedding.js  ← 02 The Wedding           (Agent C)
/js/exhibits/weekend.js  ← 03 The Weekend           (Agent D)
/js/exhibits/philly.js   ← 04 Philadelphia          (Agent D)
/js/exhibits/gallery.js  ← 05 Gallery               (Agent E)
/js/exhibits/details.js  ← 06 Details               (Agent E)
/js/exhibits/rsvp.js     ← 07 RSVP finale           (Agent F)
/functions/api/rsvp.js   ← Pages Function           (Agent F)
/assets/art/…            ← SVG line art per exhibit
/assets/gallery/manifest.json
/vendor/gsap.min.js, ScrollTrigger.min.js, lenis.min.js
/assets/fonts/*.woff2
```

Every exhibit module exports:

```js
export default {
  id: 'story',                   // matches <section id="ex-story">
  title: '01 · Our Story',       // persistent UI context label
  render(section) {…},           // inject interior markup (semantic HTML)
  init(ctx) {…},                 // build GSAP timeline; ctx = {section, prefersReduced, isMobile, tier}
}
```

`js/core/engine.js` owns pinning, progress normalization, and kill/pause of
off-screen timelines. **Modules never create their own ScrollTriggers for pinning** —
they return scrubbed timelines the engine attaches. (Prevents fighting over pin
spacing and guarantees menu jumps land correctly.)

### Layer speed table (brief §11)
| Layer | Role | Speed |
|---|---|---|
| L1 | Distant environment / light | 0.20× |
| L2 | Rear wall / architecture | 0.50× |
| L3 | Primary content / artwork | 1.00× |
| L4 | Near architecture | 1.30× |
| L5 | Foreground occluder | 1.70× |
| UI | Persistent navigation | fixed |

Mobile: L1+L2 merge, L4 optional, L5 kept only for occlusion transitions (2–3 layers).

---

## 4 · Visual system (locked)

- **Palette (tokens.css):** warm limestone `#F4F0E8`, ivory `#FAF7F1`, stone `#CFC6B8`,
  warm gray `#8A8276`, near-black ink `#191713`, restrained green `#5A6353`.
  No pink, no heavy gold, no neon, no tech-blue.
- **Type:** Cormorant Garamond 300/400/500 (display, generous tracking on titles);
  Inter 400/500 for numbering (`01 / 07`), labels, captions, nav. Letter-spaced
  uppercase micro-labels for the museum wayfinding voice.
- **Texture:** near-invisible paper grain overlay; soft, large-radius shadows; square
  corners; hairline (1px) rules as the "line" vocabulary.
- **Illustration continuity (all agents drawing figures):** Jason — short dark hair,
  gray at sides, strong eyebrows, clean-cut, friendly smile. Nicole — long
  center-parted hair, hoop earrings, delicate necklace, warm laugh, slightly shorter.
  Dogs: Jagger (mini Bordoodle, curly), Cleo (cocker spaniel, slim, stubbed tail).
  Single-weight black line, no fills/shading, SVG-friendly.
- **Coordinates:** Barnes Foundation `39.9606° N, 75.1728° W` (verified) —
  2025 Benjamin Franklin Parkway, Philadelphia.

---

## 5 · Agent work packages

Each agent owns **only** its listed files. Shared files (`index.html`, `styles/tokens.css`,
core JS) are owned by the integrator and are read-only to exhibit agents.

### Agent A — Exhibit 00 · Loader, Entrance, Lobby
Files: `js/exhibits/entrance.js`, `styles/exhibits/entrance.css`, `assets/art/loader/*`
- Loader states A–F per brief §04 table: point → metadata labels (PHL · 39.9606°N
  75.1728°W · 06.12.27) → thin construction lines → flat plan bending into corridor
  (CSS perspective) → warm material fade-in → title wall (NICOLE + JASON / THE
  WEDDING EXHIBITION / June 12 2027 / The Barnes Foundation, Philadelphia).
- Scroll controls everything; on load with zero scroll, a subtle idle breathing on the
  point + "scroll to enter" cue. Never blocks.
- Lobby: camera drifts forward toward a directory wall — the real `<nav>`
  (EXHIBITIONS / 01 Our Story … 07 RSVP). Items are actual links driving master-timeline
  jumps (engine API `goTo(id)`), with visible focus states.
- Reduced motion: crossfade point → title → directory.

### Agent B — Exhibit 01 · Our Story  *(largest package; the brief's "prototype sequence")*
Files: `js/exhibits/story.js`, `styles/exhibits/story.css`, `assets/art/story/*`
- **Entrance:** doorway occlusion turn from Lobby (feel of turning right into a room).
- **Gallery 01.01 First Date:** September 2022 · Sassafras, Philadelphia. Original SVG
  line-art scene (bar interior, two figures per continuity spec; Negroni + tequila soda
  as small visual details, not copy). Progressive path draw-on tied to scroll.
- **Gallery 01.02 Walk Home:** the drawing's line escapes the frame and becomes the
  street seam. Old City atmosphere: cobblestone suggestion, street lamps, rowhouse
  silhouettes, evening tint. True 3-layer parallax (fg wall 1.7×, mid figures 1.0×,
  bg architecture 0.5×), camera walks left ←.
- **Micro-gallery — Early Memories:** one wide wall, 6 small framed pieces passing
  horizontally: Dogs Meet (Oct 2022), Thanksgiving, Hanukkah, first trip, life
  together, +1 curated. Simple line-art vignettes; captions in Inter micro-labels.
- **Engagement — feature piece:** quiet, singular, centered; line art crossfades toward
  a photo frame placeholder (real photo drops in later). **No invented date/location** —
  caption reads "The Engagement" only.
- Exit: pull back reveals the piece hanging in a room; doorway occlusion → Wedding.

### Agent C — Exhibit 02 · The Wedding
Files: `js/exhibits/wedding.js`, `styles/exhibits/wedding.css`, `assets/art/wedding/*`
- One wide gallery translating left-to-right (world moves left as user scrolls down),
  perspective + layer speeds so it reads as *walking past installations*, not a carousel.
- Three installations (brief §08 table): **Ceremony** (bright, formal; date/venue/time —
  "June 12, 2027 · The Barnes Foundation" + ceremony time placeholder), **Cocktail Hour**
  (garden-adjacent, airy; column occlusion reveal), **Reception** (warmer, richer;
  restrained — explicitly no nightclub/neon).
- Architecture is an **original simplified Barnes interpretation** in SVG line +
  flat warm planes: strong geometry, glass, garden adjacency. No traced photos.

### Agent D — Exhibits 03–04 · The Weekend + Philadelphia
Files: `js/exhibits/weekend.js`, `js/exhibits/philly.js`, matching CSS, `assets/art/philly/*`
- **Weekend:** reversed movement — schedule installation moves ↑ while user scrolls ↓.
  Friday (Welcome), Saturday (Wedding Day), Sunday (Farewell) each pause centered long
  enough to read. Event copy = elegant placeholders ("Details to follow").
- **Philadelphia:** the line exiting Weekend grows nodes → stylized editorial
  transit-diagram map (NOT Google Maps). Camera travels right/down/diagonally along the
  route via MotionPath-style progress. Nodes: **Stay** (hotel block placeholder),
  **Eat** (curated dining), **Explore** (museums, Parkway, neighborhoods),
  **Transportation** (getting around). Node panels expand on arrival; also
  keyboard/tap accessible. The Barnes is the route's visual anchor.
  May incorporate `assets/PhiladelphiaSkylineDrawing2.jpg` linework as reference or
  trace-simplified skyline SVG.

### Agent E — Exhibits 05–06 · Gallery + Details
Files: `js/exhibits/gallery.js`, `js/exhibits/details.js`, matching CSS, `assets/gallery/manifest.json`
- **Gallery:** museum wall, images hung at varied sizes with editorial spacing,
  horizontal walk; 3–4 curated "focus" pieces where the camera approaches to near
  fullscreen then pulls back to re-reveal the wall. Driven by `manifest.json`
  (src, alt, size, focus flag) rendering elegant framed placeholders (stone tones,
  small captions) until real photos are added. No click required for progression.
- **Details:** intentionally calm reading room. Static centered column, generous
  whitespace, accessible accordions: Attire, Accommodations, Transportation, Registry,
  Questions. Real `<details>/<summary>` or ARIA-correct disclosure. Content =
  structured placeholders awaiting final copy.

### Agent F — Exhibit 07 · RSVP + Pages Function
Files: `js/exhibits/rsvp.js`, `styles/exhibits/rsvp.css`, `functions/api/rsvp.js`, `schema.sql`
- Scene empties to warm-white; the loader's point returns, draws the recurring line,
  resolves into an **N+J monogram** (SVG stroke animation).
- Form: name, email, attending yes/no, guest count, dietary notes, message. Plain,
  practical, fully keyboard accessible, real validation.
- `functions/api/rsvp.js`: POST handler → validates → inserts into D1 (`RSVP_DB`
  binding, `schema.sql` provided). Without the binding returns 503 `{setup:false}`;
  the UI then shows a warm fallback ("RSVP portal opening soon — or email us")
  rather than a fake success. Honeypot + length caps for spam.
- After success: "See you at the Barnes." + June 12, 2027.

### Integrator (orchestrator) — owns shared files
- `index.html`, `styles/tokens.css`, `styles/base.css`, `js/main.js`, `js/core/*`
- Persistent UI: N+J top-left (→ jump to top), exhibit context top-right (`03 / 07 ·
  The Weekend`, updates from engine), MENU control opening the full-screen directory
  (same component as Lobby's), subtle scroll cue. Fixed while architecture moves.
- Wires all modules, verifies inter-exhibit occlusion handoffs, mobile choreography,
  reduced-motion audit, focus order, `<noscript>` block with all practical info.

---

## 6 · Responsive choreography (brief §12)

| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layers | 4–5 | 3–4 | 2–3 |
| Lateral runs | full | shortened | short translations only |
| Perspective turns | full | reduced | depth cue only |
| Pins | longer | medium | shorter |
| Hover | allowed, never required | — | none required |

Breakpoints in `config.js`: mobile <768, tablet 768–1199, desktop ≥1200.
Safe focus area: content confined to central band; UI at fixed corners.

## 7 · Performance & accessibility (non-negotiable, from brief §15)

- `prefers-reduced-motion`: engine flips to `tier: 'calm'` — pins shortened/removed,
  camera flights become crossfades, **all content preserved**.
- Device tier check (deviceMemory / save-data / small screen) simplifies layers.
- Lazy render: each exhibit builds its heavy DOM/SVG on approach (engine callback),
  timelines pause when off-screen.
- Semantic headings h1→h3 in document order; keyboard: directory reachable via
  visible skip link; focus states everywhere; touch targets ≥44px.
- No essential info raster-only; no audio; no autoplay video.
- Images: lazy `loading`, modern formats when real photos arrive (manifest supports
  `srcset`).
- Test matrix: desktop Chrome/Safari/Edge (wheel + trackpad), iOS Safari, Android
  Chrome (touch), keyboard-only pass.

## 8 · Guardrails checklist (from brief §17 — reviewers verify every PR)

No ticket booths/museum jokes · no "Exhibit-labels-on-a-template" · no effect zoo ·
readability beats graphics · no horizontal input · no Barnes replication · not generic
beige luxury — the line motif + story art must make it unmistakably Nicole + Jason ·
no HUD/cyberpunk · practical info always ≤2 interactions away via MENU.

## 9 · Delivery pipeline

1. Agents build on branch `claude/website-rebuild-plan-2p9zz4` with disjoint file ownership.
2. Integrator wires + audits; Playwright smoke: scroll journey screenshots at each
   exhibit (desktop 1440×900, mobile 390×844), console-error check, menu jump check,
   RSVP validation check, reduced-motion pass.
3. Push → **draft PR** to `main`.
4. **Deploy:** merging to `main` auto-deploys via the existing Cloudflare Pages
   project (no build command, output `/`). `DEPLOYMENT.md` covers the one-time D1
   setup for RSVP storage and how to verify the deployment.

## 10 · Open items needing Nicole + Jason (placeholders shipped meanwhile)

- Ceremony/cocktail/reception times · weekend event details · hotel block name/link ·
  registry links · attire wording · FAQ copy · real photography (drop into
  `assets/gallery/` + manifest) · engagement photo · final dining/explore picks ·
  RSVP deadline date.
