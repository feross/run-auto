var auto = require('../')
var test = require('tape')

test('functions run in parallel', function (t) {
  var callOrder = []

  var tasks = {
    task1: ['task2', function (cb) {
      setTimeout(function () {
        callOrder.push('task1')
        cb()
      }, 25)
    }],
    task2: function (cb) {
      setTimeout(function () {
        callOrder.push('task2')
        cb()
      }, 50)
    },
    task3: ['task2', function (cb) {
      callOrder.push('task3')
      cb()
    }],
    task4: ['task1', 'task2', function (cb) {
      callOrder.push('task4')
      cb()
    }],
    task5: ['task2', function (cb) {
      setTimeout(function () {
        callOrder.push('task5')
        cb()
      }, 0)
    }],
    task6: ['task2', function (cb) {
      callOrder.push('task6')
      cb()
    }]
  }

  auto(tasks, function (err) {
    t.error(err)
    t.deepEqual(callOrder, ['task2', 'task6', 'task3', 'task5', 'task1', 'task4'])
    t.end()
  })
})
