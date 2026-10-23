import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-overlay-card-image';
      else div.className = 'cards-overlay-card-body';
    });
    if (!li.querySelector('.cards-overlay-card-image')) li.classList.add('no-image');
    ul.append(li);
  });

  // only the background photo is resized wide; inline images (e.g. logos) keep a small size
  ul.querySelectorAll('picture > img').forEach((img) => {
    const isBackground = !!img.closest('.cards-overlay-card-image');
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: isBackground ? '1000' : '300' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
