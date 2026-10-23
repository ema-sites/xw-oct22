/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-video (xwalk model: image, imageAlt, text).
 * Source: Elementor container with a Vimeo background video
 * (.elementor-background-video-container iframe and/or data-settings.background_video_link)
 * and a text-editor widget holding an H1 or a statement paragraph.
 * Output rows: 1) optional poster image  2) richtext with heading/statement + video URL link.
 */
export default function parse(element, { document }) {
  // ---- Video URL: prefer data-settings (canonical vimeo.com link), fall back to iframe src.
  let videoUrl = '';
  const settingsHost = element.matches('[data-settings]') ? element : element.querySelector('[data-settings]');
  if (settingsHost) {
    try {
      const settings = JSON.parse(settingsHost.getAttribute('data-settings') || '{}');
      if (settings.background_video_link) videoUrl = settings.background_video_link;
    } catch (e) {
      // ignore malformed settings
    }
  }
  if (!videoUrl) {
    const iframe = element.querySelector('.elementor-background-video-container iframe[src], iframe[src*="vimeo"], iframe[src*="youtube"]');
    if (iframe) {
      const src = iframe.getAttribute('src');
      const vimeo = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      videoUrl = vimeo ? `https://vimeo.com/${vimeo[1]}` : src;
    }
  }
  if (!videoUrl) {
    const video = element.querySelector('video source[src], video[src]');
    if (video) videoUrl = video.getAttribute('src');
  }

  // ---- Optional poster image (direct img outside text widgets).
  const poster = [...element.querySelectorAll('img')].find((img) => !img.closest('.elementor-widget-text-editor'));

  // ---- Text content: headings/paragraphs from text-editor widgets.
  const textNodes = [];
  element.querySelectorAll('.elementor-widget-text-editor .elementor-widget-container').forEach((container) => {
    const blocks = container.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > p, :scope > ul, :scope > ol');
    if (blocks.length) {
      blocks.forEach((node) => textNodes.push(node));
    } else if (container.textContent.trim()) {
      const p = document.createElement('p');
      p.innerHTML = container.innerHTML.trim();
      textNodes.push(p);
    }
  });
  // Optional CTA buttons.
  element.querySelectorAll('.elementor-widget-button a.elementor-button[href]').forEach((btn) => {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = btn.getAttribute('href');
    a.textContent = btn.textContent.trim();
    p.append(a);
    textNodes.push(p);
  });

  const cells = [];

  // Row 1: image (poster) - emitted even when empty.
  if (poster) {
    const frag = document.createDocumentFragment();
    frag.appendChild(document.createComment(' field:image '));
    frag.appendChild(poster);
    cells.push([frag]);
  } else {
    cells.push(['']);
  }

  // Row 2: richtext text with video link.
  const textFrag = document.createDocumentFragment();
  textFrag.appendChild(document.createComment(' field:text '));
  textNodes.forEach((node) => textFrag.appendChild(node));
  if (videoUrl) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = videoUrl;
    a.textContent = videoUrl;
    p.append(a);
    textFrag.appendChild(p);
  }
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-video', cells });
  element.replaceWith(block);
}
