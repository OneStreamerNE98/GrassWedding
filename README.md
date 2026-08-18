# Nicole + Jason — The Wedding Exhibition

**Saturday, June 12, 2027 · The Barnes Foundation · Philadelphia**

A single continuous-scroll "museum exhibition" wedding website, rebuilt to closely
mimic the framework of Getty's [*Tracing Art*](https://www.getty.edu/tracingart/).

## Current state

**Chunks 1–2 are merged to `main`:** the Tracing-Art-style framework plus the real
content pour — six chapters (Entrance · The Wedding · Travel · Registry · Details ·
RSVP), all copy from `js/content.js`, unknown facts as "to follow" placeholders,
working RSVP form wired to the live D1 + Turnstile backend. Site-wide passphrase
gate is active. **Production (grass.wedding) may lag `main`** — deploys are manual
(direct upload, see `DEPLOYMENT.md`); Chunk 2 is reviewable on its preview at
`chunk2.grasswedding.pages.dev` until Jason approves the production push.
Remaining: real photography (ASSETS.md checkpoints), registry links and other
facts as Jason supplies them, hidden Our Story chapter (post-launch).

## Documents

| File | What it is |
|---|---|
| **`PLAN.md`** | The build plan (v5): chunks, framework spec, content mapping, image checkpoints |
| **`DEPLOYMENT.md`** | Deploy + backend runbook — what's configured and how to operate it |
| **`ASSETS.md`** | The photos Nicole + Jason supply: exact files, sizes, and when |
| **`docs/reference/tracing-art.md`** | Teardown of the reference site — the spec we bump the build against |
| `docs/archive/` | Superseded plans and the original design brief (historical only) |

## Stack

Static, **no build step**: vanilla ES modules + GSAP (ScrollTrigger) + Lenis, all
vendored in `/vendor`. Self-hosted fonts. Cloudflare Pages Functions (`/functions`)
+ D1 power the RSVP; `functions/_middleware.js` is the passphrase gate.

## Layout

```
index.html              shell: loader, <main> (chapters render here), noscript
js/main.js              entry — waits for vendors + fonts, boots the engine
js/core/config.js       TUNING knobs (lerp, pace, palette, heights) — safe to edit
js/core/engine.js       Lenis+GSAP single loop, chapter build, progress, debug HUD
js/core/nav.js          dot rail, chapter readout, slide-in panels, jumps
js/core/scenes.js       scene builders: intro · bgRoom · steps · zoom · pair · reading · rsvp
js/content.js           ALL site copy + the CHAPTERS list — the file Jason edits
styles/framework.css    the whole visual system (light/dark palettes)
assets/specimen/        stand-in imagery (removed when real photos land)
functions/              RSVP API, guest lookup, passphrase gate, admin export
scripts/setup_cloudflare.py   idempotent one-time backend setup (already run)
```

## Local preview

```bash
python3 -m http.server 8080          # static only
npx wrangler pages dev .             # with functions + local D1
```

## Deploy

The Pages project is **direct-upload** (not git-connected). See `DEPLOYMENT.md`.

```bash
npx wrangler pages deploy . --project-name=grasswedding --branch=main   # production
npx wrangler pages deploy . --project-name=grasswedding --branch=<name> # preview URL
```

## Editing

- Motion/feel: numbers in `js/core/config.js` (commented; no animation knowledge needed)
- Words: `js/content.js` only
- Debug overlay: append `?debug=1` to the URL
