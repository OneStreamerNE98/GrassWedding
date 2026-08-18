// Exhibit engine — owns pinning, scrub, progress, jumps, and motion contexts.
//
// Contract (PLAN.md §3): one ScrollTrigger + one scrubbed labeled timeline per
// exhibit, created in DOM order. Modules never pin; they render semantic markup
// and return a paused timeline. Under reduced motion there are NO pins and NO
// scrubbed motion — modules must leave their DOM in a complete, legible state.

import { EXHIBITS, MOBILE_SPAN_FACTOR, BREAKPOINTS } from './config.js';

const scenes = new Map(); // id -> { cfg, section, st }
let lenisRef = null;

export function setLenis(lenis) { lenisRef = lenis; }

// Continuously tracked scroll ratio (0..1), guarded against division by
// zero. A matchMedia rebuild (breakpoint crossing) destroys and recreates
// every ScrollTrigger, which otherwise resets scroll to 0 — we restore the
// equivalent position in the NEW document height once the rebuild settles.
let scrollRatio = 0;
function trackScrollRatio() {
  const max = document.body.scrollHeight - window.innerHeight;
  scrollRatio = max > 0 ? window.scrollY / max : 0;
}
window.addEventListener('scroll', trackScrollRatio, { passive: true });
window.addEventListener('resize', trackScrollRatio, { passive: true });

let firstRun = true;

export function registerExhibit(module) {
  const cfg = EXHIBITS.find((e) => e.id === module.id);
  if (cfg) cfg.module = module;
}

export function bootExhibits() {
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Render interior markup once — shared by every motion context.
  for (const cfg of EXHIBITS) {
    const section = document.getElementById(`ex-${cfg.id}`);
    if (!cfg.module || !section) continue;
    cfg.module.render(section);
    scenes.set(cfg.id, { cfg, section, st: null });
  }

  const mm = gsap.matchMedia();
  mm.add(
    {
      reduced: '(prefers-reduced-motion: reduce)',
      mobile: `(max-width: ${BREAKPOINTS.mobile - 1}px)`,
      tablet: `(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`,
      desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
    },
    (ctx) => {
      const { reduced, mobile, tablet } = ctx.conditions;
      const viewport = mobile ? 'mobile' : tablet ? 'tablet' : 'desktop';
      document.documentElement.classList.toggle('reduced-motion', reduced);

      for (const scene of scenes.values()) {
        buildScene(scene, { reduced, viewport });
      }
      buildProgressBar();

      // Restore scroll position after a rebuild (breakpoint crossing) — but
      // never on the very first boot, where scroll should stay wherever the
      // page loaded (top, or a deep-link jump handled separately in main.js).
      if (!firstRun) {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          const newMax = document.body.scrollHeight - window.innerHeight;
          if (newMax > 0) window.scrollTo(0, scrollRatio * newMax);
        });
      }
      firstRun = false;

      // matchMedia auto-reverts ScrollTriggers/timelines on context change.
      return () => {
        for (const scene of scenes.values()) scene.st = null;
      };
    }
  );
}

function buildScene(scene, { reduced, viewport }) {
  const { cfg, section } = scene;
  const stage = section.querySelector('.stage');

  const tl = cfg.module.init({
    section,
    stage,
    cfg,
    viewport,
    isMobile: viewport === 'mobile',
    prefersReduced: reduced,
  });

  if (reduced) {
    // No pins, no scrub. Track activation only, for the context label.
    scene.st = ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (self) => self.isActive && announceActive(cfg),
    });
    return;
  }

  const spanPx = () => {
    const factor = viewport === 'mobile' ? MOBILE_SPAN_FACTOR : 1;
    return Math.round(cfg.span * factor * window.innerHeight / 100);
  };

  if (cfg.mode === 'pin') {
    scene.st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${spanPx()}`,
      pin: stage,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: true,
      animation: tl || undefined,
      invalidateOnRefresh: true,
      onToggle: (self) => {
        toggleWillChange(stage, self.isActive);
        if (self.isActive) announceActive(cfg);
      },
    });
  } else {
    // Flow sections are long reading columns. The reveal is mapped to the
    // section's ARRIVAL only (roughly one viewport of scroll), never to its
    // whole height — otherwise a tall column spends most of its scroll with
    // half its text still fading in, i.e. unreadable while fully on screen.
    // A second, range-wide trigger keeps the context label in sync.
    scene.st = ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      end: 'top 20%',
      scrub: tl ? true : false,
      animation: tl || undefined,
      invalidateOnRefresh: true,
    });
    ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      end: 'bottom 25%',
      onToggle: (self) => self.isActive && announceActive(cfg),
    });
  }
}

// Promote only the active scene's layers (GPU memory discipline).
function toggleWillChange(stage, active) {
  for (const layer of stage.querySelectorAll('.layer')) {
    layer.style.willChange = active ? 'transform' : '';
  }
}

function announceActive(cfg) {
  document.dispatchEvent(new CustomEvent('exhibit:active', { detail: { ...cfg } }));
}

function buildProgressBar() {
  const bar = document.querySelector('.site-progress');
  if (!bar) return;
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => { bar.style.transform = `scaleX(${self.progress})`; },
  });
}

// Jump the walk to an exhibit (directory, lobby nav, deep links).
// Positions are computed fresh per jump — never cached across refreshes.
export function goTo(id, { smooth = true } = {}) {
  const scene = scenes.get(id);
  if (!scene) return;
  const y = scene.st && scene.st.pin
    ? scene.st.start + 2
    : scene.section.getBoundingClientRect().top + window.scrollY + 2;

  const finish = () => focusHeading(scene.section);
  const reduced = document.documentElement.classList.contains('reduced-motion');

  history.replaceState(null, '', `#ex-${id}`);
  if (reduced || !smooth) {
    window.scrollTo(0, y);
    finish();
  } else if (lenisRef) {
    lenisRef.scrollTo(y, { duration: 1.4, onComplete: finish });
  } else {
    window.scrollTo({ top: y, behavior: 'smooth' });
    setTimeout(finish, 700);
  }
}

// After a programmatic jump, keyboard/AT users land where the viewport did.
// The target heading can be `autoAlpha:0` (visibility:hidden) at arrival —
// e.g. Details/RSVP reveal their heading only once their own scrub crosses
// a threshold — in which case focus() silently no-ops. Fall back to the
// section itself so focus always lands somewhere inside it.
function focusHeading(section) {
  const h = section.querySelector('h1, h2, h3');
  if (h && isFocusable(h)) {
    h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
    if (document.activeElement === h) return;
  }
  section.setAttribute('tabindex', '-1');
  section.focus({ preventScroll: true });
}

function isFocusable(el) {
  if (!el.isConnected) return false;
  const cs = getComputedStyle(el);
  if (cs.visibility === 'hidden' || cs.display === 'none') return false;
  if (parseFloat(cs.opacity) === 0) return false;
  return true;
}

export function exhibitList() {
  return EXHIBITS.filter((e) => e.menu);
}
