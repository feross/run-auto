# run-auto [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/run-auto/master.svg
[travis-url]: https://travis-ci.org/feross/run-auto
[npm-image]: https://img.shields.io/npm/v/run-auto.svg
[npm-url]: https://npmjs.org/package/run-auto
[downloads-image]: https://img.shields.io/npm/dm/run-auto.svg
[downloads-url]: https://npmjs.org/package/run-auto
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

#### Determine the best order for running async functions, ***LIKE MAGIC!***

![auto](https://raw.githubusercontent.com/feross/run-auto/master/img.png) [![Sauce Test Status](https://saucelabs.com/browser-matrix/run-auto.svg)](https://saucelabs.com/u/run-auto)

### install

```
npm install run-auto
```

### usage

#### auto(tasks, [callback])

Determines the best order for running the functions in `tasks`, based on their
requirements. Each function can optionally depend on other functions being completed
first, and each function is run as soon as its requirements are satisfied.

If any of the functions pass an error to their callback, the `auto` sequence will
stop. Further tasks will not execute (so any other functions depending on it will
not run), and the main `callback` is immediately called with the error.

Functions also receive an object containing the results of functions which have
completed so far as the first argument, if they have dependencies. If a task
function has no dependencies, it will only be passed a callback.

##### arguments

- `tasks` - An object. Each of its properties is either a function or an array of requirements, with the function itself the last item in the array. The object's key of a property serves as the name of the task defined by that property, i.e. can be used when specifying requirements for other tasks. The function receives one or two arguments:
  - a `results` object, containing the results of the previously executed functions, only passed if the task has any dependencies, **Argument order changed in 2.0**
  - a `callback(err, result)` function, which must be called when finished, passing an `error` (which can be `null`) and the result of the function's execution. **Argument order changed in 2.0**
- `callback(err, results)` - An optional callback which is called when all the tasks have been completed. It receives the `err` argument if any `tasks` pass an error to their callback. Results are always returned; however, if an error occurs, no further `tasks` will be performed, and the results object will only contain partial results.

##### example

```js
var auto = require('run-auto')

auto({
  getData: function (callback) {
    console.log('in getData')
    // async code to get some data
    callback(null, 'data', 'converted to array')
  },
  makeFolder: function (callback) {
    console.log('in makeFolder')
    // async code to create a directory to store a file in
    // this is run at the same time as getting the data
    callback(null, 'folder')
  },
  writeFile: ['getData', 'makeFolder', function (results, callback) {
    console.log('in writeFile', JSON.stringify(results))
    // once there is some data and the directory exists,
    // write the data to a file in the directory
    callback(null, 'filename')
  }],
  emailLink: ['writeFile', function (results, callback) {
    console.log('in emailLink', JSON.stringify(results))
    // once the file is written let's email a link to it...
    // results.writeFile contains the filename returned by writeFile.
    callback(null, { file: results.writeFile, email: 'user@example.com' })
  }]
}, function(err, results) {
  console.log('err = ', err)
  console.log('results = ', results)
})
```

#### usage note

Note, all functions are called with a `results` object as a second argument, so it is
unsafe to pass functions in the` tasks` object which cannot handle the extra argument.

For example, this snippet of code:

```js
auto({
  readData: async.apply(fs.readFile, 'data.txt', 'utf-8')
}, callback)
```

will have the effect of calling `readFile` with the results object as the last argument,
which will fail, like this:

```js
fs.readFile('data.txt', 'utf-8', cb, {})
```

Instead, wrap the call to `readFile` in a function which does not forward the `results`
object:

```js
auto({
  readData: function (cb, results) {
    fs.readFile('data.txt', 'utf-8', cb)
  }
}, callback)
```

This module is basically equavalent to
[`async.auto`](https://github.com/caolan/async#autotasks-callback), but it's
handy to just have the one function you need instead of the kitchen sink. Modularity!
Especially handy if you're serving to the browser and need to reduce your javascript
bundle size.

Works great in the browser with [browserify](http://browserify.org/)!

### see also

- [run-parallel](https://github.com/feross/run-parallel)
- [run-parallel-limit](https://github.com/feross/run-parallel-limit)
- [run-series](https://github.com/feross/run-series)
- [run-waterfall](https://github.com/feross/run-waterfall)

### license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org).

Image credit: Wizard Hat designed by Andrew Fortnum
