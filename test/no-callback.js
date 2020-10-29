const auto = require('../')
const test = require('tape')

test('no callback', function (t) {
  t.plan(2)

  const tasks = {
    a: function (cb) {
      t.pass('cb 1')
    },
    b: function (cb) {
      t.pass('cb 2')
    }
  }

  auto(tasks)
})
