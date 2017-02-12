/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 12/19/16.
 */


'use strict';

let Range = (() => {
  // BTDT: old value is used in "on value change" callback
  let oldValue, value, min, max, step, breakpoints;
  let wrapperWidth, stepWidth;
  let wrapper, fill, handle, element, outputList = [];
  let onInitCallback, onSlideCallback, onValueChangeCallback, onSlideEndCallback;


  /**
   * Handle "mouse down" events.
   * @param event
   * @private
   */
  function _mouseDown(event) {
    // disable selection (Safari)
    event.preventDefault();

    // add event listeners to "mouse move" and "mouse up" events
    // BTDT: attach events to the document, not the element
    document.addEventListener('mousemove', _mouseMove);
    document.addEventListener('mouseup', _mouseUp);

    // set old value
    oldValue = value;

    // get the active range
    wrapper = event.target.parentNode;
    fill = wrapper.querySelector('.range-fill');
    handle = event.target;
    element = wrapper.querySelector('input[type="range"]');
    outputList = document.range.get(wrapper);
    
    _initialCalculations();
    
    // disable selection
    return false;
  }

  /**
   * Handle "mouse move" events.
   * @param event
   * @private
   */
  function _mouseMove(event) {
    // disable selection
    event.preventDefault();

    let valueBeforeSlide = value;
    let newWidth = event.pageX - wrapper.getBoundingClientRect().left;

    // stay in wrapper bounds
    if (newWidth > wrapperWidth) {
      newWidth = wrapperWidth;
    } else if (newWidth < 0) {
      newWidth = 0;
    }

    value = _calculateValue(newWidth);

    if (valueBeforeSlide !== value) {
      // update value
      _updateValue(value);
    }

    // "on slide" callback call
    if (onSlideCallback) {
      onSlideCallback();
    }
  }

  /**
   * Handle "mouse up" events.
   * @param event
   * @private
   */
  function _mouseUp(event) {
    // remove "mouse move" and "mouse up" events
    document.removeEventListener('mousemove', _mouseMove);
    document.removeEventListener('mouseup', _mouseUp);

    // "on value change" callback call
    if (onValueChangeCallback && oldValue !== value) {
      onValueChangeCallback();
    }

    // "on slide end" callback call
    if (onSlideEndCallback) {
      onSlideEndCallback();
    }
  }

  /**
   * Create DOM elements for wrapper, fill, and handle.
   * @private
   */
  function _createDOMElements() {
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
  }

  /**
   * Attach events on init.
   * @private
   */
  function _attachInitEvents() {
    // set a new value on click
    wrapper.addEventListener('click', (event) => {
      if (event.target == wrapper || event.target == fill) {
        value = _calculateValue(event.offsetX);

        // update value
        _updateValue(value);
      }
    });

    // disable default "drag start" event handler
    handle.addEventListener('dragstart', () => {
      return false;
    });

    // add a custom "mouse down" event handler
    handle.addEventListener('mousedown', _mouseDown);
  }

  /**
   * Do initial calculations.
   * @private
   */
  function _initialCalculations() {
    min = Number(element.getAttribute('min'));
    max = Number(element.getAttribute('max'));

    // get wrapper width
    wrapperWidth = parseInt(window.getComputedStyle(wrapper).width, 10);

    step = Number(element.getAttribute('step'));
    breakpoints = Math.ceil((max - min + 1) / step);
    stepWidth = wrapperWidth / (breakpoints - 1);

    // default value = min
    value = element.getAttribute('value') ? Number(element.getAttribute('value')) : min;
    setValue(value);
  }

  /**
   * Check if an element is valid.
   * @param element
   * @return {boolean}
   * @private
   */
  function _isValid(element) {
    let valid = true;

    // min is required
    if (!element.getAttribute('min')) {
      console.warn("The element must have a min attribute.");
      valid = false;
    }

    // min must be a number
    if (isNaN(Number(element.getAttribute('min')))) {
      console.warn("The attribute min must be a number.");
      valid = false;
    }

    // max is required
    if (!element.getAttribute('max')) {
      console.warn("The element must have a max attribute.");
      valid = false;
    }

    // max must be a number
    if (isNaN(Number(element.getAttribute('max')))) {
      console.warn("The attribute max must be a number.");
      valid = false;
    }

    // step is required
    if (!element.getAttribute('step')) {
      console.warn("The element must have a step attribute.");
      valid = false;
    }

    // step must be a number
    if (isNaN(Number(element.getAttribute('step')))) {
      console.warn("The attribute step must be a number.");
      valid = false;
    }

    // step must be > 0
    if (Number(element.getAttribute('step')) <= 0) {
      console.warn("The attribute step cannot be less than or equal to 0.");
      valid = false;
    }

    // value must be a number
    if (isNaN(Number(element.getAttribute('value')))) {
      console.warn("The attribute value must be a number.");
      valid = false;
    }

    return valid;
  }

  /**
   * Calculate a new value based on a new width.
   * @param newWidth - the new width of the "range-fill"
   * @return the new value
   * @private
   */
  function _calculateValue(newWidth) {
    // BTDT: set start width = -1, not 0 to avoid additional if statement
    let newValue, startWidth = -1, endWidth = stepWidth / 2;

    // loop over breakpoints to find out where the value lies
    for (let i = 0; i < breakpoints; ++i) {
      if (newWidth > startWidth && newWidth <= endWidth) {
        newValue = min + i * step;
        break;
      }

      startWidth = endWidth;
      endWidth = endWidth + stepWidth;
    }

    // discontinuous drag effect
    // BTDT: remove this to allow smooth effect
    newWidth = _calculateWidth(newValue);

    // update width
    fill.style.width = newWidth + 'px';

    return newValue;
  }

  /**
   * Calculate a new fill width based on a new value.
   * @param newValue - the new value
   * @return {*} the new width
   * @private
   */
  function _calculateWidth(newValue) {
    return (Math.abs(newValue - min) / step) * stepWidth;
  }

  /**
   * Update a range value.
   * @param newValue
   * @private
   */
  function _updateValue(newValue) {
    // update input value
    element.setAttribute('value', newValue);

    // update output list values
    if (outputList) {
      for (let i = 0; i < outputList.length; ++i) {
        outputList[i].textContent = newValue;
      }
    }
  }


  /**
   * Initialize a range element.
   * @param input - <input type="range"> element
   * @param output - the list of output elements
   * @param callback - on init callback
   * @return {*} a Range element
   */
  let init = (input, output = [], callback) => {
    element = input;
    outputList = output;

    if (!_isValid(element)) {
      return;
    }

    // create necessary DOM elements
    _createDOMElements();

    // calculate the value, breakpoints, etc.
    _initialCalculations();

    // attach events on init
    _attachInitEvents();

    // "on init" callback call
    if (onInitCallback = callback) {
      onInitCallback();
    }
    
    // support multiple range instances
    if (!document.range) {
      document.range = new Map();
    }
    document.range.set(wrapper, outputList);

    // allow chaining
    return Range;
  };

  /**
   * Set a new range value.
   * @param newValue - the new value
   */
  let setValue = (newValue) => {
    // the new value must be a number
    if (isNaN(Number(newValue))) {
      console.warn("The new value must be a number.");
      return;
    }

    newValue = Number(newValue);

    // out of bounds
    if (newValue < min || newValue > max) {
      console.warn("The new value is out of bounds.");
      return;
    }

    if ((newValue - min) % step !== 0) {
      console.warn("The new value is not available with these range parameters.");
      return;
    }

    // set width
    fill.style.width = _calculateWidth(newValue) + 'px';

    // set value
    value = newValue;

    // update value
    _updateValue(newValue);
  };

  /**
   * Get a range value.
   * @return the range value
   */
  let getValue = () => {
    return value;
  };

  /**
   * "On slide" event handler.
   * @param callback
   */
  let onSlide = (callback) => {
    onSlideCallback = callback;
  };

  /**
   * "On value change" event handler.
   * @param callback
   */
  let onValueChange = (callback) => {
    onValueChangeCallback = callback;
  };

  /**
   * "On slide end" event handler.
   * @param callback
   */
  let onSlideEnd = (callback) => {
    onSlideEndCallback = callback;
  };


  return {
    init: init,
    setValue: setValue,
    getValue: getValue,
    onSlide: onSlide,
    onValueChange: onValueChange,
    onSlideEnd: onSlideEnd
  };
})();