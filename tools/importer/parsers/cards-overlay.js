/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-overlay (xwalk container; item model cards-overlay-card: image, imageAlt, text).
 * Source: Elementor parent container with one child container (.e-con.e-child) per card.
 * Card background is a direct <img> child (materialized background) or a CSS background-image.
 * Widgets inside the card (document order): eyebrow <p>, <h3> title, description, optional
 * logo image widget (Zelle), button widget (CTA), optional footnote text widget.
 * Output: one row per card -> [image cell, richtext cell].
 */
// Captured from live Elementor post CSS (backgrounds are lazy-loaded and may not be computed yet).
const FALLBACK_BG = {
  e274826: 'https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-home-investments-2.jpg',
  '1391f39': 'https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-produto-3.jpg',
  f9193f1: 'https://bradescobank.com/wp-content/uploads/2026/08/thumb-bradesco-credit-home-1.webp',
  '3618faf': 'https://bradescobank.com/wp-content/uploads/2025/12/home-zelle-2.webp',
};

function urlFromCss(value) {
  if (!value || value === 'none') return '';
  const m = value.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
  return m ? m[1] : '';
}

function getBackgroundImage(card, document) {
  const direct = card.querySelector(':scope > img');
  if (direct) return direct;
  let src = urlFromCss(card.style && card.style.backgroundImage);
  if (!src) {
    try {
      const view = document.defaultView;
      if (view && view.getComputedStyle) src = urlFromCss(view.getComputedStyle(card).backgroundImage);
    } catch (e) {
      // ignore
    }
  }
  if (!src) {
    const idClass = [...card.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c));
    if (idClass) src = FALLBACK_BG[idClass.replace('elementor-element-', '')] || '';
  }
  if (!src) return null;
  const img = document.createElement('img');
  img.src = src;
  return img;
}

export default function parse(element, { document }) {
  let cards = [...element.querySelectorAll(':scope > .e-con.e-child, :scope > .e-con-inner > .e-con.e-child')];
  if (!cards.length) cards = [...element.querySelectorAll('.e-con.e-child')].filter((c) => c.querySelector('.discovery-product'));

  const cells = [];
  cards.forEach((card) => {
    // Image cell
    const bg = getBackgroundImage(card, document);
    const titleEl = card.querySelector('h1, h2, h3, h4');
    if (bg && !bg.getAttribute('alt') && titleEl) bg.alt = titleEl.textContent.replace(/\s+/g, ' ').trim();
    let imageCell = '';
    if (bg) {
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(bg);
    }

    // Text cell: walk widgets in document order
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    const widgets = [...card.querySelectorAll('.elementor-widget')].filter((w) => !w.parentElement.closest('.elementor-widget'));
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
        textCell.appendChild(p);
      } else if (widget.classList.contains('elementor-widget-image')) {
        const img = container.querySelector('img');
        if (!img) return;
        const p = document.createElement('p');
        p.append(img);
        textCell.appendChild(p);
      } else if (widget.classList.contains('elementor-widget-text-editor')) {
        const blocks = [...container.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > ul, :scope > ol')];
        if (blocks.length) {
          blocks.forEach((node) => {
            if (/^H[1-6]$/.test(node.tagName)) {
              const h = document.createElement(node.tagName.toLowerCase());
              h.innerHTML = node.innerHTML.replace(/&nbsp;| /g, ' ').trim();
              textCell.appendChild(h);
            } else {
              textCell.appendChild(node);
            }
          });
        } else if (container.textContent.trim()) {
          const p = document.createElement('p');
          p.innerHTML = container.innerHTML.trim();
          textCell.appendChild(p);
        }
      }
    });

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-overlay', cells });
  element.replaceWith(block);
}
