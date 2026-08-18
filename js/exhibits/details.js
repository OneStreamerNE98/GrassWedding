// Exhibition 06 · Details — "The Reading Room." Intentionally calm: normal
// document flow (mode 'flow' in config.js — no pin, no .stage), a centered
// reading column, and the full FAQ set as native <details>/<summary>
// disclosures that work with zero JS. The only animation is a subtle
// fade/rise as the section crosses the viewport, scrubbed by the engine.

import { CONTENT } from '../content.js';

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function render(section) {
  const { intro, subtitle, faqs } = CONTENT.details;

  const items = faqs.map((faq) => `
    <details class="faq-item">
      <summary class="faq-q">${escapeHtml(faq.q)}</summary>
      <div class="faq-a"><p>${escapeHtml(faq.a)}</p></div>
    </details>`).join('');

  section.innerHTML = `
    <div class="reading-room">
      <p class="u-label reading-eyebrow">${escapeHtml(intro)}</p>
      <h2 id="h-details" class="display reading-title">${escapeHtml(subtitle)}</h2>
      <div class="faq-list">${items}</div>
    </div>`;
}

function init(ctx) {
  const { section, prefersReduced } = ctx;

  // Reduced motion: no scrub. Native <details>/<summary> already works with
  // zero JS, and with no gsap.set applied the resting DOM is fully legible.
  if (prefersReduced) return null;

  const eyebrow = section.querySelector('.reading-eyebrow');
  const title = section.querySelector('.reading-title');
  const items = [...section.querySelectorAll('.faq-item')];
  if (!title) return null;

  // autoAlpha, not opacity: every <summary> is focusable, and at opacity 0
  // they were 13 invisible Tab stops sitting between the top of the page and
  // its first real control (engine rule 14).
  gsap.set([eyebrow, title, ...items], { autoAlpha: 0, y: 12 });

  const tl = gsap.timeline();
  tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'none' }, 0);
  tl.to(title, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'none' }, 0.06);
  tl.to(items, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'none', stagger: 0.05 }, 0.18);

  return tl;
}

export default { id: 'details', title: '06 · Details', render, init };
