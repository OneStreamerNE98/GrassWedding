# NICOLE + JASON — THE WEDDING EXHIBITION
## Production Build Plan · v2 (research-backed)

**Design source of truth:** `docs/brief/` (Fable master brief — Saturday, June 12 2027 ·
The Barnes Foundation · Philadelphia). This plan turns that brief into buildable,
agent-assignable work packages and locks every engineering decision the brief left open.
v2 incorporates three research passes: (a) GSAP/ScrollTrigger/Lenis engineering practice,
(b) the 2026 Cloudflare deployment landscape, (c) professional wedding-site content,
RSVP UX, and older-guest accessibility standards.

> North star: **"The information is the exhibition. The architecture is the navigation.
> The scroll is the walk."**

---

## 1 · Locked decisions

| Decision | Choice | Rationale |
|---|---|---|
| Hosting | **Stay on Cloudflare Pages**, git-connected, **no build command**, output = repo root | Pages is fully supported (no deprecation); the `functions/` directory works with zero build. Migrating to Workers Static Assets would *add* a compile step for functions. Every branch push gets a preview URL automatically; the PR gets the link as a comment. |
| Stack | Vanilla ES modules + **GSAP 3.13+** (ScrollTrigger, **DrawSVGPlugin**, MotionPath) + **Lenis** — all vendored locally | GSAP and all former Club plugins are 100% free since 3.13 (Webflow acquisition). DrawSVG replaces hand-rolled dashoffset line drawing (handles `<line>/<rect>/<polyline>`, partial draws, measurement bugs). |
| Camera model | **One ScrollTrigger + one labeled scrubbed timeline per exhibit section**, created in DOM order. No page-spanning master pin. | Per-section pins are the documented best practice: local start/end math, cheap refresh, graceful degradation. A whole-page master pin rebuilds ScrollSmoother badly. |
| Smoothing | Lenis `lerp ≈ 0.12`, RAF driven by `gsap.ticker` + `lagSmoothing(0)`; **native scroll on touch** (`syncTouch: false`, Lenis inert); `scrub: true` (never stack big scrub numbers on Lenis lerp); **no `normalizeScroll`** | Exactly one smoothing stage = the precise "walking" feel the brief demands. |
| Markup | `index.html` holds semantic `<section>` shells + persistent UI + `<noscript>`; each exhibit module renders its interior from a template string | Exclusive file ownership per agent; semantic DOM; document order = scroll order = screen-reader order. |
| Copy | **All words live in `js/content.js`** — one file the couple can edit without touching choreography | Content/choreography decoupling; agents read from it, never hardcode copy. |
| Fonts | Self-hosted Cormorant Garamond (display) + Inter (UI), `font-display: swap`, preloaded; boot waits on `document.fonts.ready` | Correct trigger measurement; no third-party requests. |
| RSVP | Pages Function + **D1** (party/household model) + **Turnstile** (invisible) + **Resend** email notification + **Cloudflare Access**-protected CSV export | See §8. MailChannels' free tier is dead (2024); SendGrid's free tier is dead (2025); Resend free (3k/mo) is the 2026 recommendation. |
| Privacy | `noindex` everywhere (meta + `X-Robots-Tag` + robots.txt); RSVP gated by guest-name lookup; **optional** shared-passphrase gate via Pages middleware — *couple's call* | Industry norm: reachable by URL from the invitation, invisible to search. Cloudflare Access is wrong for guests (50-seat cap) — reserved for `/admin`. |
| Photography | Placeholder frame system driven by `assets/gallery/manifest.json`; real photos drop in with zero code changes | No invented content; brief prefers real photography later. |
| Old site | Deleted (in git history) | "Start over." |

---

## 2 · Master timeline (from brief §16)

| Range | ID | Exhibition | Spatial behavior |
|---|---|---|---|
| 0–6% | 00a | Loader | Signal → data → construction → perspective → materialization → title. Scroll-controlled, never a blocking pre-roll. |
| 6–11% | 00b | Entrance + Lobby | Slow forward approach; directory wall = real nav |
| 11–30% | 01 | Our Story | ↓ → ↓ ← ↓ varied narrative choreography |
| 30–46% | 02 | The Wedding | Long horizontal gallery → (Ceremony · Cocktails · Reception) |
| 46–55% | 03 | The Weekend | World moves visually ↑ |
| 55–70% | 04 | Philadelphia | Route/map journey (right, down, diagonal) |
| 70–84% | 05 | Gallery | Photo walk + approach/pull-back focus |
| 84–92% | 06 | Details | Static quiet reading room (normal flow, no pin) |
| 92–100% | 07 | RSVP | Point/line returns → monogram → form → "See you at the Barnes" |

