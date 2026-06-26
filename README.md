# Nicole &amp; Jason — Wedding Website

A single-file, self-contained wedding website — **June 12, 2027 · Hudson Valley, NY**.

Everything lives in `index.html` (inline CSS + JS, no build step). The only other
assets are the loader background video and its poster image.

## Files

- `index.html` — the entire site
- `meadow-loader.mp4`, `meadow-poster.jpg` — loader background

## Local preview

Run any static server from this folder, e.g.:

    npx serve .

…then open the printed URL.

## Deploy (Cloudflare Pages)

Static site — **no build command**, output directory is the repo root (`/`).
Cloudflare Pages serves `index.html` at the root automatically.
