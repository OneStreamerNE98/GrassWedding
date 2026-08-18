// Exhibition 07 · RSVP — js/exhibits/rsvp.js
//
// The walk ends here. The world empties to warm ivory, the loader's point
// returns to center, and a single continuous line (see js/core/line.js)
// resolves into the N+J monogram — the same stroke vocabulary that opened
// the site. Then the form rises into place, settled well before the scroll
// ends so the final ~30% of this exhibit is scroll-idle: nothing keeps
// animating while a guest is trying to type.
//
// Copy comes only from CONTENT.rsvp (js/content.js). Submission talks to
// functions/api/rsvp.js; it never fabricates success.

import { CONTENT } from '../content.js';
import { drawOn, prepDraw, showDrawn } from '../core/line.js';

const MAX_NAME = 199; // server rejects >=200
const MAX_TEXT = 1999; // server rejects >=2000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  id: 'rsvp',
  title: '07 · RSVP',

  render(section) {
    const stage = section.querySelector('.stage');
    const c = CONTENT.rsvp;

    stage.innerHTML = `
      <div class="rsvp-scene">
        <div class="rsvp-panel">
          <svg class="rsvp-monogram line-art" viewBox="0 0 210 246" aria-hidden="true" focusable="false">
            <g class="rsvp-monogram-strokes">
              <path d="M32,200 L32,40" />
              <path d="M20,40 L44,40" />
              <path d="M20,200 L44,200" />
              <path d="M32,52 L108,188" />
              <path d="M108,200 L108,40" />
              <path d="M96,40 L120,40" />
              <path d="M150,40 L190,40" />
              <path d="M170,40 L170,172 C170,204 138,218 110,194" />
              <circle class="rsvp-point" cx="140" cy="118" r="3" />
              <path d="M20,226 L190,226" />
            </g>
          </svg>

          <p class="u-label rsvp-eyebrow">${esc(c.intro)}</p>
          <h2 id="h-rsvp" class="rsvp-title display">${esc(c.ask)}</h2>
          ${c.deadline ? `<p class="rsvp-deadline">${esc(c.deadline)}</p>` : ''}

          <form class="rsvp-form" novalidate autocomplete="on">
            <div class="rsvp-field">
              <label for="rsvp-name">Full name</label>
              <input id="rsvp-name" name="name" type="text" autocomplete="name"
                     maxlength="${MAX_NAME}" aria-describedby="rsvp-name-error" required>
              <p class="rsvp-error" id="rsvp-name-error" role="alert" hidden></p>
            </div>

            <div class="rsvp-field">
              <label for="rsvp-email">Email <span class="rsvp-hint">(optional — for a confirmation)</span></label>
              <input id="rsvp-email" name="email" type="email" autocomplete="email"
                     maxlength="${MAX_NAME}" aria-describedby="rsvp-email-error">
              <p class="rsvp-error" id="rsvp-email-error" role="alert" hidden></p>
            </div>

            <fieldset class="rsvp-field rsvp-attending" aria-describedby="rsvp-attending-error">
              <legend>Will you join us?</legend>
              <div class="rsvp-radio-cards">
                <label class="rsvp-radio-card">
                  <input type="radio" name="attending" value="yes" required>
                  <span>Joyfully accept</span>
                </label>
                <label class="rsvp-radio-card">
                  <input type="radio" name="attending" value="no" required>
                  <span>Regretfully decline</span>
                </label>
              </div>
              <p class="rsvp-decline-note" hidden>${esc(c.declineNote)}</p>
              <p class="rsvp-error" id="rsvp-attending-error" role="alert" hidden></p>
            </fieldset>

            <div class="rsvp-field rsvp-seats-field">
              <label for="rsvp-seats">How many of you?</label>
              <select id="rsvp-seats" name="seats">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>

            <div class="rsvp-field rsvp-dietary-field">
              <label for="rsvp-dietary">Dietary needs</label>
              <textarea id="rsvp-dietary" name="dietary" rows="2" maxlength="${MAX_TEXT}"></textarea>
            </div>

            <div class="rsvp-field">
              <label for="rsvp-note">A note for us <span class="rsvp-hint">(optional)</span></label>
              <textarea id="rsvp-note" name="note" rows="2" maxlength="${MAX_TEXT}"></textarea>
            </div>

            <div class="rsvp-honeypot u-visually-hidden" aria-hidden="true">
              <label for="rsvp-website">Website</label>
              <input id="rsvp-website" name="website" type="text" tabindex="-1" autocomplete="off">
            </div>

            ${c.turnstileSiteKey
              ? `<div class="cf-turnstile rsvp-turnstile" data-sitekey="${esc(c.turnstileSiteKey)}" data-size="invisible"></div>`
              : ''}

            <button class="rsvp-submit" type="submit">
              <span class="rsvp-submit-label">Send our RSVP</span>
            </button>
            <p class="rsvp-status" role="status" aria-live="polite"></p>
          </form>

          <div class="rsvp-success" hidden>
            <p class="rsvp-done display">${esc(c.done)}</p>
            <p class="rsvp-done-date u-label">${esc(c.doneDate)}</p>
          </div>

          <div class="rsvp-fallback" hidden>
            <p>${esc(c.fallback)}</p>
          </div>
        </div>
      </div>
    `;

    if (c.turnstileSiteKey && !document.querySelector('script[data-turnstile]')) {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.defer = true;
      s.dataset.turnstile = '1';
      document.head.appendChild(s);
    }

    wireForm(stage);
  },

  init(ctx) {
    const { section, prefersReduced } = ctx;
    const stage = section.querySelector('.stage');
    const monogram = stage.querySelector('.rsvp-monogram-strokes');
    const eyebrow = stage.querySelector('.rsvp-eyebrow');
    const title = stage.querySelector('.rsvp-title');
    const deadline = stage.querySelector('.rsvp-deadline');
    const form = stage.querySelector('.rsvp-form');
    const reveal = [eyebrow, title, deadline, form].filter(Boolean);

    if (prefersReduced) {
      // No pins, no scrub (engine rule 10) — resting DOM must be complete
      // and legible with zero JS animation: monogram fully drawn, form
      // fully visible and interactive.
      showDrawn(monogram);
      gsap.set(monogram, { autoAlpha: 1, scale: 1 });
      gsap.set(reveal, { autoAlpha: 1, y: 0 });
      return null;
    }

    prepDraw(monogram);
    gsap.set(monogram, { autoAlpha: 0, scale: 0.92, transformOrigin: '50% 50%' });
    gsap.set(reveal, { autoAlpha: 0, y: 28 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

    // The point returns to center.
    tl.to(monogram, { autoAlpha: 1, scale: 1, duration: 0.08 }, 0);

    // A single continuous line resolves into the monogram. autoAlpha (not
    // plain opacity) toggles visibility alongside opacity so the form's
    // fields stay out of the tab order until they are actually revealed —
    // engine rule 14: focusables must never mid-scene desync the scrub.
    drawOn(tl, monogram, { start: 0.08, duration: 0.34, overlap: 0.8 });

    // The form rises into place. This settles by local progress 0.45, so
    // the trailing 55% of the pin's scroll span is deliberately idle —
    // the couple can keep scrolling without fighting the fields, or just
    // stop and fill it in. (It used to settle at 0.7, which left the last
    // stretch of the whole site showing a monogram and nothing else.)
    if (eyebrow) tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.26);
    if (title) tl.to(title, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.30);
    if (deadline) tl.to(deadline, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.34);
    tl.to(form, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.37);

    // Explicit idle pad: forces the timeline's total duration to 1.0 so
    // scroll progress 0.45–1.0 maps to nothing changing at all.
    tl.to({}, { duration: 0.55 }, 0.45);

    return tl;
  },
};

