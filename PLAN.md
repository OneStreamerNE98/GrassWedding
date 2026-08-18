# NICOLE + JASON — THE WEDDING EXHIBITION
## Build Plan · v3 (post-review reset)

**What changed from v2:** the v2 site shipped and was reviewed on a real deployment
(screenshots, desktop + mobile, full scroll journey). Verdict: the museum concept
works — the execution doesn't. v3 keeps the exhibition/navigation idea, **deletes all
carried-over story content from the original site**, rebuilds every page from scratch
around the basic wedding facts only, adds a **Registry** page, and replaces invented
line-art "scenes" with a photography-first design where **Jason supplies the images**
(exact spec in §6). Backend (D1 + Turnstile + passphrase gate + RSVP) is **live and
verified** — nothing in v3 touches it.

> North star, unchanged: *"The information is the exhibition. The architecture is the
> navigation. The scroll is the walk."* — but executed with restraint. Polish comes
> from typography, spacing, and light — not from more drawing.

---

## 1 · Review findings (why v2 feels unpolished)

Observed on the deployed preview at 1440×900 and 390×844:

| # | Finding | Lesson for v3 |
|---|---|---|
| R1 | Loader/entrance is a beige void with a single dot; reads as *broken*, not cinematic | First screen must be composed and complete at rest: names, date, venue — instantly |
| R2 | "First Date" bar scene and pet/holiday doodles look like clip-art placeholders | **No invented illustration, ever.** Real photos or elegant typography — nothing else |
| R3 | Wedding walk background is overlapping wireframe noise; cards float over scribbles | Backgrounds are quiet (flat tone, one hairline, or a photo). Content is the art |
| R4 | Weekend "spine" is a fat rounded stroke that looks like an error | Motifs must be hairline-weight and purposeful, or absent |
| R5 | Directory lobby gradient "walls" band and look muddy | Fake-3D gradients out; flat planes + soft shadow are what museums actually look like |
| R6 | Gallery is gray monogram rectangles — obvious placeholder | Whole exhibition waits on photos; ship the wall only when photos exist |
| R7 | FAQ + RSVP typography is close to right | The typographic system is the strongest thing on the site — extend it everywhere |
| R8 | Story/weekend/venue copy carried over from the original site | Content reset (§2) — basic wedding facts only until the couple writes new copy |
| R9 | Deployment docs claimed git-connected Pages; project is actually direct-upload | Runbook corrected (§8) — deploys run via `wrangler pages deploy` |

---

## 2 · Content reset (drop / keep)

**KEEP (basic wedding info only):**
- Names: Nicole + Jason
- Date: Saturday, June 12, 2027
- Venue: The Barnes Foundation · Philadelphia, PA (address + maps link + parking garage fact)
- RSVP flow + passphrase gate (live backend)
- Practical FAQ entries that are venue facts, not voice: arrival buffer, indoor/AC,
  ADA accessibility, parking, dress-code placeholder, RSVP-deadline placeholder

**DROP (everything inherited or invented — remove from `js/content.js` and the DOM):**
- Our Story in its entirety: First Date/Sassafras, Walk Home/Old City, all six
  "Early Memories" pieces, engagement caption
- The Weekend Fri/Sat/Sun schedule (returns only when the couple defines real events)
- Philadelphia editorial guide (Stay/Eat/Explore neighborhoods content) — replaced by
  a compact, factual **Travel** panel (airport, train, rideshare, parking, maps links)
- All line-art scene SVGs (`assets/art/*`) and their exhibit choreography
- Weather prose, hashtag/livestream/photos FAQ filler

**Pages after the reset** (exhibition numbering stays — museum feel intact):

| № | Exhibition | Status at launch |
|---|---|---|
| 00 | Entrance — names, date, venue, countdown, directory | rebuilt |
| 01 | The Wedding — ceremony / cocktails / reception, add-to-calendar | rebuilt, times TBD-safe |
| 02 | Travel — getting here, parking, hotels-TBD | rebuilt, compact |
| 03 | **Registry — NEW (§5)** | new |
| 04 | Details — FAQ reading room | rebuilt from kept facts |
| 05 | RSVP — existing working form, restyled to match | keep + reskin |
| — | Our Story / Gallery | **hidden entirely** until real photos + real copy arrive; slots reserved in nav config |

---

## 3 · Design language: "professional museum," precisely

The museum metaphor stays and gets *more* literal — real museums are typography,
white space, and light. The design system:

- **Wall text, not scenes.** Each exhibition opens with a museum wall-text panel:
  eyebrow (`EXHIBITION 01`), display title, one short paragraph. Set in the existing
  Cormorant/Inter pairing — that part of v2 already works (R7).
- **Object labels.** Every fact block (ceremony time, hotel, registry item) is styled
  as a museum object label: small caps label, title, one or two lines, hairline rule.
  One component, reused everywhere — consistency is the polish.
- **Flat planes + shadow, no fake 3D.** Section backgrounds alternate limestone/ivory
  with a soft, wide drop shadow at each seam ("room change"). No gradient walls (R5).
