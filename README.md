# range.js<sup>β</sup>
> Finally, a range slider that we all deserve.

**Remark:** The current version supports only integer values for the step attribute. We will support floating point values in the nearest future. Thank you for using **range.js**. We are sorry for the inconvenience.

### Getting started
- Add _range.css_ and _range.js_ to your project
- Create an `<input type="range">` element
- Create a DOM element(s) for the output (`<output>`, `<span>`, etc.)
- Initialize a new Range instance 
- Enjoy!

### Usage
```html
<input type="range" min="-10" max="10" step="1" id="input" />
<output id="output"></output>
```

```javascript
const inputElement = document.getElementById('input');
const outputElement = document.getElementById('output');

const range = new Range(inputElement, outputElement, () => {
  // do something on init
});

// to set a value
range.setValue(7);

// to get a value
const value = range.getValue();
console.log(value);

range.onClick(() => {
  // do something on click
});

range.onSlide(() => {
  // do something on slide
});

range.onSlideEnd(() => {
  // do something on slide end
});

range.onValueChange(() => {
  // do something only when the value has been changed
});
```

### Demo
- [JSFiddle](https://jsfiddle.net/bruntouchables/8ayhrpk0/)

### Authors
- Henrikh Kantuni ([@kantuni](https://github.com/kantuni))
- Shahen Kosyan ([@k0syan](https://github.com/k0syan))

Please feel free to open an issue or a pull request.
