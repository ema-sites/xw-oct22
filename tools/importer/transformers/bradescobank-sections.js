/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for bradescobank.com.
 * Inserts section breaks (<hr>) and Section Metadata blocks driven by
 * payload.template.sections from page-templates.json.
 */
const MARKER_ATTR = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector; try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const document = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (!el) continue;
      // Non-first sections always get a break; a styled first section gets a temporary marker <hr>.
      if (i > 0 || section.style) {
        const hr = document.createElement('hr');
        if (section.style) hr.setAttribute(MARKER_ATTR, section.id);
        if (i === 0) hr.setAttribute('data-excat-first-section', 'true');
        el.parentNode.insertBefore(hr, el);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      // Prefer the surviving section element; fall back to the marker <hr>.
      const el = findSectionElement(element, section);
      if (el) {
        el.after(metadata);
      } else if (marker) {
        marker.after(metadata);
      }
      if (marker) {
        marker.removeAttribute(MARKER_ATTR);
        if (marker.hasAttribute('data-excat-first-section')) marker.remove();
      }
    }
    element.querySelectorAll('hr[data-excat-first-section]').forEach((hr) => hr.remove());
  }
}
