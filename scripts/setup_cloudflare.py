#!/usr/bin/env python3
"""One-time Cloudflare setup for the wedding site. Python 3 stdlib only.

Run from anywhere (the repo is not required):

  CLOUDFLARE_API_TOKEN='cfat_...' \
  SITE_PASSPHRASE='...' \
  RSVP_EMAIL_TO='a@example.com,b@example.com' \
  python3 setup_cloudflare.py

Optional env: RESEND_API_KEY (email notifications), PROJECT (Pages project
name, auto-detected when the account has exactly one), DOMAIN (default
grass.wedding).

What it does (all idempotent — safe to re-run):
  1. Verifies the token and finds the account + Pages project
  2. Connects DOMAIN + www to the Pages project and creates DNS records
     (skipped with a warning if the zone isn't in the account yet)
  3. Turns on Always Use HTTPS for the zone
  4. Creates D1 databases wedding-rsvp + wedding-rsvp-preview, applies schema
  5. Creates an invisible Turnstile widget for the domain + pages.dev
  6. Writes Pages bindings/secrets: RSVP_DB, TURNSTILE_SECRET,
     SITE_PASSPHRASE, RSVP_EMAIL_TO/FROM, RESEND_API_KEY (if given)
  7. Prints the Turnstile SITE KEY — paste that back to Claude so it can be
     committed into js/content.js (that deploy also activates the bindings)

Nothing is stored by this script; secrets go only to Cloudflare.
"""

import json
import os
import sys
import urllib.request
import urllib.error

API = 'https://api.cloudflare.com/client/v4'
TOKEN = os.environ.get('CLOUDFLARE_API_TOKEN', '')
DOMAIN = os.environ.get('DOMAIN', 'grass.wedding')

SCHEMA = [
    """CREATE TABLE IF NOT EXISTS parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL,
  max_seats INTEGER NOT NULL DEFAULT 1,
  plus_one INTEGER NOT NULL DEFAULT 0
)""",
    """CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  party_id INTEGER REFERENCES parties(id),
  full_name TEXT NOT NULL,
  nicknames TEXT
)""",
    """CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id INTEGER REFERENCES guests(id),
  party_id INTEGER REFERENCES parties(id),
  name TEXT NOT NULL,
  email TEXT,
  attending INTEGER NOT NULL,
  seats INTEGER NOT NULL DEFAULT 1,
  dietary TEXT,
  note TEXT,
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)""",
    'CREATE INDEX IF NOT EXISTS idx_responses_created ON responses(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_guests_party ON guests(party_id)',
]


def api(method, path, body=None):
    req = urllib.request.Request(API + path, method=method)
    req.add_header('Authorization', f'Bearer {TOKEN}')
    req.add_header('Content-Type', 'application/json')
    data = json.dumps(body).encode() if body is not None else None
    try:
        with urllib.request.urlopen(req, data=data) as r:
            out = json.load(r)
    except urllib.error.HTTPError as e:
        out = json.load(e)
    if not out.get('success'):
        raise RuntimeError(f'{method} {path} failed: {out.get("errors")}')
    return out.get('result')


def step(msg):
    print(f'\n== {msg}')


