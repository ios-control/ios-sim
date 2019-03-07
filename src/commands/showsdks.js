const BaseCommand = require('../BaseCommand')

class ShowSdksCommand extends BaseCommand {
  async run () {
    console.log('test')
  }
}

ShowSdksCommand.description = 'List the available iOS SDK versions'

ShowSdksCommand.flags = {
  ...BaseCommand.flags
}

module.exports = ShowSdksCommand
