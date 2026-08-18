// ALL site copy lives here. Edit this file to change any words on the site —
// no animation code needs to be touched. Items marked TBD are awaiting
// Nicole + Jason; the site renders them as elegant structured placeholders.

export const CONTENT = {
  hero: {
    names: 'Nicole + Jason',
    eyebrow: 'The Wedding Exhibition',
    date: 'Saturday, June 12, 2027',
    venue: 'The Barnes Foundation',
    city: 'Philadelphia, Pennsylvania',
    coords: '39.9606° N · 75.1728° W',
  },

  story: {
    intro: 'Exhibition 01 · Our Story',
    firstDate: {
      label: 'Gallery 01.01 — First Date',
      when: 'September 2022',
      where: 'Sassafras, Philadelphia',
      // Negroni + tequila soda appear as drawn details in the scene, not copy.
    },
    walkHome: {
      label: 'Gallery 01.02 — The Walk Home',
      caption: 'Old City, after dark.',
    },
    memories: {
      label: 'Micro-gallery — Early Memories',
      pieces: [
        { id: 'dogs-meet', caption: 'Jagger meets Cleo', when: 'October 2022' },
        { id: 'thanksgiving', caption: 'First Thanksgiving', when: '' },
        { id: 'hanukkah', caption: 'Hanukkah', when: '' },
        { id: 'first-trip', caption: 'First trip together', when: '' },
        { id: 'life-together', caption: 'Life together', when: '' },
        { id: 'holidays', caption: 'Holidays', when: '' },
      ],
    },
    engagement: {
      label: 'The Engagement',
      // TBD: no invented details — caption stays minimal until supplied.
      caption: 'The Engagement',
    },
  },

  wedding: {
    intro: 'Exhibition 02 · The Wedding',
    arrival: 'Please plan to arrive 20–30 minutes before the ceremony begins.',
    installations: [
      {
        id: 'ceremony',
        label: '02.01 — Ceremony',
        time: 'TBD', // e.g. '4:30 in the afternoon'
        lines: ['Saturday, June 12, 2027', 'The Barnes Foundation'],
      },
      {
        id: 'cocktails',
        label: '02.02 — Cocktail Hour',
        time: 'TBD',
        lines: ['Garden-adjacent. Golden hour arrives near 8:30.'],
      },
      {
        id: 'reception',
        label: '02.03 — Reception',
        time: 'TBD',
        lines: ['Dinner and dancing to follow.'],
      },
    ],
  },

  weekend: {
    intro: 'Exhibition 03 · The Weekend',
    days: [
      { id: 'friday', day: 'Friday', date: 'June 11', title: 'Welcome', body: 'Details to follow.' },
      { id: 'saturday', day: 'Saturday', date: 'June 12', title: 'The Wedding', body: 'Ceremony, cocktails, and reception at the Barnes.' },
      { id: 'sunday', day: 'Sunday', date: 'June 13', title: 'Farewell', body: 'Details to follow.' },
    ],
  },

  philly: {
    intro: 'Exhibition 04 · Philadelphia',
    nodes: [
      {
        id: 'getting-here',
        label: 'Getting Here',
        items: [
          { title: 'By air', body: 'Philadelphia International (PHL) is 20–30 minutes from Center City by car. The SEPTA Airport Line runs to Center City in about 25 minutes.' },
          { title: 'By train', body: 'Amtrak arrives at 30th Street Station — about 1:15 from New York and 1:45 from Washington — five minutes from the Barnes.' },
          {
            title: 'Getting around',
            body: 'Uber and Lyft are the easiest way to reach the Barnes. Drop-off: 2025 Benjamin Franklin Parkway.',
            link: {
              label: 'Open in Maps',
              href: 'https://maps.google.com/?q=The+Barnes+Foundation,+2025+Benjamin+Franklin+Pkwy,+Philadelphia,+PA+19130',
            },
          },
        ],
      },
      {
        id: 'stay',
        label: 'Stay',
        items: [
          { title: 'Logan Square', body: 'Closest to the Barnes — a five-minute walk along the Parkway. Hotel block details to follow.' }, // TBD block
          { title: 'Rittenhouse Square', body: 'The city’s best restaurants and shopping, 15–20 minutes on foot or a 5-minute ride.' },
          { title: 'Center City', body: 'The widest range of hotels, all within a 10-minute ride of the Parkway.' },
        ],
      },
      {
        id: 'eat',
        label: 'Eat',
        items: [
          { title: 'Our favorites', body: 'A curated list is coming soon.' }, // TBD couple's picks
        ],
      },
      {
        id: 'explore',
        label: 'Explore',
        items: [
          { title: 'On the Parkway', body: 'The Rodin Museum next door, the Philadelphia Museum of Art and its famous steps, and the Franklin Institute.' },
          { title: 'Further afield', body: 'Reading Terminal Market, Rittenhouse Square, and Old City’s Independence Hall.' },
        ],
      },
      {
        id: 'parking',
        label: 'Parking',
        items: [
          {
            title: 'At the Barnes',
            body: 'On-site garage entered from Pennsylvania Avenue between 20th and 21st Streets.',
            link: {
              label: 'Open in Maps',
              href: 'https://maps.google.com/?q=The+Barnes+Foundation,+2025+Benjamin+Franklin+Pkwy,+Philadelphia,+PA+19130',
            },
          },
          { title: 'Nearby', body: 'Rodin Place (420 N. 20th St.), Dalian on the Park (500 N. 21st St.), and the Franklin Institute garage.' },
        ],
      },
    ],
  },

  details: {
    intro: 'Exhibition 06 · Details',
    subtitle: 'The Reading Room',
    faqs: [
      { q: 'What should I wear?', a: "We'll share the dress code with the invitations. In the meantime: please avoid white and ivory." },
      { q: 'What time should I arrive?', a: 'The ceremony begins promptly — please arrive 20–30 minutes early.' },
      { q: 'Is the celebration indoors or outdoors?', a: 'Indoors and air-conditioned, with garden-adjacent spaces at the Barnes.' },
      { q: 'Is the venue accessible?', a: 'Yes — the Barnes Foundation is fully ADA accessible, with elevators and accessible restrooms.' },
      { q: 'Can I bring a date?', a: 'Your invitation will have the details for your party.' },
      { q: 'Are children invited?', a: "We'll share this with the invitations." },
      { q: 'Where do I park?', a: 'The Barnes has an on-site garage entered from Pennsylvania Avenue between 20th and 21st Streets; nearby garages listed under Philadelphia.' },
      { q: 'What will the weather be like?', a: 'Philadelphia in June is warm — low 80s in the day, upper 60s in the evening, with a chance of a passing shower. The celebration is indoors.' },
      { q: 'When should I RSVP by?', a: 'TBD — the date will be on your invitation.' },
      { q: 'Where are you registered?', a: 'Your presence is the greatest gift. Registry details to follow.' }, // TBD links
      { q: 'Can I take photos during the ceremony?', a: "We'll let you know before the ceremony begins." },
      { q: 'Will the wedding be livestreamed?', a: 'If we add a stream, the link will live right here.' },
      { q: 'Whom do I contact with questions?', a: 'Contact details are on their way.' },
    ],
  },

  rsvp: {
    intro: 'Exhibition 07 · RSVP',
    turnstileSiteKey: '', // set after creating the Turnstile widget (DEPLOYMENT.md §3)
    ask: 'Will you join us?',
    deadline: '', // TBD e.g. 'Kindly reply by May 1, 2027'
    declineNote: 'We’ll miss you!',
    fallback: 'Prefer the old-fashioned way? Reach us directly and we’ll take care of it.', // TBD contact
    done: 'See you at the Barnes.',
    doneDate: 'June 12, 2027',
  },

  nav: {
    menu: 'Menu',
    directoryTitle: 'Exhibitions',
    close: 'Close',
  },
};
