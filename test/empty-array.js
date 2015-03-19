var auto = require('../')
var test = require('tape')

test('empty tasks object', function (t) {
  t.plan(1)

  auto({}, function (err) {
    t.error(err)
  })
})

test('empty tasks object and no callback', function (t) {
  auto([])
  t.pass('did not throw')
  t.end()
})
