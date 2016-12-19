/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 12/19/16.
 */


'use strict';

/**
 * Range slider
 * 
 * @param element
 * @constructor
 */
function Range(element) {
  if (!element.id) {
    console.warn("An element must have an id attribute.");
    return;
  }

  // create wrapper
  let wrapper = document.createElement('div');
  wrapper.classList.add('range', `range-${element.id}`);

  // create range-fill
  let fill = document.createElement('span');
  fill.classList.add('range-fill');

  // create range-handle
  let handle = document.createElement('span');
  handle.classList.add('range-handle');

  // append wrapper
  element.parentNode.insertBefore(wrapper, element);

  // append range-fill
  wrapper.appendChild(fill);

  // append range-handle
  wrapper.appendChild(handle);

  // append element
  wrapper.appendChild(element);

  // hide input
  element.style.display = 'none';

  handle.setAttribute('draggable', 'true');

  // add drag event on range-handle
  handle.addEventListener('drag', (event) => {
    console.log(event);
  });

  let range = `<div class="range"></div>`;
}