// ---------------------------------------------------------------------------
// Interactive wiring (attached once from render — never from init, which can
// re-run across matchMedia breakpoint changes).

function wireForm(stage) {
  const form = stage.querySelector('.rsvp-form');
  const panel = stage.querySelector('.rsvp-panel');
  const success = stage.querySelector('.rsvp-success');
  const fallback = stage.querySelector('.rsvp-fallback');
  const status = form.querySelector('.rsvp-status');
  const submitBtn = form.querySelector('.rsvp-submit');
  const submitLabel = form.querySelector('.rsvp-submit-label');
  const declineNote = form.querySelector('.rsvp-decline-note');
  const seatsField = form.querySelector('.rsvp-seats-field');
  const dietaryField = form.querySelector('.rsvp-dietary-field');
  const attendingError = form.querySelector('#rsvp-attending-error');
  const radios = [...form.querySelectorAll('input[name="attending"]')];

  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      radios.forEach((r) => {
        r.closest('.rsvp-radio-card').classList.toggle('is-checked', r.checked);
      });
      const declined = radio.checked && radio.value === 'no';
      declineNote.hidden = !declined;
      if (seatsField) seatsField.hidden = declined;
      if (dietaryField) dietaryField.hidden = declined;
      attendingError.hidden = true;
      attendingError.textContent = '';
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const errors = validate(form);
    applyErrors(form, errors);
    if (Object.keys(errors).length) {
      focusFirstError(form, errors);
      setStatus(status, 'Please check the highlighted field below.', true);
      return;
    }

    setSubmitting(submitBtn, submitLabel, true);
    setStatus(status, 'Sending your RSVP…', false);

    try {
      const payload = buildPayload(form);
      if (window.turnstile) {
        try {
          payload['cf-turnstile-response'] = window.turnstile.getResponse() || '';
        } catch {
          // Turnstile not ready — the server rejects a missing token if it
          // requires one; the guest sees the normal error state below.
        }
      }

      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 503) {
        const data = await safeJson(res);
        if (data && data.setup === false) {
          showFallback(form, fallback);
          return;
        }
        throw new Error('unavailable');
      }

      const data = await safeJson(res);
      if (res.ok && data && data.ok) {
        showSuccess(form, success, panel);
        return;
      }

      if (res.status === 403) {
        setStatus(status, 'We couldn’t verify that automatically — please try again.', true);
      } else if (res.status === 429) {
        setStatus(
          status,
          'Looks like this already went through — thank you! If that’s not right, please reach us directly.',
          true
        );
      } else if (res.status === 400) {
        setStatus(status, 'Please double-check the form and try again.', true);
      } else {
        throw new Error('failed');
      }
    } catch {
      setStatus(
        status,
        'Something went wrong on our end. Please try again in a moment, or reach us directly.',
        true
      );
    } finally {
      setSubmitting(submitBtn, submitLabel, false);
    }
  });
}

