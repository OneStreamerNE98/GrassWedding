// Entry point: wait for vendor globals + fonts, run the loader, boot the engine.

import { CHAPTERS } from './specimen.js';
import { boot } from './core/engine.js';

const loader = document.querySelector('.pageLoader');
const loaderBar = loader?.querySelector('.pageLoader__bar i');

function vendorsReady() {
  return new Promise((resolve) => {
    const check = () => (window.gsap && window.ScrollTrigger && window.Lenis) ? resolve() : setTimeout(check, 25);
    check();
  });
}

const loaded = new Promise((resolve) => {
  if (document.readyState === 'complete') resolve();
  else addEventListener('load', resolve, { once: true });
});

(async () => {
  if (loaderBar) loaderBar.style.transform = 'scaleX(0.35)';
  await vendorsReady();
  if (loaderBar) loaderBar.style.transform = 'scaleX(0.65)';
  await Promise.race([
    Promise.all([document.fonts?.ready ?? Promise.resolve(), loaded]),
    new Promise((r) => setTimeout(r, 4000)), // never trap the guest on the loader
  ]);
  if (loaderBar) loaderBar.style.transform = 'scaleX(1)';

  await boot(CHAPTERS);

  setTimeout(() => loader?.classList.add('is-done'), 250);
})();
