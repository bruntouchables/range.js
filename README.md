# range.js<sup>β</sup>
Finally, a range slider that we all deserve.

> A lightweight vanilla javascript polyfill for `<input type="range">`.

### Usage

- Add **range.css** and **range.js** to your project.
- Create an `<input type="range">` element.
- Create a DOM element (output, span, etc.) for an output.
- Call `Range.init()` with input and output elements.
- Enjoy your range slider!

### Example

```html
<input type="range" min="-10" max="10" step="1" id="input">
<output id="output"></output>
```

```javascript
let inputElement = document.getElementById('input');
let outputList = document.getElementById('output');

let range = Range.init(inputElement, [outputList], () => {
  // "on init" callback
  console.log("range.js has been successfully initialized.");
});

// to set a value
range.setValue(7);

// to get a value
let value = range.getValue();
console.log(value);

// "on slide" callback
range.onSlide(() => {
  // do something on slide
});

// "on slide end" callback
range.onSlideEnd(() => {
  // do something on slide end
});

// "on value change" callback
range.onValueChange(() => {
  // do something only when a value has been changed
});
```

We will continue working on the range slider. 
Please feel free to open an issue or a pull request. 
If you like this project please leave us feedback. 
If you don't - please tell us how we can improve it.

### Authors

- Henrikh Kantuni ([@kantuni](https://github.com/kantuni))
- Shahen Kosyan ([@k0syan](https://github.com/k0syan))
