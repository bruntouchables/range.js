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
  let value, step, breakpoints, min, max;

  // id attribute required
  if (!element.id) {
    console.warn("An element must have an id attribute.");
    return;
  }

  // min attribute required
  if (!element.getAttribute('min')) {
    console.warn("An element must have a min attribute.");
    return;
  }

  // max attribute required
  if (!element.getAttribute('max')) {
    console.warn("An element must have a max attribute.");
    return;
  }

  max = Number(element.getAttribute('max'));
  min = Number(element.getAttribute('min'));

  // default step = (max - min) / 100
  step = element.getAttribute('step') ? Number(element.getAttribute('step')) : (max - min) / 100;

  // default value = min
  value = element.getAttribute('value') ? Number(element.getAttribute('value')) : min;

  breakpoints = (max - min) / step;

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

  handle.addEventListener('dragstart', (event) => {
    // remove drag cursor
    event.dataTransfer.effectAllowed = 'none';

    // create a fake ghost
    let ghost = handle.cloneNode(false);

    // hide it
    // BTDT: display: none; doesn't work
    ghost.style.cssText = `
      left: 0;
      position: absolute;
      top: 0;
      visibility: hidden;
      z-index: -1;
    `;

    // place it into the DOM tree
    document.body.appendChild(ghost);

    // set the fake ghost as a "drag image" of the dragged element
    event.dataTransfer.setDragImage(ghost, 0, 0);
  });

  // add drag event on range-handle
  handle.addEventListener('drag', (event) => {
    // remove drag cursor
    event.dataTransfer.effectAllowed = 'none';

    let wrapperWidth = parseInt(window.getComputedStyle(wrapper).width, 10)
      , fillWidth = parseInt(window.getComputedStyle(fill).width, 10)
      , newWidth = fillWidth + event.offsetX
      , round = step - Math.floor(step) != 0 ? (step - Math.floor(step)).toString().split('.')[1].length : 0;

    // value = Math.floor((newWidth / wrapperWidth) * step);

    // calculate new width
    if (newWidth > wrapperWidth) {
      fill.style.width = wrapperWidth + 'px';
    } else {
      fill.style.width = newWidth + 'px';
    }

    // value
    let stepWidth = wrapperWidth / breakpoints;

    value = (newWidth / stepWidth) * step;

    if (value - Math.floor(value) > 0.4 && round == 0) {
      value = Math.ceil(value);
    } else if (round == 0) {
      value = Math.floor(value);
    }

    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }

    value = value.toFixed(round);

    console.log(value);
  });

  handle.addEventListener('drop', (event) => {
    // remove drag cursor
    event.dataTransfer.effectAllowed = 'none';
  });

  handle.addEventListener('dragend', (event) => {
    // remove a fake ghost
    document.body.removeChild(document.body.lastChild);
  });

  wrapper.addEventListener('click', (event) => {
    // calculate new width
    fill.style.width = event.offsetX + 'px';

    let fillWidth = parseInt(window.getComputedStyle(fill).width, 10);
    console.log(fillWidth);
  })
}
