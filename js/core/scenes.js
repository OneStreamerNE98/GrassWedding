// Scene builders. Each returns { el } after rendering into the chapter section,
// and exposes init(ctx) to create its animation. All scrubbed motion is
// transform/opacity only; scrub is 1 (cinematic catch-up), never `true`.

import { TUNING } from './config.js';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function objLabel(l) {
  return `<div class="objLabel">
    <div class="kicker">${esc(l.kicker)}</div>
    <div class="title">${esc(l.title)}</div>
    ${(l.lines || []).map((x) => `<p>${esc(x)}</p>`).join('')}
  </div>`;
}

// Shared credits popup (the reference's fixed bottom-right creditsPopup),
// opened by a small ring button on an image.
let creditsPopupEl = null;
function attachCredit(stage, text) {
  if (!creditsPopupEl) {
    creditsPopupEl = el(`
      <div class="creditsPopup" role="dialog" aria-label="Image credit">
        <p class="creditsPopup__text"></p>
        <button class="creditsPopup__close" type="button" aria-label="Close credit">×</button>
      </div>`);
    document.body.appendChild(creditsPopupEl);
    creditsPopupEl.querySelector('.creditsPopup__close')
      .addEventListener('click', () => creditsPopupEl.classList.remove('is-open'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') creditsPopupEl.classList.remove('is-open');
    });
  }
  const btn = el(`<button class="creditBtn" type="button" aria-label="Image credit">i</button>`);
  stage.appendChild(btn);
  btn.addEventListener('click', () => {
    creditsPopupEl.querySelector('.creditsPopup__text').textContent = text;
    creditsPopupEl.classList.add('is-open');
  });
}

function breakoutBtn(b) {
  return `<a class="breakoutBtn" href="${esc(b.href)}" target="_blank" rel="noopener">
    <span class="breakoutBtn__label">${esc(b.label)}</span><span class="breakoutBtn__arrow">→</span>
  </a>`;
}

/* ---------- intro ---------- */
export function intro(section, c) {
  // Mirrors the reference landing: centered mark → oversized title →
  // subtitle → one framing sentence → "Scroll down".
  section.appendChild(el(`
    <div class="stage">
      <div class="intro__mono" aria-hidden="true">${esc(c.mono)}</div>
      <div class="intro__inner">
        <h1 class="tH1 intro__names">${esc(c.names)}</h1>
        <div class="tBodyL intro__subtitle">${esc(c.subtitle)}</div>
        <p class="tBody intro__framing">${esc(c.framing)}</p>
      </div>
      <div class="intro__hint"><button class="scrollDown" type="button">${esc(c.hint)} ↓</button></div>
    </div>`));
  return {
    init({ gsap, reduced }) {
      if (reduced) return;
      const s = section;
      gsap.timeline()
        .from(s.querySelector('.intro__mono'), { opacity: 0, y: -16, duration: 0.9, ease: 'smoothE' }, 0.1)
        .from(s.querySelector('.intro__names'), { opacity: 0, y: 34, duration: 1.5, ease: 'silkE' }, 0.25)
        .from(s.querySelector('.intro__subtitle'), { opacity: 0, y: 22, duration: 1.0, ease: 'smoothE' }, 0.85)
        .from(s.querySelector('.intro__framing'), { opacity: 0, y: 18, duration: 0.9, ease: 'smoothE' }, 1.1)
        .from(s.querySelector('.intro__hint'), { opacity: 0, duration: 1.0, ease: 'smoothE' }, 1.5);
      // leave: title drifts up + fades as the first room takes over
      gsap.timeline({
        scrollTrigger: { trigger: s, start: 'top top', end: 'bottom top', scrub: 1 },
      })
        .to(s.querySelector('.intro__inner'), { y: -80, opacity: 0, ease: 'none' }, 0)
        .to(s.querySelector('.intro__hint'), { opacity: 0, ease: 'none' }, 0);
    },
  };
}

