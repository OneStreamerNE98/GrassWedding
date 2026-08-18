// Navigation chrome, mirroring the reference wireframe exactly:
// - 40px rounded hamburger button, top-right (their nav__btnAbout)
// - right-center rail: 5px dots; the active dot stretches into a 30px
//   progress pill, with the chapter title + number badge appearing beside it
//   (their navChapter / navDots)
// - floating rounded card panels anchored to the corners (their navPanel:
//   Exhibitions bottom-right, About top-right), numbered square badges,
//   hairline dividers, small copyright footer

import { TUNING } from './config.js';
import { CONTENT } from '../content.js';

export function buildNav({ chapters, lenis, reduced }) {
  const body = document.body;

  body.insertAdjacentHTML('beforeend', `
    <div class="chrome chrome--brand"><a href="#ch-${chapters[0].id}" data-goto="${chapters[0].id}">N + J</a></div>
    <button class="btnMenu" type="button" aria-label="Menu" aria-expanded="false">
      <hr><hr>
    </button>
    <nav class="railNav" aria-label="Exhibitions">
      ${chapters.map((c, i) => `
        <button class="railChapter" type="button" data-goto="${c.id}" aria-label="${c.num} · ${c.title}">
          <span class="railChapter__titleWrap">
            <span class="indexNumber">${i + 1}</span>
            <span class="railChapter__title">${c.title}<i class="railChapter__progress"><b></b></i></span>
          </span>
          <span class="railChapter__dot"><i></i></span>
        </button>`).join('')}
    </nav>
    <div class="navPanel__backdrop"></div>
    <aside class="navPanel navPanel--chapters" role="dialog" aria-modal="true" aria-label="Exhibitions">
      <div class="navPanel__inner">
        <button class="navPanel__close" type="button" aria-label="Close">×</button>
        <div class="tLabel navPanel__heading">Exhibitions</div>
        <ul class="navPanel__chapters">
          ${chapters.map((c, i) => `
            <li data-ch="${c.id}">
              <a href="#ch-${c.id}" data-goto="${c.id}">
                <span class="indexNumber">${i + 1}</span><span class="ttl">${c.title}</span>
              </a>
              <div class="navPanel__divider"></div>
            </li>`).join('')}
        </ul>
        <button class="navPanel__aboutLink" type="button">About this site →</button>
        <div class="navPanel__footer">
          <span class="navPanel__mono">N + J</span>
          <span class="navPanel__copyright">${CONTENT.nav.chaptersFoot}</span>
        </div>
      </div>
    </aside>
    <aside class="navPanel navPanel--about" role="dialog" aria-modal="true" aria-label="About">
      <div class="navPanel__inner">
        <button class="navPanel__close" type="button" aria-label="Close">×</button>
        <div class="tLabel navPanel__heading">About</div>
        <div class="navPanel__description">${CONTENT.nav.about.map((p) => `<p>${p}</p>`).join('')}</div>
        <div class="navPanel__footer">
          <span class="navPanel__mono">N + J</span>
          <span class="navPanel__copyright">${CONTENT.nav.aboutFoot}</span>
        </div>
      </div>
    </aside>`);

  const menuBtn = body.querySelector('.btnMenu');
  const rows = [...body.querySelectorAll('.railChapter')];
  const dotFills = rows.map((r) => r.querySelector('.railChapter__dot i'));
  const titleBars = rows.map((r) => r.querySelector('.railChapter__progress b'));
  const panels = { chapters: body.querySelector('.navPanel--chapters'), about: body.querySelector('.navPanel--about') };
  const backdrop = body.querySelector('.navPanel__backdrop');
  const listItems = [...body.querySelectorAll('.navPanel__chapters li')];

  /* ----- panels ----- */
  let openPanel = null, lastFocus = null;
  function setPanel(name) {
    if (openPanel) panels[openPanel].classList.remove('is-open');
    openPanel = name;
    backdrop.classList.toggle('is-open', !!name);
    menuBtn.setAttribute('aria-expanded', String(!!name));
    if (name) {
      lastFocus = document.activeElement;
      panels[name].classList.add('is-open');
      panels[name].querySelector('.navPanel__close').focus();
    } else if (lastFocus) { lastFocus.focus(); }
  }
  menuBtn.addEventListener('click', () => setPanel(openPanel ? null : 'chapters'));
  body.querySelector('.navPanel__aboutLink').addEventListener('click', () => setPanel('about'));
  Object.values(panels).forEach((p) => p.querySelector('.navPanel__close').addEventListener('click', () => setPanel(null)));
  backdrop.addEventListener('click', () => setPanel(null));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openPanel) setPanel(null);
    if (e.key === 'Tab' && openPanel) {
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
  function paintDone(i) {
    // chapters above the current one read as complete, below as untouched
    rows.forEach((r, j) => r.classList.toggle('is-done', j < i));
  }
  return {
    goTo,
    setProgress(i, p) {
      if (i !== current) return;
      if (dotFills[i]) dotFills[i].style.transform = `scaleY(${p})`;
      if (titleBars[i]) titleBars[i].style.transform = `scaleX(${p})`;
    },
    setCurrent(i) {
      if (i === current) return;
      if (current >= 0) {
        dotFills[current].style.transform = 'scaleY(0)';
        titleBars[current].style.transform = 'scaleX(0)';
      }
      current = i;
      rows.forEach((r, j) => r.classList.toggle('is-active', j === i));
      listItems.forEach((li, j) => li.classList.toggle('is-current', j === i));
      paintDone(i);
    },
  };
}
