/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for bradescobank.com (WordPress / Blocksy / Elementor).
 * Removes non-authorable chrome, widgets and desktop-hidden duplicates.
 * All selectors were verified against migration-work/cleaned.html.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Overlays / widgets that can interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      '#cookie-notice', // Cookie Notice plugin banner
      'access-widget-ui', // accessiBe widget hosts
      '.acsb-sr-only', // accessiBe screen-reader guide link
      '.acsb-trigger', // accessiBe trigger button
      '.ct-drawer-canvas', // Blocksy off-canvas drawer (mobile menu)
      '.skip-link', // "Skip to content" link
      '.otgs-development-site-front-end', // WPML dev-site notice
      '#elementor-device-mode',
    ]);

    // Mobile/tablet-only duplicates and containers hidden on every breakpoint.
    // Note: only elementor-hidden-desktop is targeted; desktop sections carry
    // elementor-hidden-mobile/-tablet and must be kept.
    WebImporter.DOMUtils.remove(element, ['.elementor-hidden-desktop']);

    // Empty red spacer strips between sections.
    WebImporter.DOMUtils.remove(element, [
      '.elementor-element-df3b3d3',
      '.elementor-element-1191c87',
    ]);

    // Empty tracking iframe (no src) at the end of body; keep Vimeo iframes used by hero-video.
    element.querySelectorAll('iframe').forEach((iframe) => {
      if (!iframe.getAttribute('src')) iframe.remove();
    });

    // Hidden inline SVG placeholder images (data:image/svg+xml with display:none).
    element.querySelectorAll('img[src^="data:image/svg+xml"]').forEach((img) => {
      if (!img.closest('main')) img.remove();
    });
  }

  if (hookName === 'afterTransform') {
    // Global header, footer and remaining non-authorable chrome.
    WebImporter.DOMUtils.remove(element, [
      '#header',
      'header.ct-header',
      'footer.elementor.elementor-6228',
      'nav.mobile-menu',
      'script',
      'style',
      'noscript',
      'link',
      'iframe:not([src])',
    ]);

    // Strip tracking / builder attributes.
    element.querySelectorAll('[data-elementor-device-mode], [data-header], [data-footer], [data-link], [data-prefix]').forEach((el) => {
      ['data-elementor-device-mode', 'data-header', 'data-footer', 'data-link', 'data-prefix'].forEach((attr) => el.removeAttribute(attr));
    });
  }
}