/* ---------- bgRoom ---------- */
export function bgRoom(section, c) {
  section.appendChild(el(`
    <div class="stage">
      <div class="bgMedia"><img src="${esc(c.image)}" alt="${esc(c.alt)}" decoding="async"></div>
      <div class="wallText">
        <div class="tLabel">${esc(c.eyebrow)}</div>
        <h2 class="tH2" tabindex="-1">${esc(c.heading)}</h2>
        <p class="tBody">${esc(c.body)}</p>
        ${c.label ? objLabel(c.label) : ''}
        ${c.breakout ? breakoutBtn(c.breakout) : ''}
      </div>
    </div>`));
  if (c.credit) attachCredit(section.querySelector('.stage'), c.credit);
  return {
    init({ gsap, reduced }) {
      if (reduced) return;
      const img = section.querySelector('.bgMedia img');
      gsap.fromTo(img, { scale: 1.12 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
      gsap.from(section.querySelectorAll('.wallText > *'), {
        opacity: 0, y: 30, duration: 1.0, ease: 'smoothE', stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 55%', toggleActions: 'play none none reverse' },
      });
    },
  };
}

/* ---------- steps (pinned passage + timeline bar) ---------- */
export function steps(section, c) {
  section.appendChild(el(`
    <div class="stage">
      <div class="bgMedia"><img src="${esc(c.image)}" alt="${esc(c.alt)}" decoding="async"></div>
      ${c.card ? `
      <div class="titleCard">
        <div class="tLabel">${esc(c.card.kicker)}</div>
        <h2 class="tH2" tabindex="-1">${esc(c.card.title)}</h2>
      </div>` : ''}
      <div class="steps__blocks">
        ${c.steps.map((s) => `
          <div class="stepBlock">
            <div class="tLabel">${esc(s.kicker)}</div>
            <h2 class="tH2">${esc(s.heading)}</h2>
            <p class="tBody">${esc(s.body)}</p>
          </div>`).join('')}
      </div>
      <div class="timelineBar" aria-hidden="true">
        <div class="timelineBar__years">${c.timeline.map((y) => `<span>${esc(y)}</span>`).join('')}</div>
        <div class="timelineBar__line"><i></i></div>
      </div>
    </div>`));
  return {
    init({ gsap, reduced }) {
      if (reduced) return;
      const blocks = [...section.querySelectorAll('.stepBlock')];
      const years = [...section.querySelectorAll('.timelineBar__years span')];
      const line = section.querySelector('.timelineBar__line i');
      const img = section.querySelector('.bgMedia img');
      const card = section.querySelector('.titleCard');
      const n = blocks.length;
      const lead = card ? 1 : 0;     // the title card occupies the first unit
      const units = n + lead;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1,
          onUpdate(self) {
            const idx = Math.min(n - 1, Math.max(0, Math.floor(self.progress * units) - lead));
            years.forEach((y, i) => y.classList.toggle('is-on', i <= idx));
          },
        },
        defaults: { ease: 'none' },
      });
      // slow drift on the held image across the whole passage
      tl.fromTo(img, { scale: 1.06 }, { scale: 1, duration: units }, 0);
      tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: units }, 0);
      if (card) {
        // chapter title card: holds the opening beat, then gives way to step 1
        gsap.from(card, {
          opacity: 0, y: 30, duration: 1.0, ease: 'smoothE',
          scrollTrigger: { trigger: section, start: 'top 60%', toggleActions: 'play none none reverse' },
        });
        tl.to(card, { opacity: 0, y: -30, duration: 0.4 }, 0.55);
      }
      blocks.forEach((b, i) => {
        const at = lead + i;
        tl.fromTo(b, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.28 }, at + 0.06);
        if (i < n - 1) tl.to(b, { opacity: 0, y: -24, duration: 0.24 }, at + 0.76);
      });
    },
  };
}

/* ---------- zoom ---------- */
export function zoom(section, c) {
  section.appendChild(el(`
    <div class="stage">
      <div class="zoom__wrap"><img src="${esc(c.image)}" alt="${esc(c.alt)}" decoding="async" style="transform-origin:${esc(c.origin || '50% 40%')}"></div>
      <div class="zoom__scrim"></div>
      ${c.credit ? `<div class="zoom__credit">${esc(c.credit)}</div>` : ''}
      <div class="zoom__caption">
        <div class="tLabel">${esc(c.caption.kicker)}</div>
        <h2 class="tH2">${esc(c.caption.heading)}</h2>
        <p class="tBody" style="margin:0 auto">${esc(c.caption.body)}</p>
      </div>
    </div>`));
  return {
    init({ gsap, reduced }) {
      if (reduced) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1 },
        defaults: { ease: 'none' },
      });
      tl.fromTo(section.querySelector('.zoom__wrap img'), { scale: 1 }, { scale: TUNING.zoomDepth, duration: 1 }, 0)
        .fromTo(section.querySelector('.zoom__scrim'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.45)
        .fromTo(section.querySelector('.zoom__caption'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3 }, 0.62);
    },
  };
}

