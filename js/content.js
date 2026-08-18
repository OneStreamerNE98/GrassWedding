// ALL site copy lives here — the single content source (PLAN.md §5).
// Edit this file to change any words on the site; no animation code needs
// touching. Facts kept strictly to the PLAN §8 keep list. Anything whose
// value is still unknown (times, dress code, deadline, registry links,
// hotel block, contact) renders as an honest "to follow" placeholder —
// never an invented fact.

const MAPS_URL =
  'https://maps.google.com/?q=The+Barnes+Foundation,+2025+Benjamin+Franklin+Pkwy,+Philadelphia,+PA+19130';

export const CONTENT = {
  couple: {
    mono: 'N + J',
    names: 'Nicole + Jason',
    date: 'Saturday, June 12, 2027',
    venue: 'The Barnes Foundation',
    address: ['2025 Benjamin Franklin Parkway', 'Philadelphia, PA 19130'],
    city: 'Philadelphia',
    mapsUrl: MAPS_URL,
  },

  entrance: {
    framing:
      'We are getting married at the Barnes Foundation in Philadelphia. ' +
      'Everything a guest needs hangs along this walk.',
    hint: 'Scroll down',
  },

  wedding: {
    card: { kicker: 'Exhibition 01', title: 'The Wedding' },
    image: '/assets/specimen/spec-gold.jpg',
    alt: 'Stand-in artwork — a gilded painting holds this wall until wedding photography arrives.',
    timeline: ['Ceremony', 'Cocktails', 'Reception'],
    steps: [
      {
        kicker: '01 · Time to follow',
        heading: 'Ceremony',
        body:
          'Saturday, June 12, 2027, at the Barnes Foundation. ' +
          'Please plan to arrive 20–30 minutes before the ceremony begins.',
      },
      {
        kicker: '02 · Time to follow',
        heading: 'Cocktail Hour',
        body: 'Cocktails follow the ceremony. Details arrive with the invitations.',
      },
      {
        kicker: '03 · Time to follow',
        heading: 'Reception',
        body: 'Dinner and dancing to follow.',
      },
    ],
  },

  travel: {
    eyebrow: 'Exhibition 02 · Travel',
    heading: 'Getting to the Barnes',
    body:
      'The Barnes Foundation sits on the Benjamin Franklin Parkway in Philadelphia — ' +
      'indoors, air-conditioned, and fully ADA accessible. Rideshares drop off at the door; ' +
      'the full travel and parking notes hang in the Details reading room.',
    image: '/assets/specimen/spec-fog.jpg',
    alt: 'Stand-in artwork — a painted landscape holds this wall until a venue photograph arrives.',
    credit:
      'Wanderer above the Sea of Fog, Caspar David Friedrich · Hamburger Kunsthalle · stand-in artwork, public domain, until a venue photograph arrives.',
    label: {
      kicker: '02.01 — The address',
      title: 'The Barnes Foundation',
      lines: ['2025 Benjamin Franklin Parkway', 'Philadelphia, PA 19130'],
    },
    breakout: { label: 'Open in Maps', href: MAPS_URL },
  },

  // PLAN §6 model. Add stores as { name, url, blurb } — a store renders only
  // once it has a url. While `stores` is empty the chapter shows the graceful
  // "details to follow" card instead.
  registry: {
    eyebrow: 'Exhibition 03 · Registry',
    heading: 'Registry',
    intro: 'Thank you for thinking of us.',
    note: 'Your presence is the greatest gift we could ask for.',
    listTitle: 'Where we are registered',
    linkLabel: 'Visit registry',
    empty: {
      kicker: '03.01 — Registry',
      title: 'Registry details to follow',
      lines: ['Store links will appear here once the registry exists.'],
    },
    stores: [],
    fund: null,
  },

  details: {
    eyebrow: 'Exhibition 04 · Details',
    heading: 'The Reading Room',
    body: 'Everything a guest might ask, hung in one place. More answers arrive with the invitations.',
    labels: [
      {
        kicker: '04.01 — Arrival',
        title: 'What time should I arrive?',
        lines: ['The ceremony begins promptly — please arrive 20–30 minutes early.'],
      },
      {
        kicker: '04.02 — The rooms',
        title: 'Indoors or outdoors?',
        lines: ['Indoors and air-conditioned at the Barnes.'],
      },
      {
        kicker: '04.03 — Accessibility',
        title: 'Is the venue accessible?',
        lines: ['Yes — the Barnes Foundation is fully ADA accessible, with elevators and accessible restrooms.'],
      },
      {
        kicker: '04.04 — Parking',
        title: 'Where do I park?',
        lines: [
          'The Barnes has an on-site garage entered from Pennsylvania Avenue between 20th and 21st Streets.',
          'Nearby: Rodin Place (420 N. 20th St.), Dalian on the Park (500 N. 21st St.), and the Franklin Institute garage.',
        ],
      },
      {
        kicker: '04.05 — Dress code',
        title: 'What should I wear?',
        lines: ['Details to follow — the dress code arrives with the invitations.'],
      },
      {
        kicker: '04.06 — RSVP',
        title: 'When should I reply by?',
        lines: ['The reply-by date will be on your invitation. The RSVP room is just ahead.'],
      },
      {
        kicker: '04.07 — Registry',
        title: 'Where are you registered?',
        lines: ['Your presence is the greatest gift — the Registry chapter has the rest.'],
      },
      {
        kicker: '04.08 — Questions',
        title: 'Whom do I contact?',
        lines: ['Contact details to follow.'],
      },
    ],
    travelList: {
      title: 'Getting here',
      items: [
        {
          title: 'By air',
          sub: 'Philadelphia International (PHL) is 20–30 minutes from Center City by car; the SEPTA Airport Line runs to Center City in about 25 minutes.',
        },
        {
          title: 'By train',
          sub: 'Amtrak arrives at 30th Street Station — about 1:15 from New York and 1:45 from Washington.',
        },
        {
          title: 'By rideshare',
          sub: 'Uber and Lyft drop off at the Barnes: 2025 Benjamin Franklin Parkway.',
        },
      ],
    },
    footerLinks: [
      { label: 'RSVP', href: '#ch-rsvp', preview: '/assets/specimen/spec-dusk.jpg' },
      { label: 'Registry', href: '#ch-registry', preview: '/assets/specimen/spec-sea.jpg' },
      { label: 'Travel', href: '#ch-travel', preview: '/assets/specimen/spec-fog.jpg' },
    ],
    colophon: 'Nicole + Jason · Saturday, June 12, 2027 · The Barnes Foundation, Philadelphia.',
  },

  rsvp: {
    eyebrow: 'Exhibition 05 · RSVP',
    ask: 'Will you join us?',
    deadline: '', // e.g. 'Kindly reply by May 1, 2027' — blank shows the placeholder below
    deadlinePlaceholder: 'The reply-by date will follow with your invitation.',
    turnstileSiteKey: '0x4AAAAAAET2DUuTxkRbJg_k',
    form: {
      nameLabel: 'Full name',
      emailLabel: 'Email',
      emailHint: '(optional — for a confirmation)',
      attendingLegend: 'Will you join us?',
      accept: 'Joyfully accept',
      decline: 'Regretfully decline',
      seatsLabel: 'How many of you?',
      maxSeats: 6,
      dietaryLabel: 'Dietary needs',
      noteLabel: 'A note for us',
      noteHint: '(optional)',
      submit: 'Send our RSVP',
      submitting: 'Sending…',
    },
    declineNote: 'We’ll miss you!',
    partyHint: 'We have your party down as {name} — up to {seats} seats.',
    lookupMiss: 'We couldn’t find that name on our list — no matter, your reply will still reach us.',
    errors: {
      name: 'Please tell us your name.',
      nameLong: 'That name is a little too long.',
      email: 'That doesn’t look like a valid email — or leave it blank.',
      attending: 'Please let us know if you can join us.',
      checkForm: 'Please check the highlighted field below.',
    },
    status: {
      sending: 'Sending your RSVP…',
      verifyFailed: 'We couldn’t verify that automatically — please try again.',
      duplicate: 'Looks like this already went through — thank you! If that’s not right, please reach us directly.',
      badRequest: 'Please double-check the form and try again.',
      failed: 'Something went wrong on our end. Please try again in a moment, or reach us directly.',
    },
    fallback: 'The RSVP book isn’t open just yet — please check back soon, or reach us directly and we’ll take care of it.',
    done: 'See you at the Barnes.',
    doneDate: 'Saturday, June 12, 2027',
  },

  nav: {
    about: [
      'Nicole + Jason are getting married on Saturday, June 12, 2027, at the Barnes Foundation on the Benjamin Franklin Parkway in Philadelphia.',
      'Some walls still hang stand-in artwork — public-domain paintings holding each spot until photographs arrive.',
    ],
    chaptersFoot: 'Nicole + Jason · June 12, 2027',
    aboutFoot: 'grass.wedding',
  },
};

