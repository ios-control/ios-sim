const TheCommand = require('../../src/commands/showsdks')
const os = require('os')
const { stdout } = require('stdout-stderr')

jest.mock('simctl')
const simctl = require('simctl')

let command
beforeEach(() => {
  command = new TheCommand([])
})

test('showsdks', function () {
  if (os.platform() === 'darwin') {
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
  }
})
