// 00 · Entrance + Lobby — the loader/title/directory exhibit.
//
// One pinned scene, one scrubbed timeline. Local progress reads:
//   0.00–0.07  Signal        — a single ink point, breathing idle.
//   0.07–0.18  Data          — micro-labels resolve around the point.
//   0.18–0.34  Construction  — thin guide lines/rects draw outward (DrawSVG).
//   0.34–0.46  Perspective   — the flat plan bends into a corridor.
//   0.46–0.56  Materialization — linework crossfades to warm architecture.
//   0.56–0.80  Title wall    — "Nicole + Jason" resolves, then HOLDS alone.
//   0.80–0.86  Title recedes  — the wall empties completely.
//   0.86–1.00  Lobby         — the directory wall appears on a clean wall.
//
// The beats are strictly sequential: the title is never on screen at the same
// time as the directory (they occupy the same centre of the wall).
//
// gsap / ScrollTrigger / DrawSVGPlugin are vendored globals — never imported.

import { CONTENT } from '../content.js';
import { VENUE } from '../core/config.js';
import { goTo, exhibitList } from '../core/engine.js';
import { prepDraw, drawOn, showDrawn } from '../core/line.js';

// Phase boundaries as fractions of the local (0–1) scrubbed timeline.
const PHASE = {
  signal: [0, 0.07],
  data: [0.07, 0.18],
  build: [0.18, 0.34],
  perspective: [0.34, 0.46],
  materialize: [0.46, 0.56],
  title: [0.56, 0.68],   // resolves; then holds, alone, until titleOut
  titleOut: [0.80, 0.86],
  lobby: [0.86, 1.0],
};

// The airport code is real content — pulled from the Philadelphia exhibit's
// "Getting Here" copy rather than hardcoded, so it stays in sync with content.js.
function airportCode() {
  const body = CONTENT.philly?.nodes?.[0]?.items?.[0]?.body || '';
  const m = body.match(/\(([A-Z]{3})\)/);
  return m ? m[1] : '';
}

// "06 · 12 · 27" — derived from the canonical ISO date in core/config.js, not
// typed as prose. Formatting, not new copy.
function dateCode() {
  const [y, mo, d] = VENUE.dateISO.split('-');
  return `${mo} · ${d} · ${y.slice(2)}`;
}

