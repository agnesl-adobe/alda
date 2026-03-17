/**
 * Loads and decorates the hero block.
 * Structure is built by buildHeroBlock in scripts.js; this adds any block-specific behavior.
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  // Hero structure (picture + h1 + optional CTA link) is created by buildHeroBlock
  // Ensure picture, h1, and CTA are direct children of .hero for layout
  const row = block.querySelector(':scope > div');
  if (row) {
    const col = row.querySelector(':scope > div');
    if (col) {
      while (col.firstElementChild) {
        const el = col.firstElementChild;
        block.appendChild(el);
        // Style CTA link as orange hero button
        if (el.tagName === 'A' && el.href) {
          const wrapper = document.createElement('p');
          wrapper.className = 'button-wrapper';
          wrapper.appendChild(el);
          block.appendChild(wrapper);
        }
      }
      row.remove();
    }
  }
}
