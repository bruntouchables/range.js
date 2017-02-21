# range.js<sup>β</sup>
> Finally, a range slider that we all deserve.

**Remark:** The current version supports only one range slider instance. We will add multiple instances support in the nearest future. Thank you for using **range.js**. We are sorry for the inconvenience.

### Getting started

- Add _range.css_ and _range.js_ to your project
- Create an `<input type="range">` element
- Create a DOM element(s) for an output (`<output>`, `<span>`, etc.)
- Call `Range.init()`
- Enjoy!

### Usage

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

### Demo
- [JSFiddle](https://jsfiddle.net/bruntouchables/8ayhrpk0/)

### Authors

- Henrikh Kantuni ([@kantuni](https://github.com/kantuni))
- Shahen Kosyan ([@k0syan](https://github.com/k0syan))


Please feel free to open an issue or a pull request.  
If you like this project please leave us feedback. If you don't - please tell us how we can improve it.
