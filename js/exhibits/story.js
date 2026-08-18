// 01 · Our Story — doorway occlusion → First Date (line-art draw-on) → a line
// escapes the frame and becomes the street seam → Walk Home (3-layer parallax
// walk) → Early Memories micro-gallery (horizontal wall) → Engagement
// (line-art → empty frame crossfade) → pull back + exit occlusion.
//
// Illustration continuity (PLAN.md §4): Jason — short dark hair, gray at the
// sides, strong eyebrows, clean-cut, friendly smile. Nicole — long
// center-parted hair, hoop earrings, delicate necklace, warm smile, slightly
// shorter than Jason. Jagger — mini Bordoodle, curly, simplified. Cleo —
// cocker spaniel, slim, stubbed tail. Single-weight black line, no fill.

import { CONTENT } from '../content.js';
import { prepDraw, drawOn, showDrawn } from '../core/line.js';
import { walkStack } from '../core/motion.js';

const S = CONTENT.story;

export default {
  id: 'story',
  title: '01 · Our Story',

  render(section) {
    const stage = section.querySelector('.stage');
    stage.innerHTML = template();
  },

  init(ctx) {
    const { stage, prefersReduced, isMobile } = ctx;
    const q = (sel) => stage.querySelector(sel);
    const qa = (sel) => [...stage.querySelectorAll(sel)];

    const els = {
      occluderIn: q('.story-occluder--in'),
      occluderOut: q('.story-occluder--out'),

      sceneFirstDate: q('.story-scene--firstdate'),
      fdArt: q('.story-firstdate-art'),
      fdRoom: q('.story-firstdate-art .g-room'),
      fdCounter: q('.story-firstdate-art .g-counter'),
      fdFigures: q('.story-firstdate-art .g-figures'),
      fdDrinks: q('.story-firstdate-art .g-drinks'),
      fdHead: q('.story-gallery-head'),

      seam: q('.story-seam'),
      seamPath: q('.story-seam-path'),

      sceneWalk: q('.story-scene--walkhome'),
      walkTint: q('.story-walk-tint'),
      walkBg: q('.story-walk-bg'),
      walkMid: q('.story-walk-mid'),
      walkFg: q('.story-walk-fg'),
      walkCaption: q('.story-walk-caption'),

      sceneMemories: q('.story-scene--memories'),
      memLabel: q('.story-memories-label'),
      memTrack: q('.story-memories-track'),
      memArt: qa('.story-frame-art'),

      sceneEngagement: q('.story-scene--engagement'),
      enWrap: q('.story-engagement-inner'),
      enArt: q('.story-engagement-art'),
      enFrame: q('.story-engagement-frame'),
    };

    if (prefersReduced) {
      restState(els);
      return null;
    }

    return buildTimeline(els, isMobile);
  },
};

// ---------------------------------------------------------------- template