/* ---------- pair (+ ledger) ---------- */
export function pair(section, c) {
  section.appendChild(el(`
    <div class="stage">
      <div class="pair__text pair__text--start">
        <div class="tLabel" style="margin-bottom:0.7rem">${esc(c.eyebrow)}</div>
        <div class="tBodyL">${esc(c.textStart)}</div>
      </div>
      <div class="pair__inner">
        <div class="pair__fig pair__fig--l"><figure><img src="${esc(c.left.image)}" alt="${esc(c.left.alt)}" decoding="async"><figcaption>${esc(c.left.caption)}</figcaption></figure></div>
        <div class="pair__fig pair__fig--r"><figure><img src="${esc(c.right.image)}" alt="${esc(c.right.alt)}" decoding="async"><figcaption>${esc(c.right.caption)}</figcaption></figure></div>
      </div>
      <div class="pair__text pair__text--end"><div class="tBodyL">${esc(c.textEnd)}</div></div>
      <button class="pair__ledgerBtn" type="button">${esc(c.ledger.prompt)}</button>
    </div>`));

  const ledger = el(`
    <div class="ledger" role="dialog" aria-modal="true" aria-label="Document viewer">
      <div class="ledger__inner">
        <img src="${esc(c.ledger.image)}" alt="${esc(c.ledger.alt)}" loading="lazy" decoding="async">
        <p class="ledger__caption">${esc(c.ledger.caption)}</p>
        <button class="ledger__close" type="button">Close</button>
      </div>
    </div>`);
  document.body.appendChild(ledger);

  const btn = section.querySelector('.pair__ledgerBtn');
  const closeBtn = ledger.querySelector('.ledger__close');
  const open = () => { ledger.classList.add('is-open'); closeBtn.focus(); };
  const close = () => { ledger.classList.remove('is-open'); btn.focus(); };
  btn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  ledger.addEventListener('click', (e) => { if (e.target === ledger) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ledger.classList.contains('is-open')) close(); });

  return {
    init({ gsap, reduced }) {
      if (reduced) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1 },
        defaults: { ease: 'none' },
      });
      tl.fromTo(section.querySelector('.pair__fig--l'), { x: '-46vw', rotate: -4, opacity: 0.2 }, { x: 0, rotate: 0, opacity: 1, duration: 0.42 }, 0.05)
        .fromTo(section.querySelector('.pair__fig--r'), { x: '46vw', rotate: 4, opacity: 0.2 }, { x: 0, rotate: 0, opacity: 1, duration: 0.42 }, 0.05)
        .to(section.querySelector('.pair__text--start'), { opacity: 0, y: -18, duration: 0.2 }, 0.42)
        .fromTo(section.querySelector('.pair__text--end'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.22 }, 0.55)
        .fromTo(btn, { opacity: 0 }, { opacity: 1, duration: 0.15 }, 0.7);
    },
  };
}

