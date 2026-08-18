// 02 · The Wedding — one long horizontal gallery.
// The world translates left as the guest scrolls (camera walks right) past
// three installations: Ceremony → Cocktail Hour → Reception. Layer speeds
// follow PLAN.md §11-C: bg architecture 0.5x, content 1.0x, near columns
// 1.3x, foreground occluders 1.7x (walkStack / LAYER_SPEEDS).
//
// Ownership: js/exhibits/wedding.js · styles/exhibits/wedding.css ·
// assets/art/wedding/* (art is inlined here as SVG per PLAN preference).

import { CONTENT } from '../content.js';
import { drawOn, showDrawn } from '../core/line.js';
import { walkStack } from '../core/motion.js';

const W = CONTENT.wedding;

// -- copy helpers -------------------------------------------------------

// TBD never ships to the DOM as the raw string — an elegant placeholder
// pattern instead (PLAN §5, module contract).
function timeMarkup(time) {
  const isTbd = !time || /^tbd$/i.test(String(time).trim());
  if (isTbd) {
    return (
      '<p class="wd-time wd-time--tbd">' +
      '<span class="wd-dash" aria-hidden="true">—</span>' +
      '<span>Details to follow</span></p>'
    );
  }
  return `<p class="wd-time">${time}</p>`;
}

const INSTALLATION_TITLE = {
  ceremony: 'Ceremony',
  cocktails: 'Cocktail Hour',
  reception: 'Reception',
};

// -- inline SVG art (simplified, original Barnes-inspired abstraction —
//    never a trace of the real building or any photograph) -------------

// Background architecture (layer l2): flat warm planes + tall glass rhythm.
function archSvg(id) {
  if (id === 'ceremony') {
    return `
      <svg class="line-art wd-svg" viewBox="0 0 900 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <rect class="wd-plane wd-plane--warm" x="0" y="70" width="900" height="350"/>
        <line x1="0" y1="70" x2="900" y2="70"/>
        <line x1="40" y1="70" x2="40" y2="420"/>
        <line x1="860" y1="70" x2="860" y2="420"/>
        ${Array.from({ length: 9 })
          .map((_, i) => `<line x1="${110 + i * 90}" y1="70" x2="${110 + i * 90}" y2="420"/>`)
          .join('')}
        <line x1="0" y1="150" x2="900" y2="150"/>
        <circle class="wd-topiary" cx="70" cy="400" r="16"/>
        <circle class="wd-topiary" cx="830" cy="400" r="16"/>
      </svg>`;
  }
  if (id === 'cocktails') {
    return `
      <svg class="line-art wd-svg" viewBox="0 0 900 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <rect class="wd-plane wd-plane--air" x="0" y="130" width="900" height="290"/>
        <line x1="0" y1="130" x2="900" y2="130"/>
        ${Array.from({ length: 5 })
          .map((_, i) => `<line x1="${150 + i * 150}" y1="130" x2="${150 + i * 150}" y2="420"/>`)
          .join('')}
        <path class="wd-leaf" d="M60 420 C 60 340, 130 320, 150 250" />
        <path class="wd-leaf" d="M150 250 C 170 270, 175 300, 160 330" />
        <path class="wd-leaf" d="M840 420 C 840 330, 770 310, 750 240" />
        <path class="wd-leaf" d="M750 240 C 730 260, 725 295, 740 325" />
      </svg>`;
  }
  // reception
  return `
    <svg class="line-art wd-svg" viewBox="0 0 900 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <rect class="wd-plane wd-plane--warm-deep" x="0" y="40" width="900" height="380"/>
      <line x1="0" y1="40" x2="900" y2="40"/>
      <path d="M330 40 Q 450 -30 570 40" />
      ${Array.from({ length: 6 })
        .map((_, i) => `<line x1="${90 + i * 130}" y1="40" x2="${90 + i * 130}" y2="420"/>`)
        .join('')}
      <line x1="60" y1="330" x2="840" y2="330"/>
      ${Array.from({ length: 16 })
        .map((_, i) => `<line x1="${75 + i * 48}" y1="330" x2="${75 + i * 48}" y2="345"/>`)
        .join('')}
    </svg>`;
}

