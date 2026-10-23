/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-banner (xwalk model: image, imageAlt, text).
 * Source: Elementor parent container (.elementor-element-f4e421d) whose photo is a CSS
 * background-image (materialized as a direct <img> in cleaned HTML), with a child container
 * holding an H3 heading, a text paragraph and a button widget.
 * Output rows: 1) background image  2) richtext with heading, text and CTA link.
 */
// Captured from live Elementor post CSS (backgrounds are lazy-loaded and may not be computed yet).
const FALLBACK_BG = {
  f4e421d: 'https://bradescobank.com/wp-content/uploads/2024/10/bg-Exclusive-1.jpg',
};

function urlFromCss(value) {
  if (!value || value === 'none') return '';
  const m = value.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
  return m ? m[1] : '';
}

function getBackgroundImage(element, document) {
  const direct = element.querySelector(':scope > img, :scope > .e-con-inner > img');
  if (direct) return direct;
  let src = urlFromCss(element.style && element.style.backgroundImage);
  if (!src) {
    try {
      const view = document.defaultView;
      if (view && view.getComputedStyle) src = urlFromCss(view.getComputedStyle(element).backgroundImage);
    } catch (e) {
      // ignore
    }
  }
  if (!src) {
    const idClass = [...element.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c));
    if (idClass) src = FALLBACK_BG[idClass.replace('elementor-element-', '')] || '';
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  return img;
}

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: background image
  const bg = getBackgroundImage(element, document);
  const heading = element.querySelector('h1, h2, h3, h4');
  if (bg && !bg.getAttribute('alt') && heading) bg.alt = heading.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  if (bg) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(' field:image '));
    frag.appendChild(bg);
    cells.push([frag]);
  } else {
    cells.push(['']);
  }

  // Row 2: richtext (heading, text, CTA) in document order
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  const widgets = [...element.querySelectorAll('.elementor-widget')].filter((w) => !w.parentElement.closest('.elementor-widget'));
  widgets.forEach((widget) => {
    const container = widget.querySelector('.elementor-widget-container') || widget;
    if (widget.classList.contains('elementor-widget-button')) {
      const btn = container.querySelector('a[href]');
      if (!btn) return;
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = btn.getAttribute('href');
      a.textContent = btn.textContent.replace(/\s+/g, ' ').trim();
      p.append(a);
      textFrag.appendChild(p);
    } else if (widget.classList.contains('elementor-widget-text-editor')) {
      const blocks = [...container.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > ul, :scope > ol')];
      if (blocks.length) {
        blocks.forEach((node) => textFrag.appendChild(node));
      } else if (container.textContent.trim()) {
        const p = document.createElement('p');
        p.innerHTML = container.innerHTML.trim();
        textFrag.appendChild(p);
      }
    }
  });
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
