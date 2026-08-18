// Exhibit 04 — Philadelphia
// The line handed off from The Weekend grows nodes and becomes an editorial
// transit-diagram map (single-weight route, small nodes, u-label station
// names) — explicitly not a literal map. A wide track pans like a camera
// tracking the route right/down/diagonally; each stop pauses in focus while
// its info panel (real researched travel content) expands beside it. The
// Barnes Foundation anchors the route as a larger terminal node.

import { CONTENT } from '../content.js';
import { VENUE } from '../core/config.js';
import { drawOn, prepDraw, showDrawn } from '../core/line.js';
import { layerShift } from '../core/motion.js';

const RAW_NODES = CONTENT.philly.nodes;

// Shared coordinate space for both the SVG route and the HTML overlay —
// keeping one source of truth means the two always stay in register.
const MAP_W = 1200;
const MAP_H = 520;
const COORDS = {
  'getting-here': { x: 80, y: 300 },
  stay: { x: 300, y: 300 },
  eat: { x: 300, y: 460 },
  explore: { x: 620, y: 200 },
  parking: { x: 900, y: 200 },
  barnes: { x: 1140, y: 380 },
};

// The Barnes is the visually anchoring terminal — real, non-invented facts
// only, drawn from the venue constants (core/config.js is the single
// source of truth for those) rather than duplicating the street address
// already surfaced in the Getting Here / Parking stops above.
const STOPS = [
  ...RAW_NODES.map((n) => ({ ...n, terminal: false, ...COORDS[n.id] })),
  {
    id: 'barnes',
    label: 'The Barnes Foundation',
    terminal: true,
    items: [
      { title: 'The venue', body: `${VENUE.venue} — ${VENUE.city}.` },
      { title: 'The date', body: VENUE.dateText },
      { title: 'Coordinates', body: VENUE.coords },
    ],
    ...COORDS.barnes,
  },
];

const ROUTE_D = 'M' + STOPS.map((s) => `${s.x},${s.y}`).join(' L');

// Simplified, stylized Philadelphia skyline silhouette — a stepped block
// profile inspired by the reference drawing, built as one filled path so
// only a single element repaints (PLAN.md §3 rule 11).
const SKYLINE_BLOCKS = [
  [160, 55], [50, 25], [70, 100], [55, 125], [45, 150], [40, 190],
  [55, 130], [65, 165], [75, 140], [60, 155], [55, 115], [90, 65],
  [55, 135], [95, 60], [75, 48], [120, 40],
];

function pct(v, total) {
  return (v / total) * 100;
}

function skylineSvg() {
  const H = 200;
  let x = 0;
  let d = `M0,${H} `;
  for (const [w, h] of SKYLINE_BLOCKS) {
    d += `L${x},${H - h} L${x + w},${H - h} `;
    x += w;
  }
  d += `L${x},${H} Z`;
  return `<svg class="philly-skyline-svg" viewBox="0 0 ${x} ${H}" preserveAspectRatio="none" focusable="false" aria-hidden="true"><path d="${d}"></path></svg>`;
}

function nodeMarker(node) {
  const { x, y, terminal, id } = node;
  const cls = 'philly-node' + (terminal ? ' philly-node--terminal' : '');
  if (terminal) {
    return `
      <g class="${cls}" data-id="${id}">
        <circle cx="${x}" cy="${y}" r="16"></circle>
        <line class="philly-tick" x1="${x - 9}" y1="${y}" x2="${x + 9}" y2="${y}"></line>
        <line class="philly-tick" x1="${x}" y1="${y - 9}" x2="${x}" y2="${y + 9}"></line>
      </g>`;
  }
  return `
      <g class="${cls}" data-id="${id}">
        <rect x="${x - 7}" y="${y - 7}" width="14" height="14" transform="rotate(45 ${x} ${y})"></rect>
      </g>`;
}

function stopPanel(node) {
  const { x, y, label, items, terminal, id } = node;
  const cls = 'philly-stop' + (terminal ? ' philly-stop--terminal' : '');
  return `
      <div class="${cls}" data-id="${id}" style="left:${pct(x, MAP_W)}%; top:${pct(y, MAP_H)}%;">
        <p class="u-label philly-stop-label">${label}</p>
        <div class="philly-panel">
          <h3 class="display philly-panel-title">${label}</h3>
          ${items
            .map(
              (it) => `
          <div class="philly-item">
            <p class="philly-item-title">${it.title}</p>
            <p class="philly-item-body">${it.body}</p>
          </div>`
            )
            .join('')}
        </div>
      </div>`;
}

