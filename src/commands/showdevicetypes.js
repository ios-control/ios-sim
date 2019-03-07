const BaseCommand = require('../BaseCommand')
const { getDeviceTypes } = require('../helpers')

class ShowDeviceTypesCommand extends BaseCommand {
  async run () {
    const output = []
    getDeviceTypes().forEach(function (device) {
      output.push(device)
    })

    this.log(output.join('\n'))
    return output
  }
}

ShowDeviceTypesCommand.description = 'List the available device types'

ShowDeviceTypesCommand.flags = {
  ...BaseCommand.flags
}

module.exports = ShowDeviceTypesCommand
