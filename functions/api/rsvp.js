// POST /api/rsvp — functions/api/rsvp.js
//
// Validate → (optional) Turnstile verify → D1 insert → (optional) Resend
// notification. D1 is the source of truth (PLAN.md §6); email is
// best-effort only and its failure is swallowed. Without a D1 binding the
// endpoint returns 503 {setup:false} so the frontend can show a warm
// fallback instead of ever faking success.

const MAX_NAME = 200;
const MAX_TEXT = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_WINDOW_SECONDS = 60;
const RATE_LIMIT = 4; // >4 inserts from one IP in the window trips the limiter

export async function onRequestPost({ request, env, waitUntil }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  if (!body || typeof body !== 'object') {
    return json({ error: 'bad_request' }, 400);
  }

  // Honeypot — bots that fill a field real guests never see get a
  // fake-neutral 200 so they have no signal to react to.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json({ ok: true }, 200);
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const dietary = typeof body.dietary === 'string' ? body.dietary.trim() : '';
  const note = typeof body.note === 'string' ? body.note.trim() : '';
  const attending = body.attending;
  const rawSeats = body.seats;

  if (!name || name.length >= MAX_NAME) {
    return json({ error: 'invalid_name' }, 400);
  }
  if (email.length >= MAX_TEXT || (email && !EMAIL_RE.test(email))) {
    return json({ error: 'invalid_email' }, 400);
  }
  if (dietary.length >= MAX_TEXT || note.length >= MAX_TEXT) {
    return json({ error: 'invalid_length' }, 400);
  }
  if (typeof attending !== 'boolean') {
    return json({ error: 'invalid_attending' }, 400);
  }
  const seats = Number.isInteger(rawSeats) ? rawSeats : Number.parseInt(rawSeats, 10);
  if (!Number.isInteger(seats) || seats < 1 || seats > 10) {
    return json({ error: 'invalid_seats' }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP') || '';

  if (env.TURNSTILE_SECRET) {
    const token = typeof body['cf-turnstile-response'] === 'string' ? body['cf-turnstile-response'] : '';
    const verified = await verifyTurnstile(env.TURNSTILE_SECRET, token, ip);
    if (!verified) {
      return json({ error: 'turnstile_failed' }, 403);
    }
  }

  if (!env.RSVP_DB) {
    return json({ setup: false }, 503);
  }

  // Dupe-soften: a burst of submissions from one IP in a short window reads
  // as a script, not a guest re-reading the form five times in a minute.
  if (ip) {
    const recent = await env.RSVP_DB.prepare(
      `SELECT COUNT(*) AS n FROM responses WHERE ip = ? AND created_at > datetime('now', ?)`
    )
      .bind(ip, `-${RATE_WINDOW_SECONDS} seconds`)
      .first();
    if (recent && recent.n > RATE_LIMIT) {
      return json({ error: 'rate_limited' }, 429);
    }
  }

  await env.RSVP_DB.prepare(
    `INSERT INTO responses (name, email, attending, seats, dietary, note, ip)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(name, email || null, attending ? 1 : 0, seats, dietary || null, note || null, ip || null)
    .run();

  if (env.RESEND_API_KEY) {
    waitUntil(notifyCouple(env, { name, email, attending, seats, dietary, note }));
  }

  return json({ ok: true }, 200);
}

async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  try {
    const form = new URLSearchParams();
    form.set('secret', secret);
    form.set('response', token);
    if (ip) form.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const data = await res.json();
    return !!(data && data.success === true);
  } catch {
    return false;
  }
}

async function notifyCouple(env, entry) {
  try {
    const from = env.RSVP_EMAIL_FROM || 'RSVP <rsvp@updates.grasswedding.com>';
    const to = (env.RSVP_EMAIL_TO || 'nicole.and.jason@example.com')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const subject = `RSVP: ${entry.name} — ${entry.attending ? 'Attending' : 'Regrets'}`;
    const lines = [
      `Name: ${entry.name}`,
      entry.email ? `Email: ${entry.email}` : null,
      `Attending: ${entry.attending ? 'Yes' : 'No'}`,
      `Party size: ${entry.seats}`,
      entry.dietary ? `Dietary: ${entry.dietary}` : null,
      entry.note ? `Note: ${entry.note}` : null,
    ].filter(Boolean);

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, text: lines.join('\n') }),
    });
  } catch {
    // Best-effort only — D1 is already the source of truth by this point.
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