function template() {
  const overline = S.intro.split('·')[0].trim();
  const heading = S.intro.split('·').pop().trim();
  const fd = S.firstDate;
  const wh = S.walkHome;
  const mem = S.memories;
  const eng = S.engagement;

  return `
    <div class="story-scenes">

      <div class="layer layer--l5 story-occluder story-occluder--in" aria-hidden="true"></div>

      <article class="story-scene story-scene--firstdate">
        <div class="layer layer--l3 story-firstdate-inner">
          <header class="story-gallery-head">
            <p class="u-label">${overline}</p>
            <h2 id="h-story">${heading}</h2>
            <p class="u-label story-gallery-kicker">${fd.label}</p>
            <p class="story-gallery-meta">${fd.when} &middot; ${fd.where}</p>
          </header>
          <div class="story-firstdate-frame">
            <div class="story-firstdate-art line-art" aria-hidden="true" focusable="false">
              ${firstDateSvg()}
            </div>
          </div>
        </div>
      </article>

      <div class="layer layer--l4 story-seam line-art" aria-hidden="true" focusable="false">
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none">
          <path class="story-seam-path" d="M660,368 C700,392 730,430 780,442 C860,460 940,462 1000,462" />
        </svg>
      </div>

      <article class="story-scene story-scene--walkhome" aria-label="${wh.label}">
        <div class="layer layer--l1 story-walk-tint" aria-hidden="true"></div>
        <div class="layer layer--l2 story-walk-bg line-art" aria-hidden="true" focusable="false">
          <svg viewBox="0 0 1800 500" preserveAspectRatio="xMidYMax slice">
            ${rowhousesSvg()}
          </svg>
        </div>
        <div class="layer layer--l3 story-walk-mid">
          <div class="story-walk-mid-art line-art" aria-hidden="true" focusable="false">
            <svg viewBox="0 0 500 380" preserveAspectRatio="xMidYMax meet">
              ${walkCoupleSvg()}
            </svg>
          </div>
          <div class="story-walk-caption">
            <h3 class="u-label">${wh.label}</h3>
            <p>${wh.caption}</p>
          </div>
        </div>
        <div class="layer layer--l4 story-walk-fg line-art" aria-hidden="true" focusable="false">
          <svg viewBox="0 0 900 500" preserveAspectRatio="xMidYMax slice">
            ${walkForegroundSvg()}
          </svg>
        </div>
      </article>

      <section class="story-scene story-scene--memories" aria-label="${mem.label}">
        <div class="layer layer--l3 story-memories-wall">
          <p class="u-label story-memories-label">${mem.label}</p>
          <div class="story-memories-track">
            ${mem.pieces.map(memoryFrame).join('')}
          </div>
        </div>
      </section>

      <article class="story-scene story-scene--engagement" aria-label="${eng.label}">
        <div class="layer layer--l3 story-engagement-inner">
          <div class="story-engagement-art line-art" aria-hidden="true" focusable="false">
            <svg viewBox="0 0 420 480">
              ${engagementCoupleSvg()}
            </svg>
          </div>
          <div class="story-engagement-frame">
            <div class="story-frame-empty"></div>
            <h3 class="u-label">${eng.caption}</h3>
          </div>
        </div>
      </article>

      <div class="layer layer--l5 story-occluder story-occluder--out" aria-hidden="true"></div>

    </div>
  `;
}

function memoryFrame(piece) {
  return `
    <article class="story-frame">
      <div class="story-frame-art line-art" aria-hidden="true" focusable="false">
        <svg viewBox="0 0 120 120">${memoryVignette(piece.id)}</svg>
      </div>
      <h4 class="u-label">${piece.caption}</h4>
      ${piece.when ? `<p class="story-frame-when">${piece.when}</p>` : ''}
    </article>
  `;
}

// ---------------------------------------------------------------- SVG art

