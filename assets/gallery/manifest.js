// Gallery wall manifest — the couple drops photographs into assets/gallery/
// and fills `src` below; the wall, placeholders, and choreography in
// js/exhibits/gallery.js keep working with zero code changes.
//
// size: 'small' | 'medium' | 'large' | 'feature' — controls the frame's size
//       on the wall (see styles/exhibits/gallery.css for the pixel scale).
// focus: true marks a piece the wall approaches as it crosses center — the
//        whole track scales up until that frame nearly fills the viewport,
//        holds a beat, then pulls back. Exactly 3 pieces are marked true.
// src: '' renders an elegant placeholder (stone panel, hairline frame, small
//      monogram mark) until a real photograph exists at that path. Once src
//      is set, a real <img> renders instead — no other change required.

export const GALLERY = [
  { id: 'together',      src: '', alt: 'Nicole and Jason, together.',            caption: 'Together',       size: 'medium',  focus: false },
  { id: 'golden-hour',    src: '', alt: 'An evening together.',                   caption: 'Golden Hour',    size: 'small',   focus: false },
  { id: 'proposal',      src: '', alt: 'The proposal.',                          caption: 'The Proposal',   size: 'feature', focus: true  },
  { id: 'the-dogs',      src: '', alt: 'Jagger and Cleo.',                       caption: 'Jagger & Cleo',  size: 'small',   focus: false },
  { id: 'old-city',      src: '', alt: 'A street in Old City, Philadelphia.',    caption: 'Old City',       size: 'medium',  focus: false },
  { id: 'portrait',      src: '', alt: 'A portrait of the two of them.',         caption: 'Nicole & Jason', size: 'large',   focus: true  },
  { id: 'family',        src: '', alt: 'Family, gathered.',                     caption: 'Family',         size: 'small',   focus: false },
  { id: 'quiet-detail',  src: '', alt: 'A quiet detail.',                        caption: 'Details',        size: 'medium',  focus: false },
  { id: 'the-two-of-us', src: '', alt: 'The two of them.',                       caption: 'The Two of Us',  size: 'feature', focus: true  },
  { id: 'celebration',   src: '', alt: 'A celebration.',                        caption: 'Celebration',    size: 'small',   focus: false },
];
