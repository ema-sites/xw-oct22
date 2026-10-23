/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-tiles (xwalk container; item model cards-tiles-card: image, imageAlt, text).
 * Source: section.services with one <a class="e-con e-child"> per tile. Tile images are CSS
 * background-images (Elementor post CSS), so they are read from: a materialized <img>, inline
 * style, data-settings, computed style, then a fallback map captured from the live site CSS.
 * Output: one row per tile -> [image cell, text cell (label as link)].
 */
const FALLBACK_BG = {
  '9c67a4b': 'https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-2.jpg',
  '109f75e': 'https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-1.jpg',
  a6eeed4: 'https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-4.jpg',
  a264488: 'https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-3.jpg',
};

function urlFromCss(value) {
  if (!value || value === 'none') return '';
  const m = value.match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
  return m ? m[1] : '';
}

function getBackgroundUrl(tile, document) {
  const inline = urlFromCss(tile.style && tile.style.backgroundImage);
  if (inline) return inline;
  try {
    const settings = JSON.parse(tile.getAttribute('data-settings') || '{}');
    if (settings.background_image && settings.background_image.url) return settings.background_image.url;
  } catch (e) {
    // ignore
  }
  try {
    const view = document.defaultView;
    if (view && view.getComputedStyle) {
      const computed = urlFromCss(view.getComputedStyle(tile).backgroundImage);
      if (computed) return computed;
    }
  } catch (e) {
    // ignore
  }
  const idClass = [...tile.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c));
  if (idClass) {
    const id = idClass.replace('elementor-element-', '');
    if (FALLBACK_BG[id]) return FALLBACK_BG[id];
  }
  return '';
}

export default function parse(element, { document }) {
  let tiles = [...element.querySelectorAll(':scope > a.e-con, :scope > .e-con-inner > a.e-con')];
  if (!tiles.length) tiles = [...element.querySelectorAll('a[href]')].filter((a) => a.querySelector('.title-services, p'));

  const cells = [];
  tiles.forEach((tile) => {
    const labelEl = tile.querySelector('.title-services p, .title-services .elementor-widget-container, p');
    const labelText = (labelEl ? labelEl.textContent : tile.textContent).replace(/\s+/g, ' ').trim();

    // Image cell
    let img = tile.querySelector('img');
    if (!img) {
      const src = getBackgroundUrl(tile, document);
      if (src) {
        img = document.createElement('img');
        img.src = src;
        img.alt = labelText;
      }
    }
    let imageCell = '';
    if (img) {
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // Text cell: label as link
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = tile.getAttribute('href') || '';
    a.textContent = labelText;
    p.append(a);
    textCell.appendChild(p);

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tiles', cells });
  element.replaceWith(block);
}
