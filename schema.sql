-- RSVP schema — party/household model (industry standard).
-- The form runs in "open mode" until parties/guests are imported; once the guest
-- list CSV is loaded, the lookup endpoint switches the UI to name-lookup mode.

CREATE TABLE IF NOT EXISTS parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,          -- "The Grass Family", "Sam Lee & Guest"
  max_seats INTEGER NOT NULL DEFAULT 1,
  plus_one INTEGER NOT NULL DEFAULT 0  -- 1 if party includes an unnamed guest seat
);

CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  party_id INTEGER REFERENCES parties(id),
  full_name TEXT NOT NULL,
  nicknames TEXT                        -- comma-separated alternates for fuzzy lookup
);

CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id INTEGER REFERENCES guests(id),  -- NULL in open mode
  party_id INTEGER REFERENCES parties(id), -- NULL in open mode
  name TEXT NOT NULL,                      -- as typed/confirmed
  email TEXT,
  attending INTEGER NOT NULL,              -- 1 yes / 0 no
  seats INTEGER NOT NULL DEFAULT 1,        -- open mode party size
  dietary TEXT,
  note TEXT,
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_responses_created ON responses(created_at);
CREATE INDEX IF NOT EXISTS idx_guests_party ON guests(party_id);
