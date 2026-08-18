// Exhibit engine — owns pinning, scrub, progress, and menu jumps.
// Modules never create their own pinning ScrollTriggers; they return a paused
// timeline (durations are relative) and the engine scrubs it over the
// exhibit's scroll span.

import { EXHIBITS, MOBILE_SPAN_FACTOR } from './config.js';
import { prefersReduced, viewportTier, deviceTier } from './motion.js';

const registry = new Map();
let lenisRef = null;

export function registerExhibit(module) {
  registry.set(module.id, module);
}

export function setLenis(lenis) {
  lenisRef = lenis;
}

export function bootExhibits() {
  const tier = deviceTier();
  const vp = viewportTier();
  const vh = window.innerHeight / 100;

  for (const cfg of EXHIBITS) {
    const module = registry.get(cfg.id);
    const section = document.getElementById(`ex-${cfg.id}`);
    if (!module || !section) continue;

    module.render(section);

    const ctx = {
      section,
      stage: section.querySelector('.stage'),
      cfg,
      prefersReduced,
      tier,               // 'full' | 'lean' | 'calm'
      viewport: vp,       // 'mobile' | 'tablet' | 'desktop'
      isMobile: vp === 'mobile',
    };

    const tl = module.init(ctx);

    let spanVh = cfg.span;
    if (vp === 'mobile') spanVh = Math.round(spanVh * MOBILE_SPAN_FACTOR);
    if (tier === 'calm') spanVh = Math.round(spanVh * 0.45);

    const common = {
      trigger: section,
      onToggle: (self) => {
        if (self.isActive) announceActive(cfg);
      },
    };

    if (cfg.mode === 'pin') {
      ScrollTrigger.create({
        ...common,
        start: 'top top',
        end: `+=${Math.round(spanVh * vh)}`,
        pin: ctx.stage,
        pinSpacing: true,
        scrub: tier === 'calm' ? true : 0.6,
        animation: tl || undefined,
        invalidateOnRefresh: true,
      });
    } else {
      ScrollTrigger.create({
        ...common,
        start: 'top 75%',
        end: 'bottom 25%',
        scrub: tl ? 0.6 : false,
        animation: tl || undefined,
      });
    }
  }

  buildProgressBar();
}

function announceActive(cfg) {
  document.dispatchEvent(
    new CustomEvent('exhibit:active', { detail: { ...cfg } })
  );
}

function buildProgressBar() {
  const bar = document.querySelector('.site-progress');
  if (!bar) return;
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      bar.style.transform = `scaleX(${self.progress})`;
    },
  });
}

// Jump the master timeline to an exhibit (used by directory + lobby nav).
export function goTo(id, { smooth = true } = {}) {
  const section = document.getElementById(`ex-${id}`);
  if (!section) return;
  const st = ScrollTrigger.getAll().find(
    (t) => t.trigger === section && t.pin
  ) || ScrollTrigger.getAll().find((t) => t.trigger === section);
  const y = st ? st.start + 2 : section.getBoundingClientRect().top + window.scrollY;
  if (prefersReduced || !smooth) {
    window.scrollTo(0, y);
  } else if (lenisRef) {
    lenisRef.scrollTo(y, { duration: 1.4 });
  } else {
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

export function exhibitList() {
  return EXHIBITS.filter((e) => e.menu);
}
