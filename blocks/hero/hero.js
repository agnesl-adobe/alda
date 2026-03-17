/**
 * Loads and decorates the hero block.
 * Structure is built by buildHeroBlock in scripts.js; this adds any block-specific behavior.
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  // Hero structure (picture + h1) is created by buildHeroBlock
  // Ensure picture and h1 are direct children of .hero for layout
  const row = block.querySelector(':scope > div');
  if (row) {
    const col = row.querySelector(':scope > div');
    if (col) {
      while (col.firstElementChild) {
        block.appendChild(col.firstElementChild);
      }
      row.remove();
    }
  }
}
