# NICOLE + JASON — THE WEDDING EXHIBITION
## Build Plan · v4 (framework-first)

**Structure of this plan:** the build is split into chunks. **Chunk 1 — the
Framework — comes first and is the thing to perfect:** the scrolling, the navigation,
the exhibition *feel* of moving through rooms. It is built and reviewed with dummy
"specimen" content, so the walk can be tuned until it's right before a single real
word or photo is placed. Content then plugs into the approved framework through a
fixed contract (§5) — adding or editing content never touches framework code.

Backend (D1 + Turnstile + passphrase gate + working RSVP) is live and verified —
no chunk rebuilds it (§9).

> North star: *"The information is the exhibition. The architecture is the navigation.
> The scroll is the walk."* Polish comes from typography, spacing, and light — not
> from drawing. No invented illustration, ever (v3 review finding, §8).

---

## 1 · CHUNK 1 — THE FRAMEWORK (review gate: Jason walks it and approves)

The framework is a content-free museum: rooms, the walk between them, and the
wayfinding. It ships as a deployable preview populated with **specimen rooms**
(placeholder wall text + framed gray mats, clearly fake) so the motion and navigation
can be judged on their own. This chunk is where iteration happens — nothing else
starts until the walk feels right.

### 1.1 Scroll engine (exact wiring — research-backed, non-negotiable)

Vendored Lenis + GSAP (already in `/vendor`). One animation loop, GSAP-driven:

```js
gsap.registerPlugin(ScrollTrigger, CustomEase);
const lenis = new Lenis({ autoRaf: false, lerp: 0.12, syncTouch: false }); // native scroll on touch
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);
ScrollTrigger.config({ ignoreMobileResize: true });
```

- Boot: `Promise.all([document.fonts.ready, window load]) → build rooms → ScrollTrigger.refresh()`.
- Registered easing vocabulary (free-tier `CustomEase`, string API):
  `silk (0.45,0.05,0.55,0.95)` · `smooth (0.25,0.1,0.25,1)` · `flow (0.33,0,0.2,1)`
  · `linear (0.4,0,0.6,1)`. No default GSAP eases anywhere.
- Scrubbed animation uses `scrub: 1` (1-second catch-up — cinematic), never
  `scrub: true` (mechanical). Background-only accents may use `scrub: 2`.

### 1.2 Room anatomy — CSS sticky, not pinning

The museum "room" (screen holds while you walk through it) is built with **CSS
`position: sticky`**, not ScrollTrigger pinning. Identical held-room feel, a fraction
of the failure modes on mobile (no pin-spacer math, no address-bar thrash, works
without JS):

```html
<section class="room" id="room-wedding" aria-label="Exhibition 01 · The Wedding"
         style="--room-height: 200vh">
  <div class="room-stage"><!-- sticky, 100svh, holds the content --></div>
</section>
```

```css
.room        { position: relative; min-height: var(--room-height); }
.room-stage  { position: sticky; top: 0; height: 100svh; overflow: clip; }
```

The gap between `--room-height` and `100svh` = the walking distance through that
room. Standard heights (desktop / mobile = ×0.75):

| Room type | Height | Feel |
|---|---|---|
| Entrance / title | 250vh | Long, deliberate arrival |
| Standard exhibition room | 200vh | Read + one reveal sequence |
| **Gallery walk (horizontal)** | = track width (1:1 px) | Vertical scroll turns into a sideways walk past hung works — §1.4 |
| Corridor (transition breather) | 100vh | Non-sticky; pure breathing room |
| Reading room (Details/FAQ, Registry) | auto | **Normal document flow — no stickiness.** Long-form reading never fights the scroll |
| Finale (RSVP) | 200vh | Held monogram moment, then normal-flow form |

**Hard rule — the page itself can never scroll horizontally.** `html, body
{ overflow-x: clip; }`; there is exactly one native scrollbar (vertical) at all
times. Any sideways movement on this site is a *transform* driven by vertical
scroll (§1.4) — the scroll wheel/thumb gesture never changes meaning, which is the
condition under which the usability research says this pattern works.

