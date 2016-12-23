/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 12/19/16.
 */


'use strict';

let Range = (() => {
  let oldValue, value, step, stepWidth, precision, breakpoints, min, max, element, outputList = [], wrapperWidth;
  let onInitCallback, onSlideCallback, onSlideEndCallback, onValueChangeCallback;

  // create wrapper
  let wrapper = document.createElement('div');
  wrapper.classList.add('range');

  // create range-fill
  let fill = document.createElement('span');
  fill.classList.add('range-fill');

  // create range-handle
  let handle = document.createElement('span');
  handle.classList.add('range-handle');

  // private methods
  function _mouseDown(event) {
    // add event listeners to mouse move and mouse up
    // BTDT: attach events to document not element
    document.addEventListener('mousemove', _mouseMove);
    document.addEventListener('mouseup', _mouseUp);

    // set oldValue
    oldValue = value;

    // disable selection
    return false;
  }

  function _mouseMove(event) {
    // disable selection
    event.preventDefault();

    let valueBeforeSlide = value;
    let newWidth;

    if (event.pageX - wrapper.getBoundingClientRect().left > wrapperWidth) {
      newWidth = wrapperWidth;
    } else {
      newWidth = event.pageX - wrapper.getBoundingClientRect().left;
    }
    
    value = _calculateValue(newWidth);

    if (valueBeforeSlide !== value) {
      // update input value
      element.setAttribute('value', value);

      // update output value
      if (outputList) {
        for (let i = 0; i < outputList.length; i++) {
          outputList[i].textContent = value;
        }
      }

      // callback call
      if (onSlideCallback) {
        onSlideCallback();
      }
    }
  }

  function _mouseUp(event) {
    // remove mouse move and mouse up events
    document.removeEventListener('mousemove', _mouseMove);
    document.removeEventListener('mouseup', _mouseUp);

    // on slide end callback call
    if (onSlideEndCallback) {
      onSlideEndCallback();
    }

    // on value change callback call
    if (onValueChangeCallback && oldValue !== value) {
      onValueChangeCallback();
    }
  }

  function _calculateValue(newWidth) {
    let newValue = min + (newWidth / stepWidth) * step;

    // whole number values
    if (precision == 0) {
      newValue = Math.round(newValue);
    } else {
      newValue = Number(newValue.toFixed(precision));
    }

    if (newValue < min) {
      newValue = min;
    } else if (newValue > max) {
      newValue = max;
    }

    // discontinuous drag effect
    newWidth = (newValue - min) * stepWidth / step;

    fill.style.width = newWidth + 'px';

    return newValue;
  }

  // public methods
  let init = (elem, output = [], callback) => {
    element = elem;

    // output list
    outputList = output;

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

    // append wrapper
    element.parentNode.insertBefore(wrapper, element);

    // append range-fill
    wrapper.appendChild(fill);

    // append range-handles
    wrapper.appendChild(handle);

    // append element
    wrapper.appendChild(element);

    // hide input
    element.style.display = 'none';

    wrapperWidth = parseInt(window.getComputedStyle(wrapper).width, 10);

    min = Number(element.getAttribute('min'));
    max = Number(element.getAttribute('max'));

    // default step = (max - min) / 100
    step = element.getAttribute('step') ? Number(element.getAttribute('step')) : (max - min) / 100;

    breakpoints = (max - min + 1) / step;
    precision = step - Math.floor(step) != 0 ? (step - Math.floor(step)).toString().split('.')[1].length : 0;

    stepWidth = wrapperWidth / breakpoints;

    // default value = min
    value = element.getAttribute('value') ? Number(element.getAttribute('value')) : (max + min) / 2;
    element.setAttribute('value', value);
    setValue(value);

    wrapper.addEventListener('click', (event) => {
      if (event.target == wrapper || event.target == fill) {
        value = _calculateValue(event.offsetX);

        // update input value
        element.setAttribute('value', value);

        // update output value
        if (outputList) {
          for (let i = 0; i < outputList.length; i++) {
            outputList[i].textContent = value;
          }
        }
      }
    });

    // disable default drag start event handler
    handle.addEventListener('dragstart', () => {
      return false;
    });
    // add custom mouse down event handler
    handle.addEventListener('mousedown', _mouseDown);

    // return input element
    Range.element = element;

    // on init callback
    onInitCallback = callback;

    // callback call
    if (onInitCallback) {
      onInitCallback();
    }

    return Range;
  };

  function setValue(newValue) {
    if (newValue < min || newValue > max) {
      console.warn("A new value is out of bounds.");
      return;
    }

    // whole number values
    if (precision == 0) {
      newValue = Math.round(newValue);
    } else {
      newValue = Number(newValue.toFixed(precision));
    }

    _calculateValue(Math.abs(newValue - min) * stepWidth);

    // update module value
    value = newValue;

    // update input value
    element.setAttribute('value', newValue);

    // update output value
    if (outputList) {
      for (let i = 0; i < outputList.length; i++) {
        outputList[i].textContent = newValue;
      }
    }
  }

  function getValue() {
    return value;
  }

  // on slide
  function onSlide(callback) {
    onSlideCallback = callback;
  }

  // on slide end
  function onSlideEnd(callback) {
    onSlideEndCallback = callback;
  }

  // on value change
  function onValueChange(callback) {
    onValueChangeCallback = callback
  }

  // return public methods
  return {
    init: init,
    setValue: setValue,
    getValue: getValue,
    onSlide: onSlide,
    onValueChange: onValueChange,
    onSlideEnd: onSlideEnd
  };
})();