Spans are defined in vh in `js/core/config.js`; mobile spans ×0.7. Directional changes
are always motivated by architecture; scene swaps hide behind **foreground occlusion**
(implemented as the next scene overtaking with `pinSpacing: false` + higher z-index, or
an L5 occluder wiping the stage).

**Recurring line motif:** loader construction line → First Date drawing stroke → Walk
Home street seam → Wedding architecture edge → Weekend spine → Philadelphia route →
Gallery hairline → RSVP monogram. One stroke vocabulary via DrawSVG helpers in
`js/core/line.js`.

---

## 3 · Architecture

```
/index.html                  section shells, persistent UI, meta/OG, <noscript>
/404.html                    styled not-found page
/robots.txt                  noindex posture
/_headers                    caching (immutable vendor/fonts) + security headers + CSP
/_redirects                  /rsvp → /#ex-rsvp convenience routes
/styles/tokens.css           palette, type, spacing, z-layers, motion tokens
/styles/base.css             reset, typography, persistent UI, directory, focus states
/styles/exhibits/<id>.css    one per exhibit (agent-owned)
/js/content.js               ALL site copy + schedule/travel/FAQ data  ← couple edits this
/js/main.js                  boot sequence (fonts.ready + load → init → refresh)
/js/core/config.js           timeline spans, breakpoints, layer speeds, venue constants
/js/core/engine.js           per-section pin/scrub creation, registry, goTo(), focus mgmt
/js/core/line.js             DrawSVG wrappers for the line motif
/js/core/motion.js           matchMedia contexts, tiering, parallax stack helper
/js/exhibits/<id>.js         entrance | story | wedding | weekend | philly | gallery | details | rsvp
/functions/api/rsvp.js       POST: Turnstile verify → validate → D1 insert → Resend email
/functions/api/lookup.js     POST: fuzzy guest/party lookup (never ships full list to client)
/functions/admin/export.js   GET: CSV of RSVPs (Cloudflare Access-protected path)
/schema.sql                  D1 schema (parties, guests, responses)
/assets/art/…  /assets/gallery/…  /assets/fonts/…  /assets/og/…  /vendor/…
/wrangler.toml.example       Pages config template (activated during deploy setup — see §15)
/DEPLOYMENT.md               runbook (§15)
```

### Module contract (unchanged interface, hardened rules)

```js
export default {
  id: 'story',
  title: '01 · Our Story',
  render(section) {…},   // inject semantic interior markup; copy from content.js only
  init(ctx) {…},         // return ONE paused labeled timeline; engine attaches + scrubs
}
// ctx = { section, stage, cfg, viewport, tier, prefersReduced, contentEl }
```

**Engine-enforced rules (from research — violations are review blockers):**
1. Modules never create pinning ScrollTriggers; the engine creates one per section, in
   DOM order, `scrub: true`, `invalidateOnRefresh: true`, function-based `end`.
2. Never nest ScrollTriggers inside timeline tweens.
3. Never animate the pinned stage element itself — only its children. No CSS transforms
   on ancestors of pinned elements.
4. All scroll-mapped movement uses `ease: 'none'`; eases only for intra-scene accents.
5. All layout-dependent tween values are function-based (`x: () => -(track.scrollWidth - innerWidth)`).
6. Transform/opacity only in scrubbed tweens. No filters, no stroke-width, no `d`.
7. `will-change` is toggled by the engine on scene enter/leave — never blanket CSS.
8. Horizontal walks: wide flex track, `x` to measured distance, `end: () => '+=' + dist`,
   `anticipatePin: 1`; captions inside a walk use `containerAnimation`.
