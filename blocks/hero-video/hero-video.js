import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const VIDEO_PATTERN = /vimeo\.com|youtube\.com|youtu\.be|\.mp4(\?|$)/i;

function getVimeoId(url) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

function getYoutubeId(url) {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return match ? match[1] : null;
}

function buildVideo(url) {
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-video-media';
  const vimeoId = getVimeoId(url);
  const youtubeId = getYoutubeId(url);
  if (vimeoId || youtubeId) {
    const iframe = document.createElement('iframe');
    iframe.src = vimeoId
      ? `https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&muted=1&dnt=1`
      : `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&playlist=${youtubeId}`;
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
    iframe.setAttribute('title', 'Background video');
    iframe.setAttribute('tabindex', '-1');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.loading = 'lazy';
    wrapper.append(iframe);
  } else {
    const video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('aria-hidden', 'true');
    const source = document.createElement('source');
    source.src = url;
    source.type = 'video/mp4';
    video.append(source);
    wrapper.append(video);
  }
  return wrapper;
}

export default function decorate(block) {
  const rows = [...block.children];
  const background = document.createElement('div');
  background.className = 'hero-video-background';
  const content = document.createElement('div');
  content.className = 'hero-video-content';

  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !cell.textContent.trim()) {
        const img = picture.querySelector('img');
        const optimized = createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]);
        moveInstrumentation(img, optimized.querySelector('img'));
        background.append(optimized);
      } else if (cell.children.length || cell.textContent.trim()) {
        moveInstrumentation(row, content);
        while (cell.firstChild) content.append(cell.firstChild);
      }
    });
  });

  // Video URL is authored as a link in the text; turn the first video link into background media.
  const videoLink = [...content.querySelectorAll('a[href]')].find((a) => VIDEO_PATTERN.test(a.href));
  if (videoLink) {
    background.append(buildVideo(videoLink.href));
    const parent = videoLink.closest('p');
    if (parent && parent.textContent.trim() === videoLink.textContent.trim()) parent.remove();
    else videoLink.remove();
    block.classList.add('has-video');
  }

  block.textContent = '';
  if (background.children.length) block.append(background);
  block.append(content);
}
