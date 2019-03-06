const { Command } = require('@oclif/command')

class ShowDeviceTypesCommand extends Command {
  async run () {
    console.log('test')
  }
}

ShowDeviceTypesCommand.description = 'Show device types'

module.exports = ShowDeviceTypesCommand