/* ---------- reading room + footer ---------- */
export function reading(section, c) {
  section.appendChild(el(`
    <div class="reading__wrap">
      <header class="reading__head">
        <div class="tLabel">${esc(c.eyebrow)}</div>
        <h2 class="tH2" tabindex="-1">${esc(c.heading)}</h2>
        <p class="tBody">${esc(c.body)}</p>
      </header>
      ${c.note ? `<div class="tBodyL reading__note">${esc(c.note)}</div>` : ''}
      ${(c.labels || []).length ? `<div class="reading__labels">${c.labels.map(objLabel).join('')}</div>` : ''}
      ${c.list ? `
      <div class="dataList">
        <div class="tLabel dataList__title">${esc(c.list.title)}</div>
        <ol>
          ${c.list.items.map((it, i) => `
          <li>
            <span class="num">${String(i + 1).padStart(2, '0')}</span>
            <div>
              ${it.href
                ? `<a class="dataList__link" href="${esc(it.href)}" target="_blank" rel="noopener">
                     <span class="itemTitle">${esc(it.title)}</span>
                     <span class="linkLabel">${esc(it.linkLabel || '')} →</span>
                   </a>`
                : `<div class="itemTitle">${esc(it.title)}</div>`}
              ${it.sub ? `<div class="itemSub">${esc(it.sub)}</div>` : ''}
            </div>
          </li>`).join('')}
        </ol>
        ${c.list.more ? '<div class="ellipsis" aria-hidden="true"><i></i><i></i><i></i></div>' : ''}
      </div>` : ''}
      ${c.final ? `<div class="finalText tH2">${esc(c.final)}</div>` : ''}
      ${c.footerLinks ? `
      <footer class="footer">
        <ul class="footer__list">
          ${c.footerLinks.map((l, i) => `
            <li><a href="${esc(l.href)}" data-preview="${i}">
              <span class="ttl">${esc(l.label)}</span><span class="arrow">→</span>
            </a></li>`).join('')}
        </ul>
        <p class="footer__colophon">${esc(c.colophon)}</p>
      </footer>` : ''}
      <div class="endPad"></div>
    </div>`));

  // follow-mouse previews (desktop garnish; pointer-fine only)
  if (c.footerLinks && matchMedia('(pointer: fine)').matches) {
    const pv = el(`<div class="followPreview" aria-hidden="true"><img alt=""></div>`);
    document.body.appendChild(pv);
    const img = pv.querySelector('img');
    let raf = null, tx = 0, ty = 0, x = 0, y = 0;
    const tick = () => {
      x += (tx - x) * 0.14; y += (ty - y) * 0.14;
      pv.style.transform = `translate(${x + 22}px, ${y - 70}px)` + (pv.classList.contains('is-on') ? ' scale(1)' : ' scale(0.92)');
      raf = requestAnimationFrame(tick);
    };
    section.querySelectorAll('.footer__list a').forEach((a, i) => {
      a.addEventListener('mouseenter', () => { img.src = c.footerLinks[i].preview; pv.classList.add('is-on'); if (!raf) tick(); });
      a.addEventListener('mouseleave', () => { pv.classList.remove('is-on'); cancelAnimationFrame(raf); raf = null; });
      a.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
    });
  }

  return {
    init({ gsap, reduced }) {
      if (reduced) return;
      gsap.utils.toArray(section.querySelectorAll('.reading__head, .reading__note, .objLabel, .dataList, .finalText, .footer__list li')).forEach((n) => {
        gsap.from(n, {
          opacity: 0, y: 26, duration: 0.9, ease: 'smoothE',
          scrollTrigger: { trigger: n, start: 'top 88%', toggleActions: 'play none none reverse' },
        });
      });
    },
  };
}

/* ---------- rsvp (title-card moment, then a normal-flow form) ---------- */
// Talks to functions/api/lookup.js + functions/api/rsvp.js. Never fabricates
// success: a 503 {setup:false} or any failure shows the warm fallback/status
// lines from content. All copy comes from the chapter's content object.

