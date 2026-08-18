// Master timeline configuration — single source of truth for pacing.
// span = scroll distance (in vh units) each exhibit owns while pinned.
// mode 'pin'  = stage pinned full-viewport, module timeline scrubbed over span.
// mode 'flow' = normal document flow (natural height); timeline scrubbed while
//               the section crosses the viewport.

export const EXHIBITS = [
  { id: 'entrance', num: '00', title: 'Entrance',     menu: null,            span: 190, mode: 'pin'  },
  { id: 'story',    num: '01', title: 'Our Story',    menu: 'Our Story',     span: 270, mode: 'pin'  },
  { id: 'wedding',  num: '02', title: 'The Wedding',  menu: 'The Wedding',   span: 230, mode: 'pin'  },
  { id: 'weekend',  num: '03', title: 'The Weekend',  menu: 'The Weekend',   span: 130, mode: 'pin'  },
  { id: 'philly',   num: '04', title: 'Philadelphia', menu: 'Philadelphia',  span: 210, mode: 'pin'  },
  { id: 'gallery',  num: '05', title: 'Gallery',      menu: 'Gallery',       span: 200, mode: 'pin'  },
  { id: 'details',  num: '06', title: 'Details',      menu: 'Details',       span: 0,   mode: 'flow' },
  // RSVP is deliberately NOT pinned: the form is taller than a viewport at
  // ordinary desktop heights and far taller at 200% zoom, and inside a pinned
  // stage that forced an inner scroll container — a wheel trap that desynced
  // the scrub and stranded zoom/keyboard users. In flow the form is simply
  // read and filled in like any other page. The monogram/point choreography
  // still plays, scrubbed against the section's arrival.
  { id: 'rsvp',     num: '07', title: 'RSVP',         menu: 'RSVP',          span: 0,   mode: 'flow' },
];

export const BREAKPOINTS = { mobile: 768, desktop: 1200 };

// Mobile shortens every pin so the walk stays brisk on touch.
export const MOBILE_SPAN_FACTOR = 0.7;

// Parallax layer speed table (relative to primary content = 1.0).
export const LAYER_SPEEDS = { l1: 0.2, l2: 0.5, l3: 1.0, l4: 1.3, l5: 1.7 };

export const VENUE = {
  names: 'Nicole + Jason',
  dateISO: '2027-06-12',
  dateText: 'June 12, 2027',
  venue: 'The Barnes Foundation',
  city: 'Philadelphia',
  coords: '39.9606° N · 75.1728° W',
};