### 1.3 Motion vocabulary (the complete allowed set)

Every animation on the site is one of these five patterns — nothing bespoke per page.
All durations run through a global `pace` multiplier in config (default 1.0).

| Pattern | Mechanism | Timing | Used for |
|---|---|---|---|
| **Arrive** | fade + rise 40→0px, `toggleActions: 'play none none reverse'`, trigger `top 80%` | 1.0s `smooth`; title variant 1.4s `silk` | Every wall-text panel and object label entering |
| **Walk-scrub** | timeline scrubbed across a room's walking distance, `scrub: 1`, `ease: none` inside | tied to scroll | Signature moments only: Entrance title sequence, RSVP monogram draw, and the horizontal Gallery Walk (§1.4) |
| **Mat reveal** | image scales 0.96→1 + opacity, 1.2s `smooth`, trigger `top 70%` | 1.2s | Framed photos/mats |
| **Seam** | room boundary: next room's stage slides over the previous (sticky natural overlap) + a soft 24px shadow line at the seam | passive | Every room change — this *is* the "walking into the next gallery" cue |
| **Hairline** | progress line + directory underline growth | scrub-linked, `linear` | Wayfinding only |

**Pacing rule (hard):** every Arrive completes within the first 30% of its room's
walking distance — a guest never waits for content to become readable. Uppercase
micro-labels, hairline rules and generous whitespace do the "museum" work at rest.

### 1.4 The Gallery Walk — vertical → horizontal → vertical (researched recipe)

The one place scrolling changes *direction* without changing *gesture*: you keep
scrolling down, and for one room the museum moves sideways past you — then the walk
ends and the world resumes moving up. Used **sparingly** (the usability research is
blunt that this pattern sours when overused): at launch, exactly one walk — **The
Wedding room** (Ceremony → Cocktail Hour → Reception as three hung installations);
the future photo **Gallery** room reuses the same machinery when Checkpoint C photos
arrive. Never more than two walks on the site.

**Mechanism (desktop/tablet, the documented GSAP pattern):**
- The room is a full-viewport **pinned** section containing a wide flex `track` of
  panels. Vertical scroll scrubs `x` on the track:
  `x: () => -(track.scrollWidth - innerWidth)`, `end: () => '+=' + (track.scrollWidth - innerWidth)`,
  `scrub: 1`, `ease: 'none'`, `invalidateOnRefresh: true`, `anticipatePin: 1`.
- **1:1 px mapping** (one pixel scrolled = one pixel walked) so walking speed feels
  identical to the rest of the museum — this is what makes it read as "the room
  turned" rather than "the page glitched."
- Anything animating *inside* the walk (caption arrives, mat reveals) uses
  `containerAnimation` triggers; the container tween stays linear; no pinning or
  snapping inside `containerAnimation` triggers (documented GSAP constraints).
- **Entry/exit cues:** the room's wall-text panel Arrives first (vertical, normal);
  the walk begins only after it settles. A hairline **walk progress tick-strip**
  (like a gallery floor line with room-numbered stations) sits at the bottom edge
  and fills as you walk — the guest always sees how far the corridor goes. On exit
  the next room seams in vertically as usual.
- The track's DOM order = reading order, so screen readers and keyboard users
  traverse the panels in sequence with no horizontal anything.

**Mobile (≤768px), via `gsap.matchMedia`:** the pinned walk is replaced by a native
**scroll-snap strip** (`scroll-snap-type: x mandatory`, momentum-friendly, swipeable,
with the same tick-strip) inside normal vertical flow — the researched consensus for
touch, where pinning fights momentum scrolling. Progressive enhancement: with JS off
it's simply a horizontally swipeable strip; nothing breaks.

**Reduced motion:** the walk flattens into a vertical stack of the same panels —
full content, zero pinning (also satisfies WCAG reflow).