9. Stage heights are `100svh` (with `100vh` fallback). Never `dvh` on pinned scenes.
10. Reduced motion (via `gsap.matchMedia`): **no Lenis, no pins, no scrubbed motion** —
    every scene `gsap.set` to its final, fully-legible state; only gentle opacity fades
    allowed. The resting DOM of every scene must be complete and readable with zero JS
    animation (this doubles as the no-JS story).
11. SVG scenes: simplified paths, staggered group draws (few paths repainting per frame),
    modest rendered area; decorative SVGs get `aria-hidden="true" focusable="false"`.
12. Boot: `Promise.all([document.fonts.ready, window load]) → init scenes → ScrollTrigger.refresh()`.
    `ScrollTrigger.config({ ignoreMobileResize: true })`. Explicit dimensions on every image.
13. Menu jumps: registry of per-scene triggers; target = `st.start` (or `st.labelToScroll`)
    computed fresh per jump, driven through `lenis.scrollTo` (native under reduced motion);
    `history.replaceState` for the hash; after arrival, focus moves to the scene heading
    (`tabindex="-1"`, `focus({ preventScroll: true })`).
14. Interactive elements must not exist in mid-scene hidden states where Tab would
    scroll-desync the scrub — keep focusables at scene rest states, or intercept focus
    and route through `goTo`.
15. `content-visibility: auto` is banned on animated/pinned sections (allowed on Details).
16. `img`: `loading="lazy" decoding="async"`; scrub-revealed photos pre-warmed with
    `img.decode()` when the previous scene activates.

---

## 4 · Visual system

- **Palette:** limestone `#f4f0e8` · ivory `#faf7f1` · stone `#cfc6b8` (decorative only) ·
  warm gray **`#6f6759`** (darkened from v1 — the original `#8a8276` failed WCAG AA on
  limestone for small text) · ink `#191713` · muted green `#5a6353`.
  Every text/background pair must pass **AA 4.5:1** (grandparents use this site).
- **Type:** Cormorant Garamond for names/titles/dates (display only — never for
  addresses, times, or form labels); Inter ≥ 16–18px body for all logistics and UI.
  Letter-spaced uppercase micro-labels for wayfinding.
- **Texture:** near-invisible grain, hairline rules, square corners, soft large shadows.
- **Illustration continuity:** Jason — short dark hair, gray at sides, strong eyebrows,
  clean-cut, friendly smile. Nicole — long center-parted hair, hoop earrings, delicate
  necklace, warm laugh, slightly shorter. Jagger — mini Bordoodle, curly, simplified.
  Cleo — cocker spaniel, slim, stubbed tail. Single-weight black line, no fills/shading.
- **Identity assets (new in v2):** N+J monogram SVG (finale + favicon + apple-touch-icon);
  SVG favicon with dark-mode media query inside + 180×180 opaque apple-touch-icon +
  32×32 ico; **OG image 1200×630** (safe zone 1080×600) + 2400×1260 export for full-width
  iMessage bubbles — monogram + names + date artwork until engagement photos exist.
- **Venue constants:** The Barnes Foundation, 2025 Benjamin Franklin Parkway,
  Philadelphia, PA 19130 · `39.9606° N, 75.1728° W` · **Saturday**, June 12, 2027.

---

## 5 · Content architecture (`js/content.js`)

Single exported object; agents interpolate, never hardcode. Status flags:
**[REAL]** shipped with true researched content · **[TBD]** structured placeholder
awaiting the couple.

- **Hero/entrance:** names, date, venue, city [REAL]
- **Our Story:** First Date (Sept 2022, Sassafras; Negroni + tequila soda as visual
  details) [REAL from brief]; Walk Home Old City [REAL]; Early Memories captions
  (Dogs Meet Oct 2022, Thanksgiving, Hanukkah, trips…) [REAL from brief];
  Engagement — no invented details [TBD]
- **Wedding:** ceremony/cocktails/reception times [TBD]; venue + arrival guidance
  ("please arrive 20–30 minutes early") [REAL pattern]
