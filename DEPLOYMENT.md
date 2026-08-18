# Deployment Runbook — Cloudflare Pages

The site deploys exactly like the old one: the Pages project is connected to this
GitHub repo with **no build command** and **output directory = repo root**. Every push
to `main` deploys production; every push to any other branch gets a **preview URL**
(`<branch>.<project>.pages.dev`), and the Cloudflare GitHub app comments the link on
the PR. Nothing about that needs to change.

The steps below are the **one-time backend setup** (RSVP storage, spam protection,
email notifications). The site works without them — the RSVP form shows a graceful
"reach us directly" fallback until they're done.

## 1 · D1 databases (RSVP storage)

```bash
npx wrangler login
npx wrangler d1 create wedding-rsvp
npx wrangler d1 create wedding-rsvp-preview
# apply the schema to both:
npx wrangler d1 execute wedding-rsvp --remote --file=./schema.sql
npx wrangler d1 execute wedding-rsvp-preview --remote --file=./schema.sql
```

## 2 · Activate wrangler.toml

Copy `wrangler.toml.example` → `wrangler.toml`, paste the two `database_id`s from
step 1, commit, push. **Note:** from this moment the file is the only source of
bindings for the Pages project (dashboard bindings are ignored) — that's intended.

## 3 · Turnstile (free spam protection)

Cloudflare dashboard → Turnstile → Add widget → mode **Invisible** →
hostnames: your custom domain **and** `<project>.pages.dev`.
Put the **sitekey** in `js/content.js` (`rsvp.turnstileSiteKey`), then:

```bash
npx wrangler pages secret put TURNSTILE_SECRET
```

## 4 · Email notification (Resend, free 3k/mo)

1. Create a Resend account (use the couple's email).
2. Either verify the wedding domain (2 DNS records — DNS is already on Cloudflare),
   or skip verification and deliver only to the account owner's own address.
3. `npx wrangler pages secret put RESEND_API_KEY`
4. Set the from/to addresses in `functions/api/rsvp.js` config block.

D1 is the source of truth — email is best-effort notification only.

## 5 · Viewing / exporting RSVPs

- Zero-code: dashboard → Storage & Databases → D1 → wedding-rsvp → Console →
  `SELECT * FROM responses ORDER BY updated_at DESC;`
- CSV: `/admin/export` endpoint. Protect it first: Zero Trust → Access →
  Applications → Add self-hosted app for path `yourdomain.com/admin*` (and
  `*.pages.dev/admin*`), policy = allow only the couple's email addresses
  (free ≤50 users, email PIN login).

## 6 · Custom domain

Pages project → Custom domains → add apex + www (records auto-created when DNS is
on Cloudflare). Zone: SSL **Full (strict)** + **Always Use HTTPS**.

## 7 · Analytics (optional, cookie-free)

Dashboard → Web Analytics → add site → copy the beacon token into the snippet in
`index.html` (commented block). The CSP in `_headers` already allows it.

## 8 · Optional: passphrase gate (couple's decision)

If the site should require a shared passphrase: create `functions/_middleware.js`
per PLAN.md §8, then `npx wrangler pages secret put SITE_PASSPHRASE`. Covers preview
URLs too. Without it, the site stays public-but-unlisted (noindex everywhere).

## 9 · Optional: WAF rate limit

Zone → Security → WAF → rate limiting rule (free plan includes one):
path `/api/rsvp`, method POST, > 5 requests / 10s per IP → block.

## Local development

```bash
npx wrangler pages dev .        # static site + functions + local D1 (Miniflare)
npx wrangler d1 execute wedding-rsvp --local --file=./schema.sql
```

`.dev.vars` (gitignored) holds local secrets. Turnstile test keys:
sitekey `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`.

## Content updates after launch

- Words/times/FAQ: edit `js/content.js` only.
- Photos: drop files in `assets/gallery/` + add entries to
  `assets/gallery/manifest.json`.
- Guest list: import CSV per `schema.sql` notes to switch RSVP from open mode to
  name-lookup mode.