### 1.5 Room wireframes — "a simple museum," literally

The layout vocabulary is lifted from real gallery interiors: one work per wall,
a small label beside it, a baseboard line, nothing else. (Design research consensus
for museum sites: neutral palette, serif display + sans body, ruthless whitespace,
the art/photos as the only ornament.)

```
STANDARD ROOM (200vh, sticky stage)          GALLERY WALK PANEL (one of 3)
┌────────────────────────────────────┐      ┌────────────────────────────────────┐
│ N+J                    02/06 ROOM  │      │                                    │
│                                    │      │        ┌────────────────┐          │
│        EXHIBITION 02               │      │        │                │  02.01   │
│        Travel                      │      │        │   framed mat   │  ─────   │
│        one short sentence.         │      │        │   (photo/img)  │  CEREMONY│
│                                    │      │        │                │  4:30 PM │
│   ┌─────────┐  BY AIR              │      │        └────────────────┘  Barnes  │
│   │ framed  │  ───────             │      │                                    │
│   │  mat    │  PHL is 20–30 min…   │      │  ── walk ticks ▪▪▪▫▫ ──────────────│
│   └─────────┘                      │      └────────────────────────────────────┘
│                                    │       wall label sits BESIDE the frame,
│ MENU        ─── baseboard ──────── │       never on top of it; one work per
└────────────────────────────────────┘       viewport; generous margins
```

- Exactly **one focal element per viewport-moment**; labels beside works, museum
  style, never overlaid on images.
- The baseboard hairline runs through every room at the same height — the single
  continuous line that makes separate rooms feel like one building.
- Backgrounds are flat limestone/ivory alternation only. All texture comes from the
  photographs, the type, and the seam shadows.

### 1.6 Navigation & wayfinding (the exhibition UX)

- **Persistent chrome** (never scrolls away): monogram top-left (click = entrance),
  wayfinding top-right (`02 / 06` + room name, crossfades 300ms on room change),
  `MENU` bottom-left, progress hairline along the left viewport edge.
- **Directory overlay** (the strongest v2 screen — kept and refined): full-screen,
  numbered room list, opens ≤300ms `flow` with staggered rows (0.04s), closes on
  `Esc`/backdrop/row-choice. Focus is trapped inside while open; the trigger button
  gets focus back on close. Current room's row shows a filled marker.
- **`goTo(roomId)`:** computes the target *fresh* per jump (never cached offsets) =
  room's stage-settle point; drives `lenis.scrollTo(target, { duration: 1.2, easing: flow })`;
  `history.replaceState('#'+roomId)`; on arrival moves focus to the room heading
  (`tabindex="-1"`, `focus({ preventScroll: true })`).
- **Deep links:** on load with a hash (or `_redirects` shortlinks `/rsvp`,
  `/registry`, …) → instant jump (no animated catch-up), then normal behavior.
- **Keyboard:** the whole site is tabbable in document order; focusables exist only
  at room rest states; `PageDown`/arrows work natively (Lenis passes them through).
- **Reduced motion** (`prefers-reduced-motion`): Lenis destroyed → native scroll;
  all Arrives/`Walk-scrubs` skipped — `gsap.set` every element to its final state;
  directory opens/closes with instant fades; `goTo` uses `behavior: 'auto'`. The
  resting DOM of every room is complete and readable with zero JS (doubles as the
  no-JS/noscript story).

### 1.7 Atmosphere layer — more museum feel, near-zero complexity

Five effects, each individually toggleable in `TUNING.atmosphere` and all present in
the specimen build so each can be judged (and switched off) on real devices. All are
CSS custom properties + existing scroll plumbing — no new libraries, no canvas, no
measurable performance cost.

