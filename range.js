/**
 * Created by Henrikh Kantuni and Shahen Kosyan on 12/19/16.
 */


'use strict';

class Range {
  /**
   * Initialize a Range element.
   */
  constructor(input, output, callback) {
    this.input = input;
    this.output = output;

    if (!this._isValid()) {
      return;
    }

    // create necessary DOM elements
    this._createDOMElements();

    // calculate the value, breakpoints, etc.
    this._initialCalculations();

    // attach events on init
    this._attachInitEvents();

    // "on init" callback call
    if (this.onInitCallback = callback) {
      this.onInitCallback();
    }
  }

  /**
   * Handle "mouse down" events.
   */
  _mouseDown(e) {
    // disable selection (Safari)
    e.preventDefault();

    // add event listeners to "mouse move" and "mouse up" events
    // BTDT: attach events to the document, not the element
    this._mouseMove = this._mouseMove.bind(this);
    this._mouseUp = this._mouseUp.bind(this);
    document.addEventListener('mousemove', this._mouseMove);
    document.addEventListener('mouseup', this._mouseUp);

    // set old value
    this.oldValue = this.value;

    // disable selection
    return false;
  }

  /**
   * Handle "mouse move" events.
   */
  _mouseMove(e) {
    // disable selection
    e.preventDefault();

    let valueBeforeSlide = this.value;
    let newWidth = e.pageX - this.wrapper.getBoundingClientRect().left;

    // stay in wrapper bounds
    if (newWidth > this.wrapperWidth) {
      newWidth = this.wrapperWidth;
    } else if (newWidth < 0) {
      newWidth = 0;
    }

    this.value = this._calculateValue(newWidth);

    if (valueBeforeSlide !== this.value) {
      // update value
      this._updateValue(this.value);
    }

    // "on slide" callback call
    if (this.onSlideCallback) {
      this.onSlideCallback();
    }
  }

  /**
   * Handle "mouse up" events.
   */
  _mouseUp(e) {
    // remove "mouse move" and "mouse up" events
    document.removeEventListener('mousemove', this._mouseMove);
    document.removeEventListener('mouseup', this._mouseUp);

    // "on value change" callback call
    if (this.onValueChangeCallback && this.oldValue !== this.value) {
      this.onValueChangeCallback();
    }

    // "on slide end" callback call
    if (this.onSlideEndCallback) {
      this.onSlideEndCallback();
    }
  }

  /**
   * Create DOM elements for wrapper, fill, and handle.
   */
  _createDOMElements() {
    // create a wrapper
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('range');

    // create a "range-fill"
    this.fill = document.createElement('span');
    this.fill.classList.add('range-fill');

    // create a handle
    this.handle = document.createElement('span');
    this.handle.classList.add('range-handle');

    // add a wrapper element to the DOM
    this.input.parentNode.insertBefore(this.wrapper, this.input);

    // append a "range-fill" to the wrapper
    this.wrapper.appendChild(this.fill);

    // append a handle to the wrapper
    this.wrapper.appendChild(this.handle);

    // append an element to the wrapper
    this.wrapper.appendChild(this.input);

    // hide input
    this.input.style.display = 'none';
  }

  /**
   * Attach events on init.
   */
  _attachInitEvents() {
    // set a new value on click
    this.wrapper.addEventListener('click', (event) => {
      if (event.target == this.wrapper || event.target == this.fill) {
        this.value = this._calculateValue(event.offsetX);

        // update value
        this._updateValue(this.value);
      }
    });

    // disable default "drag start" event handler
    this.handle.addEventListener('dragstart', () => false);

    // add a custom "mouse down" event handler
    this._mouseDown = this._mouseDown.bind(this);
    this.handle.addEventListener('mousedown', this._mouseDown);
  }

  /**
   * Do initial calculations.
   */
  _initialCalculations() {
    this.min = Number(this.input.getAttribute('min'));
    this.max = Number(this.input.getAttribute('max'));

    // get wrapper width
    this.wrapperWidth = parseInt(window.getComputedStyle(this.wrapper).width, 10);

    this.step = Number(this.input.getAttribute('step'));
    this.breakpoints = Math.ceil((this.max - this.min + 1) / this.step);
    this.stepWidth = this.wrapperWidth / (this.breakpoints - 1);

    // default value = min
    this.value = this.input.getAttribute('value') ? Number(this.input.getAttribute('value')) : this.min;
    this.setValue(this.value);
  }

