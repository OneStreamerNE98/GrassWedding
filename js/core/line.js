// The recurring line motif — thin wrappers over DrawSVGPlugin.
// (DrawSVG is free since GSAP 3.13 and handles <line>/<rect>/<polyline>,
// partial draws, and cross-browser measurement — never hand-roll dashoffset.)

// Hide strokes before a draw-on (set drawSVG to zero-length).
export function prepDraw(target) {
  gsap.set(collect(target), { drawSVG: '0%' });
}

// Sequentially draw all strokes in a container onto a timeline.
// Stagger groups rather than whole large SVGs so only a few paths repaint
// per frame (CPU paint cost — see PLAN.md §3 rule 11).
export function drawOn(tl, target, opts = {}) {
  const { start = 0, duration = 1, ease = 'none', overlap = 0.85 } = opts;
  const els = collect(target);
  if (!els.length) return tl;
  const per = duration / els.length;
  els.forEach((el, i) => {
    tl.to(el, { drawSVG: '100%', duration: per, ease }, start + per * i * overlap);
  });
  return tl;
}

// Reduced-motion / resting state: strokes fully drawn.
export function showDrawn(target) {
  gsap.set(collect(target), { drawSVG: '100%' });
}

function collect(target) {
  if (typeof target === 'string') target = document.querySelector(target);
  if (!target) return [];
  if (target.tagName && target.tagName !== 'svg' && target.tagName !== 'g')
    return [target];
  return [...target.querySelectorAll('path, line, polyline, circle, ellipse, rect')];
}
