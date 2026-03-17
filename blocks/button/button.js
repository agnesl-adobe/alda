/**
 * Decorates links as buttons. Any link in this block becomes a styled button.
 * Variants: accent (orange CTA), primary, secondary - from strong/em formatting or block config.
 * @param {Element} block The button block element
 */
export default function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;

  link.classList.add('button');
  const wrapper = link.closest('p') || block.querySelector(':scope > div > div');
  if (wrapper) {
    wrapper.classList.add('button-wrapper');
  }

  // Check for authored formatting (strong/em) for variant
  const strong = link.closest('strong');
  const em = link.closest('em');
  if (strong && em) {
    link.classList.add('accent');
    const outer = strong.contains(em) ? strong : em;
    outer.replaceWith(link);
  } else if (strong) {
    link.classList.add('primary');
    strong.replaceWith(link);
  } else if (em) {
    link.classList.add('secondary');
    em.replaceWith(link);
  } else {
    // Default: accent (orange) for hero, secondary elsewhere
    const inHero = block.closest('.hero');
    link.classList.add(inHero ? 'accent' : 'secondary');
  }
}
