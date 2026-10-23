// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetches the nav fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA/EDS preview and live).
 * @returns {Promise<{html: string, baseUrl: string}|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), baseUrl: resp.url };
}

/**
 * Resolves relative image paths against the fragment URL so they work from any page.
 * @param {Element} root The fragment root
 * @param {string} baseUrl The URL the fragment was loaded from
 */
function resolveImages(root, baseUrl) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), baseUrl).href;
    img.loading = 'eager';
  });
}

/**
 * Closes every open dropdown in the given container
 * @param {Element} container The element holding the dropdowns
 * @param {Element} [except] A dropdown to leave untouched
 */
function closeDropdowns(container, except = null) {
  container.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((drop) => {
    if (drop !== except) drop.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Toggles the mobile menu
 * @param {Element} nav The nav element
 * @param {boolean|null} forceExpanded Optional state to force
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? forceExpanded : nav.getAttribute('aria-expanded') !== 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
  if (button) button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  if (!expanded) closeDropdowns(nav);
}

/**
 * Turns the nav section list into click-toggled dropdowns
 * @param {Element} list The top-level <ul> of the nav sections
 */
function decorateDropdowns(list) {
  list.querySelectorAll(':scope > li').forEach((item) => {
    const submenu = item.querySelector(':scope > ul');
    if (!submenu) return;
    item.classList.add('nav-drop');
    item.setAttribute('aria-expanded', 'false');
    const label = item.querySelector(':scope > p, :scope > a') || item.firstChild;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-drop-toggle nav-trigger';
    toggle.textContent = label.textContent.trim();
    toggle.setAttribute('aria-haspopup', 'true');
    label.replaceWith(toggle);
    submenu.classList.add('nav-dropdown');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = item.getAttribute('aria-expanded') === 'true';
      closeDropdowns(list, item);
      item.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
}

/**
 * Builds a picture-free image link group (logo variants, badges)
 * @param {Element} section The source section
 * @param {string[]} variantClasses Class to assign to each image paragraph, in order
 */
function tagVariants(section, variantClasses) {
  [...section.children].forEach((child, i) => {
    if (variantClasses[i]) child.classList.add(variantClasses[i]);
  });
}

/**
 * Loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navData = await fetchNav();
  block.textContent = '';
  if (!navData) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = navData.html;
  resolveImages(fragment, navData.baseUrl);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  // the fragment has up to four sections: badge bar, brand, sections, tools
  const sections = [...fragment.children].filter((el) => el.tagName === 'DIV');
  const names = sections.length >= 4 ? ['badge', 'brand', 'sections', 'tools'] : ['brand', 'sections', 'tools'];
  sections.forEach((section, i) => {
    if (names[i]) section.classList.add(`nav-${names[i]}`);
  });

  const badge = fragment.querySelector('.nav-badge');
  if (badge) tagVariants(badge, ['variant-desktop', 'variant-mobile']);

  const brand = fragment.querySelector('.nav-brand');
  if (brand) tagVariants(brand, ['variant-light', 'variant-dark']);

  const navSections = fragment.querySelector('.nav-sections');
  const sectionList = navSections?.querySelector(':scope > ul');
  if (sectionList) {
    sectionList.classList.add('nav-list');
    sectionList.querySelectorAll(':scope > li > a').forEach((a) => a.classList.add('nav-trigger'));
    decorateDropdowns(sectionList);
  }

  const tools = fragment.querySelector('.nav-tools');
  tools?.querySelectorAll('li').forEach((li) => {
    if (!li.querySelector('a')) li.classList.add('is-current');
  });

  // badge bar sits above the main bar
  const badgeBar = document.createElement('div');
  badgeBar.className = 'nav-badge-bar';
  if (badge) badgeBar.append(badge);

  // full-width bar with an inner content container
  const mainBar = document.createElement('div');
  mainBar.className = 'nav-main-bar';
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-main-inner';
  [brand, navSections, tools].forEach((el) => { if (el) mainInner.append(el); });

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  mainInner.append(hamburger);
  mainBar.append(mainInner);

  nav.append(badgeBar, mainBar);
  nav.setAttribute('aria-expanded', 'false');

  // close dropdowns on outside click and escape
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeDropdowns(nav);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (nav.querySelector('.nav-drop[aria-expanded="true"]')) closeDropdowns(nav);
    else if (!isDesktop.matches) toggleMenu(nav, false);
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    closeDropdowns(nav);
    toggleMenu(nav, false);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // transparent over a full-bleed hero; solid when the page has no hero behind the header
  const header = block.closest('header') || block;
  const firstSection = document.querySelector('main > div:first-of-type, main > .section:first-of-type');
  const hasHero = !!firstSection?.querySelector('[class*="hero"]');
  header.classList.toggle('header-overlay', hasHero);

  // sticky solid bar once the badge row has scrolled away
  const onScroll = () => {
    const threshold = badgeBar.offsetHeight || 0;
    header.classList.toggle('is-sticky', window.scrollY > threshold);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