const RSVP_MAX_NAME = 199; // server rejects >= 200
const RSVP_MAX_TEXT = 1999; // server rejects >= 2000
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function rsvp(section, c) {
  const f = c.form;
  const seatOptions = Array.from({ length: f.maxSeats }, (_, i) => i + 1);
  section.appendChild(el(`
    <div class="rsvp__wrap">
      <div class="rsvp__card">
        <div class="tLabel">${esc(c.eyebrow)}</div>
        <h2 class="tH2" tabindex="-1">${esc(c.ask)}</h2>
        <p class="tBody rsvp__deadline">${esc(c.deadline || c.deadlinePlaceholder)}</p>
      </div>

      <form class="rsvpForm" novalidate autocomplete="on">
        <div class="rsvpField">
          <label for="rsvp-name">${esc(f.nameLabel)}</label>
          <input id="rsvp-name" name="name" type="text" autocomplete="name"
                 maxlength="${RSVP_MAX_NAME}" aria-describedby="rsvp-name-error rsvp-party-hint" required>
          <p class="rsvpError" id="rsvp-name-error" role="alert" hidden></p>
          <p class="rsvpHint" id="rsvp-party-hint" hidden></p>
        </div>

        <div class="rsvpField">
          <label for="rsvp-email">${esc(f.emailLabel)} <span class="rsvpHint">${esc(f.emailHint)}</span></label>
          <input id="rsvp-email" name="email" type="email" autocomplete="email"
                 maxlength="${RSVP_MAX_NAME}" aria-describedby="rsvp-email-error">
          <p class="rsvpError" id="rsvp-email-error" role="alert" hidden></p>
        </div>

        <fieldset class="rsvpField rsvpAttending" aria-describedby="rsvp-attending-error">
          <legend>${esc(f.attendingLegend)}</legend>
          <div class="rsvpRadios">
            <label class="rsvpRadio">
              <input type="radio" name="attending" value="yes" required>
              <span>${esc(f.accept)}</span>
            </label>
            <label class="rsvpRadio">
              <input type="radio" name="attending" value="no" required>
              <span>${esc(f.decline)}</span>
            </label>
          </div>
          <p class="rsvpDeclineNote tBodyL" hidden>${esc(c.declineNote)}</p>
          <p class="rsvpError" id="rsvp-attending-error" role="alert" hidden></p>
        </fieldset>

        <div class="rsvpField rsvpField--seats">
          <label for="rsvp-seats">${esc(f.seatsLabel)}</label>
          <select id="rsvp-seats" name="seats">
            ${seatOptions.map((n) => `<option value="${n}">${n}</option>`).join('')}
          </select>
        </div>

        <div class="rsvpField rsvpField--dietary">
          <label for="rsvp-dietary">${esc(f.dietaryLabel)}</label>
          <textarea id="rsvp-dietary" name="dietary" rows="2" maxlength="${RSVP_MAX_TEXT}"></textarea>
        </div>

        <div class="rsvpField">
          <label for="rsvp-note">${esc(f.noteLabel)} <span class="rsvpHint">${esc(f.noteHint)}</span></label>
          <textarea id="rsvp-note" name="note" rows="2" maxlength="${RSVP_MAX_TEXT}"></textarea>
        </div>

        <div class="rsvpHoneypot" aria-hidden="true">
          <label for="rsvp-website">Website</label>
          <input id="rsvp-website" name="website" type="text" tabindex="-1" autocomplete="off">
        </div>

        ${c.turnstileSiteKey
          ? `<div class="cf-turnstile rsvpTurnstile" data-sitekey="${esc(c.turnstileSiteKey)}" data-size="invisible"></div>`
          : ''}

        <button class="breakoutBtn rsvpSubmit" type="submit">
          <span class="breakoutBtn__label rsvpSubmit__label">${esc(f.submit)}</span><span class="breakoutBtn__arrow">→</span>
        </button>
        <p class="rsvpStatus" role="status" aria-live="polite"></p>
      </form>

      <div class="rsvp__success" hidden>
        <div class="finalText tH2">${esc(c.done)}</div>
        <p class="tLabel rsvp__doneDate">${esc(c.doneDate)}</p>
      </div>

      <div class="rsvp__fallback" hidden>
        <p class="tBodyL">${esc(c.fallback)}</p>
      </div>

      <div class="endPad"></div>
    </div>`));

  // Turnstile loads lazily, only as the chapter approaches (regardless of
  // reduced-motion — the observer is framework-independent).
  if (c.turnstileSiteKey) {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      if (!document.querySelector('script[data-turnstile]')) {
        const s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        s.async = true;
        s.defer = true;
        s.dataset.turnstile = '1';
        document.head.appendChild(s);
      }
    }, { rootMargin: '150% 0px' });
    io.observe(section);
  }

  wireRsvpForm(section, c);

  return {
    init({ gsap, reduced }) {
      if (reduced) return; // resting DOM is complete and fully interactive
      gsap.utils.toArray(section.querySelectorAll('.rsvp__card > *, .rsvpForm')).forEach((n) => {
        gsap.from(n, {
          opacity: 0, y: 26, duration: 0.9, ease: 'smoothE',
          scrollTrigger: { trigger: n, start: 'top 88%', toggleActions: 'play none none reverse' },
        });
      });
    },
  };
}

