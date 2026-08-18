// Engine: boot sequence, Lenis+GSAP single-loop wiring, chapter construction,
// progress tracking for the nav, debug HUD, reduced-motion posture.

import { TUNING, HEIGHTS, MOBILE_HEIGHT_FACTOR, MOBILE_BREAKPOINT } from './config.js';
import { SCENES } from './scenes.js';
import { buildNav } from './nav.js';

export async function boot(chapters) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  document.documentElement.dataset.palette = TUNING.palette;

  // easing vocabulary — approximations of the reference cubic-beziers,
  // registered as named eases (no CustomEase plugin needed)
  gsap.registerEase('silkE', (t) => t * t * (3 - 2 * t));      // slow in/out ≈ cinematicSilk
  gsap.registerEase('smoothE', (t) => 1 - Math.pow(1 - t, 2.6)); // settle ≈ cinematicSmooth

  /* ----- render chapters ----- */
  const main = document.querySelector('main');
  const isMobile = innerWidth <= MOBILE_BREAKPOINT;
  const built = chapters.map((c) => {
    const sticky = c.type !== 'reading';
    const h = HEIGHTS[c.type] * (isMobile ? MOBILE_HEIGHT_FACTOR : 1) * TUNING.pace;
    const section = document.createElement('section');
    section.className = `chapter chapter--${c.type}` + (sticky ? ' chapter--sticky' : ' chapter--reading');
    section.id = 'ch-' + c.id;
    section.setAttribute('aria-label', `${c.num} · ${c.title}`);
    if (sticky) section.style.setProperty('--h', h + 'vh');
    main.appendChild(section);
    return { chapter: c, section, scene: SCENES[c.type](section, c.content) };
  });

  /* ----- Lenis + GSAP: one loop ----- */
  let lenis = null;
  if (!reduced) {
    lenis = new window.Lenis({ autoRaf: false, lerp: TUNING.lerp, syncTouch: false });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', window.ScrollTrigger.update);
    window.ScrollTrigger.config({ ignoreMobileResize: true });
  }

  /* ----- nav ----- */
  const nav = buildNav({ chapters, lenis, reduced });

  /* ----- per-chapter progress triggers (feed the dot rail) ----- */
  built.forEach(({ section }, i) => {
    window.ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onUpdate: (self) => nav.setProgress(i, self.progress),
      onToggle: (self) => { if (self.isActive) nav.setCurrent(i); },
    });
  });
  nav.setCurrent(0);

  // corner brand + chapter readout appear once the guest leaves the landing
  // (the reference's center→corner logo move; no readout on its landing either)
  const chrome = [document.querySelector('.chrome--brand'), document.querySelector('.chrome--readout')];
  const setChrome = (on) => chrome.forEach((n) => n.classList.toggle('is-visible', on));
  if (reduced) setChrome(true);
  else window.ScrollTrigger.create({
    trigger: built[0].section,
    start: 'bottom 70%',
    onEnter: () => setChrome(true),
    onLeaveBack: () => setChrome(false),
  });

  /* ----- scene animations ----- */
  const ctx = { gsap, reduced, lenis };
  built.forEach(({ scene }) => scene.init(ctx));

  /* ----- deep link ----- */
  const hash = location.hash.replace('#ch-', '');
  if (hash && chapters.some((c) => c.id === hash)) {
    requestAnimationFrame(() => nav.goTo(hash, { instant: true }));
  }

  window.ScrollTrigger.refresh();

  /* ----- debug HUD ----- */
  if (new URLSearchParams(location.search).has('debug')) {
    const hud = document.createElement('div');
    hud.className = 'debugHud';
    document.body.appendChild(hud);
    let frames = 0, fps = 0, last = performance.now();
    gsap.ticker.add(() => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) { fps = frames; frames = 0; last = now; }
      const p = window.scrollY / (document.documentElement.scrollHeight - innerHeight);
      hud.textContent = `scroll ${(p * 100).toFixed(1)}%\nfps ${fps}\nlerp ${TUNING.lerp} pace ${TUNING.pace}\npalette ${TUNING.palette}`;
    });
  }

  return { nav, lenis };
}
