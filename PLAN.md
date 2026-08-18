# NICOLE + JASON — THE WEDDING EXHIBITION
## Build Plan · v5 (reference: Getty *Tracing Art*)

**Reference site (the framework to mimic closely):** https://www.getty.edu/tracingart/
Jason picked it; this plan is built from a source-level teardown of that page (its
HTML, CSS, and JS bundle were pulled and analyzed — findings in §1, receipts are the
site's own class names). Prior planning notes are archived at
`docs/archive/PLAN-v4-notes.md` (kept for reference; superseded where this plan
differs, still authoritative for backend/deploy facts and image checkpoints it
defines).

**Very good news from the teardown:** *Tracing Art* is built on **GSAP +
ScrollTrigger + Lenis** — exactly the stack already vendored in this repo. Mimicking
it closely is a page-architecture and choreography job, not a re-platforming job.
(Theirs is a Nuxt/Vue app; ours stays vanilla ES modules — the rendered DOM and
motion are what we're copying, not the build tooling.)

---

## 1 · Teardown: how Tracing Art actually works

**Stack:** Nuxt (SSR) · Lenis smooth scroll (`scrollContent` wrapper) · GSAP +
ScrollTrigger (pins + a small number of scrubs) · `matchMedia` responsive gating ·
images only, no video · one tiny canvas element · `dvh/svh` viewport units ·
`landscapeWarning` overlay on phones in landscape.

**Navigation system (their strongest idea — we copy it wholesale):**
- `navDots` — a fixed vertical **dot rail**, one dot per chapter; the *current* dot
  is a ring that **fills as you progress through that chapter** (`navDots__dotProgress`).
- `navChapter` — fixed current-chapter title + thin progress bar (`navChapter__progressBar`).
- `navPanel--chapters` / `navPanel--about` — slide-in panels: a chapter directory
  and an about/credits panel (`btnAbout`).
- `sectionAnchors` — invisible anchors per chapter for jumps/deep links.
- `pageLoader` → `introTitle` (logo + oversized intro text) opens the page.

**Content patterns (their scene vocabulary, with their class names):**

| Pattern | Class | What it does |
|---|---|---|
| Full-bleed image room | `bgImage` (`__inner`) | Artwork fills the viewport; inner element gently scales/parallaxes on scrub |
| Scrolly steps | `section1…3` + `step2/3/4`, `stepList`, `textBlock(s)`, `textBlockBg` | Pinned background while short text blocks step over it — the storytelling core |
| Artwork zoom | `assetZoom` (`__imgOuter/__imgInner/__imgWrap`, `__gradient`, `__textBlock`) | Scroll-driven slow zoom *into* a painting, gradient scrim, caption block |
| Timeline | `timelineBar` (`__line`, `__year`, `__yearText`) | A horizontal year-line that advances as the story moves through time |
| Split reveal | `husbandAndWife` (`__husband`, `__wife`, `__textStart/__textEnd`) | Two portraits + framing text — a paired-figures moment |
| Handover | `assetTransaction` (`__img1/__img2`), `transactionTitle` | One image gives way to another (artwork changing hands) |
| Expandable document | `ledger` (`__expand`, `__overlay`, `__close`) | A document opens full-screen from the page, with close/expand controls |
| Credits | `creditsPopup`, `imageCredits` | Per-image credit popup — tidy rights handling |
| Footer resources | `footerResources` + `follow-mouse` | Link list; hovering a link floats a preview image that follows the cursor |
| Typography scale | `textH1` (15rem serif) `textH2` (6rem) `textBodyL/M/S`, `textLabelL/S` | Two families: display serif (Bardford) + grotesque sans (Graphik); huge headline scale |
| Reveal util | `js-animEl`, `useFade`, `indexNumber`, `endPad` | Generic fade/rise reveals, numbered sections, scroll breathing room |

**Palette:** near-black stage (`#0c0c0c`) with white text and full-color artwork —
the images provide all the color.

---

## 2 · Mapping: Tracing Art pattern → wedding site

Same skeleton, chapter for chapter; our content poured into their molds:

| Tracing Art | Grass Wedding equivalent |
|---|---|
| `pageLoader` → `introTitle` | Loader → **"Nicole + Jason"** oversized title, date + venue beneath (their logo slot = our monogram) |
| 3 numbered chapters | Exhibitions: **01 The Wedding · 02 Travel · 03 Registry** (+ Details & RSVP as footer-adjacent reading sections, and hidden **Our Story** chapter that unlocks with Checkpoint C photos) |
| `bgImage` full-bleed rooms | Full-bleed engagement/venue photography between text passages |
| `stepList` text blocks over pinned bg | Ceremony → Cocktails → Reception told as steps over a Barnes photo (replaces v4's horizontal gallery walk — this is Getty's vertical equivalent and it's better on mobile) |
| `assetZoom` | The signature moment: slow scroll-zoom into the hero photo (or invitation art), caption fading in |
| `timelineBar` | **Wedding-day timeline** — the year-line becomes an hour-line (4:30 ceremony → evening), advancing as you scroll the day |
| `husbandAndWife` split reveal | **Nicole / Jason paired-portrait moment** (their pattern is literally named for us) |
| `assetTransaction` img1→img2 | Then→now moment (e.g. first photo → engagement photo) — optional, Checkpoint C |
| `ledger` expandable document | The **invitation** (or venue map) opening full-screen; also the pattern for FAQ detail |
| `footerResources` + `follow-mouse` | Footer: RSVP · Registry · Details links with floating photo previews on hover (desktop garnish) |
| `navDots` + `navChapter` + `navPanel` | Exhibition dot rail with progress rings, current-exhibition title readout, slide-in Exhibitions panel — replaces v4's MENU/directory design |
| `creditsPopup` | Photographer credit, if desired |
| `landscapeWarning` | Same |

**Palette decision (the one place we may diverge):** Tracing Art is near-black with
white text. Options: (a) mimic fully — dramatic, gallery-at-night, photos glow; or
(b) keep the limestone/ivory wedding palette on the identical structure. **Default:
(a) full mimicry**, since the instruction is to mimic closely and the dark stage is
a large part of its feel — flag for Jason's veto at the framework review. Typography
maps Bardford→Cormorant Garamond (display serif, huge scale) and Graphik→Inter.

---

## 3 · CHUNK 1 — Framework (mimic, content-free, Jason review gate)

Deliverable: a deployed specimen build that *feels like Tracing Art* with placeholder
imagery (free museum-grade stand-in photos, clearly temporary) and lorem wall text.

1. **Shell:** `pageLoader` → `introTitle` sequence; Lenis `scrollContent` wrapper;
   `overflow-x: clip` (their page also never scrolls sideways natively);
   `sectionAnchors`; `endPad`; `landscapeWarning`.
2. **Nav:** dot rail with per-chapter progress ring · fixed chapter title + progress
   bar · slide-in Exhibitions panel + About panel · deep links (`/rsvp`, `/registry`)
   · keyboard + focus management · reduced-motion: no pins/scrubs, instant jumps,
   complete resting DOM.
3. **Scene vocabulary, built once as components:** `bgImage` room · step-list pinned
   passage · `assetZoom` · `timelineBar` · split reveal · `ledger` expand · footer
   with follow-mouse previews. Each specimen chapter demonstrates 2–3 of them.
4. **Engine rules carried from v4 notes** (still binding): single GSAP-driven loop,
   `autoRaf:false`, `lagSmoothing(0)`, `scrub: 1` not `true`, transform/opacity
   only, function-based ends, `svh` stages, engine-owned `will-change`,
   entrance-completes-in-first-30% pacing, AA contrast (white-on-black passes
   trivially), 44px targets.
5. **Tuning knobs** (`js/core/config.js`): lerp, pace, chapter heights, zoom depth,
   dark/light palette switch — all Jason-editable; `?debug=1` overlay retained.

**Gate:** Jason walks the specimen build on phone + desktop against the real
tracingart page side-by-side; iterate until the mimicry convinces. Playwright
journey green at every iteration.

## 4 · CHUNK 2 — Content pour + CHUNK 3 — Media + CHUNK 4 — Launch QA

- **Chunk 2:** content purge (drop/keep list in archived v4 notes §8 still applies:
  basic wedding facts only), then pour real copy into the chapter molds per §2
  mapping; Registry chapter (model in v4 notes §6); RSVP form reskinned onto the
  dark stage. Per-page screenshot approval.
- **Chunk 3:** image checkpoints — **the checkpoint system in v4 notes §7 stands**,
  with one addition for this art direction: full-bleed background photos want
  **2560px long edge** (hero: 2880×1920). Claude re-states exact needs at
  Checkpoint A. The dark palette is forgiving of placeholder photography, so the
  specimen build is presentable even pre-photos.
- **Chunk 4:** QA matrix + budgets from v4 notes §9, production deploy + smoke test.

## 5 · Carry-over facts (unchanged, from archived notes)

Backend live & verified (D1 + Turnstile + passphrase gate + RSVP; Resend pending) ·
Pages project is direct-upload (`wrangler pages deploy`, `--branch=main` for prod) ·
noindex/CSP/`_redirects` posture · content contract: all words in `js/content.js`,
all images by filename in `assets/photos/`, chapter order one line each in config.