function firstDateSvg() {
  return `
    <svg viewBox="0 0 900 440" preserveAspectRatio="xMidYMid meet">
      <g class="g-room">
        <line x1="60" y1="80" x2="840" y2="80" />
        <line x1="560" y1="150" x2="820" y2="150" />
        <line x1="560" y1="150" x2="560" y2="80" />
        <line x1="820" y1="150" x2="820" y2="80" />
        <rect x="596" y="95" width="16" height="55" rx="4" />
        <rect x="656" y="100" width="16" height="50" rx="4" />
        <rect x="716" y="92" width="16" height="58" rx="4" />
        <path d="M100,240 L100,90 Q100,60 140,60 Q180,60 180,90 L180,240" />
        <line x1="140" y1="60" x2="140" y2="240" />
      </g>
      <g class="g-counter">
        <line x1="60" y1="288" x2="840" y2="288" />
        <line x1="40" y1="300" x2="860" y2="300" />
        <line x1="40" y1="300" x2="60" y2="288" />
        <line x1="860" y1="300" x2="840" y2="288" />
        <path d="M40,300 L40,420 L860,420 L860,300" />
        <line x1="40" y1="420" x2="860" y2="420" />
        <ellipse cx="300" cy="330" rx="26" ry="8" />
        <line x1="284" y1="336" x2="270" y2="420" />
        <line x1="316" y1="336" x2="330" y2="420" />
        <ellipse cx="560" cy="330" rx="24" ry="8" />
        <line x1="546" y1="336" x2="534" y2="420" />
        <line x1="574" y1="336" x2="586" y2="420" />
      </g>
      <g class="g-figures">
        <circle cx="300" cy="150" r="40" />
        <path d="M262,148 Q270,100 300,96 Q330,100 338,148" />
        <line x1="264" y1="150" x2="270" y2="158" />
        <line x1="336" y1="150" x2="330" y2="158" />
        <path d="M282,142 Q290,135 300,140" />
        <path d="M300,140 Q310,135 320,142" />
        <circle cx="290" cy="150" r="2" />
        <circle cx="310" cy="150" r="2" />
        <path d="M284,168 Q300,178 316,168" />
        <line x1="292" y1="188" x2="292" y2="200" />
        <line x1="308" y1="188" x2="308" y2="200" />
        <path d="M250,300 L262,206 Q300,196 338,206 L350,300" />
        <path d="M262,230 Q240,260 246,300" />
        <path d="M338,230 Q365,255 378,285" />

        <circle cx="560" cy="160" r="36" />
        <path d="M560,124 Q525,140 520,220 Q520,260 530,300" />
        <path d="M560,124 Q595,140 600,220 Q600,260 590,300" />
        <line x1="560" y1="124" x2="560" y2="140" />
        <circle cx="596" cy="168" r="7" />
        <path d="M544,198 Q560,210 576,198" />
        <path d="M544,152 Q552,148 560,151" />
        <path d="M564,151 Q572,148 580,152" />
        <circle cx="552" cy="160" r="2" />
        <circle cx="570" cy="160" r="2" />
        <path d="M546,176 Q560,186 576,176" />
        <line x1="552" y1="196" x2="552" y2="206" />
        <line x1="570" y1="196" x2="570" y2="206" />
        <path d="M516,300 L528,216 Q560,206 594,216 L604,300" />
        <path d="M528,240 Q505,265 495,290" />
      </g>
      <g class="g-drinks">
        <path d="M380,270 L424,270 L416,300 L388,300 Z" />
        <path d="M392,270 A8,8 0 0 1 408,270" />
        <line x1="396" y1="270" x2="400" y2="262" />
        <line x1="404" y1="270" x2="400" y2="262" />
        <rect x="470" y="255" width="24" height="45" rx="2" />
        <path d="M470,255 L482,255 L476,242 Z" />
        <line x1="486" y1="230" x2="478" y2="299" />
      </g>
    </svg>
  `;
}

function rowhousesSvg() {
  let s = '';
  const count = 9;
  const spacing = 200;
  for (let i = 0; i < count; i++) {
    const x = 30 + i * spacing;
    s += `
      <path d="M${x},260 L${x},160 L${x + 88} ,160 L${x + 88},260" />
      <path d="M${x - 6},160 L${x + 44},118 L${x + 94},160" />
      <rect x="${x + 32}" y="198" width="24" height="62" />
      <rect x="${x + 10}" y="178" width="18" height="18" />
      <rect x="${x + 62}" y="178" width="18" height="18" />
    `;
  }
  s += `<line x1="0" y1="260" x2="1800" y2="260" />`;
  return s;
}

function walkCoupleSvg() {
  return `
    <circle cx="200" cy="140" r="26" />
    <path d="M178,132 Q200,110 222,132" />
    <path d="M182,166 L172,260 L228,260 L218,166 Z" />
    <line x1="185" y1="260" x2="178" y2="330" />
    <line x1="215" y1="260" x2="228" y2="330" />
    <path d="M222,180 Q250,200 262,220" />

    <circle cx="280" cy="148" r="22" />
    <path d="M262,132 Q255,180 262,240" />
    <path d="M298,132 Q305,180 298,240" />
    <path d="M264,170 L258,250 L302,250 L296,170 Z" />
    <line x1="268" y1="250" x2="262" y2="315" />
    <line x1="292" y1="250" x2="300" y2="315" />
    <path d="M262,190 Q244,205 262,220" />
    <circle cx="262" cy="220" r="4" />
  `;
}