/* ------------------------------------------------------------------ */
/* Chapter definitions — the array the engine walks. Order here is the
   walk order and the dot-rail order. Scene shapes are documented in
   js/core/scenes.js.                                                  */

const c = CONTENT;

const registryStores = (c.registry.stores || []).filter((s) => s && s.url);

export const CHAPTERS = [
  {
    id: 'entrance',
    num: '00',
    title: 'Entrance',
    type: 'intro',
    content: {
      mono: c.couple.mono,
      names: c.couple.names,
      subtitle: c.couple.date,
      framing: c.entrance.framing,
      hint: c.entrance.hint,
    },
  },
  {
    id: 'wedding',
    num: '01',
    title: 'The Wedding',
    type: 'steps',
    content: {
      card: c.wedding.card,
      image: c.wedding.image,
      alt: c.wedding.alt,
      timeline: c.wedding.timeline,
      steps: c.wedding.steps,
    },
  },
  {
    id: 'travel',
    num: '02',
    title: 'Travel',
    type: 'bgRoom',
    content: {
      image: c.travel.image,
      alt: c.travel.alt,
      eyebrow: c.travel.eyebrow,
      heading: c.travel.heading,
      body: c.travel.body,
      label: c.travel.label,
      breakout: c.travel.breakout,
      credit: c.travel.credit,
    },
  },
  {
    id: 'registry',
    num: '03',
    title: 'Registry',
    type: 'reading',
    content: {
      eyebrow: c.registry.eyebrow,
      heading: c.registry.heading,
      body: c.registry.intro,
      note: c.registry.note,
      // Stores render only once they have a url; until then, the graceful card.
      labels: registryStores.length ? [] : [c.registry.empty],
      list: registryStores.length
        ? {
            title: c.registry.listTitle,
            items: registryStores.map((s) => ({
              title: s.name,
              sub: s.blurb || '',
              href: s.url,
              linkLabel: c.registry.linkLabel,
            })),
          }
        : null,
    },
  },
  {
    id: 'details',
    num: '04',
    title: 'Details',
    type: 'reading',
    content: {
      eyebrow: c.details.eyebrow,
      heading: c.details.heading,
      body: c.details.body,
      labels: c.details.labels,
      list: c.details.travelList,
      footerLinks: c.details.footerLinks,
      colophon: c.details.colophon,
    },
  },
  {
    id: 'rsvp',
    num: '05',
    title: 'RSVP',
    type: 'rsvp',
    content: c.rsvp,
  },
];