def main():
    if not TOKEN:
        sys.exit('Set CLOUDFLARE_API_TOKEN first.')
    passphrase = os.environ.get('SITE_PASSPHRASE', '')
    email_to = os.environ.get('RSVP_EMAIL_TO', '')
    resend_key = os.environ.get('RESEND_API_KEY', '')

    step('Verifying token')
    try:
        api('GET', '/user/tokens/verify')
    except RuntimeError:
        # Account-owned tokens (cfat_...) can't call /user/* — the /accounts
        # call below verifies them instead.
        print('   (account-owned token — skipping user verify)')
    accounts = api('GET', '/accounts')
    if not accounts:
        sys.exit('Token sees no accounts — check its Account permissions.')
    acct = accounts[0]['id']
    print(f'   account: {accounts[0]["name"]}')

    step('Finding Pages project')
    projects = api('GET', f'/accounts/{acct}/pages/projects')
    want = os.environ.get('PROJECT')
    if want:
        proj = next((p for p in projects if p['name'] == want), None)
    elif len(projects) == 1:
        proj = projects[0]
    else:
        proj = next((p for p in projects if 'grass' in p['name'].lower()), None)
    if not proj:
        sys.exit(f'Could not pick a project from {[p["name"] for p in projects]} — set PROJECT=name and re-run.')
    pname = proj['name']
    pages_host = f'{pname}.pages.dev'
    print(f'   project: {pname} ({pages_host})')

    step(f'Looking up zone {DOMAIN}')
    zones = api('GET', f'/zones?name={DOMAIN}')
    zone = zones[0]['id'] if zones else None
    if not zone:
        print(f'   !! {DOMAIN} is not in this Cloudflare account yet.')
        print('   Buy/add it (dashboard > Domain Registration), then re-run — skipping domain steps.')

    if zone:
        step('Connecting custom domains to the Pages project')
        existing = {d['name'] for d in api('GET', f'/accounts/{acct}/pages/projects/{pname}/domains')}
        for host in (DOMAIN, f'www.{DOMAIN}'):
            if host in existing:
                print(f'   {host}: already attached')
            else:
                api('POST', f'/accounts/{acct}/pages/projects/{pname}/domains', {'name': host})
                print(f'   {host}: attached')

        step('Ensuring DNS records')
        records = api('GET', f'/zones/{zone}/dns_records?per_page=100')
        have = {r['name'] for r in records}
        for host in (DOMAIN, f'www.{DOMAIN}'):
            if host in have:
                print(f'   {host}: record exists')
            else:
                api('POST', f'/zones/{zone}/dns_records', {
                    'type': 'CNAME', 'name': host, 'content': pages_host, 'proxied': True,
                })
                print(f'   {host}: CNAME -> {pages_host}')

        step('Enabling Always Use HTTPS')
        try:
            api('PATCH', f'/zones/{zone}/settings/always_use_https', {'value': 'on'})
            print('   on')
        except RuntimeError as e:
            print(f'   !! skipped ({e})')
            print('   Enable manually: dashboard > zone > Rules > Settings > Always Use HTTPS,')
            print('   or re-run with a token that has Zone Settings:Edit.')

    step('Creating D1 databases + schema')
    dbs = {d['name']: d['uuid'] for d in api('GET', f'/accounts/{acct}/d1/database?per_page=100')}
    ids = {}
    for dbname in ('wedding-rsvp', 'wedding-rsvp-preview'):
        if dbname in dbs:
            ids[dbname] = dbs[dbname]
            print(f'   {dbname}: exists')
        else:
            created = api('POST', f'/accounts/{acct}/d1/database', {'name': dbname})
            ids[dbname] = created['uuid']
            print(f'   {dbname}: created')
        for stmt in SCHEMA:
            api('POST', f'/accounts/{acct}/d1/database/{ids[dbname]}/query', {'sql': stmt})
        print(f'   {dbname}: schema applied')

    step('Turnstile widget')
    widgets = api('GET', f'/accounts/{acct}/challenges/widgets?per_page=50') or []
    widget = next((w for w in widgets if DOMAIN in (w.get('domains') or [])), None)
    if widget:
        print(f'   exists: sitekey {widget["sitekey"]}')
        secret = widget.get('secret')  # only returned on create/rotate
        if not secret:
            print('   (existing widget: secret not re-readable — rotating to fetch a fresh one)')
            rotated = api('POST', f'/accounts/{acct}/challenges/widgets/{widget["sitekey"]}/rotate_secret',
                          {'invalidate_immediately': True})
            secret = rotated['secret']
    else:
        widget = api('POST', f'/accounts/{acct}/challenges/widgets', {
            'name': 'wedding-rsvp',
            'domains': [DOMAIN, pages_host],
            'mode': 'invisible',
        })
        secret = widget['secret']
        print(f'   created: sitekey {widget["sitekey"]}')

    step('Writing Pages bindings + secrets (production and preview)')
    def env_vars(db_id):
        out = {
            'TURNSTILE_SECRET': {'type': 'secret_text', 'value': secret},
            'RSVP_EMAIL_FROM': {'type': 'plain_text', 'value': f'Nicole + Jason RSVP <rsvp@{DOMAIN}>'},
        }
        if passphrase:
            out['SITE_PASSPHRASE'] = {'type': 'secret_text', 'value': passphrase}
        if email_to:
            out['RSVP_EMAIL_TO'] = {'type': 'plain_text', 'value': email_to}
        if resend_key:
            out['RESEND_API_KEY'] = {'type': 'secret_text', 'value': resend_key}
        return out

    api('PATCH', f'/accounts/{acct}/pages/projects/{pname}', {
        'deployment_configs': {
            'production': {
                'env_vars': env_vars(ids['wedding-rsvp']),
                'd1_databases': {'RSVP_DB': {'id': ids['wedding-rsvp']}},
            },
            'preview': {
                'env_vars': env_vars(ids['wedding-rsvp-preview']),
                'd1_databases': {'RSVP_DB': {'id': ids['wedding-rsvp-preview']}},
            },
        },
    })
    print('   done')

    print('\n' + '=' * 60)
    print('SETUP COMPLETE. Paste this line back to Claude:')
    print(f'  TURNSTILE_SITEKEY={widget["sitekey"]}')
    print('=' * 60)
    print('Notes:')
    print('- Bindings/secrets apply on the NEXT deployment (Claude will trigger')
    print('  one by committing the sitekey into js/content.js).')
    if not zone:
        print(f'- Re-run after adding {DOMAIN} to the account to connect the domain.')
    if not resend_key:
        print('- Email alerts are off until a RESEND_API_KEY is set (re-run with it')
        print('  or add it later in Pages > Settings > Variables); RSVPs still store in D1.')
    if passphrase:
        print('- The passphrase gate is now ACTIVE on the next deploy.')
    print('- You can now delete/revoke the API token in the Cloudflare dashboard.')


if __name__ == '__main__':
    main()
