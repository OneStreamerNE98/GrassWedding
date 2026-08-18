// GET /admin/export — functions/admin/export.js
//
// CSV export of RSVP responses.
//
// IMPORTANT: this path's protection is expected to come from Cloudflare
// Access (Zero Trust → Access → self-hosted app on /admin*, allow-listing
// the couple's own emails — DEPLOYMENT.md §5). Do NOT deploy this without
// an Access policy in front of it; a Pages Function alone is publicly
// reachable by URL. As defense in depth, when env.ADMIN_TOKEN is set this
// handler additionally requires it as a bearer token.

export async function onRequestGet({ request, env }) {
  if (!env.RSVP_DB) {
    return json({ setup: false }, 503);
  }

  if (env.ADMIN_TOKEN) {
    const auth = request.headers.get('Authorization') || '';
    if (!(await timingSafeEqual(auth, `Bearer ${env.ADMIN_TOKEN}`))) {
      return json({ error: 'unauthorized' }, 401);
    }
  }

  const { results } = await env.RSVP_DB.prepare(
    `SELECT id, name, email, attending, seats, dietary, note, ip, created_at, updated_at
     FROM responses
     ORDER BY created_at DESC`
  ).all();

  const columns = [
    'id',
    'name',
    'email',
    'attending',
    'seats',
    'dietary',
    'note',
    'ip',
    'created_at',
    'updated_at',
  ];

  const rows = [columns.join(',')];
  for (const row of results || []) {
    rows.push(columns.map((col) => csvEscape(formatCell(col, row[col]))).join(','));
  }
  const csv = rows.join('\r\n') + '\r\n';

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="rsvp-responses.csv"',
      'Cache-Control': 'no-store',
    },
  });
}

function formatCell(col, value) {
  if (col === 'attending') return value ? 'yes' : 'no';
  return value === null || value === undefined ? '' : value;
}

function csvEscape(value) {
  let s = String(value);
  // Guard against spreadsheet formula injection from guest-supplied text.
  if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
  if (/[",\r\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// Constant-time string comparison via digest equality.
async function timingSafeEqual(a, b) {
  const enc = new TextEncoder();
  const [da, db] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const va = new Uint8Array(da);
  const vb = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
