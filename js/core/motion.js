import { BREAKPOINTS, LAYER_SPEEDS } from './config.js';

export const prefersReduced =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

export function viewportTier() {
  const w = window.innerWidth;
  if (w < BREAKPOINTS.mobile) return 'mobile';
  if (w < BREAKPOINTS.desktop) return 'tablet';
  return 'desktop';
}

// Device capability tier: 'full' | 'lean' | 'calm'
export function deviceTier() {
  if (prefersReduced) return 'calm';
  const mem = navigator.deviceMemory || 8;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (mem <= 4 || saveData || viewportTier() === 'mobile') return 'lean';
  return 'full';
}

// How far a layer should travel for a given primary-content travel distance.
export function layerShift(layer, primaryShift) {
  return primaryShift * (LAYER_SPEEDS[layer] ?? 1);
}

// Add a horizontal "walk" for a whole layer stack onto a timeline.
// stack = { l1: el, l2: el, l3: el, l4: el, l5: el } (any subset)
// primaryX = total x travel of the l3 content layer, as a number OR a function
// returning one — pass a function whenever the distance depends on layout so
// invalidateOnRefresh re-measures it (PLAN.md §3 rule 5).
export function walkStack(tl, stack, primaryX, opts = {}) {
  const { start = 0, duration = 1, ease = 'none' } = opts;
  const resolve = typeof primaryX === 'function' ? primaryX : () => primaryX;
  for (const [layer, el] of Object.entries(stack)) {
    if (!el) continue;
    tl.to(el, { x: () => layerShift(layer, resolve()), duration, ease }, start);
  }
  return tl;
}
