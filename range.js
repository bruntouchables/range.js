/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 12/19/16.
 */


'use strict';

let Range = (() => {
  let oldValue, value, step, stepWidth, precision, breakpoints, min, max, outputList = [], wrapperWidth;
  let onInitCallback, onSlideCallback, onSlideEndCallback, onValueChangeCallback;
  let wrapper, fill, handle, element;

  /**
   * Handle mouse down events.
   * @param event
   * @private
   */
  function _mouseDown(event) {
    // add event listeners to mouse move and mouse up
    // BTDT: attach events to the document, not an element
    document.addEventListener('mousemove', _mouseMove);
    document.addEventListener('mouseup', _mouseUp);

    // set oldValue
    oldValue = value;

    // disable selection
    return false;
  }

  /**
   * Handle mouse move events.
   * @param event
   * @private
   */
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

  /**
   * Handle mouse up events.
   * @param event
   * @private
   */
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

  /**
   * Calculate a new range value based on a new width.
   * @param {Number} newWidth - the new width of the "range-fill"
   * @return {Number} the new value
   * @private
   */
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

    // consider step
    if (newValue % step > step / 2) {
      newValue = newValue - newValue % step + step;
    } else {
      newValue = newValue - newValue % step;
    }

    // discontinuous drag effect
    if (min < 0 && newValue > 0) {
      newWidth = (newValue - min + step) * stepWidth / step;
    } else {
      newWidth = (newValue - min) * stepWidth / step;
    }

    fill.style.width = newWidth + 'px';

    if (newValue < min) {
      newValue = min;
    } else if (newValue > max) {
      newValue = max;
    }

    return newValue;
  }

  /**
   * Initialize a range element.
   * @param {HTMLElement} input - <input type="range"> element
   * @param {Array} output - the list of output elements
   * @param callback - on init callback
   * @return a Range element
   */
  let init = (input, output = [], callback) => {
    element = input;

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

    // create a wrapper
    wrapper = document.createElement('div');
    wrapper.classList.add('range');

    // create a "range-fill"
    fill = document.createElement('span');
    fill.classList.add('range-fill');

    // create a handle
    handle = document.createElement('span');
    handle.classList.add('range-handle');

    // add a wrapper element to the DOM
    element.parentNode.insertBefore(wrapper, element);

    // append a "range-fill" to the wrapper
    wrapper.appendChild(fill);

    // append a handle to the wrapper
    wrapper.appendChild(handle);

    // append an element to the wrapper
    wrapper.appendChild(element);

    // hide input
    element.style.display = 'none';

    wrapperWidth = parseInt(window.getComputedStyle(wrapper).width, 10);

    min = Number(element.getAttribute('min'));
    max = Number(element.getAttribute('max'));

    // default step = (max - min) / 100
    step = element.getAttribute('step') ? Number(element.getAttribute('step')) : (max - min) / 100;
    if (step === 0) {
      console.warn("Step cannot be equal to 0.");
      return;
    }

    // 1 extra breakpoint when 0 is in values
    if (min < 0) {
      breakpoints = Math.ceil((max - min + 1) / step);
    } else {
      breakpoints = Math.ceil((max - min) / step);
    }
    precision = step - Math.floor(step) != 0 ? (step - Math.floor(step)).toString().split('.')[1].length : 0;

    stepWidth = wrapperWidth / breakpoints;

    // put handle in correct place
    if (stepWidth < 20 && stepWidth > 10) {
      handle.style.marginLeft = '-' + stepWidth + 'px';
    } else {
      handle.style.marginLeft = '-10px';
    }

    // default value = min
    value = element.getAttribute('value') ? Number(element.getAttribute('value')) : (max + min) / 2;
    // consider step
    if (value % step > step / 2) {
      value = value - value % step + step;
    } else {
      value = value - value % step;
    }
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

  /**
   * Set a new range value.
   * @param {Number} newValue - the new value
   */
  let setValue = (newValue) => {
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

    _calculateValue((Math.abs(newValue - min) / step) * stepWidth);

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
  };

  /**
   * Get a range value.
   * @return {Number} the range value
   */
  let getValue = () => {
    return value;
  };

  /**
   * On slide event handler.
   * @param callback
   */
  let onSlide = (callback) => {
    onSlideCallback = callback;
  };

  /**
   * On slide end event handler.
   * @param callback
   */
  let onSlideEnd = (callback) => {
    onSlideEndCallback = callback;
  };

  /**
   * On value change event handler.
   * @param callback
   */
  let onValueChange = (callback) => {
    onValueChangeCallback = callback
  };

  // export public methods
  return {
    init: init,
    setValue: setValue,
    getValue: getValue,
    onSlide: onSlide,
    onValueChange: onValueChange,
    onSlideEnd: onSlideEnd
  };
})();