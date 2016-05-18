var auto = require('../')
var test = require('tape')

test('functions run in parallel', function (t) {
  var callOrder = []

  var tasks = {
    task1: ['task2', function (results, cb) {
      setTimeout(function () {
        callOrder.push('task1')
        cb(null, 'res1')
      }, 25)
    }],
    task2: function (cb) {
      setTimeout(function () {
        callOrder.push('task2')
        cb(null, 'res2')
      }, 50)
    },
    task3: ['task2', function (results, cb) {
      callOrder.push('task3')
      cb(null, 'res3')
    }],
    task4: ['task1', 'task2', function (results, cb) {
      callOrder.push('task4')
      cb(null, 'res4')
    }],
    task5: ['task2', function (results, cb) {
      setTimeout(function () {
        callOrder.push('task5')
        cb(null, 'res5')
      }, 0)
    }],
    task6: ['task2', function (results, cb) {
      callOrder.push('task6')
      cb(null, 'res6')
    }]
  }

  auto(tasks, function (err, results) {
    t.error(err)
    t.deepEqual(callOrder, ['task2', 'task6', 'task3', 'task5', 'task1', 'task4'])
    t.deepEqual(results, {
      task1: 'res1',
      task2: 'res2',
      task3: 'res3',
      task4: 'res4',
      task5: 'res5',
      task6: 'res6'
    })
    t.end()
  })
})
