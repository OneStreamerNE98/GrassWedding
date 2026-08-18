# Deployment & Backend Runbook

Accurate as of the Chunk-1 specimen deploy. The old version of this file assumed a
git-connected Pages project — **that was wrong**: the `grasswedding` Pages project
is **direct-upload**. Nothing deploys on git push; deploys are made with wrangler.

## Deploying

```bash
export CLOUDFLARE_API_TOKEN=...           # account-owned token (cfat_...)
export CLOUDFLARE_ACCOUNT_ID=406a6fc62dd86b0222f5cba7b2cbdb21

# production → grass.wedding
npx wrangler pages deploy . --project-name=grasswedding --branch=main

# preview → <branch>.grasswedding.pages.dev
npx wrangler pages deploy . --project-name=grasswedding --branch=my-branch
```

- No build command; output directory is the repo root.
- `wrangler.toml` is the source of truth for bindings (D1 `RSVP_DB`, email vars).
  Because that file exists, dashboard-configured bindings/plain-text vars are
  ignored — secrets set via dashboard/API still apply.
- Optional future upgrade: connect the repo to Pages in the dashboard
  (Workers & Pages → grasswedding → Settings → Builds) for push-to-deploy.

## Backend — already configured and verified

`scripts/setup_cloudflare.py` (idempotent, safe to re-run) has been run against the
account. Current state:

| Piece | State |
|---|---|
| Custom domain | `grass.wedding` + `www` attached to the Pages project; CNAMEs proxied |
| D1 | `wedding-rsvp` (production) + `wedding-rsvp-preview`, schema from `schema.sql` applied |
| Turnstile | Invisible widget for `grass.wedding` + `grasswedding.pages.dev`; sitekey in `js/content.js`, `TURNSTILE_SECRET` bound as a secret |
| Passphrase gate | `functions/_middleware.js`, `SITE_PASSPHRASE` secret set (gate is ACTIVE) |
| RSVP notification | `RSVP_EMAIL_TO`/`RSVP_EMAIL_FROM` set; **email delivery OFF until a `RESEND_API_KEY` is added** — RSVPs always store in D1 regardless |
| Always Use HTTPS | **Not enabled** — needs the dashboard toggle (zone → SSL/TLS → Edge Certificates) or a token with `Zone Settings:Edit` |

Verified end-to-end on a deployed preview: gate accepts the passphrase and sets the
signed cookie, `/api/lookup` responds (open mode), `/api/rsvp` correctly rejects
non-browser posts with `turnstile_failed`.

### Re-running setup

```bash
CLOUDFLARE_API_TOKEN='cfat_...' \
SITE_PASSPHRASE='...' \
RSVP_EMAIL_TO='a@example.com' \
RESEND_API_KEY='re_...' \        # optional; turns email alerts on
python3 scripts/setup_cloudflare.py
```

Notes from real runs: account-owned tokens can't call `/user/tokens/verify` (the
script falls back to `/accounts`); re-running rotates the Turnstile secret and
rewrites it — harmless; the token needs Account permissions for Pages/D1/Turnstile
Edit and (optionally) Zone `DNS:Edit` + `Zone Settings:Edit`.

## Viewing / exporting RSVPs

- Zero-code: Cloudflare dashboard → Storage & Databases → D1 → `wedding-rsvp` →
  Console → `SELECT * FROM responses ORDER BY updated_at DESC;`
- CSV: `/admin/export` endpoint exists in `functions/admin/`; protect the `/admin*`
  path with Cloudflare Access (Zero Trust → Access → self-hosted app, allow-list
  the couple's emails) before relying on it.

## Secrets inventory (Pages project, both environments)

`TURNSTILE_SECRET` · `SITE_PASSPHRASE` · (`RESEND_API_KEY` when provided).
Plain vars `RSVP_EMAIL_FROM`/`RSVP_EMAIL_TO` live in `wrangler.toml`.
