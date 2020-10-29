const auto = require('../')
const test = require('tape')

test('functions that return errors', function (t) {
  t.plan(2)

  const tasks = {
    a: function (cb) {
      t.pass('cb 1')
      cb(new Error('oops'))
    },
    b: ['a', function (results, cb) {
      t.fail('cb 2 should not get called')
    }]
  }

  auto(tasks, function (err) {
    t.ok(err instanceof Error)
  })
})

test('auto error should pass partial results', function (t) {
  const tasks = {
    task1: function (cb) {
      cb(null, 'result1')
    },
    task2: ['task1', function (results, cb) {
      cb(new Error('testerror'), 'result2')
    }],
    task3: ['task2', function (results, cb) {
      t.fail('task3 should not be called')
    }]
  }

  auto(tasks, function (err, results) {
    t.ok(err instanceof Error)
    t.equals(results.task1, 'result1')
    t.equals(results.task2, 'result2')
    t.end()
  })
})
