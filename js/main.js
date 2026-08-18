// Boot: smoothing, exhibit registration, persistent UI, directory.

import { registerExhibit, bootExhibits, goTo, exhibitList, setLenis } from './core/engine.js';
import { prefersReduced, isTouch } from './core/motion.js';
import { VENUE } from './core/config.js';

import entrance from './exhibits/entrance.js';
import story from './exhibits/story.js';
import wedding from './exhibits/wedding.js';
import weekend from './exhibits/weekend.js';
import philly from './exhibits/philly.js';
import gallery from './exhibits/gallery.js';
import details from './exhibits/details.js';
import rsvp from './exhibits/rsvp.js';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin);

// --- Smoothing: one smoothing stage, wheel/trackpad only ---------------------
let lenis = null;
if (!prefersReduced && !isTouch && window.Lenis) {
  lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  setLenis(lenis);
}

[entrance, story, wedding, weekend, philly, gallery, details, rsvp].forEach(
  registerExhibit
);

// Init only after fonts AND full load so every trigger measures true layout.
Promise.all([
  document.fonts.ready,
  new Promise((r) =>
    document.readyState === 'complete'
      ? r()
      : window.addEventListener('load', r, { once: true })
  ),
]).then(() => {
  bootExhibits();
  ScrollTrigger.refresh();

  // Deep links (#ex-story …) land correctly once pin math exists.
  if (location.hash.startsWith('#ex-')) {
    goTo(location.hash.slice(4), { smooth: false });
  }
});

// --- Persistent UI -----------------------------------------------------------
const contextNum = document.querySelector('.site-context .num');
const contextName = document.querySelector('.site-context .name');
document.addEventListener('exhibit:active', (e) => {
  const { num, title, menu } = e.detail;
  contextNum.textContent = menu ? `${num} / 07` : '';
  contextName.textContent = menu ? title : '';
});

const cue = document.querySelector('.site-cue');
let cueHidden = false;
window.addEventListener(
  'scroll',
  () => {
    if (!cueHidden && window.scrollY > 40) {
      cue.setAttribute('data-hidden', '');
      cueHidden = true;
    }
  },
  { passive: true }
);

// --- Directory overlay -------------------------------------------------------
const directory = document.getElementById('directory');
const list = directory.querySelector('.directory-list');
for (const ex of exhibitList()) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = `#ex-${ex.id}`;
  a.innerHTML = `<span class="num">${ex.num}</span><span class="name">${ex.menu}</span>`;
  a.addEventListener('click', (ev) => {
    ev.preventDefault();
    closeDirectory();
    goTo(ex.id);
  });
  li.appendChild(a);
  list.appendChild(li);
}

document.querySelector('.site-menu-btn').addEventListener('click', openDirectory);
directory.querySelector('.directory-close').addEventListener('click', closeDirectory);
directory.addEventListener('cancel', () => lenis && lenis.start());

function openDirectory() {
  directory.showModal();
  lenis && lenis.stop();
}
function closeDirectory() {
  directory.close();
  lenis && lenis.start();
}

document.querySelector('.site-brand').addEventListener('click', (e) => {
  e.preventDefault();
  goTo('entrance');
});

document.title = `${VENUE.names} · The Wedding Exhibition`;
