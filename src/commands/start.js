const BaseCommand = require('../BaseCommand')
const { flags } = require('@oclif/command')
const { getDeviceFromDeviceTypeId } = require('../helpers')
const simctl = require('simctl')

class StartCommand extends BaseCommand {
  async run () {
    const { flags } = this.parse(StartCommand)

    const device = getDeviceFromDeviceTypeId(flags.devicetypeid)
    simctl.extensions.start(device.id)
  }
}

StartCommand.description = 'Launch the iOS Simulator without an app'

StartCommand.flags = {
  ...BaseCommand.flags,
  devicetypeid: flags.string({
    char: 'd',
    description: 'The id of the device type that should be simulated (Xcode6+). Use \'showdevicetypes\' to list devices.'
  })
}

module.exports = StartCommand