function validate(form) {
  const errors = {};
  const name = form.querySelector('#rsvp-name').value.trim();
  const email = form.querySelector('#rsvp-email').value.trim();
  const attending = form.querySelector('input[name="attending"]:checked');

  if (!name) {
    errors.name = 'Please tell us your name.';
  } else if (name.length > MAX_NAME) {
    errors.name = 'That name is a little too long.';
  }

  if (email && !EMAIL_RE.test(email)) {
    errors.email = 'That doesn’t look like a valid email — or leave it blank.';
  }

  if (!attending) {
    errors.attending = 'Please let us know if you can join us.';
  }

  return errors;
}

function applyErrors(form, errors) {
  const map = {
    name: form.querySelector('#rsvp-name'),
    email: form.querySelector('#rsvp-email'),
  };
  for (const [key, input] of Object.entries(map)) {
    const el = form.querySelector(`#rsvp-${key}-error`);
    if (errors[key]) {
      el.textContent = errors[key];
      el.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    } else {
      el.textContent = '';
      el.hidden = true;
      input.setAttribute('aria-invalid', 'false');
    }
  }
  const attendingError = form.querySelector('#rsvp-attending-error');
  if (errors.attending) {
    attendingError.textContent = errors.attending;
    attendingError.hidden = false;
  } else {
    attendingError.textContent = '';
    attendingError.hidden = true;
  }
}

function focusFirstError(form, errors) {
  if (errors.name) return form.querySelector('#rsvp-name').focus();
  if (errors.email) return form.querySelector('#rsvp-email').focus();
  if (errors.attending) {
    const first = form.querySelector('input[name="attending"]');
    if (first) first.focus();
  }
}

function buildPayload(form) {
  const data = new FormData(form);
  return {
    name: String(data.get('name') || '').trim(),
    email: String(data.get('email') || '').trim(),
    attending: data.get('attending') === 'yes',
    seats: Number.parseInt(data.get('seats'), 10) || 1,
    dietary: String(data.get('dietary') || '').trim(),
    note: String(data.get('note') || '').trim(),
    website: String(data.get('website') || ''),
  };
}

function setSubmitting(btn, label, submitting) {
  btn.disabled = submitting;
  btn.setAttribute('aria-busy', submitting ? 'true' : 'false');
  label.textContent = submitting ? 'Sending…' : 'Send our RSVP';
}

function setStatus(el, message, isError) {
  el.textContent = message;
  el.classList.toggle('rsvp-status--error', !!isError);
}

function showSuccess(form, successEl, panel) {
  form.hidden = true;
  successEl.hidden = false;
  if (panel) panel.classList.add('is-success');
  const heading = successEl.querySelector('.rsvp-done');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

function showFallback(form, fallbackEl) {
  form.hidden = true;
  fallbackEl.hidden = false;
  const msg = fallbackEl.querySelector('p');
  if (msg) {
    msg.setAttribute('tabindex', '-1');
    msg.focus({ preventScroll: true });
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}
