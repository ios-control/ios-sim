const TheCommand = require('../../src/commands/showdevicetypes')
const { stdout } = require('stdout-stderr')

jest.mock('simctl')
const simctl = require('simctl')

let command
beforeEach(() => {
  command = new TheCommand([])
})

test('showdevicetypes run', function () {
  const json = fixtureJson('simctl-list.json')
  simctl.list = jest.fn(() => {
    return {
      json
    }
  })

  return command.run().then((result) => {
    expect(stdout.output).toMatch(fixtureFile('showdevicetypes.txt'))
    expect(result instanceof Array).toBeTruthy()
    expect(result.length).toEqual(79)
  })
})

test('showdevicetypes output', function () {
  const json = fixtureJson('simctl-list.json')
  simctl.list = jest.fn(() => {
    return {
      json
    }
  })

  return command.output().then((result) => {
    expect(result).toMatch(fixtureFile('showdevicetypes.txt'))
  })
})

// see https://github.com/ios-control/ios-sim/issues/234
test('showdevicetypes - device key in the form of com.apple.CoreSimulator.SimRuntime.XXXX', function () {
  const json = fixtureJson('issue-234/simctl-list.json')
  simctl.list = jest.fn(() => {
    return {
      json
    }
  })

  return command.run().then((result) => {
    expect(stdout.output).toMatch(fixtureFile('issue-234/showdevicetypes.txt'))
  })
})

// see https://github.com/ios-control/ios-sim/issues/262
test('showdevicetypes - new isAvailable property', function () {
  const json = fixtureJson('issue-262/simctl-list.json')
  simctl.list = jest.fn(() => {
    return {
      json
    }
  })

  return command.run().then((result) => {
    expect(stdout.output).toMatch(fixtureFile('issue-262/showdevicetypes.txt'))
  })
})
