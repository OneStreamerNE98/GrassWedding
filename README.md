# Nicole + Jason — The Wedding Exhibition

**Saturday, June 12, 2027 · The Barnes Foundation · Philadelphia**

A single continuous-scroll "museum exhibition" wedding website. One vertical scroll
drives a virtual camera through seven exhibitions; the design brief and concept
boards live in `docs/brief/`, and the full build plan in **`PLAN.md`**.

## Stack

Static, **no build step**: vanilla ES modules + GSAP (ScrollTrigger, DrawSVG,
MotionPath) + Lenis, all vendored in `/vendor`. Self-hosted fonts. Cloudflare Pages
Functions (`/functions`) + D1 power the RSVP.

## Editing content

All words live in **`js/content.js`** — edit that file only. Photos go in
`assets/gallery/` + `assets/gallery/manifest.json`.

## Local preview

```bash
npx serve .                    # static only
npx wrangler pages dev .       # with RSVP functions + local D1
```

## Deploy

Push to `main` → Cloudflare Pages auto-deploys (no build command, output = root).
Branch pushes get preview URLs. One-time backend setup: see **`DEPLOYMENT.md`**.
