import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const background = document.createElement('div');
  background.className = 'hero-banner-background';
  const content = document.createElement('div');
  content.className = 'hero-banner-content';

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && !cell.textContent.trim()) {
        const img = picture.querySelector('img');
        const optimized = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]);
        moveInstrumentation(img, optimized.querySelector('img'));
        background.append(optimized);
      } else if (cell.children.length || cell.textContent.trim()) {
        moveInstrumentation(row, content);
        while (cell.firstChild) content.append(cell.firstChild);
      }
    });
  });

  block.textContent = '';
  if (background.children.length) block.append(background);
  else block.classList.add('no-image');
  block.append(content);
}