// Near columns (layer l4): a few closer architectural verticals.
function nearSvg(id) {
  const count = id === 'ceremony' ? 3 : 2;
  return `
    <svg class="line-art wd-svg" viewBox="0 0 400 420" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      ${Array.from({ length: count })
        .map((_, i) => {
          const x = 60 + i * 140;
          return `<rect x="${x}" y="0" width="26" height="420"/><line x1="${x}" y1="0" x2="${x}" y2="420"/><line x1="${x + 26}" y1="0" x2="${x + 26}" y2="420"/>`;
        })
        .join('')}
    </svg>`;
}

function installationMarkup(inst) {
  const title = INSTALLATION_TITLE[inst.id] || inst.id;
  const lines = inst.lines.map((l) => `<span class="wd-line">${l}</span>`).join('');
  const arrivalMarkup =
    inst.id === 'ceremony'
      ? `<p class="wd-placard-note">${W.arrival}</p>`
      : '';
  const icsMarkup =
    inst.id === 'reception'
      ? `<a class="ics-link" href="/assets/ics/wedding.ics" download>Add to calendar</a>`
      : '';

  return `
    <article class="wd-installation" data-installation="${inst.id}" aria-labelledby="wd-h-${inst.id}">
      <div class="wd-arch">${archSvg(inst.id)}</div>
      <div class="wd-near">${nearSvg(inst.id)}</div>
      <div class="wd-placard">
        <span class="u-label">${inst.label}</span>
        <h3 class="wd-h" id="wd-h-${inst.id}">${title}</h3>
        <div class="wd-lines">${lines}</div>
        ${timeMarkup(inst.time)}
        ${arrivalMarkup}
        ${icsMarkup}
      </div>
    </article>`;
}

function markup() {
  const installations = W.installations.map(installationMarkup).join('');
  return `
    <div class="wd-root">
      <div class="layer layer--l1"><div class="wd-track wd-track--l1" aria-hidden="true">
        <div class="wd-horizon"></div>
      </div></div>

      <div class="layer layer--l2"><div class="wd-track wd-track--l2" aria-hidden="true">
        <div class="wd-arch-scene wd-arch-scene--lead"></div>
        <div class="wd-arch-scene" data-for="ceremony">${archSvg('ceremony')}</div>
        <div class="wd-arch-scene" data-for="cocktails">${archSvg('cocktails')}</div>
        <div class="wd-arch-scene" data-for="reception">${archSvg('reception')}</div>
      </div></div>

      <div class="wd-tint" aria-hidden="true"></div>

      <div class="layer layer--l3"><div class="wd-track wd-track--l3">
        <div class="wd-title">
          <span class="u-label">${W.intro}</span>
          <h2 id="h-wedding">The Wedding</h2>
        </div>
        ${installations}
        <svg class="wd-floor" aria-hidden="true" focusable="false"><path d="M0 16 H 1"/></svg>
      </div></div>

      <div class="layer layer--l4"><div class="wd-track wd-track--l4" aria-hidden="true">
        ${['ceremony', 'cocktails', 'reception'].map((id) => `<div class="wd-near-scene">${nearSvg(id)}</div>`).join('')}
      </div></div>

      <div class="layer layer--l5">
        <div class="wd-track wd-track--l5" aria-hidden="true"></div>
        <div class="wd-occluder" aria-hidden="true"></div>
      </div>
    </div>`;
}

// -- module ---------------------------------------------------------------

