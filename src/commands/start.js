const BaseCommand = require('../BaseCommand')
const { getDeviceFromDeviceTypeId } = require('../helpers')
const simctl = require('simctl')

class StartCommand extends BaseCommand {
  async run () {
    const { flags } = this.parse(StartCommand)

    let device = getDeviceFromDeviceTypeId(flags.devicetypeid)
    simctl.extensions.start(device.id)
  }
}

StartCommand.description = 'Launch iOS Simulator without an app'

StartCommand.flags = {
  ...BaseCommand.flags
}

module.exports = StartCommand
