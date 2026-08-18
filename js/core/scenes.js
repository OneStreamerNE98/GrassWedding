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

/* ---------- intro ---------- */
export function intro(section, c) {
  section.appendChild(el(`
    <div class="stage">
      <div class="intro__inner">
        <div class="tLabel intro__eyebrow">${esc(c.eyebrow)}</div>
        <h1 class="tH1 intro__names">${esc(c.names)}</h1>
        <div class="tBodyL intro__line">${esc(c.line)}</div>
      </div>
      <div class="intro__hint tLabel">${esc(c.hint)}</div>
    </div>`));
  return {
    init({ gsap, reduced }) {
      if (reduced) return;
      const s = section;
      gsap.timeline()
        .from(s.querySelector('.intro__eyebrow'), { opacity: 0, y: 20, duration: 0.9, ease: 'smoothE' }, 0.1)
        .from(s.querySelector('.intro__names'), { opacity: 0, y: 34, duration: 1.5, ease: 'silkE' }, 0.25)
        .from(s.querySelector('.intro__line'), { opacity: 0, y: 20, duration: 1.0, ease: 'smoothE' }, 0.8)
        .from(s.querySelector('.intro__hint'), { opacity: 0, duration: 1.0, ease: 'smoothE' }, 1.4);
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
      </div>
    </div>`));
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
      const n = blocks.length;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1,
          onUpdate(self) {
            const idx = Math.min(n - 1, Math.floor(self.progress * n));
            years.forEach((y, i) => y.classList.toggle('is-on', i <= idx));
          },
        },
        defaults: { ease: 'none' },
      });
      // slow drift on the held image across the whole passage
      tl.fromTo(img, { scale: 1.06 }, { scale: 1, duration: n }, 0);
      tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: n }, 0);
      blocks.forEach((b, i) => {
        tl.fromTo(b, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.28 }, i + 0.06);
        if (i < n - 1) tl.to(b, { opacity: 0, y: -24, duration: 0.24 }, i + 0.76);
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
      <div class="reading__labels">${c.labels.map(objLabel).join('')}</div>
      <footer class="footer">
        <ul class="footer__list">
          ${c.footerLinks.map((l, i) => `
            <li><a href="${esc(l.href)}" data-preview="${i}">
              <span class="ttl">${esc(l.label)}</span><span class="arrow">→</span>
            </a></li>`).join('')}
        </ul>
        <p class="footer__colophon">${esc(c.colophon)}</p>
      </footer>
      <div class="endPad"></div>
    </div>`));

  // follow-mouse previews (desktop garnish; pointer-fine only)
  if (matchMedia('(pointer: fine)').matches) {
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
      gsap.utils.toArray(section.querySelectorAll('.reading__head, .objLabel, .footer__list li')).forEach((n) => {
        gsap.from(n, {
          opacity: 0, y: 26, duration: 0.9, ease: 'smoothE',
          scrollTrigger: { trigger: n, start: 'top 88%', toggleActions: 'play none none reverse' },
        });
      });
    },
  };
}

export const SCENES = { intro, bgRoom, steps, zoom, pair, reading };
