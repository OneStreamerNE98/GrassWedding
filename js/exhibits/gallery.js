// Exhibition 05 · Gallery — a wide horizontal wall, walked past rather than
// browsed as a grid. Three pieces are "focus" pieces: as each reaches
// center, the whole track (never an individual frame) scales up until it
// nearly fills the viewport, holds a beat, then pulls back to the wall.
//
// gsap and its plugins are loaded as globals (see index.html); this module
// only ever returns a single paused timeline for the engine to scrub.

import { GALLERY } from '../../assets/gallery/manifest.js';
import { layerShift } from '../core/motion.js';

// Real-image intrinsic dimensions, assuming a 3:2 photograph, per wall size.
const SIZE_DIMS = {
  small: [480, 320],
  medium: [720, 480],
  large: [960, 640],
  feature: [1200, 800],
};

// Deterministic vertical stagger so frames don't line up on a single shelf —
// generous, editorial spacing rather than a grid.
const VOFFSET = [0, -34, 18, -22, 30, -12, 24, -30, 14, -18];

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function frameMarkup(item, i) {
  const [w, h] = SIZE_DIMS[item.size] || SIZE_DIMS.medium;
  const voffset = VOFFSET[i % VOFFSET.length];
  const alt = escapeHtml(item.alt);
  const caption = escapeHtml(item.caption);

  const media = item.src
    ? `<img class="frame-media" src="${escapeHtml(item.src)}" alt="${alt}" width="${w}" height="${h}" loading="lazy" decoding="async" data-gallery-img>`
    : `<div class="frame-placeholder" aria-hidden="true"><span class="frame-mark">N&nbsp;·&nbsp;J</span></div>`;

  return `
    <figure class="frame frame--${item.size}" data-focus="${item.focus ? 'true' : 'false'}" style="--voffset:${voffset}px">
      <div class="frame-media-wrap">${media}</div>
      <figcaption class="frame-caption u-label">${caption}</figcaption>
    </figure>`;
}

function render(section) {
  const stage = section.querySelector('.stage');
  if (!stage) return;

  const frames = GALLERY.map(frameMarkup).join('');

  stage.innerHTML = `
    <div class="layer layer--l2 gallery-wall" aria-hidden="true"></div>
    <div class="layer layer--l3 gallery-track">
      <div class="gallery-intro">
        <p class="u-label">Exhibition 05</p>
        <h2 id="h-gallery" class="display gallery-intro-title">Gallery</h2>
        <p class="gallery-intro-sub">A walk along the wall.</p>
      </div>
      ${frames}
    </div>
    <div class="layer layer--l5 gallery-columns" aria-hidden="true">
      <span class="gallery-column gallery-column--a"></span>
      <span class="gallery-column gallery-column--b"></span>
    </div>`;
}

function init(ctx) {
  const { section, stage, prefersReduced } = ctx;
  const track = section.querySelector('.gallery-track');
  const wall = section.querySelector('.gallery-wall');
  const columns = section.querySelector('.gallery-columns');
  if (!track) return null;

  // Pre-warm real images the moment this scene builds (guarded — a decode
  // failure, e.g. an unset src, must never throw). PLAN.md §3 rule 16.
  for (const img of section.querySelectorAll('img[data-gallery-img]')) {
    try {
      if (img.decode) img.decode().catch(() => {});
    } catch (e) { /* ignore */ }
  }

  if (prefersReduced) {
    // No pins, no scrub (engine enforces this). Make the wall a normal,
    // fully legible static wrap instead of a clipped horizontal strip —
    // the resting DOM must be complete and readable with zero JS. The
    // wrap/auto-height behavior itself lives in gallery.css, scoped to
    // .reduced-motion; here we just guarantee a neutral transform state.
    gsap.set(track, { x: 0, scale: 1, clearProps: 'transform' });
    return null;
  }

  const frames = [...track.querySelectorAll('.frame')];
  const focusFrames = frames.filter((f) => f.dataset.focus === 'true');

  // Layout-dependent distance — function-based so a later invalidate
  // (breakpoint change → matchMedia rebuild) re-measures rather than
  // replaying a stale pixel value. PLAN.md §3 rule 5.
  const totalDist = () => Math.max(0, track.scrollWidth - stage.clientWidth);

  // Fraction (0–1) of the total walk at which a frame's center aligns with
  // the viewport center — also function-based for the same reason.
  function fracFor(frame) {
    return () => {
      const dist = totalDist();
      if (!dist) return 0;
      const center = frame.offsetLeft + frame.offsetWidth / 2 - stage.clientWidth / 2;
      return gsap.utils.clamp(0, 1, center / dist);
    };
  }

  function originFor(frame) {
    return () => `${frame.offsetLeft + frame.offsetWidth / 2}px ${frame.offsetTop + frame.offsetHeight / 2}px`;
  }

  const tl = gsap.timeline();
  let cursor = 0;
  const legDur = 1.3;   // walk leg between waypoints
  const zoomDur = 0.45; // approach / pull-back
  const holdDur = 0.4;  // beat at full approach

  // Walk legs are split at each focus frame; the final leg runs to the end
  // of the wall. Parallax layers (wall texture l2 slower, columns l5
  // faster) ride the same leg via layerShift so the whole stack reads as
  // one wall, not independent images.
  const legs = [...focusFrames, null];

  legs.forEach((waypoint) => {
    const targetFrac = waypoint ? fracFor(waypoint) : () => 1;

    tl.to(track, { x: () => -totalDist() * targetFrac(), duration: legDur, ease: 'none' }, cursor);
    if (wall) {
      tl.to(wall, { x: () => -layerShift('l2', totalDist() * targetFrac()), duration: legDur, ease: 'none' }, cursor);
    }
    if (columns) {
      tl.to(columns, { x: () => -layerShift('l5', totalDist() * targetFrac()), duration: legDur, ease: 'none' }, cursor);
    }
    cursor += legDur;

    if (waypoint) {
      // 1.8×, not 2.2×: at 2.2 a focus piece's own caption was pushed past
      // the bottom of the viewport, and the wall around it disappeared
      // entirely — an approach should still read as standing in the room.
      tl.to(track, {
        scale: 1.8,
        transformOrigin: originFor(waypoint),
        duration: zoomDur,
        ease: 'none',
      }, cursor);
      cursor += zoomDur + holdDur; // approach, then hold the beat
      tl.to(track, { scale: 1, duration: zoomDur, ease: 'none' }, cursor);
      cursor += zoomDur;
    }
  });

  return tl;
}

export default { id: 'gallery', title: '05 · Gallery', render, init };