  /**
   * Check if an element is valid.
   */
  _isValid() {
    // min is required
    if (!this.input.getAttribute('min')) {
      console.warn("The element must have a min attribute.");
      return false;
    }

    // min must be a number
    if (isNaN(Number(this.input.getAttribute('min')))) {
      console.warn("The attribute min must be a number.");
      return false;
    }

    // max is required
    if (!this.input.getAttribute('max')) {
      console.warn("The element must have a max attribute.");
      return false;
    }

    // max must be a number
    if (isNaN(Number(this.input.getAttribute('max')))) {
      console.warn("The attribute max must be a number.");
      return false;
    }

    // step is required
    if (!this.input.getAttribute('step')) {
      console.warn("The element must have a step attribute.");
      return false;
    }

    // step must be a number
    if (isNaN(Number(this.input.getAttribute('step')))) {
      console.warn("The attribute step must be a number.");
      return false;
    }

    // step must be an integer
    if (Number(this.input.getAttribute('step')) !== parseInt(this.input.getAttribute('step'), 10)) {
      console.warn("The attribute step must be an integer.");
      return false;
    }

    // step must be > 0
    if (Number(this.input.getAttribute('step')) <= 0) {
      console.warn("The attribute step cannot be less than or equal to 0.");
      return false;
    }

    // value must be a number
    if (isNaN(Number(this.input.getAttribute('value')))) {
      console.warn("The attribute value must be a number.");
      return false;
    }

    return true;
  }

  /**
   * Calculate a new value based on a new width.
   */
  _calculateValue(newWidth) {
    // BTDT: set start width = -1, not 0 to avoid additional if statement
    let newValue, startWidth = -1, endWidth = this.stepWidth / 2;

    // loop over breakpoints to find out where the value lies
    for (let i = 0; i < this.breakpoints; ++i) {
      if (newWidth > startWidth && newWidth <= endWidth) {
        newValue = this.min + i * this.step;
        break;
      }

      startWidth = endWidth;
      endWidth = endWidth + this.stepWidth;
    }

    // discontinuous drag effect
    // BTDT: remove this to allow smooth effect
    newWidth = this._calculateWidth(newValue);

    // update width
    this.fill.style.width = newWidth + 'px';

    return newValue;
  }

  /**
   * Calculate a new fill width based on a new value.
   */
  _calculateWidth(newValue) {
    return (Math.abs(newValue - this.min) / this.step) * this.stepWidth;
  }

  /**
   * Update a range value.
   */
  _updateValue(newValue) {
    // update input value
    this.input.setAttribute('value', newValue);

    // update output list values
    if (this.output instanceof Array) {
      for (let i = 0; i < this.output.length; ++i) {
        this.output[i].textContent = newValue;
      }
    } else {
      if (this.output) {
        this.output.textContent = newValue;
      }
    }
  }
  

  /**
   * Set a new range value.
   */
  setValue(newValue) {
    // the new value must be a number
    if (isNaN(Number(newValue))) {
      console.warn("The new value must be a number.");
      return;
    }

    newValue = Number(newValue);

    // out of bounds
    if (newValue < this.min || newValue > this.max) {
      console.warn("The new value is out of bounds.");
      return;
    }

    if ((newValue - this.min) % this.step !== 0) {
      console.warn("The new value is not available with these range parameters.");
      return;
    }

    // set width
    this.fill.style.width = this._calculateWidth(newValue) + 'px';

    // set value
    this.value = newValue;

    // update value
    this._updateValue(newValue);
  };

  /**
   * Get a range value.
   */
  getValue() {
    return this.value;
  };

  /**
   * "On slide" event handler.
   */
  onSlide(callback) {
    this.onSlideCallback = callback;
  };

  /**
   * "On value change" event handler.
   */
  onValueChange(callback) {
    this.onValueChangeCallback = callback;
  };

  /**
   * "On slide end" event handler.
   */
  onSlideEnd(callback) {
    this.onSlideEndCallback = callback;
  };
}