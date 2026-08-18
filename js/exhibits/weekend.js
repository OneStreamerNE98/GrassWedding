// Exhibit 03 — The Weekend
// A tall vertical schedule installation. The user scrolls down; the world
// (the day-panel track) moves UP through the frame — the reverse of the
// horizontal walks elsewhere in the exhibition. Friday / Saturday / Sunday
// each pause centered long enough to read, then the track continues. A thin
// spine line draws downward alongside the panels and bends right at the
// exit, handing the recurring line motif off to Philadelphia.

import { CONTENT } from '../content.js';
import { drawOn, prepDraw, showDrawn } from '../core/line.js';
import { layerShift } from '../core/motion.js';

const DAYS = CONTENT.weekend.days;

export default {
  id: 'weekend',
  title: '03 · The Weekend',

  render(section) {
    const stage = section.querySelector('.stage');
    stage.innerHTML = `
      <div class="layer layer--l1 weekend-floor" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false" aria-hidden="true">
          <line x1="0" y1="16" x2="100" y2="16"></line>
          <line x1="0" y1="40" x2="100" y2="40"></line>
          <line x1="0" y1="64" x2="100" y2="64"></line>
          <line x1="0" y1="88" x2="100" y2="88"></line>
        </svg>
      </div>
      <div class="layer layer--l2 weekend-spine" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false" aria-hidden="true">
          <path class="weekend-spine-path" d="M50,4 L50,86 Q50,96 62,97 L100,93"></path>
        </svg>
      </div>
      <div class="layer layer--l3 weekend-frame">
        <header class="weekend-head">
          <p class="u-label">${CONTENT.weekend.intro}</p>
          <h2 id="h-weekend" class="display weekend-title">The Weekend</h2>
        </header>
        <div class="weekend-track">
          ${DAYS.map(
            (d) => `
            <article class="weekend-panel" data-day="${d.id}">
              <div class="weekend-placard">
                <p class="u-label weekend-placard-eyebrow">${d.day} &middot; ${d.date}</p>
                <h3 class="display weekend-placard-title">${d.title}</h3>
                <p class="weekend-placard-body">${d.body}</p>
              </div>
            </article>`
          ).join('')}
        </div>
      </div>
    `;
  },

  init({ stage, isMobile, prefersReduced }) {
    const track = stage.querySelector('.weekend-track');
    const floor = stage.querySelector('.weekend-floor');
    const spinePath = stage.querySelector('.weekend-spine-path');

    // Reduced motion: everything holds at its resting, fully-legible state.
    // Layout collapses to a static stacked column via weekend.css.
    if (prefersReduced) {
      gsap.set(track, { yPercent: 0 });
      gsap.set(floor, { yPercent: 0 });
      showDrawn(spinePath);
      return null;
    }

    gsap.set(track, { yPercent: 0 });
    gsap.set(floor, { yPercent: 0 });
    prepDraw(spinePath);

    // Pacing weights (relative scrub-time units — not seconds; only the
    // ratios matter once scrubbed across the section's fixed scroll span).
    const HOLD = isMobile ? 1.0 : 1.4; // reading pause, each day centered
    const MOVE = isMobile ? 0.45 : 0.6; // transition between days
    const EXIT = isMobile ? 0.55 : 0.85; // final departure + spine hand-off

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

    // Friday opens already centered (t=0..HOLD is an implicit dwell — no
    // tween needed, the track simply hasn't moved yet).
    let t = HOLD;
    tl.to(track, { yPercent: -100, duration: MOVE }, t); // Friday -> Saturday
    t += MOVE + HOLD;
    tl.to(track, { yPercent: -200, duration: MOVE }, t); // Saturday -> Sunday
    t += MOVE + HOLD;
    tl.to(track, { yPercent: -300, duration: EXIT }, t); // Sunday exits upward
    const total = t + EXIT;

    // Floor seams: distant environment (layer l1), drifting at 0.2x the
    // panels' total travel (config.js LAYER_SPEEDS) — a continuous, faint
    // parallax cue, independent of the panels' dwell/move rhythm.
    tl.to(floor, { yPercent: layerShift('l1', -300), duration: total, ease: 'none' }, 0);

    // The spine draws downward across the whole scene and — because its
    // path already bends right near the bottom — completes its bend right
    // as the track exits, handing the line off to Philadelphia.
    drawOn(tl, spinePath, { start: 0, duration: total, ease: 'none' });

    return tl;
  },
};
