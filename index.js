module.exports = runAuto

var dezalgo = require('dezalgo')

var hasOwnProperty = Object.prototype.hasOwnProperty

var _setImmediate
if (typeof setImmediate === 'function') {
  _setImmediate = function (fn) {
    // not a direct alias for IE10+ compatibility
    setImmediate(fn)
  }
} else {
  _setImmediate = function (fn) {
    setTimeout(fn, 0)
  }
}

function runAuto (tasks, cb) {
  if (cb) cb = dezalgo(cb)
  var results = {}
  var listeners = []

  var keys = Object.keys(tasks)
  var remainingTasks = keys.length

  if (!remainingTasks) {
    return cb && cb(null, results)
  }

  function addListener (fn) {
    listeners.unshift(fn)
  }

  function removeListener (fn) {
    for (var i = 0; i < listeners.length; i += 1) {
      if (listeners[i] === fn) {
        listeners.splice(i, 1)
        return
      }
    }
  }

  function taskComplete () {
    remainingTasks -= 1
    listeners.slice(0).forEach(function (fn) {
      fn()
    })
  }

  addListener(function () {
    if (!remainingTasks && cb) {
      var thecb = cb
      // prevent final cb from calling itself if it errors
      cb = null
      thecb(null, results)
    }
  })

  keys.forEach(function (key) {
    var task = Array.isArray(tasks[key])
      ? tasks[key]
      : [tasks[key]]
    var requires = task.slice(0, task.length - 1)

    var taskcb = function (err) {
      var args = Array.prototype.slice.call(arguments, 1)
      if (args.length <= 1) {
        args = args[0]
      }

      if (err) {
        var safeResults = {}
        Object.keys(results).forEach(function (rkey) {
          safeResults[rkey] = results[rkey]
        })
        safeResults[key] = args
        if (cb) cb(err, safeResults)
        // stop subsequent errors hitting cb multiple times
        cb = null
      } else {
        results[key] = args
        _setImmediate(taskComplete)
      }
    }

    var ready = function () {
      return requires.reduce(function (a, x) {
        return a && hasOwnProperty.call(results, x)
      }, true) && !hasOwnProperty.call(results, key)
    }

    if (ready()) {
      if (requires.length === 0) {
        task[task.length - 1](taskcb)
      } else {
        task[task.length - 1](results, taskcb)
      }
    } else {
      var listener = function () {
        if (ready()) {
          removeListener(listener)
          if (requires.length === 0) {
            task[task.length - 1](taskcb)
          } else {
            task[task.length - 1](results, taskcb)
          }
        }
      }
      addListener(listener)
    }
  })
}