// A static, typographic countdown — computed once at init from the venue's
// canonical date. No invented copy beyond the number itself + "days".
function daysUntil() {
  const target = new Date(`${VENUE.dateISO}T00:00:00`);
  const now = new Date();
  const ms = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export default {
  id: 'entrance',
  title: '00 · Entrance',

  render(section) {
    const stage = section.querySelector('.stage');
    const hero = CONTENT.hero;
    const directory = exhibitList();

    stage.innerHTML = `
      <div class="layer layer--l1 ent-far" aria-hidden="true" focusable="false">
        <span class="ent-glow"></span>
      </div>

      <div class="layer layer--l2 ent-rear" aria-hidden="true" focusable="false">
        <div class="ent-corridor ent-corridor--rear">
          <div class="ent-plane ent-plane--back"><span class="ent-plane-fill"></span></div>
          <div class="ent-plane ent-plane--floor"><span class="ent-plane-fill"></span></div>
          <div class="ent-plane ent-plane--ceiling"><span class="ent-plane-fill"></span></div>
        </div>
      </div>

      <div class="layer layer--l3 ent-content">
        <div class="ent-signal" aria-hidden="true" focusable="false">
          <span class="ent-point"></span>
        </div>

        <ul class="ent-meta" aria-hidden="true">
          <li class="ent-meta-item ent-meta-item--code u-label">${airportCode()}</li>
          <li class="ent-meta-item ent-meta-item--coords u-label">${hero.coords}</li>
          <li class="ent-meta-item ent-meta-item--date u-label">${dateCode()}</li>
        </ul>

        <svg class="line-art ent-construction" aria-hidden="true" focusable="false"
             viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
          <line class="ent-cx-axis" x1="0" y1="60" x2="200" y2="60"></line>
          <line class="ent-cx-axis" x1="100" y1="0" x2="100" y2="120"></line>
          <rect class="ent-cx-guide" x="38" y="18" width="124" height="84"></rect>
          <rect class="ent-cx-guide" x="64" y="34" width="72" height="52"></rect>
          <polyline class="ent-cx-guide" points="82,86 82,60 118,60 118,86"></polyline>
        </svg>

        <div class="ent-title">
          <p class="ent-title-eyebrow u-label">${hero.eyebrow}</p>
          <h1 id="h-entrance" class="ent-title-names">${hero.names}</h1>
          <p class="ent-title-date u-label">${hero.date}</p>
          <p class="ent-title-venue u-label">${hero.venue}<br>${hero.city}</p>
          <p class="ent-title-countdown u-label">${daysUntil()} days</p>
        </div>
      </div>

      <div class="layer layer--l4 ent-near">
        <div class="ent-corridor ent-corridor--near" aria-hidden="true" focusable="false">
          <div class="ent-plane ent-plane--left"><span class="ent-plane-fill"></span></div>
          <div class="ent-plane ent-plane--right"><span class="ent-plane-fill"></span></div>
        </div>

        <nav class="ent-directory" aria-label="Exhibition directory">
          <p class="ent-directory-head u-label">${CONTENT.nav.directoryTitle}</p>
          <ul class="ent-directory-list">
            ${directory
              .map(
                (ex) => `
              <li>
                <a href="#ex-${ex.id}" data-goto="${ex.id}">
                  <span class="num u-label">${ex.num}</span>
                  <span class="name">${ex.menu}</span>
                </a>
              </li>`
              )
              .join('')}
          </ul>
        </nav>
      </div>

      <div class="layer layer--l5 ent-occluder" aria-hidden="true" focusable="false"></div>
    `;

    // Directory links are real navigation — route them through the engine.
    for (const a of stage.querySelectorAll('[data-goto]')) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        goTo(a.dataset.goto);
      });
    }
  },

  init(ctx) {
    const { stage, prefersReduced } = ctx;

    const point = stage.querySelector('.ent-point');
    const metaItems = stage.querySelectorAll('.ent-meta-item');
    const construction = stage.querySelector('.ent-construction');
    const glow = stage.querySelector('.ent-glow');
    const rearPlanes = stage.querySelectorAll('.ent-corridor--rear .ent-plane');
    const nearPlanes = stage.querySelectorAll('.ent-corridor--near .ent-plane');
    const allPlaneFills = stage.querySelectorAll('.ent-plane-fill');
    const titleWall = stage.querySelector('.ent-title');
    const titleEyebrow = stage.querySelector('.ent-title-eyebrow');
    const titleNames = stage.querySelector('.ent-title-names');
    const titleDate = stage.querySelector('.ent-title-date');
    const titleVenue = stage.querySelector('.ent-title-venue');
    const titleCountdown = stage.querySelector('.ent-title-countdown');
    const directoryNav = stage.querySelector('.ent-directory');
    const occluder = stage.querySelector('.ent-occluder');

    if (prefersReduced) {
      // Final resting state: title + directory fully legible, strokes drawn,
      // architecture materialized. No motion, no pins (engine skips those).
      gsap.set(point, { opacity: 0 });
      gsap.set(metaItems, { opacity: 0 });
      gsap.set(construction, { opacity: 0.3 });
      showDrawn(construction);
      gsap.set(glow, { opacity: 0.4, scale: 1 });
      gsap.set([...rearPlanes, ...nearPlanes], { opacity: 1, rotateX: 0, rotateY: 0, translateZ: 0 });
      gsap.set(allPlaneFills, { opacity: 1 });
      gsap.set(titleWall, { opacity: 1, scale: 1, y: 0 });
      gsap.set([titleEyebrow, titleNames, titleDate, titleVenue, titleCountdown], { opacity: 1, y: 0 });
      gsap.set(directoryNav, { autoAlpha: 1, y: 0 });
      gsap.set(occluder, { opacity: 0, xPercent: 100 });
      return null;
    }

    // --- initial (Signal) state ------------------------------------------
    gsap.set(point, { opacity: 1, scale: 1 });
    gsap.set(metaItems, { opacity: 0, y: 6 });
    prepDraw(construction);
    gsap.set(construction, { opacity: 0, rotateX: 0, transformPerspective: 900 });
    gsap.set(glow, { opacity: 0, scale: 0.5 });
    gsap.set([...rearPlanes, ...nearPlanes], { opacity: 0, rotateX: 0, rotateY: 0, translateZ: 0 });
    gsap.set(allPlaneFills, { opacity: 0 });
    gsap.set(titleWall, { opacity: 0, scale: 1, y: 0 });
    gsap.set([titleEyebrow, titleNames, titleDate, titleVenue, titleCountdown], { opacity: 0, y: 22 });
    // autoAlpha (opacity + visibility), not opacity: the directory is real
    // navigation, and an invisible-but-focusable link list at the top of the
    // document put seven Tab stops before the page's first real control and
    // scroll-desynced the scrub when one was focused (engine rule 14).
    gsap.set(directoryNav, { autoAlpha: 0, y: 24 });
    gsap.set(occluder, { opacity: 0, xPercent: 100 });

    // Idle breathing loop — lives outside the scrubbed timeline; a single
    // scroll tick past the very start kills it for good.
    const idle = gsap.to(point, {
      scale: 1.5,
      opacity: 0.55,
      duration: 1.6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    const tl = gsap.timeline();

    tl.call(
      () => {
        idle.kill();
        gsap.set(point, { scale: 1, opacity: 1 });
      },
      null,
      0.0001
    );

    // --- B. Data — micro-labels resolve around the point -----------------
    const [dS, dE] = PHASE.data;
    tl.to(
      metaItems,
      { opacity: 1, y: 0, duration: (dE - dS) * 0.9, ease: 'none', stagger: (dE - dS) * 0.15 },
      dS
    );

    // --- C. Construction — guide lines/rects draw outward -----------------
    const [cS, cE] = PHASE.build;
    tl.to(construction, { opacity: 1, duration: (cE - cS) * 0.2, ease: 'none' }, cS);
    drawOn(tl, construction, { start: cS + (cE - cS) * 0.08, duration: (cE - cS) * 0.85, ease: 'none' });
    tl.to(glow, { opacity: 0.5, scale: 1, duration: cE - cS, ease: 'none' }, cS);

    // --- D. Perspective — the flat plan bends into a corridor -------------
    const [pS, pE] = PHASE.perspective;
    // The construction plan lifts and hands off to the materializing corridor.
    tl.to(construction, { rotateX: 48, opacity: 0.35, duration: pE - pS, ease: 'none' }, pS);
    tl.to(glow, { opacity: 0.2, duration: pE - pS, ease: 'none' }, pS);

    tl.to(stage.querySelector('.ent-plane--back'), { opacity: 1, translateZ: -420, duration: pE - pS, ease: 'none' }, pS);
    tl.to(stage.querySelector('.ent-plane--floor'), { opacity: 1, rotateX: 78, translateZ: -180, duration: pE - pS, ease: 'none' }, pS);
    tl.to(stage.querySelector('.ent-plane--ceiling'), { opacity: 1, rotateX: -78, translateZ: -180, duration: pE - pS, ease: 'none' }, pS);
    tl.to(stage.querySelector('.ent-plane--left'), { opacity: 1, rotateY: 62, translateZ: -80, duration: pE - pS, ease: 'none' }, pS + (pE - pS) * 0.15);
    tl.to(stage.querySelector('.ent-plane--right'), { opacity: 1, rotateY: -62, translateZ: -80, duration: pE - pS, ease: 'none' }, pS + (pE - pS) * 0.15);

    // --- E. Materialization — linework crossfades to warm planes ----------
    const [mS, mE] = PHASE.materialize;
    tl.to(allPlaneFills, { opacity: 1, duration: mE - mS, ease: 'none', stagger: (mE - mS) * 0.12 }, mS);
    tl.to(construction, { opacity: 0, duration: (mE - mS) * 0.6, ease: 'none' }, mS);
    tl.to(glow, { opacity: 0, duration: (mE - mS) * 0.6, ease: 'none' }, mS);
    tl.to(metaItems, { opacity: 0, duration: (mE - mS) * 0.5, ease: 'none' }, mS);
    tl.to(point, { opacity: 0, duration: (mE - mS) * 0.5, ease: 'none' }, mS);

    // --- F. Title wall ------------------------------------------------------
    const [tS, tE] = PHASE.title;
    const titleDur = tE - tS;
    tl.to(titleWall, { opacity: 1, duration: titleDur * 0.3, ease: 'none' }, tS);
    tl.to(titleEyebrow, { opacity: 1, y: 0, duration: titleDur * 0.5, ease: 'none' }, tS);
    tl.to(titleNames, { opacity: 1, y: 0, duration: titleDur * 0.55, ease: 'none' }, tS + titleDur * 0.12);
    tl.to(titleDate, { opacity: 1, y: 0, duration: titleDur * 0.5, ease: 'none' }, tS + titleDur * 0.3);
    tl.to(titleVenue, { opacity: 1, y: 0, duration: titleDur * 0.5, ease: 'none' }, tS + titleDur * 0.4);
    tl.to(titleCountdown, { opacity: 1, y: 0, duration: titleDur * 0.5, ease: 'none' }, tS + titleDur * 0.5);

    // --- Title recedes — the wall empties completely before the lobby ------
    // The title and the directory share the centre of the wall, so the title
    // must be fully gone (opacity 0) before the directory starts to arrive.
    const [oS, oE] = PHASE.titleOut;
    tl.to(titleWall, { scale: 0.94, y: -26, opacity: 0, duration: oE - oS, ease: 'none' }, oS);

    // --- Lobby — the directory wall appears on the emptied wall ------------
    const [lS, lE] = PHASE.lobby;
    const lobbyDur = lE - lS;
    tl.to(directoryNav, { autoAlpha: 1, y: 0, duration: lobbyDur * 0.55, ease: 'none' }, lS + lobbyDur * 0.1);

    // The exit handoff to Our Story is made on the Story side (its L5 wall
    // plane slides off to reveal the room), so the entrance's last frame
    // stays a clean, fully legible lobby: the directory IS the navigation.
    tl.set(occluder, { opacity: 0 }, lE);

    return tl;
  },
};
