/* eslint-disable no-underscore-dangle, import/no-unresolved */
import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

// Live Preview: dapreview loaded in head.html when ?dapreview present
const hasDapreview = new URL(window.location.href).searchParams.get('dapreview');
if (hasDapreview) {
  document.documentElement.classList.add('dapreview');
}

/**
 * Builds hero block and prepends to main in a new section.
 * Includes first link from hero section as CTA button (e.g. "Adventures near you").
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    // Check if h1 or picture is already inside a hero block
    if (h1.closest('.hero') || picture.closest('.hero')) {
      return; // Don't create a duplicate hero block
    }
    const firstSection = main.querySelector(':scope > div');
    const heroLinks = firstSection?.querySelectorAll('a[href]') || [];
    const isAfterH1 = (el) => {
      const pos = h1.compareDocumentPosition(el);
      // eslint-disable-next-line no-bitwise -- compareDocumentPosition returns bitmask
      return (pos & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    };
    let ctaLink = [...heroLinks].find((a) => !h1.contains(a) && isAfterH1(a)) || null;
    // If link is inside h1 (e.g. same line in doc), extract it for use as CTA
    if (!ctaLink) {
      const linkInH1 = h1.querySelector('a[href]');
      if (linkInH1) {
        linkInH1.remove();
        ctaLink = linkInH1;
      }
    }
    const subheadings = firstSection?.querySelectorAll('h2, h3') || [];
    const isBefore = (el, other) => {
      const pos = el.compareDocumentPosition(other);
      // eslint-disable-next-line no-bitwise -- compareDocumentPosition returns bitmask
      return (pos & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
    };
    const subheading = [...subheadings].find((el) => isAfterH1(el)
      && (!ctaLink || isBefore(el, ctaLink))) || null;
    const contentElems = [h1, ...(subheading ? [subheading] : []), ...(ctaLink ? [ctaLink] : [])];
    const elems = [picture, ...contentElems];
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }

    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    p.className = 'button-wrapper';
    a.className = 'button';

    const strong = a.closest('strong');
    const em = a.closest('em');
    if (strong && em) {
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else if (em) {
      a.classList.add('secondary');
      em.replaceWith(a);
    } else {
      // Standalone link: always button. Accent (orange) in hero, secondary elsewhere
      const inHero = a.closest('.hero');
      a.classList.add(inHero ? 'accent' : 'secondary');
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

// UE Editor support before page load
if (/\.(stage-ue|ue)\.da\.live$/.test(window.location.hostname)) {
  await import(`${window.hlx.codeBasePath}/ue/scripts/ue.js`).then(({ default: ue }) => ue());
}

// Initialize dapreview when ready (loaded in head or 404) - handle race with event or stored ref
if (hasDapreview) {
  const initDapreview = (daPreview) => daPreview(loadPage);
  window.addEventListener('dapreview-ready', (e) => initDapreview(e.detail.daPreview), { once: true });
  const daPreviewRef = window[`${String.fromCharCode(95, 95)}daPreview`]; // window.__daPreview
  if (daPreviewRef) initDapreview(daPreviewRef); // event may have fired before listener
}

loadPage();

(function da() {
  const exp = new URL(window.location.href).searchParams.get('daexperiment');
  if (exp) {
    const base = 'https://da.live';
    import(`${base}/nx/public/plugins/exp/exp.js`);
  }
}());
