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

  min = Number(element.getAttribute('min'));
  max = Number(element.getAttribute('max'));

  // default step = (max - min) / 100
  step = element.getAttribute('step') ? Number(element.getAttribute('step')) : (max - min) / 100;

  // default value = min
  value = element.getAttribute('value') ? Number(element.getAttribute('value')) : min;

  breakpoints = (max - min) / step;

  // create wrapper
  let wrapper = document.createElement('div');
  wrapper.classList.add('range', 'range-' + element.id);

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

  // calculate wrapper width
  let wrapperWidth = parseInt(window.getComputedStyle(wrapper).width, 10);

  // hide input
  element.style.display = 'none';

  wrapper.addEventListener('click', (event) => {
    if (event.target == wrapper || event.target == fill) {
      // calculate value
      value = calculateValue(event.offsetX);
    }
  });

  // disable default drag start event handler
  handle.addEventListener('dragstart', () => {
    return false;
  });
  // add custom mouse down event handler
  handle.addEventListener('mousedown', mouseDown);

  function mouseDown(event) {
    // add event listeners to mouse move and mouse up
    // BTDT: attach events to document not element
    document.addEventListener('mousemove', mouseMove);
    document.addEventListener('mouseup', mouseUp);

    // disable selection
    return false;
  }

  function mouseMove(event) {
    event.preventDefault();

    let newWidth = (event.pageX - wrapper.offsetLeft > wrapperWidth) ? wrapperWidth : event.pageX - wrapper.offsetLeft;
    value = calculateValue(newWidth);
  }

  function mouseUp(event) {
    // remove mouse move and mouse up events
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
  }

  function calculateValue(newWidth) {
    let precision = step - Math.floor(step) != 0 ? (step - Math.floor(step)).toString().split('.')[1].length : 0
      , stepWidth = wrapperWidth / breakpoints;

    value = (newWidth / stepWidth) * step;

    // whole number values
    if (precision == 0) {
      if (value - Math.floor(value) >= 0.5) {
        value = Math.ceil(value);
      } else {
        value = Math.floor(value);
      }
    }

    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }

    value = value.toFixed(precision);

    newWidth = value * stepWidth;
    fill.style.width = newWidth + 'px';

    return value;
  }
}
