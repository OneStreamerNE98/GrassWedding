// The recurring line motif: helpers for scroll-driven SVG stroke drawing.

// Prepare a path (or every path in a container) for draw-on animation.
export function prepDraw(target) {
  const paths = collect(target);
  for (const p of paths) {
    const len = p.getTotalLength();
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
  }
  return paths;
}

// Add a sequential draw of all paths to a timeline.
// opts: { start, duration (total), stagger (0..1 portion of overlap), ease }
export function drawOn(tl, target, opts = {}) {
  const { start = 0, duration = 1, ease = 'none' } = opts;
  const paths = collect(target);
  if (!paths.length) return tl;
  const per = duration / paths.length;
  paths.forEach((p, i) => {
    tl.to(p, { strokeDashoffset: 0, duration: per, ease }, start + per * i * 0.85);
  });
  return tl;
}

// Instantly show strokes (reduced-motion path).
export function showDrawn(target) {
  for (const p of collect(target)) p.style.strokeDashoffset = '0';
}

function collect(target) {
  if (typeof target === 'string') target = document.querySelector(target);
  if (!target) return [];
  if (target instanceof SVGPathElement) return [target];
  return [...target.querySelectorAll('path, line, polyline, circle, ellipse, rect')]
    .filter((el) => el.getTotalLength);
}
