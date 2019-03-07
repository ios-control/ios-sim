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
  // simctl.list(options).json

  if (os.platform() === 'darwin') {
    const runtimes = [
      {
        name: 'Runtime1',
        availability: '(available)',
        buildversion: 1
      },
      {
        name: 'Runtime2',
        availability: '(unavailable)',
        buildversion: 2
      }
    ]

    simctl.list = jest.fn(() => {
      return {
        json: {
          runtimes
        }
      }
    })

    return command.run().then((result) => {
      expect(result).toMatchObject(runtimes)
      expect(stdout.output).toMatch(`Simulator SDK Roots:\n"Runtime1" (1)\n\t(unknown)\n\n`)
    })
  }
})
