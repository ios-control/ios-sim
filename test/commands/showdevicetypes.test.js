const TheCommand = require('../../src/commands/showdevicetypes')
const { stdout } = require('stdout-stderr')

jest.mock('simctl')
const simctl = require('simctl')

let command
beforeEach(() => {
  command = new TheCommand([])
})

test('showsdks', function () {
  const json = fixtureJson('simctl-list.json')
  simctl.list = jest.fn(() => {
    return {
      json
    }
  })

  return command.run().then((result) => {
    expect(stdout.output).toMatch(fixtureFile('showdevicetypes.txt'))
  })
})