export default {
  id: 'wedding',
  title: '02 · The Wedding',

  render(section) {
    const stage = section.querySelector('.stage');
    stage.innerHTML = markup();
  },

  init({ stage, prefersReduced, isMobile }) {
    const root = stage.querySelector('.wd-root');
    const l1 = root.querySelector('.wd-track--l1');
    const l2 = root.querySelector('.wd-track--l2');
    const l3 = root.querySelector('.wd-track--l3');
    const l4 = root.querySelector('.wd-track--l4');
    const l5 = root.querySelector('.wd-track--l5');
    const tint = root.querySelector('.wd-tint');
    const occluder = root.querySelector('.wd-occluder');
    const floorSvg = root.querySelector('.wd-floor');
    const floorPath = floorSvg.querySelector('path');

    const ceremonyEl = l3.querySelector('[data-installation="ceremony"]');
    const cocktailsEl = l3.querySelector('[data-installation="cocktails"]');
    const receptionEl = l3.querySelector('[data-installation="reception"]');
    const placards = l3.querySelectorAll('.wd-placard');

    if (prefersReduced) {
      // Static, readable, stacked layout — CSS (wedding.css) switches the
      // track to normal document flow. Just settle final states here.
      gsap.set([l1, l2, l4, l5, tint, occluder].filter(Boolean), { x: 0, opacity: 0 });
      gsap.set(placards, { opacity: 1 });
      showDrawn(floorSvg);
      return null;
    }

    const stageW = stage.clientWidth;
    const l3Dist = Math.max(l3.scrollWidth - stageW, 1);
    const primaryX = -l3Dist;

    // Progress fraction (0..1 of this scene's own scrub) at which an
    // element's edge reaches a given point in the viewport.
    const pAt = (el, viewportOffset = 0) =>
      Math.min(1, Math.max(0, (el.offsetLeft - viewportOffset) / l3Dist));

    // Floor seam: one path along the content track's base, drawn on as the
    // walk progresses; extends past the last installation so the line
    // motif visibly continues off-right at the exhibit's exit.
    const floorWidth = l3.scrollWidth + 160;
    floorSvg.setAttribute('viewBox', `0 0 ${floorWidth} 32`);
    floorPath.setAttribute('d', `M0 16 H ${floorWidth}`);

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

    // 1 — the walk itself: every layer translates left at its own speed.
    const stack = { l1, l2, l3, l4, l5 };
    if (isMobile) {
      delete stack.l1; // shorter lateral run, fewer layers on mobile
      delete stack.l4;
    }
    walkStack(tl, stack, primaryX, { start: 0, duration: 1 });

    // 2 — the recurring line motif: floor seam drawn across the full walk.
    drawOn(tl, floorPath, { start: 0, duration: 1, ease: 'none' });

    // 3 — foreground column occlusion (L5 plane crossing): Ceremony →
    // Cocktail Hour. A close, fast plane sweeps the viewport, hiding the
    // scene swap the way a passing column hides a turn in a real gallery.
    const pReveal = pAt(cocktailsEl, stageW / 2);
    const sweepHalf = isMobile ? 0.045 : 0.06;
    tl.fromTo(
      occluder,
      { x: '120vw' },
      { x: '-60vw', duration: sweepHalf * 2 },
      Math.max(0, pReveal - sweepHalf)
    );

    // 4 — golden-hour tint shift, held across the Cocktail Hour span.
    const pCocktailIn = pAt(cocktailsEl);
    const pCocktailOut = pAt(receptionEl);
    const fade = Math.max((pCocktailOut - pCocktailIn) * 0.3, 0.02);
    tl.fromTo(tint, { opacity: 0 }, { opacity: 1, duration: fade }, pCocktailIn).to(
      tint,
      { opacity: 0, duration: fade },
      Math.max(pCocktailIn, pCocktailOut - fade)
    );

    // 5 — each placard settles in as its installation walks into view and
    // lifts again as it walks out. Keying off the PLACARD's own centre (not
    // the installation's left edge) is what keeps text off the viewport
    // edges: previously a placard held opacity 1 all the way out of frame and
    // spent a long stretch of the walk sliced by the left edge of the stage.
    const MARGIN = 32;   // keep a placard's own edges this far inside the stage
    const settle = 0.035;

    [ceremonyEl, cocktailsEl, receptionEl].forEach((el) => {
      const placard = el.querySelector('.wd-placard');
      const half = placard.offsetWidth / 2;
      const centre = el.offsetLeft + placard.offsetLeft + half;
      // Track-x at which the placard's centre sits at a given viewport x.
      const pFor = (viewportX) =>
        Math.min(1, Math.max(0, (centre - viewportX) / l3Dist));
      const pIn = pFor(stageW - MARGIN - half);  // right edge just inside
      const pOut = pFor(MARGIN + half);          // left edge about to touch

      tl.fromTo(placard, { opacity: 0 }, { opacity: 1, duration: settle }, pIn);
      // Only release a placard that actually leaves the frame during the
      // walk — the last one stays lit so the exhibit's closing frame reads.
      if (pOut > pIn + settle && pOut + settle < 0.97) {
        tl.to(placard, { opacity: 0, duration: settle }, pOut);
      }
    });

    return tl;
  },
};
