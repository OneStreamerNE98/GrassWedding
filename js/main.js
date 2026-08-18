// Boot: smoothing, persistent UI, directory, exhibit registration.

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

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// --- Smoothing: light, and only where input stays precise -------------------
let lenis = null;
if (!prefersReduced && !isTouch && window.Lenis) {
  lenis = new Lenis({ lerp: 0.14, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  setLenis(lenis);
}

// --- Exhibits ----------------------------------------------------------------
[entrance, story, wedding, weekend, philly, gallery, details, rsvp].forEach(
  registerExhibit
);
bootExhibits();

// --- Persistent UI -----------------------------------------------------------
const contextNum = document.querySelector('.site-context .num');
const contextName = document.querySelector('.site-context .name');
document.addEventListener('exhibit:active', (e) => {
  const { num, title, menu } = e.detail;
  if (!menu) {
    contextNum.textContent = '';
    contextName.textContent = '';
    return;
  }
  contextNum.textContent = `${num} / 07`;
  contextName.textContent = title;
});

// Scroll cue hides after first movement
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

const menuBtn = document.querySelector('.site-menu-btn');
menuBtn.addEventListener('click', openDirectory);
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

// Deep links (#ex-story etc.) land correctly after layout settles.
if (location.hash.startsWith('#ex-')) {
  const id = location.hash.slice(4);
  requestAnimationFrame(() => goTo(id, { smooth: false }));
}

document.title = `${VENUE.names} · The Wedding Exhibition`;
