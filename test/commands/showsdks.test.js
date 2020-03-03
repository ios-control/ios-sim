const TheCommand = require('../../src/commands/showsdks')
const { stdout } = require('stdout-stderr')

jest.mock('simctl')
const simctl = require('simctl')

let command
beforeEach(() => {
  command = new TheCommand([])
})

test('showsdks run', function () {
  const json = fixtureJson('simctl-list.json')
  simctl.list = jest.fn(() => {
    return {
      json
    }
  })

  return command.run().then((result) => {
    expect(result).toMatchObject(json.runtimes)
    expect(stdout.output).toMatch(fixtureFile('showsdks.txt'))
  })
})

// see https://github.com/ios-control/ios-sim/issues/262
test('showsdks run (coverage for new isAvailable property in runtimes)', function () {
  const json = fixtureJson('issue-262/simctl-list.json')
  simctl.list = jest.fn(() => {
    return {
      json
    }
  })

  return command.run().then((result) => {
    expect(result).toMatchObject(json.runtimes)
    expect(stdout.output).toMatch(fixtureFile('issue-262/showsdks.txt'))
  })
})

test('showsdks output', function () {
  const json = fixtureJson('simctl-list.json')
  simctl.list = jest.fn(() => {
    return {
      json
    }
  })

  return command.output().then((result) => {
    expect(result).toMatch(fixtureFile('showsdks.txt'))
  })
})