function lampSvg(x) {
  return `
    <line x1="${x}" y1="500" x2="${x}" y2="120" />
    <path d="M${x - 16},90 L${x},74 L${x + 16},90" />
    <rect x="${x - 14}" y="90" width="28" height="34" rx="4" />
    <circle cx="${x}" cy="107" r="26" class="story-glow story-glow--1" />
    <circle cx="${x}" cy="107" r="16" class="story-glow story-glow--2" />
    <circle cx="${x}" cy="107" r="8" class="story-glow story-glow--3" />
  `;
}

function walkForegroundSvg() {
  let wall = '<line x1="0" y1="470" x2="900" y2="470" />';
  for (let x = 0; x <= 900; x += 45) {
    wall += `<line x1="${x}" y1="470" x2="${x}" y2="445" />`;
  }
  return `${lampSvg(120)}${lampSvg(650)}${wall}`;
}

function memoryVignette(id) {
  switch (id) {
    case 'dogs-meet':
      return `
        <ellipse cx="38" cy="80" rx="20" ry="12" />
        <path d="M20,68 Q24,60 28,68 Q32,60 36,68 Q40,60 44,68 Q48,60 52,68" />
        <circle cx="18" cy="68" r="10" />
        <ellipse cx="12" cy="72" rx="5" ry="8" />
        <circle cx="16" cy="66" r="1.4" />
        <line x1="26" y1="88" x2="26" y2="98" />
        <line x1="34" y1="90" x2="34" y2="98" />
        <line x1="46" y1="90" x2="46" y2="98" />
        <line x1="54" y1="88" x2="54" y2="98" />
        <path d="M58,72 Q66,68 62,60 Q56,62 58,70" />

        <ellipse cx="90" cy="80" rx="18" ry="10" />
        <circle cx="70" cy="70" r="9" />
        <path d="M64,68 Q56,78 62,92 Q68,86 66,72" />
        <circle cx="68" cy="68" r="1.4" />
        <line x1="80" y1="88" x2="80" y2="98" />
        <line x1="88" y1="90" x2="88" y2="98" />
        <line x1="96" y1="90" x2="96" y2="98" />
        <line x1="104" y1="88" x2="104" y2="98" />
        <line x1="108" y1="76" x2="113" y2="74" />
      `;
    case 'thanksgiving':
      return `
        <line x1="20" y1="90" x2="100" y2="90" />
        <line x1="30" y1="90" x2="30" y2="105" />
        <line x1="90" y1="90" x2="90" y2="105" />
        <ellipse cx="60" cy="82" rx="22" ry="8" />
        <path d="M60,40 Q45,55 60,75 Q75,55 60,40 Z" />
        <line x1="60" y1="42" x2="60" y2="72" />
      `;
    case 'hanukkah':
      return `
        <line x1="30" y1="95" x2="90" y2="95" />
        <line x1="60" y1="95" x2="60" y2="70" />
        <line x1="60" y1="70" x2="60" y2="44" />
        <path d="M60,75 Q46,75 44,58" />
        <path d="M60,75 Q53,75 51,64" />
        <path d="M60,75 Q74,75 76,58" />
        <path d="M60,75 Q67,75 69,64" />
        <path d="M42,44 q2,-6 4,0" />
        <path d="M50,50 q2,-6 4,0" />
        <path d="M60,40 q2,-6 4,0" />
        <path d="M68,50 q2,-6 4,0" />
        <path d="M76,44 q2,-6 4,0" />
      `;
    case 'first-trip':
      return `
        <rect x="35" y="55" width="50" height="35" rx="4" />
        <path d="M55,55 L55,46 Q55,41 60,41 Q65,41 65,46 L65,55" />
        <line x1="35" y1="70" x2="85" y2="70" />
        <rect x="57" y="67" width="6" height="5" />
      `;
    case 'life-together':
      return `
        <path d="M30,90 L30,55 L60,32 L90,55 L90,90 Z" />
        <path d="M55,90 L55,70 L65,70 L65,90" />
        <path d="M60,48 Q56,43 51,47 Q47,51 51,57 Q55,61 60,66 Q65,61 69,57 Q73,51 69,47 Q64,43 60,48 Z" />
      `;
    case 'holidays':
    default:
      return `
        <path d="M60,30 L46,54 L53,54 L40,78 L49,78 L32,100 L88,100 L71,78 L80,78 L67,54 L74,54 Z" />
        <path d="M60,18 L62,24 L68,24 L63,28 L65,34 L60,30 L55,34 L57,28 L52,24 L58,24 Z" />
        <line x1="60" y1="100" x2="60" y2="108" />
      `;
  }
}

