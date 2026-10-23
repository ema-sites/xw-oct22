import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-tiles-card-image';
      else div.className = 'cards-tiles-card-body';
    });

    // The whole tile is the link: promote the first link in the body to a full-tile overlay.
    const link = li.querySelector('.cards-tiles-card-body a[href]');
    if (link) {
      li.classList.add('cards-tiles-card-linked');
      link.classList.add('cards-tiles-card-link');
      link.classList.remove('button');
      const container = link.closest('.button-container');
      if (container) container.classList.remove('button-container');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}