export default {
  id: 'philly',
  title: '04 · Philadelphia',

  render(section) {
    const stage = section.querySelector('.stage');
    stage.innerHTML = `
      <div class="layer layer--l1 philly-sky" aria-hidden="true">
        ${skylineSvg()}
      </div>
      <div class="layer layer--l3 philly-frame">
        <header class="philly-head">
          <p class="u-label">${CONTENT.philly.intro}</p>
          <h2 id="h-philly" class="display philly-title">Philadelphia</h2>
        </header>
        <div class="philly-map-track">
          <svg class="philly-route-svg" viewBox="0 0 ${MAP_W} ${MAP_H}" preserveAspectRatio="none" focusable="false" aria-hidden="true">
            <path class="philly-route-path" d="${ROUTE_D}"></path>
            ${STOPS.map((s) => nodeMarker(s)).join('')}
          </svg>
          <div class="philly-stops">
            ${STOPS.map((s) => stopPanel(s)).join('')}
          </div>
        </div>
      </div>
    `;
  },

  init({ stage, isMobile, prefersReduced }) {
    const track = stage.querySelector('.philly-map-track');
    const sky = stage.querySelector('.philly-sky');
    const routePath = stage.querySelector('.philly-route-path');
    const dots = [...stage.querySelectorAll('.philly-node')];
    const stopEls = [...stage.querySelectorAll('.philly-stop')];
    const panels = stopEls.map((el) => el.querySelector('.philly-panel'));

    // Reduced motion: every stop's panel is visible at rest, stacked in
    // reading order via philly.css; nothing scrubs.
    if (prefersReduced) {
      gsap.set(track, { x: 0 });
      gsap.set(sky, { x: 0 });
      gsap.set(dots, { scale: 1, opacity: 1 });
      gsap.set(panels, { opacity: 1, scale: 1 });
      showDrawn(routePath);
      return null;
    }

    gsap.set(track, { x: 0 });
    gsap.set(sky, { x: 0 });
    gsap.set(dots, { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
    gsap.set(panels, { opacity: 0, scale: 0.98, transformOrigin: '0% 50%' });
    prepDraw(routePath);

    // Function-based measurement so a later ScrollTrigger.refresh() (resize,
    // font load, orientation change) recomputes cleanly — never bake a
    // layout-dependent pixel value in as a literal.
    const maxTravel = () => Math.max(0, track.scrollWidth - stage.clientWidth);
    const centerOn = (el) => () => {
      const raw = el.offsetLeft + el.offsetWidth / 2 - stage.clientWidth / 2;
      return -Math.min(Math.max(raw, 0), maxTravel());
    };

    const HOLD = isMobile ? 0.7 : 1.0; // reading pause at each stop
    const MOVE = isMobile ? 0.4 : 0.55; // camera pan between stops
    const POP = 0.35; // node pop / panel reveal (intra-scene accent)

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

    let t = 0;
    stopEls.forEach((el, i) => {
      if (i > 0) {
        tl.to(track, { x: centerOn(el), duration: MOVE }, t);
        t += MOVE;
      }
      tl.to(dots[i], { scale: 1, opacity: 1, duration: POP, ease: 'back.out(1.6)' }, t);
      tl.to(panels[i], { opacity: 1, scale: 1, duration: POP, ease: 'power2.out' }, t);
      t += HOLD;
    });
    // Exit: the route continues on, off toward the Gallery exhibit.
    tl.to(track, { x: () => -maxTravel(), duration: MOVE }, t);
    t += MOVE;
    const total = t;

    // Skyline: far-background environment, drifting at 0.2x the route's
    // total travel (config.js LAYER_SPEEDS.l1) — a slow depth cue, not tied
    // to individual stop dwells.
    tl.to(sky, { x: () => layerShift('l1', -maxTravel()), duration: total, ease: 'none' }, 0);

    // The route draws on progressively as the camera travels its length.
    drawOn(tl, routePath, { start: 0, duration: total, ease: 'none' });

    return tl;
  },
};