function engagementCoupleSvg() {
  return `
    <circle cx="150" cy="90" r="42" />
    <path d="M110,88 Q116,42 150,38 Q184,42 190,88" />
    <path d="M112,96 L118,104" />
    <path d="M188,96 L182,104" />
    <path d="M130,80 Q140,74 150,79" />
    <path d="M150,79 Q160,74 170,80" />
    <circle cx="138" cy="90" r="2.2" />
    <circle cx="162" cy="90" r="2.2" />
    <path d="M132,108 Q150,120 168,108" />
    <path d="M96,220 L118,132 Q150,120 182,132 L204,220 L184,440 L152,440 L150,260 L148,440 L116,440 Z" />
    <path d="M96,220 Q80,260 88,300" />

    <circle cx="280" cy="106" r="36" />
    <path d="M280,66 Q235,86 228,180 Q228,230 240,260" />
    <path d="M280,66 Q325,86 332,180 Q332,230 320,260" />
    <line x1="280" y1="66" x2="280" y2="86" />
    <circle cx="320" cy="114" r="6" />
    <path d="M262,144 Q280,156 298,144" />
    <path d="M262,98 Q270,92 280,97" />
    <path d="M284,97 Q294,92 302,98" />
    <circle cx="270" cy="106" r="2.2" />
    <circle cx="292" cy="106" r="2.2" />
    <path d="M264,122 Q280,132 296,122" />
    <path d="M244,260 L254,190 Q280,178 308,190 L320,260 L300,440 L262,440 L262,300 L260,440 L222,440 Z" />
    <path d="M204,220 Q212,236 222,244" />
    <circle cx="200" cy="228" r="4" />
  `;
}

// -------------------------------------------------------------- rest state

function restState(els) {
  gsap.set(els.occluderIn, { xPercent: -100 });
  gsap.set(els.occluderOut, { xPercent: 0, opacity: 0 });

  gsap.set(els.sceneFirstDate, { opacity: 1 });
  gsap.set(els.sceneWalk, { opacity: 1 });
  gsap.set(els.sceneMemories, { opacity: 1 });
  gsap.set(els.sceneEngagement, { opacity: 1 });

  gsap.set(els.walkTint, { opacity: 0.28 });
  gsap.set([els.walkBg, els.walkMid, els.walkFg], { x: 0 });
  gsap.set(els.seam, { opacity: 1 });

  gsap.set(els.enArt, { opacity: 1 });
  gsap.set(els.enFrame, { opacity: 1 });
  gsap.set(els.enWrap, { scale: 1 });

  showDrawn(els.fdArt);
  showDrawn(els.seam);
  showDrawn(els.walkBg);
  showDrawn(els.walkMid);
  showDrawn(els.walkFg);
  els.memArt.forEach(showDrawn);
  showDrawn(els.enArt);
}

// ----------------------------------------------------------------- timeline