- **Weekend:** Fri welcome / Sat wedding / Sun farewell [TBD events, REAL structure]
- **Philadelphia [REAL, researched]:**
  - *Getting here:* PHL airport (~20–30 min to Center City; SEPTA Airport Line option);
    **Amtrak 30th Street Station** featured for NYC (~1:15) / DC (~1:45) guests;
    rideshare is the default advice.
  - *Stay:* neighborhood guide — Logan Square (walk to the Barnes; The Logan as natural
    anchor), Rittenhouse Square, Center City; hotel-block details [TBD].
  - *Parking:* Barnes on-site garage (Pennsylvania Ave between 20th & 21st) [validation
    TBD]; overflow: Rodin Place, Dalian on the Park, Franklin Institute garages.
  - *Explore:* Rodin Museum (adjacent), Philadelphia Museum of Art, Franklin Institute,
    Rittenhouse Square, Reading Terminal Market, Old City/Independence Hall.
- **Details/FAQ [REAL skeleton, ~16 canonical questions]:** attire ([TBD label] + plain-
  English sentence + "please avoid white/ivory"), plus-one policy wording, kids policy
  wording options, arrival time, parking/transport, indoor/outdoor (Barnes is indoor,
  air-conditioned, fully ADA accessible), **weather note** ("Philadelphia in June is
  warm — low 80s daytime, upper 60s evenings, chance of a passing shower; the
  celebration is indoors and air-conditioned"), photos/unplugged [TBD], livestream
  [TBD], RSVP deadline [TBD — recommend ~May 1–8, 2027], registry line ("Your presence
  is the greatest gift…") + links [TBD], contact [TBD], hashtag [TBD/likely skip].
- **RSVP copy:** lookup prompts, plus-one wording, decline kindness ("We'll miss you!"),
  escape hatch ("Prefer the old-fashioned way? Email/call …" [TBD contact]).

---

## 6 · RSVP product spec (upgraded from v1's naive form)

**Data model — party/household (industry standard):**
`parties` (id, display_name, max_seats, plus_one) · `guests` (id, party_id, full_name,
nicknames) · `responses` (guest_id, attending, meal [TBD if plated], dietary, note,
updated_at) + `submissions` audit rows (ip, created_at).

**Flow:** guest types name → `functions/api/lookup.js` fuzzy-matches (nicknames,
hyphenations, spouse surname; server-side — the guest list never ships to the browser;
no other parties revealed) → shows their party + only their invited events → per-person
accept/decline + dietary → confirmation screen with summary + **add-to-calendar** +
confirmation email (if provided) → guests can return and **edit until the deadline**
(shows current response). After deadline: graceful closed message with contact escape
hatch — never a broken form. Decline is one tap.

**Until the guest list exists** the same form runs in *open mode* (name + party size
typed manually); flipping to lookup mode = importing a CSV via documented script.

**Protection:** Turnstile invisible widget (free), verified server-side once per
submission; honeypot + length caps; optional free WAF rate rule on `/api/rsvp`;
D1-side dupe check (same IP burst).

**Notification & admin:** on insert, `ctx.waitUntil` fires Resend email to the couple
(D1 remains source of truth; email is best-effort). `/admin/` page + `functions/admin/export.js`
CSV — protected by **Cloudflare Access** (free ≤50 seats; allow-list = the couple's
emails). Zero-code fallback: D1 console in the Cloudflare dashboard.

**Accessibility:** large inputs, inline plain-language errors, no timeouts, 44px
targets, works at 200% zoom, human escape hatch on every dead end.

---

## 7 · Utilities & launch hygiene (new in v2)

- **Add-to-calendar:** static `.ics` per event + all-events file — `TZID=America/New_York`
  with full `VTIMEZONE`, stable `UID`s, `GEO:39.9606;-75.1728`, LOCATION with full
  address, attire + URL in DESCRIPTION, CRLF/folding correct — plus Google Calendar
  template links. Offered in Wedding exhibit, Details, and RSVP confirmation.
- **Countdown:** small, typographic, on the entrance title wall (no flip-clock).
- **Maps:** every address is a tappable maps link; `tel:` links for phones.
- **Analytics:** Cloudflare Web Analytics beacon (manual snippet; cookie-free, no banner).
- **`_headers`:** immutable 1-year cache on `/vendor/*` + `/assets/fonts/*`;
  `X-Robots-Tag: noindex`; nosniff, frame-deny, referrer, permissions policy; CSP
  allowing only `'self'` + `challenges.cloudflare.com` (Turnstile) +
  `static.cloudflareinsights.com` (analytics), `style-src 'unsafe-inline'` for inline
  SVG styling.
- **`404.html`** in-voice ("This gallery doesn't exist — return to the exhibition").
- **`_redirects`:** `/rsvp → /#ex-rsvp` etc. for printable short links.

## 8 · Privacy posture

`noindex` meta + header + robots.txt (site reachable only by invitation URL, invisible
to search — OG previews still work). RSVP protected by name lookup (that *is* the auth
layer). No home addresses/personal phones published. **Decision for the couple:**
optional site-wide shared-passphrase gate (pretty passphrase page, signed HttpOnly
cookie, 90-day expiry, via `functions/_middleware.js`) — zero cost, guest-friendly,
covers preview URLs too; adds one step for every guest. Default if no answer: no gate,
noindex only.

## 9 · Performance budgets & test matrix

- Budgets: JS (vendor+app, gzipped) < 180 KB · fonts < 200 KB total · LCP < 2.5s on
  4G mid-tier mobile · CLS ≈ 0 (explicit dimensions everywhere) · every scene ≥ ~55fps
  on a 6× CPU-throttled profile; canvas fallback considered only where a DOM scene
  fails that bar.
- Matrix: Chrome/Safari/Edge desktop (wheel + trackpad), iOS Safari (incl. Low Power
  60→30fps behavior), Android Chrome, keyboard-only pass, 200% zoom pass,
  reduced-motion pass, `pages.dev` preview smoke on real phone.

## 10 · Responsive choreography

Desktop: 4–5 layers, long pins, full perspective turns. Tablet: 3–4 layers, shortened
lateral runs. Mobile: 2–3 layers, spans ×0.7, no hover dependencies, occlusion kept
only where it hides swaps; horizontal walks may swap to native scroll-snap strips via
`gsap.matchMedia` where testing shows pin fatigue. Same hierarchy, same story.

---

## 11 · Agent work packages (ownership + acceptance criteria)

Shared files (`index.html`, tokens/base css, `js/core/*`, `js/main.js`, `js/content.js`)
belong to the **integrator**; exhibit agents read them, never write.

**A — Entrance (00):** `js/exhibits/entrance.js`, `styles/exhibits/entrance.css`, `assets/art/loader/*`
Loader states A–F (point → PHL·coords·date metadata → construction lines → plan bends
to corridor via CSS perspective → warm materials → title wall + countdown + "scroll to
enter"). Lobby directory = real `<nav>` → `goTo()`. ✓ criteria: loads scrolled-to-top
idle state breathes; fully scroll-controlled; reduced-motion = crossfade to title +
directory; keyboard reaches every directory link.

**B — Our Story (01):** `js/exhibits/story.js`, css, `assets/art/story/*`
Doorway occlusion entrance → First Date SVG scene draw-on (DrawSVG, staggered groups)
→ line escapes frame → Walk Home 3-layer parallax walk ← → Early Memories 6-piece
micro-wall → Engagement quiet feature (line art ↔ photo placeholder crossfade) → pull
back + exit occlusion. ✓: figures match continuity spec; ≤ few paths repaint per frame;
captions from content.js; scene readable at rest.

**C — The Wedding (02):** `js/exhibits/wedding.js`, css, `assets/art/wedding/*`
Horizontal walk (function-based distances, `containerAnimation` captions): Ceremony
(bright/formal) → column-occlusion → Cocktail Hour (garden-adjacent) → Reception
(warm, restrained). Original simplified Barnes-inspired SVG architecture. Add-to-
calendar link. ✓: reads as walking past installations, not a carousel; no neon; times
render from content.js [TBD-safe].

**D — Weekend + Philadelphia (03–04):** `js/exhibits/weekend.js`, `philly.js`, css, `assets/art/philly/*`
Weekend: world moves ↑, Fri/Sat/Sun pause centered. Philadelphia: exit line grows
nodes → editorial transit-diagram (MotionPath route; explicitly not Google Maps);
nodes Stay/Eat/Explore/Getting Here/Parking expand on arrival, keyboard-accessible;
Barnes anchors the route. ✓: all researched travel content surfaces; node panels are
real text; map SVG modest-area.

**E — Gallery + Details (05–06):** `js/exhibits/gallery.js`, `details.js`, css, `assets/gallery/manifest.json`
Gallery: manifest-driven wall, varied frame sizes, 3–4 focus pieces with group-scale
approach/pull-back, `img.decode()` pre-warm, elegant placeholders until photos exist.
Details: unpinned reading room; native `<details>` accordions for the full FAQ set;
`content-visibility` allowed here. ✓: no clicks required for progression; AA contrast;
FAQ content complete from content.js.

**F — RSVP (07) + backend:** `js/exhibits/rsvp.js`, css, `functions/api/*.js`, `functions/admin/export.js`, `schema.sql`
Emptying scene → point returns → DrawSVG monogram resolve → form per §6 (open mode
now, lookup-ready) → confirmation + .ics + "See you at the Barnes." Function: Turnstile
verify → validate → D1 insert → waitUntil Resend. Without bindings: 503 `{setup:false}`
→ UI shows warm email fallback, never fake success. ✓: keyboard/zoom/error-state pass;
schema matches §6; export endpoint emits CSV.

**Integrator:** shared files, persistent UI (brand / `03 · 07` context / MENU /
progress hairline), occlusion handoffs between exhibits, will-change toggling, focus
management, noscript block, OG/favicons/.ics files, `_headers`/`_redirects`/404,
final audits.

## 12 · QA gates (every package, then integration)

1. Engine-rules review (§3 list — any violation blocks merge)
2. Playwright journey: scroll 0→100% at 1440×900 and 390×844, screenshot per exhibit,
   zero console errors, menu-jump to each exhibit lands correctly, RSVP validates
3. Keyboard-only + reduced-motion + 200% zoom passes
4. Guardrails check (brief §17) + decision filter ("would it still be elegant slower?")
5. Scroll-fatigue read: continuous scroll of the whole site takes 3–5 min at natural pace

## 13 · Delivery & deployment runbook (detail in DEPLOYMENT.md)

1. Build on `claude/website-rebuild-plan-2p9zz4` → draft PR #3 → **automatic preview URL** per push.
2. Merge to `main` → existing Pages project auto-deploys (no build command, output `/`).
3. One-time backend setup (dashboard or wrangler, ~20 min, documented step-by-step):
   D1 create (+preview DB) + `schema.sql` → activate `wrangler.toml` from the example
   (the file becomes the single source of truth for bindings once present) → Turnstile
   widget (domain + pages.dev) → secrets (`TURNSTILE_SECRET`, `RESEND_API_KEY`) →
   Resend domain verify → Access app for `/admin*` → custom domain + Always Use HTTPS →
   Web Analytics beacon → optional passphrase gate + WAF rate rule.
4. Post-launch: photos → `assets/gallery/` + manifest; guest-list CSV import → lookup
   mode; content edits → `js/content.js` only.

## 14 · Risk register

| Risk | Mitigation |
|---|---|
| iOS Safari pin jank / address-bar thrash | `ignoreMobileResize`, svh stages, native touch scroll, no normalizeScroll, real-device preview testing |
| SVG draw scenes stutter on low-end phones | staggered group draws, modest SVG area, tier system downgrades to group reveals |
| Layer explosion / GPU memory | engine-toggled will-change, ≤5 promoted layers per active scene |
| Menu jumps mis-land after resize | function-based ends, fresh `st.start` per jump, `invalidateOnRefresh` |
| RSVP spam / abuse | Turnstile + honeypot + rate rule + D1 dupe check |
| Email notification silently fails | D1 is source of truth; admin export + dashboard console always available |
| Couple's content arrives late | [TBD] placeholders are elegant + structured; content.js single edit point |
| Preview URLs publicly guessable | noindex headers everywhere; optional middleware gate covers previews |

## 15 · What only Nicole + Jason can provide ([TBD] until then)

Ceremony/cocktail/reception times · weekend events · RSVP deadline (rec. ~May 1, 2027)
· plus-one & kids policies · meal choices (if plated) · attire label · registry links ·
contact email (rec. dedicated address on the wedding domain) · hashtag/unplugged call ·
livestream yes/no · hotel block(s) + cutoff · engagement details/photo · photography ·
guest list CSV (whenever ready — site works in open mode meanwhile) · custom domain
name · passphrase-gate yes/no · Resend/Turnstile accounts (or hand over API keys
during setup).
