// Navigation chrome: dot rail with progress rings, chapter readout,
// slide-in Exhibitions/About panels, jumps, deep links, focus management.

import { TUNING } from './config.js';
import { CONTENT } from '../content.js';

const RING_C = 69.1; // circumference of r=11 ring

export function buildNav({ chapters, lenis, reduced }) {
  const body = document.body;

  /* ----- chrome: brand / readout / menu buttons ----- */
  body.insertAdjacentHTML('beforeend', `
    <div class="chrome chrome--brand"><a href="#ch-${chapters[0].id}" data-goto="${chapters[0].id}">N + J</a></div>
    <div class="chrome chrome--readout" aria-hidden="true">
      <div class="readout__title"></div>
      <div class="readout__bar"><i></i></div>
    </div>
    <div class="chrome chrome--menu">
      <button type="button" data-panel="chapters">Exhibitions</button>
      <button type="button" data-panel="about">About</button>
    </div>
    <nav class="navDots" aria-label="Exhibitions">
      ${chapters.map((c, i) => `
        <button class="navDots__dot" type="button" data-goto="${c.id}" aria-label="${c.num} · ${c.title}">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <circle class="ring-bg" cx="13" cy="13" r="11"></circle>
            <circle class="ring-fg" cx="13" cy="13" r="11"></circle>
          </svg><i></i>
        </button>`).join('')}
    </nav>
    <div class="navPanel__backdrop"></div>
    <aside class="navPanel navPanel--chapters" role="dialog" aria-modal="true" aria-label="Exhibitions">
      <button class="navPanel__close" type="button">Close</button>
      <h2 class="tH2 navPanel__title">Exhibitions</h2>
      <ul class="navPanel__chapters">
        ${chapters.map((c) => `
          <li data-ch="${c.id}"><a href="#ch-${c.id}" data-goto="${c.id}">
            <span class="num">${c.num}</span><span class="ttl">${c.title}</span>
          </a></li>`).join('')}
      </ul>
      <div class="navPanel__foot">${CONTENT.nav.chaptersFoot}</div>
    </aside>
    <aside class="navPanel navPanel--about" role="dialog" aria-modal="true" aria-label="About">
      <button class="navPanel__close" type="button">Close</button>
      <h2 class="tH2 navPanel__title">About</h2>
      <div class="navPanel__about">
        ${CONTENT.nav.about.map((p) => `<p>${p}</p>`).join('')}
      </div>
      <div class="navPanel__foot">${CONTENT.nav.aboutFoot}</div>
    </aside>`);

  const readoutTitle = body.querySelector('.readout__title');
  const readoutBar = body.querySelector('.readout__bar i');
  const dots = [...body.querySelectorAll('.navDots__dot')];
  const rings = dots.map((d) => d.querySelector('.ring-fg'));
  const panelBtns = [...body.querySelectorAll('.chrome--menu button')];
  const panels = { chapters: body.querySelector('.navPanel--chapters'), about: body.querySelector('.navPanel--about') };
  const backdrop = body.querySelector('.navPanel__backdrop');
  const listItems = [...body.querySelectorAll('.navPanel__chapters li')];

  /* ----- panels ----- */
  let openPanel = null, lastFocus = null;
  function setPanel(name) {
    if (openPanel) { panels[openPanel].classList.remove('is-open'); }
    openPanel = name;
    backdrop.classList.toggle('is-open', !!name);
    if (name) {
      lastFocus = document.activeElement;
      panels[name].classList.add('is-open');
      panels[name].querySelector('.navPanel__close').focus();
    } else if (lastFocus) { lastFocus.focus(); }
  }
  panelBtns.forEach((b) => b.addEventListener('click', () => setPanel(b.dataset.panel)));
  Object.values(panels).forEach((p) => p.querySelector('.navPanel__close').addEventListener('click', () => setPanel(null)));
  backdrop.addEventListener('click', () => setPanel(null));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openPanel) setPanel(null);
    if (e.key === 'Tab' && openPanel) { // simple focus trap
      const f = panels[openPanel].querySelectorAll('button, a[href]');
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });

  /* ----- jumps ----- */
  function targetOf(id) {
    const sec = document.getElementById('ch-' + id);
    return sec ? sec.getBoundingClientRect().top + window.scrollY + 2 : 0;
  }
  function goTo(id, { instant = false } = {}) {
    setPanel(null);
    const y = targetOf(id);
    if (reduced || instant || !lenis) {
      window.scrollTo({ top: y, behavior: 'auto' });
    } else {
      lenis.scrollTo(y, { duration: TUNING.jumpDuration, easing: (t) => 1 - Math.pow(1 - t, 3) });
    }
    history.replaceState(null, '', '#ch-' + id);
    const h = document.querySelector(`#ch-${id} h1, #ch-${id} h2`);
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  body.addEventListener('click', (e) => {
    const g = e.target.closest('[data-goto]');
    if (g) { e.preventDefault(); goTo(g.dataset.goto); }
  });

  /* ----- state fed by the engine ----- */
  let current = -1;
  return {
    goTo,
    setProgress(i, p) {
      if (rings[i]) rings[i].style.strokeDashoffset = String(RING_C * (1 - p));
      if (i === current) readoutBar.style.transform = `scaleX(${p})`;
    },
    setCurrent(i) {
      if (i === current) return;
      if (current >= 0) rings[current].style.strokeDashoffset = String(RING_C);
      current = i;
      dots.forEach((d, j) => d.classList.toggle('is-active', j === i));
      listItems.forEach((li, j) => li.classList.toggle('is-current', j === i));
      const c = chapters[i];
      readoutTitle.textContent = c ? `${c.num} — ${c.title}` : '';
    },
  };
}
