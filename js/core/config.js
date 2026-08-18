// Framework tuning — every knob a human might turn lives here.
// Numbers are safe to edit; nothing else in the codebase needs touching.

export const TUNING = {
  // Scroll softness. Lower = dreamier glide, higher = tighter. Range 0.06–0.2.
  lerp: 0.1,

  // Global multiplier on every animation duration. 1 = as designed.
  pace: 1.0,

  // Palette: 'light' = limestone day-gallery (current choice).
  // 'dark' = the Tracing Art night-gallery stage.
  palette: 'light',

  // How deep the assetZoom scene pushes into its image. 1.8–3.0 sensible.
  zoomDepth: 2.4,

  // Duration (s) of a menu/dot jump between chapters.
  jumpDuration: 1.1,
};

// Chapter heights, in vh — the "walking distance" through each scene type.
// Mobile gets ×0.75 automatically.
export const HEIGHTS = {
  intro: 170,
  bgRoom: 230,
  steps: 400,
  zoom: 320,
  pair: 330,
  reading: 0, // normal document flow
};

export const MOBILE_HEIGHT_FACTOR = 0.75;
export const MOBILE_BREAKPOINT = 768;