function wireRsvpForm(section, c) {
  const form = section.querySelector('.rsvpForm');
  const success = section.querySelector('.rsvp__success');
  const fallback = section.querySelector('.rsvp__fallback');
  const status = form.querySelector('.rsvpStatus');
  const submitBtn = form.querySelector('.rsvpSubmit');
  const submitLabel = form.querySelector('.rsvpSubmit__label');
  const declineNote = form.querySelector('.rsvpDeclineNote');
  const seatsField = form.querySelector('.rsvpField--seats');
  const seatsSelect = form.querySelector('#rsvp-seats');
  const dietaryField = form.querySelector('.rsvpField--dietary');
  const attendingError = form.querySelector('#rsvp-attending-error');
  const partyHint = form.querySelector('#rsvp-party-hint');
  const nameInput = form.querySelector('#rsvp-name');
  const radios = [...form.querySelectorAll('input[name="attending"]')];

  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      radios.forEach((r) => r.closest('.rsvpRadio').classList.toggle('is-checked', r.checked));
      const declined = radio.checked && radio.value === 'no';
      declineNote.hidden = !declined;
      seatsField.hidden = declined;
      dietaryField.hidden = declined;
      attendingError.hidden = true;
      attendingError.textContent = '';
    });
  });

  // Guest lookup (POST /api/lookup {name}) — in "open" mode this stays silent;
  // once a guest list is imported it greets the party and caps the seat count.
  let lookedUp = '';
  nameInput.addEventListener('blur', async () => {
    const name = nameInput.value.trim();
    if (name.length < 5 || name === lookedUp) return;
    lookedUp = name;
    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await safeJson(res);
      if (!data || data.mode !== 'lookup') { setHint(partyHint, ''); return; }
      if (data.party) {
        setHint(partyHint, c.partyHint
          .replace('{name}', data.party.display_name)
          .replace('{seats}', String(data.party.max_seats)));
        [...seatsSelect.options].forEach((o) => {
          o.hidden = Number(o.value) > data.party.max_seats;
          o.disabled = o.hidden;
        });
        if (Number(seatsSelect.value) > data.party.max_seats) seatsSelect.value = String(data.party.max_seats);
      } else {
        setHint(partyHint, c.lookupMiss);
      }
    } catch {
      // Lookup is a nicety — network trouble just leaves the form in open mode.
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const errors = validateRsvp(form, c);
    applyRsvpErrors(form, errors);
    if (Object.keys(errors).length) {
      focusFirstRsvpError(form, errors);
      setStatus(status, c.errors.checkForm, true);
      return;
    }

    setSubmitting(submitBtn, submitLabel, true, c);
    setStatus(status, c.status.sending, false);

    try {
      const payload = buildRsvpPayload(form);
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
          swapTo(form, fallback, '.tBodyL');
          return;
        }
        throw new Error('unavailable');
      }

      const data = await safeJson(res);
      if (res.ok && data && data.ok) {
        swapTo(form, success, '.finalText');
        return;
      }

      if (res.status === 403) setStatus(status, c.status.verifyFailed, true);
      else if (res.status === 429) setStatus(status, c.status.duplicate, true);
      else if (res.status === 400) setStatus(status, c.status.badRequest, true);
      else throw new Error('failed');
    } catch {
      setStatus(status, c.status.failed, true);
    } finally {
      setSubmitting(submitBtn, submitLabel, false, c);
    }
  });
}

function validateRsvp(form, c) {
  const errors = {};
  const name = form.querySelector('#rsvp-name').value.trim();
  const email = form.querySelector('#rsvp-email').value.trim();
  const attending = form.querySelector('input[name="attending"]:checked');

  if (!name) errors.name = c.errors.name;
  else if (name.length > RSVP_MAX_NAME) errors.name = c.errors.nameLong;
  if (email && !EMAIL_RE.test(email)) errors.email = c.errors.email;
  if (!attending) errors.attending = c.errors.attending;
  return errors;
}

function applyRsvpErrors(form, errors) {
  const map = {
    name: form.querySelector('#rsvp-name'),
    email: form.querySelector('#rsvp-email'),
  };
  for (const [key, input] of Object.entries(map)) {
    const err = form.querySelector(`#rsvp-${key}-error`);
    if (errors[key]) {
      err.textContent = errors[key];
      err.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    } else {
      err.textContent = '';
      err.hidden = true;
      input.setAttribute('aria-invalid', 'false');
    }
  }
  const attendingError = form.querySelector('#rsvp-attending-error');
  attendingError.textContent = errors.attending || '';
  attendingError.hidden = !errors.attending;
}

function focusFirstRsvpError(form, errors) {
  if (errors.name) return form.querySelector('#rsvp-name').focus();
  if (errors.email) return form.querySelector('#rsvp-email').focus();
  if (errors.attending) form.querySelector('input[name="attending"]')?.focus();
}

function buildRsvpPayload(form) {
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

function setSubmitting(btn, label, submitting, c) {
  btn.disabled = submitting;
  btn.setAttribute('aria-busy', submitting ? 'true' : 'false');
  label.textContent = submitting ? c.form.submitting : c.form.submit;
}

function setStatus(el, message, isError) {
  el.textContent = message;
  el.classList.toggle('rsvpStatus--error', !!isError);
}

function setHint(el, message) {
  el.textContent = message;
  el.hidden = !message;
}

function swapTo(form, target, focusSel) {
  form.hidden = true;
  target.hidden = false;
  const focusEl = target.querySelector(focusSel);
  if (focusEl) {
    focusEl.setAttribute('tabindex', '-1');
    focusEl.focus({ preventScroll: true });
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const SCENES = { intro, bgRoom, steps, zoom, pair, reading, rsvp };
