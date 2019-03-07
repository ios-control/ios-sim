const BaseCommand = require('../BaseCommand')

class ShowDeviceTypesCommand extends BaseCommand {
  async run () {
    console.log('test')
  }
}

ShowDeviceTypesCommand.description = 'List the available device types'

ShowDeviceTypesCommand.flags = {
  ...BaseCommand.flags
}

module.exports = ShowDeviceTypesCommand