- **One accent moment per page, maximum.** E.g. the entrance gets the drawn N+J
  monogram (single DrawSVG moment); every other section limits itself to fades,
  small translates, and the progress hairline. Delete per-scene choreography (R2–R4).
- **Photography carries the emotion.** Every panel is designed around an image slot
  with a defined aspect ratio (§6). Until a photo exists the slot renders as a clean
  framed mat with a small centered monogram — intentional, not "missing."
- **AA contrast everywhere; Inter ≥16px for logistics; 44px touch targets** (unchanged
  from v2 — these survive).

---

## 4 · Scroll & navigation — final approach (simplified and explained)

The v2 engine (per-section ScrollTrigger pins + Lenis smoothing + goTo() registry) is
sound engineering and stays. What changes is *how much* it is asked to do.

**How it works, in plain terms:**
1. The page is one vertical document; each exhibition is a `<section>`.
2. Lenis softens wheel scrolling (`lerp ≈ 0.12`, native on touch). This alone provides
   most of the "gliding through a building" feel.
3. Only sections that need a held moment get **pinned** (the screen "stops" while
   scroll progress drives a short animation). v3 pins **two** places: the Entrance
   (title → directory reveal) and the RSVP monogram resolve. Everything else scrolls
   normally with **reveal-on-enter** transitions (fade + 20–30px rise, once, ~600ms) —
   the standard professional pattern, cheap and reliable on phones.
4. Navigation = the persistent **MENU → Exhibitions directory** overlay plus the
   `01/05` wayfinding indicator. Every directory row scrolls the page to that
   section (`lenis.scrollTo`), updates the hash (`/#registry`), and moves focus to the
   section heading. Deep links and `_redirects` short links (`/rsvp`, `/registry`) land
   on the right room. Reduced-motion visitors get instant jumps and no pins at all.