| Effect | What it does | Why it reads as "museum" | Mechanism (cost) |
|---|---|---|---|
| **Wall-tone drift** | Each room declares a wall tone (limestone → ivory → pale sage → warm gray); the background cross-fades between them as you cross the seam, scrub-linked | Real galleries repaint walls per exhibition — color change *is* the room change | One scrubbed CSS custom property, interpolated in OKLCH (`@property` registered, GPU-cheap; HSL fallback). Never animate `background-color` directly |
| **Painted wall numbers** | The room number (`01`) as huge, very-low-contrast type behind the content (3–5% opacity ink), drifting a few px slower than the scroll | Vinyl numbers painted on gallery walls; adds depth and wayfinding for free | One absolutely-positioned span per room + a tiny scrubbed `y` offset |
| **Track lighting** | A soft radial brightening (`+3–4%` lightness, very wide) centered on the focal frame, fading in as the mat Arrives | Works look *lit*, not pasted; the eye goes where the curator pointed | Static CSS radial-gradient pseudo-element, opacity tween only |
| **Hung-work shadow settle** | A mat's drop shadow starts slightly deeper/offset and settles to its rest shadow as it Arrives (~0.8s) | Pieces feel physically hung on the wall rather than printed on it | Two box-shadows on a pseudo-element, opacity crossfade (no shadow animation) |
| **One-layer parallax** | Framed works translate ~12px slower than their captions across a room's walk — one depth plane, fixed amount, everywhere the same | The slight depth of standing in a room, without "parallax site" excess | Single scrubbed `y` on `.mat` elements, `ease: none` |

Plus one **navigation garnish:** the directory overlay gains a small static SVG
**floor plan** — rooms as outlined rectangles in walk order with a "you are here"
dot (current room filled). Pure static SVG + one class toggle; it turns the menu
into a museum map and doubles as orientation for guests.

Explicitly rejected (over the top for this site): WebGL/shader backgrounds, grain
overlays that animate, cursor effects, sound, 3D room turns, text-splitting
animations. The restraint *is* the design.

### 1.8 Framework config — the knobs (Jason-tunable, one file)

`js/core/config.js`, fully commented, no animation knowledge needed:

```js
export const TUNING = {
  lerp: 0.12,        // scroll softness: 0.08 = dreamier, 0.2 = tighter
  pace: 1.0,         // global animation duration multiplier
  roomHeights: { entrance: 250, room: 200, corridor: 100, finale: 200 }, // vh
  mobileHeightFactor: 0.75,
  seamShadow: 24,    // px softness of the room-change shadow
  atmosphere: {      // §1.7 — flip any of these off if it feels like too much
    wallToneDrift: true, wallNumbers: true, trackLighting: true,
    shadowSettle: true, parallax: true, floorPlan: true,
  },
};
export const ROOMS = [   // order here = walk order = directory order
  { id: 'entrance', num: '00', title: 'Entrance',    type: 'entrance' },
  { id: 'wedding',  num: '01', title: 'The Wedding', type: 'walk' },  // horizontal gallery walk
  { id: 'travel',   num: '02', title: 'Travel',      type: 'room' },
  // …adding/reordering/hiding rooms is a one-line edit; type: 'walk' opts a room
  //   into the §1.4 horizontal machinery
];
```

### 1.9 Specimen build + review gate

- Framework ships with 6 specimen rooms: entrance walk-scrub, two standard rooms
  (wall text + object labels + mats — lorem), **one 3-panel gallery walk** (so the
  vertical→horizontal→vertical turn is reviewed on desktop *and* as the mobile
  snap-strip), one corridor, one reading room — plus the directory, wayfinding,
  progress line, walk ticks, and deep links.
- `?debug=1` overlay: room boundaries, current scroll %, fps meter, TUNING values —
  so review feedback can be specific ("entrance feels long" → one number changes).
- **Gate — Jason's approval on real devices:** the walk (wheel, trackpad, phone
  thumb-scroll), the directory, deep links, keyboard-only pass, reduced-motion pass.
  Iterate inside this chunk until approved. Playwright journey (0→100%, jump to every
  room, both viewports, zero console errors) must be green at every iteration.

