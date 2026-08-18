// Site-wide passphrase gate — functions/_middleware.js
//
// Optional, couple opt-in (PLAN.md §8, DEPLOYMENT.md §8). Disabled entirely
// until env.SITE_PASSPHRASE is set — the site stays public-but-unlisted
// (noindex only) by default. Once configured, EVERY request — pages,
// assets, and same-origin /api/* calls alike — is gated uniformly behind a
// signed, HttpOnly cookie. Gating /api/* too means the RSVP form's fetch()
// call succeeds without a separate allowlist to keep in sync: a visitor
// only ever reaches the form after already passing the gate page, so their
// cookie is already valid by the time they submit.

const COOKIE_NAME = 'nj_gate';
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days, matches DEPLOYMENT.md §8

export async function onRequest({ request, env, next }) {
  const passphrase = (env.SITE_PASSPHRASE || '').trim();
  if (!passphrase) return next(); // gate off until configured

  const signingKey = env.GATE_SIGNING_KEY || passphrase;
  const expected = await sign(passphrase, signingKey);
  const url = new URL(request.url);

  if (request.method === 'POST' && url.pathname === '/gate') {
    return handleSubmit(request, passphrase, expected);
  }

  const cookies = parseCookies(request.headers.get('Cookie') || '');
  if (cookies[COOKIE_NAME] && timingSafeEqual(cookies[COOKIE_NAME], expected)) {
    return next();
  }

  return gatePage();
}

async function handleSubmit(request, passphrase, expected) {
  let submitted = '';
  try {
    const form = await request.formData();
    submitted = String(form.get('passphrase') || '');
  } catch {
    // malformed body — falls through to the wrong-passphrase gate page
  }

  const normalize = (s) => s.trim().toLowerCase();
  if (normalize(submitted) !== normalize(passphrase)) {
    return gatePage({ wrong: true });
  }

  const headers = new Headers({ Location: '/' });
  headers.append(
    'Set-Cookie',
    `${COOKIE_NAME}=${expected}; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}; Path=/`
  );
  return new Response(null, { status: 302, headers });
}

// ---------------------------------------------------------------------------

async function sign(message, key) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function parseCookies(header) {
  const out = {};
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  });
  return out;
}

function gatePage({ wrong = false } = {}) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Nicole + Jason</title>
<style>
  :root {
    --c-limestone: #f4f0e8;
    --c-ivory: #faf7f1;
    --c-warmgray: #6f6759;
    --c-ink: #191713;
    --c-hairline: rgba(25, 23, 19, 0.18);
    --c-danger: #7c2a20;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    background: var(--c-limestone);
    color: var(--c-ink);
    font-family: Georgia, 'Times New Roman', 'Iowan Old Style', serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1.5rem;
  }
  main {
    width: 100%;
    max-width: 26rem;
    text-align: center;
  }
  h1 {
    font-weight: 400;
    font-size: clamp(2.5rem, 8vw, 4rem);
    letter-spacing: 0.08em;
    margin-bottom: 0.75rem;
  }
  p.tagline {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--c-warmgray);
    margin-bottom: 2.5rem;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: left;
  }
  label {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 0.8125rem;
    letter-spacing: 0.06em;
    color: var(--c-warmgray);
  }
  input[type="password"] {
    width: 100%;
    min-height: 48px;
    padding: 0.85rem 1rem;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 1rem;
    color: var(--c-ink);
    background: var(--c-ivory);
    border: 1px solid var(--c-hairline);
    border-radius: 2px;
  }
  input[type="password"]:focus-visible {
    outline: 2px solid var(--c-ink);
    outline-offset: 2px;
  }
  button {
    min-height: 48px;
    padding: 0.9rem 1.5rem;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: var(--c-ivory);
    background: var(--c-ink);
    border: 0;
    border-radius: 2px;
    cursor: pointer;
  }
  button:focus-visible {
    outline: 2px solid var(--c-ink);
    outline-offset: 3px;
  }
  p.wrong {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 0.875rem;
    color: var(--c-danger);
    margin-top: -0.25rem;
  }
  p.foot {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    color: var(--c-warmgray);
    margin-top: 2.5rem;
  }
</style>
</head>
<body>
  <main>
    <h1>N + J</h1>
    <p class="tagline">The Wedding Exhibition</p>
    <form method="post" action="/gate">
      <div>
        <label for="passphrase">Please enter the passphrase from your invitation</label>
        <input id="passphrase" name="passphrase" type="password" autocomplete="off" autofocus required>
      </div>
      ${wrong ? '<p class="wrong" role="alert">That passphrase didn’t match — please try again.</p>' : ''}
      <button type="submit">Enter</button>
    </form>
    <p class="foot">Saturday, June 12, 2027 &middot; The Barnes Foundation</p>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  });
}
