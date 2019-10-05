const TheCommand = require('../../src/commands/start')

jest.mock('simctl')
const simctl = require('simctl')

let command
beforeEach(() => {
  command = new TheCommand([])
})

test('start run', function () {
  const json = fixtureJson('simctl-list.json')
  const deviceType = 'com.apple.CoreSimulator.SimDeviceType.iPhone-SE,iOS 12.1'
  const availbleDevice = json.devices['iOS 12.1']
    .find(({ isAvailable, name }) => isAvailable && name === 'iPhone SE')

  simctl.list = jest.fn(() => {
    return {
      json
    }
  })
  simctl.extensions = { start: jest.fn() }

  command.argv = ['--devicetypeid', deviceType]
  return command.run().then((result) => {
    expect(simctl.extensions.start).toHaveBeenCalledWith(availbleDevice.udid)
  })
})