**Framework file ownership** (content never touches these):
`js/core/engine.js` (lenis+ticker+room builder) · `js/core/motion.js` (the five
patterns) · `js/core/nav.js` (directory, goTo, wayfinding, focus) ·
`js/core/config.js` (TUNING + ROOMS) · `styles/framework.css` (room anatomy, chrome,
seams) · `index.html` shells.

---

## 2 · CHUNK 2 — Design-system components (still content-free)

Built *on* the approved framework, into the specimen rooms:
- **Wall-text panel:** eyebrow (`EXHIBITION 01`), display title (Cormorant), one
  short Inter paragraph — the opening of every room.
- **Object label:** small-caps label, title, 1–2 lines, hairline rule — the single
  reusable block for every fact (times, hotels, registry items, FAQ answers).
- **Framed mat:** fixed-aspect image slot with mat border + soft shadow; renders a
  clean monogrammed mat when its image is missing — placeholders look intentional.
- **Seam + surface tokens:** limestone/ivory alternation, AA-verified text pairs,
  44px targets, Inter ≥16px logistics.
Gate: styleguide room shows every component; axe/contrast checks pass; Jason approves
the look of the specimen rooms wearing real components.

## 3 · CHUNK 3 — Content plug-in (Jason customizes from here on)

Real pages, entered through the §5 contract — framework and components untouched:

| № | Room | Content source |
|---|---|---|
| 00 | Entrance | names, date, venue, countdown (from `content.js`) |
| 01 | The Wedding | ceremony/cocktails/reception object labels, times TBD-safe, add-to-calendar |
| 02 | Travel | compact factual panel: air, rail, rideshare, parking, maps links |
| 03 | Registry *(new — §6)* | note + store link cards |
| 04 | Details | FAQ reading room (kept venue facts only) |
| 05 | RSVP | existing working form, reskinned with the components |
| — | Our Story / Gallery | hidden until Checkpoint C photos + captions exist; then added as rooms via one ROOMS entry each |

All copy inherited from the original site is **dropped** at the start of this chunk
(story narrative, weekend schedule, Philly editorial guide, filler FAQ — full
drop/keep list in §8). Gate: per-page screenshot approval by Jason, phone + desktop.

## 4 · CHUNK 4 — Media (image checkpoints) & CHUNK 5 — Launch QA

Chunk 4 opens with **Checkpoint A** and follows the delivery schedule in §7.
Chunk 5 = the full QA matrix: Playwright journey, keyboard/reduced-motion/200% zoom,
LCP < 2.5s on 4G profile, CLS ≈ 0, content proofread, DEPLOYMENT.md updated, then
production deploy + smoke test on grass.wedding.

---

## 5 · Content contract (how content plugs in without touching the framework)

- **All words** live in `js/content.js` — one object per room, plain strings/arrays.
- **All images** live in `assets/photos/` with the §7 filenames; `manifest.js` maps
  file → slot. Missing file = intentional mat, automatically.
- **Room existence/order** is only `ROOMS` in `config.js` (one line per room).
- Each room's renderer consumes exactly: one wall-text entry, N object labels,
  M mat slots. If content needs a shape the components can't express, the *design
  system* chunk gets the change first — content never invents one-off markup.
- Therefore: Jason can edit any copy, add registry links, drop in photos, hide/show
  Story — with zero risk to scroll, navigation, or layout.

## 6 · Registry room (Exhibition 03)

`content.js` model: `registry: { intro, note, stores: [{name, url, blurb}], fund? }`.
Rendered as object-label cards ("Visit registry →", `rel="noopener"`, links out —
no iframes/feeds/prices). Empty `stores` renders the note + a graceful "details to
follow" line. Directory row + `/registry` redirect + FAQ answer link included.

## 7 · Image checkpoints — what Jason supplies, and exactly when

Rules for all: JPG, sRGB, quality ~80, no filters/borders/text baked in; sizes are
minimums. **Claude asks for each batch at its checkpoint — nothing is needed sooner,
and nothing before Chunk 4 blocks on images.**

