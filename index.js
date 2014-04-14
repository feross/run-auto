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

module.exports = function (tasks, cb) {
  cb = cb || function () {}
  var keys = Object.keys(tasks)
  var remainingTasks = keys.length

  if (!remainingTasks) {
    return cb()
  }

  var results = {}
  var listeners = []

  var addListener = function (fn) {
    listeners.unshift(fn)
  }

  var removeListener = function (fn) {
    for (var i = 0; i < listeners.length; i += 1) {
      if (listeners[i] === fn) {
        listeners.splice(i, 1)
        return
      }
    }
  }

  var taskComplete = function () {
    remainingTasks -= 1
    listeners.slice(0).forEach(function (fn) {
      fn()
    })
  }

  addListener(function () {
    if (!remainingTasks) {
      var thecb = cb
      // prevent final cb from calling itself if it errors
      cb = function () {}
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
        cb(err, safeResults)
        // stop subsequent errors hitting cb multiple times
        cb = function () {}
      } else {
        results[key] = args
        _setImmediate(taskComplete)
      }
    }

    var ready = function () {
      return requires.reduce(function (a, x) {
        return a && results.hasOwnProperty(x)
      }, true) && !results.hasOwnProperty(key)
    }

    if (ready()) {
      task[task.length - 1](taskcb, results)
    } else {
      var listener = function () {
        if (ready()) {
          removeListener(listener)
          task[task.length - 1](taskcb, results)
        }
      }
      addListener(listener)
    }
  })
}