5. **Progress hairline** along the viewport edge continues (it's subtle and works).

**Why fewer pins:** pinned scrub scenes are where v2 spent its effort and where it
looks worst on phones (address-bar resizing, jank, half-scrolled states with stray
artwork). Two pins keep the signature museum moments; the rest of the polish budget
goes to typography and imagery, which is what guests actually perceive as quality.

**What Jason can do himself here (optional):** section order, section copy, and the
directory labels all live in `js/content.js`; reveal timing/dampening constants live
in `js/core/config.js` with comments. Changing any of those requires no animation
knowledge. Anything involving ScrollTrigger stays in agent-owned files.

---

## 5 · Registry page (new — Exhibition 03)

- Content model in `js/content.js`:
  ```js
  registry: {
    intro: 'Exhibition 03 · Registry',
    note: 'Your presence is the greatest gift. For those who wish…',  // couple's words TBD
    stores: [ { name: 'Zola', url: 'https://…', blurb: '' }, … ],      // TBD links
    fund: { title: 'Honeymoon fund', url: '', blurb: '' },             // optional
  }
  ```
- Rendered as a row of **object-label cards** (store name, one line, "Visit registry →"
  external link, `rel="noopener"`). No prices, no product feeds, no iframes — links out
  to the registries, which is both the classy and the low-maintenance standard.
- Registry links are [TBD] — the page ships with the note + placeholder cards that
  render only when a `url` is present (empty array = graceful "details to follow" line).
- Appears in directory nav, `_redirects` gets `/registry`, FAQ "Where are you
  registered?" answer links to the section.

---

## 6 · Image spec — exactly what Jason supplies, and exactly when

Drop files into `assets/photos/` using these names; the site picks them up via
`assets/photos/manifest.js` (agent maintains the manifest; Jason just sends files).
**Rules for all:** JPG (or HEIC→JPG), sRGB, quality ~80, no filters/borders/text
baked in. Landscape unless noted. Long edge sizes below are minimums; bigger is fine.

The **"Needed by"** column names the build-phase checkpoint (§7). Claude explicitly
asks for each batch at that checkpoint — nothing has to be prepared before it's
requested, and nothing blocks earlier phases. Priority meanings:
**Required** = the launch design counts on it · **Optional** = enhances a page that
already works without it · **Future** = unlocks a hidden section whenever it arrives.

| Slot | File name | Aspect | Size (px) | Needed by | Priority | Notes |
|---|---|---|---|---|---|---|
| Entrance hero | `hero.jpg` | 3:2 landscape | 2400×1600 | **Checkpoint A — start of P4** | Required | The one big photo. Engagement shot or the two of you; calm background, subject centered-ish (must survive a 4:5 crop on mobile) |
| Entrance hero (mobile alt) | `hero-portrait.jpg` | 4:5 portrait | 1600×2000 | Checkpoint A — start of P4 | Optional | Only if the landscape crop loses the subject; Claude checks the crop at P4 and asks for this only if needed |
| The Wedding — venue | `venue.jpg` | 3:2 | 2000×1333 | **Checkpoint A — start of P4** | Required | The Barnes exterior or Parkway; can be a licensed/own photo |
| Ceremony label card | `ceremony.jpg` | 1:1 | 1200×1200 | Checkpoint B — during P4 | Optional | Detail shot (rings, invitation, flowers) |
| Reception label card | `reception.jpg` | 1:1 | 1200×1200 | Checkpoint B — during P4 | Optional | Detail shot |
| Travel card | `philly.jpg` | 3:2 | 2000×1333 | Checkpoint B — during P4 | Optional | Skyline/Parkway photo replaces any drawn skyline |
| Registry note | `registry.jpg` | 1:1 | 1200×1200 | Checkpoint B — during P4 | Optional | Small; e.g. the dogs |
| OG/share image | *(generated by Claude from `hero.jpg`)* | 1.91:1 | 1200×630 | automatic, in P4 | — | Auto-composited with names + date; also 2400×1260 export. Jason supplies nothing |
| Our Story / Gallery set | `story-01.jpg` … `story-NN.jpg` | any mix | 1600 long edge | Checkpoint C — any time after launch | Future | 8–20 photos + a caption list (one line each, plain text). Unlocks the hidden Story/Gallery exhibitions in a follow-up phase |

**Timeline summary for Jason:**
1. **Nothing is needed during P0–P3** — those phases build with placeholder mats.
2. **Checkpoint A (start of P4):** Claude asks for the two required photos
   (`hero.jpg`, `venue.jpg`). This is the only hard ask before launch. If they're not
   ready, launch can still proceed on placeholder mats — Claude will say clearly
   which pages will show mats.
3. **Checkpoint B (during P4):** Claude lists which optional slots are still empty;
   send any, or none.
4. **Checkpoint C (post-launch, whenever):** the Story/Gallery photo set — no
   deadline; the sections stay hidden until it arrives.

Anything not supplied simply keeps its framed-mat placeholder — the site never looks
broken while waiting.

---

## 7 · Orchestration (phased, gated, reviewable)

Each phase = one focused PR against a preview deploy, reviewed on a phone before the
next begins. No parallel exhibit agents this time — v2's eight-agents-eight-scenes
structure is where inconsistency came from. **One integrator agent owns the design
system; phases are sequential.**

| Phase | Work | Gate to pass |
|---|---|---|
| **P0 — Purge** | Remove dropped content from `content.js`; delete `assets/art/*`, story/weekend/philly/gallery exhibit modules + CSS; nav reduced to the §2 page list; site still deploys clean | No console errors; every remaining page renders; RSVP still works |
| **P1 — System** | Build the design-system pieces once: wall-text panel, object label, framed image slot w/ placeholder mat, seam shadow, reveal-on-enter helper | A styleguide test page shows every component; AA contrast checked |
| **P2 — Pages** | Rebuild Entrance, Wedding, Travel, Registry, Details, RSVP skin — in that order, from the system components only | Phone + desktop screenshot review per page (Jason approves each) |
| **P3 — Motion** | The two pins (entrance, RSVP monogram), Lenis tuning, menu/goTo focus management, reduced-motion pass | Keyboard-only + reduced-motion + 200% zoom pass; no jank on real phone |
| **P4 — Media** | **Opens with Checkpoint A: Claude requests `hero.jpg` + `venue.jpg` (§6 specs) and lists empty optional slots (Checkpoint B).** Photos in; OG image composited; hidden Story/Gallery unlocked only if the Checkpoint C set exists | LCP < 2.5s on 4G profile; CLS ≈ 0 |
| **P5 — Launch QA** | Playwright journey (scroll 0→100%, menu-jump each section, RSVP submit, 390×844 + 1440×900, zero console errors); content proofread; DEPLOYMENT.md updated | All green → merge → production deploy + smoke test on grass.wedding |

**Division of labor:** Claude does all code phases; Jason approves P2 screenshots,
supplies §6 images, registry links, and the TBD facts (times, dress code, RSVP
deadline, contact email) whenever ready — every one of them is a `content.js` edit
that can land in any later phase without rework.

---

## 8 · Engineering foundations that carry over (do not rebuild)

- **Backend, live and verified:** D1 (`wedding-rsvp` + preview), schema applied;
  Turnstile invisible widget (sitekey in content.js, secret bound); passphrase gate
  middleware (`SITE_PASSPHRASE` set); `RSVP_EMAIL_TO/FROM` bound; Resend key pending
  (email off until then — D1 is source of truth). `scripts/setup_cloudflare.py` is
  idempotent for re-runs.
- **Deploys:** the Pages project is **direct-upload** (not git-connected). Deploy =
  `npx wrangler pages deploy . --project-name=grasswedding --branch=<branch>`
  (preview) or `--branch=main` (production). Optionally connect the repo to Pages in
  the dashboard later for push-to-deploy; until then the runbook stands.
- **Engine rules** (v2 §3 list) remain review blockers for whatever motion survives:
  transform/opacity only, function-based ends, no nested triggers, `svh` stages,
  engine-owned `will-change`, `ignoreMobileResize`, fonts-ready boot.
- **Headers/privacy:** noindex posture, CSP, immutable caching, `_redirects` — keep,
  extend with `/registry`.
- Performance budgets and the QA matrix from v2 §9/§12 apply at P5.
