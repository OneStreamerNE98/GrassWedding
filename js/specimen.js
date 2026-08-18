// SPECIMEN CONTENT — Chunk 1 only. Placeholder words and public-domain /
// generated placeholder images, used to review the framework's motion and
// navigation before any real content exists. Replaced wholesale in Chunk 2.

export const CHAPTERS = [
  {
    id: 'entrance',
    num: '00',
    title: 'Entrance',
    type: 'intro',
    content: {
      eyebrow: 'The Wedding Exhibition',
      names: 'Nicole + Jason',
      line: 'Saturday, June 12, 2027 · The Barnes Foundation · Philadelphia',
      hint: 'Scroll to enter',
    },
  },
  {
    id: 'room',
    num: '01',
    title: 'Specimen Room',
    type: 'bgRoom',
    content: {
      image: '/assets/specimen/spec-fog.jpg',
      alt: 'Specimen painting — stand-in artwork',
      eyebrow: 'Exhibition 01 · Specimen Room',
      heading: 'A full-bleed room',
      body:
        'This chapter demonstrates the background-image room: the work fills the wall, ' +
        'settles as you enter, and the label arrives beside it. Real copy replaces this in Chunk 2.',
      label: { kicker: '01.01 — Object label', title: 'Specimen object', lines: ['A fact would sit here.', 'A second line, if needed.'] },
    },
  },
  {
    id: 'passage',
    num: '02',
    title: 'The Passage',
    type: 'steps',
    content: {
      image: '/assets/specimen/spec-gold.jpg',
      alt: 'Specimen backdrop',
      eyebrow: 'Exhibition 02 · The Passage',
      timeline: ['4:30', '6:00', '8:30'],
      steps: [
        { kicker: 'Step one · 4:30', heading: 'Ceremony', body: 'Short passages step over a held image as you walk. This is the storytelling core of the reference site.' },
        { kicker: 'Step two · 6:00', heading: 'Cocktail hour', body: 'Each step fades through as scroll advances; the hour-line below tracks the day.' },
        { kicker: 'Step three · 8:30', heading: 'Reception', body: 'The passage releases back to the walk when the last step has said its piece.' },
      ],
    },
  },
  {
    id: 'zoom',
    num: '03',
    title: 'The Zoom',
    type: 'zoom',
    content: {
      image: '/assets/specimen/spec-pearl.jpg',
      alt: 'Specimen painting — stand-in for the hero photograph',
      caption: { kicker: 'Exhibition 03 · The Zoom', heading: 'The signature moment', body: 'A slow push into one image. In the real site, this is the engagement photograph.' },
      origin: '52% 38%',
    },
  },
  {
    id: 'pair',
    num: '04',
    title: 'The Pair',
    type: 'pair',
    content: {
      eyebrow: 'Exhibition 04 · The Pair',
      textStart: 'Two portraits, hung side by side.',
      textEnd: 'Nicole & Jason — the paired-portrait moment.',
      left: { image: '/assets/specimen/spec-portrait-a.jpg', alt: 'Specimen portrait A', caption: 'Portrait A' },
      right: { image: '/assets/specimen/spec-portrait-b.jpg', alt: 'Specimen portrait B', caption: 'Portrait B' },
      ledger: {
        prompt: 'Open the specimen document',
        image: '/assets/specimen/spec-doc.jpg',
        alt: 'Specimen document — stand-in for the invitation',
        caption: 'The ledger pattern: a document opens full-screen. In the real site, the invitation.',
      },
    },
  },
  {
    id: 'reading',
    num: '05',
    title: 'Reading Room',
    type: 'reading',
    content: {
      eyebrow: 'Exhibition 05 · Reading Room',
      heading: 'Normal flow resumes',
      body:
        'Long-form reading (details, FAQ, registry, RSVP) never fights the scroll — this chapter is ordinary ' +
        'document flow with the same typography. The footer below shows the follow-mouse link previews.',
      labels: [
        { kicker: 'Specimen · A', title: 'A question a guest might ask?', lines: ['An answer would live here, set in readable Inter at a size grandparents can manage.'] },
        { kicker: 'Specimen · B', title: 'Another question?', lines: ['Another answer.'] },
        { kicker: 'Specimen · C', title: 'Where are you registered?', lines: ['The registry chapter will answer this properly.'] },
      ],
      footerLinks: [
        { label: 'RSVP', href: '#ch-reading', preview: '/assets/specimen/spec-dusk.jpg' },
        { label: 'Registry', href: '#ch-reading', preview: '/assets/specimen/spec-sea.jpg' },
        { label: 'Details', href: '#ch-reading', preview: '/assets/specimen/spec-gold.jpg' },
      ],
      colophon: 'Specimen build — placeholder words and stand-in artwork. The real exhibition is poured in Chunk 2.',
    },
  },
];