function buildTimeline(els, isMobile) {
  const tl = gsap.timeline({ defaults: { ease: 'none' } });

  // Static (non-scrubbed) art is drawn once, up front — cheap and legible
  // the instant each scene scrolls into view.
  showDrawn(els.walkBg);
  showDrawn(els.walkMid);
  showDrawn(els.walkFg);
  els.memArt.forEach(showDrawn);

  gsap.set(els.sceneFirstDate, { opacity: 1 });
  gsap.set(els.sceneWalk, { opacity: 0 });
  gsap.set(els.sceneMemories, { opacity: 0 });
  gsap.set(els.sceneEngagement, { opacity: 0 });
  gsap.set(els.occluderIn, { xPercent: 0 });
  gsap.set(els.occluderOut, { xPercent: 100, opacity: 1 });
  gsap.set(els.walkTint, { opacity: 0 });
  gsap.set(els.seam, { opacity: 0 });
  gsap.set(els.enFrame, { opacity: 0 });
  gsap.set(els.enArt, { opacity: 1 });
  gsap.set(els.enWrap, { scale: 1 });

  prepDraw(els.fdRoom);
  prepDraw(els.fdCounter);
  prepDraw(els.fdFigures);
  prepDraw(els.fdDrinks);
  prepDraw(els.seamPath);

  tl.addLabel('entrance', 0);
  tl.addLabel('firstDate', 8);
  tl.addLabel('walkHome', 35);
  tl.addLabel('memories', 60);
  tl.addLabel('engagement', 85);
  tl.addLabel('exit', 96);

  // 1 · ENTRANCE — L5 wall plane slides off, revealing the room (turn right).
  tl.to(els.occluderIn, { xPercent: -100, duration: 8 }, 'entrance');

  // 2 · FIRST DATE — progressive draw, staggered by group.
  drawOn(tl, els.fdRoom, { start: 3, duration: 6, overlap: 0.7 });
  drawOn(tl, els.fdCounter, { start: 8, duration: 6, overlap: 0.7 });
  drawOn(tl, els.fdFigures, { start: 13, duration: 8, overlap: 0.75 });
  drawOn(tl, els.fdDrinks, { start: 20, duration: 4, overlap: 0.6 });

  // 3 · a line escapes the frame and becomes the street seam.
  tl.to(els.seam, { opacity: 1, duration: 1 }, 32);
  drawOn(tl, els.seamPath, { start: 32, duration: 5 });
  tl.to(els.sceneFirstDate, { opacity: 0, duration: 6 }, 30);

  // 4 · WALK HOME — camera walks left; 3-layer parallax; warm evening tint.
  tl.to(els.sceneWalk, { opacity: 1, duration: 5 }, 'walkHome');
  tl.to(els.walkTint, { opacity: isMobile ? 0.3 : 0.4, duration: 8 }, 'walkHome');

  const walkDist = isMobile ? -260 : -560;
  const walkStackEls = isMobile
    ? { l2: els.walkBg, l3: els.walkMid }
    : { l2: els.walkBg, l3: els.walkMid, l4: els.walkFg };
  if (isMobile) gsap.set(els.walkFg, { opacity: 0 });
  walkStack(tl, walkStackEls, walkDist, { start: 'walkHome', duration: 24 });

  tl.to(els.sceneWalk, { opacity: 0, duration: 4 }, 56);
  tl.to(els.seam, { opacity: 0, duration: 4 }, 56);

  // 5 · EARLY MEMORIES — wide wall translates past 6 framed pieces.
  tl.to(els.sceneMemories, { opacity: 1, duration: 4 }, 'memories');
  tl.to(
    els.memTrack,
    {
      x: () => -(els.memTrack.scrollWidth - window.innerWidth),
      duration: 22,
    },
    'memories'
  );
  tl.to(els.sceneMemories, { opacity: 0, duration: 3 }, 82);

  // 6 · ENGAGEMENT — quiet, singular, centered; line art crossfades to frame.
  tl.to(els.sceneEngagement, { opacity: 1, duration: 3 }, 'engagement');
  tl.to(els.enWrap, { scale: 1.06, duration: 11, ease: 'none' }, 'engagement');
  tl.to(els.enArt, { opacity: 0, duration: 6 }, 87);
  tl.to(els.enFrame, { opacity: 1, duration: 6 }, 87);

  // 7 · EXIT — pull back slightly, then L5 occluder wipes toward The Wedding.
  tl.to(els.enWrap, { scale: 1, duration: 4 }, 'exit');
  tl.to(els.occluderOut, { xPercent: 0, duration: 4 }, 'exit');

  return tl;
}