| Slot | File | Aspect | Size | Needed by | Priority |
|---|---|---|---|---|---|
| Entrance hero | `hero.jpg` | 3:2 | 2400×1600 | **Checkpoint A — start of Chunk 4** | Required |
| Hero mobile alt | `hero-portrait.jpg` | 4:5 | 1600×2000 | Checkpoint A (only if the 4:5 crop of hero fails — Claude checks and asks) | Optional |
| Venue | `venue.jpg` | 3:2 | 2000×1333 | **Checkpoint A** | Required |
| Ceremony detail | `ceremony.jpg` | 1:1 | 1200×1200 | Checkpoint B — during Chunk 4 | Optional |
| Reception detail | `reception.jpg` | 1:1 | 1200×1200 | Checkpoint B | Optional |
| Travel/skyline | `philly.jpg` | 3:2 | 2000×1333 | Checkpoint B | Optional |
| Registry note | `registry.jpg` | 1:1 | 1200×1200 | Checkpoint B | Optional |
| OG/share | *(Claude generates from hero)* | 1.91:1 | 1200×630 (+2400×1260) | automatic in Chunk 4 | — |
| Story/Gallery set | `story-01…NN.jpg` + caption list | any | 1600 long edge | Checkpoint C — any time after launch | Future |

Timeline: **Chunks 1–3 need no images.** Checkpoint A is the only pre-launch ask
(launch may still proceed on mats if photos aren't ready — Claude states which pages
show mats). Checkpoint B is a courtesy list of still-empty optional slots.
Checkpoint C unlocks the hidden Story/Gallery rooms whenever it arrives.

## 8 · Content reset (drop / keep) — executed at the start of Chunk 3

**KEEP:** names · Saturday, June 12, 2027 · The Barnes Foundation, Philadelphia
(address, maps, on-site garage fact) · RSVP flow + passphrase gate · venue-fact FAQs
(arrival buffer, indoor/AC, ADA, parking, dress-code placeholder, RSVP-deadline
placeholder).
**DROP:** the entire Our Story narrative (First Date/Sassafras, Walk Home, six
memories, engagement caption) · Weekend Fri/Sat/Sun schedule · Philadelphia
editorial guide (replaced by compact Travel facts) · all line-art scene SVGs
(`assets/art/*`) and their choreography · weather/hashtag/livestream/photos filler.

**v3 review findings that drive the above** (from screenshots of the deployed v2):
empty-void loader; clip-art story doodles; wireframe noise behind the Wedding walk;
fat broken stroke in Weekend; muddy gradient "walls"; gray placeholder gallery.
Lesson encoded in §1–§2: quiet backgrounds, no invented illustration, typography and
photography carry everything; the directory + FAQ typography were the good parts and
the system is built out from them.

## 9 · Engineering foundations that carry over (do not rebuild)

- **Backend live & verified:** D1 (`wedding-rsvp` + preview) with schema; invisible
  Turnstile (sitekey in content.js, secret bound); passphrase gate (`SITE_PASSPHRASE`
  set); `RSVP_EMAIL_TO/FROM` bound; Resend key pending (email off; D1 is source of
  truth). `scripts/setup_cloudflare.py` idempotent.
- **Deploys:** Pages project is **direct-upload** (not git-connected):
  `npx wrangler pages deploy . --project-name=grasswedding --branch=<branch>`
  (preview) / `--branch=main` (production). Optional: connect repo in dashboard later.
- **Headers/privacy:** noindex posture, CSP, immutable vendor/font caching,
  `_redirects` (+`/registry`).
- **Hard rules that survive from v2:** transform/opacity only in scrubbed tweens;
  function-based end values; no nested triggers; engine-owned `will-change`
  (never blanket CSS); explicit image dimensions; `loading="lazy" decoding="async"`
  + `img.decode()` pre-warm on approach; AA 4.5:1 contrast everywhere.
