// POST /api/lookup — functions/api/lookup.js
//
// Guest-name lookup for the party/household model (schema.sql, PLAN.md §6).
// Until a guest list is imported (parties/guests empty, or no D1 binding)
// the site runs in "open mode" and the frontend never calls this fuzzily —
// it just lets guests type their own name and party size. Once imported,
// this returns AT MOST the single best-matching party — never the full
// guest list, never any other party.

export async function onRequestPost({ request, env }) {
  if (!env.RSVP_DB) {
    return json({ mode: 'open' });
  }

  const countRow = await env.RSVP_DB.prepare('SELECT COUNT(*) AS n FROM guests').first();
  if (!countRow || !countRow.n) {
    return json({ mode: 'open' });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ mode: 'open' });
  }

  const raw = typeof body?.name === 'string' ? body.name.trim() : '';
  if (raw.length < 5) {
    return json({ mode: 'open' });
  }

  const normalized = normalize(raw);
  const words = normalized.split(' ').filter(Boolean);
  if (!words.length) {
    return json({ mode: 'open' });
  }

  // Every typed word must appear somewhere in the full name or a nickname.
  const conditions = words
    .map(() => `(lower(g.full_name) LIKE ? OR lower(ifnull(g.nicknames, '')) LIKE ?)`)
    .join(' AND ');
  const params = [];
  for (const w of words) params.push(`%${w}%`, `%${w}%`);

  const { results } = await env.RSVP_DB.prepare(
    `SELECT g.id, g.full_name, g.nicknames, g.party_id,
            p.display_name, p.max_seats, p.plus_one
     FROM guests g JOIN parties p ON p.id = g.party_id
     WHERE ${conditions}`
  )
    .bind(...params)
    .all();

  if (!results || !results.length) {
    return json({ mode: 'lookup', party: null });
  }

  let best = results[0];
  let bestScore = -1;
  for (const row of results) {
    const score = matchScore(normalized, normalize(row.full_name), normalize(row.nicknames || ''));
    if (score > bestScore) {
      bestScore = score;
      best = row;
    }
  }

  const { results: guests } = await env.RSVP_DB.prepare(
    'SELECT id, full_name FROM guests WHERE party_id = ? ORDER BY id'
  )
    .bind(best.party_id)
    .all();

  return json({
    mode: 'lookup',
    party: {
      display_name: best.display_name,
      guests: (guests || []).map((g) => ({ id: g.id, full_name: g.full_name })),
      max_seats: best.max_seats,
      plus_one: !!best.plus_one,
    },
  });
}

function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchScore(query, name, nicknames) {
  let score = 0;
  if (name === query) score += 100;
  if (name.includes(query)) score += 20;

  const queryWords = query.split(' ').filter(Boolean);
  const nameWords = new Set(name.split(' ').filter(Boolean));
  const nickWords = new Set(nicknames.split(' ').filter(Boolean));

  for (const w of queryWords) {
    if (nameWords.has(w)) score += 10;
    if (nickWords.has(w)) score += 8;
  }
  return score;
}

function json(obj) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
