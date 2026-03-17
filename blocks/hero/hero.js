/**
 * Loads and decorates the hero block.
 * Structure is built by buildHeroBlock in scripts.js; this adds any block-specific behavior.
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  // Hero structure (picture + h1 + optional CTA link) is created by buildHeroBlock
  // Picture stays as background; wrap h1 and CTA in .hero-content for inline layout
  const row = block.querySelector(':scope > div');
  if (row) {
    const col = row.querySelector(':scope > div');
    if (col) {
      const heroContent = document.createElement('div');
      heroContent.className = 'hero-content';

      while (col.firstElementChild) {
        const el = col.firstElementChild;
        if (el.tagName === 'PICTURE') {
          block.appendChild(el);
        } else if (el.tagName === 'A' && el.href) {
          const wrapper = document.createElement('p');
          wrapper.className = 'button-wrapper';
          wrapper.appendChild(el);
          heroContent.appendChild(wrapper);
        } else {
          heroContent.appendChild(el);
        }
      }
      block.appendChild(heroContent);
      row.remove();
    }
  }
}
