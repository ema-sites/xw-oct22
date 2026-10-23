/* eslint-disable */
/* global WebImporter */

import heroVideoParser from './parsers/hero-video.js';
import cardsTilesParser from './parsers/cards-tiles.js';
import cardsOverlayParser from './parsers/cards-overlay.js';
import heroBannerParser from './parsers/hero-banner.js';
import bradescobankCleanupTransformer from './transformers/bradescobank-cleanup.js';
import bradescobankSectionsTransformer from './transformers/bradescobank-sections.js';

const PAGE_TEMPLATE = {
  name: 'home',
  urls: [
    'https://bradescobank.com/en/',
  ],
  representativeUrl: 'https://bradescobank.com/en/',
  description: 'Bradesco Bank homepage: background-video heroes, segment tiles, product overlay cards and promo banner',
  urlPattern: '/*',
  blocks: [
    { name: 'hero-video', instances: ['.elementor-element-b079a4a', '.elementor-element-e5bf88e'] },
    { name: 'cards-tiles', instances: ['.elementor-element-6ff733d', 'section.services'] },
    { name: 'cards-overlay', instances: ['.elementor-element-c28d200', '.elementor-element-6cab8f9'] },
    { name: 'hero-banner', instances: ['.elementor-element-f4e421d'] },
  ],
  sections: [
    { id: 'rc3', name: 'Hero (background video)', selector: ['.elementor-element-b079a4a'], style: null, blocks: ['hero-video'], defaultContent: [] },
    { id: 'rc5', name: 'Tailored offerings intro', selector: ['.elementor-element-c766b99'], style: 'centered', blocks: [], defaultContent: ['.elementor-element-37e512d h2'] },
    { id: 'rc6', name: 'Client segment tiles', selector: ['.elementor-element-6ff733d', 'section.services'], style: null, blocks: ['cards-tiles'], defaultContent: [] },
    { id: 'rc8', name: 'Solutions statement (background video)', selector: ['.elementor-element-e5bf88e'], style: null, blocks: ['hero-video'], defaultContent: [] },
    { id: 'rc9', name: 'Products intro', selector: ['.elementor-element-0faff3c'], style: 'centered', blocks: [], defaultContent: ['.elementor-element-147aee5 h2'] },
    { id: 'rc10', name: 'Product cards row 1', selector: ['.elementor-element-c28d200'], style: null, blocks: ['cards-overlay'], defaultContent: [] },
    { id: 'rc11', name: 'Product cards row 2', selector: ['.elementor-element-6cab8f9'], style: null, blocks: ['cards-overlay'], defaultContent: [] },
    { id: 'rc12', name: 'Market trends intro', selector: ['.elementor-element-3326291'], style: 'centered', blocks: [], defaultContent: ['.elementor-element-69c93f6 h2'] },
    { id: 'rc13', name: 'Exclusive content banner', selector: ['.elementor-element-f4e421d'], style: null, blocks: ['hero-banner'], defaultContent: [] },
  ],
};

const parsers = {
  'hero-video': heroVideoParser,
  'cards-tiles': cardsTilesParser,
  'cards-overlay': cardsOverlayParser,
  'hero-banner': heroBannerParser,
};

const transformers = [bradescobankCleanupTransformer, bradescobankSectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Folder URLs (trailing slash) map to the folder's index document
    const { pathname } = new URL(params.originalURL);
    let rawPath = pathname.replace(/\.html?$/, '');
    if (rawPath.endsWith('/')) rawPath = `${rawPath}index`;
    const path = WebImporter.FileUtils.sanitizePath(rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
