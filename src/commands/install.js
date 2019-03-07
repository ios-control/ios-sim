const BaseCommand = require('../BaseCommand')
const { flags } = require('@oclif/command')

class InstallCommand extends BaseCommand {
  async run () {
    console.log('test')
  }
}

InstallCommand.args = [
  {
    name: 'applicationPath',
    required: true,
    description: 'the path to the application to launch'
  }
]

InstallCommand.description = 'Install the application at the specified path on the iOS Simulator without launching the app'

InstallCommand.flags = {
  ...BaseCommand.flags,
  devicetypeid: flags.string({
    char: 'd',
    description: 'The id of the device type that should be simulated (Xcode6+). Use \'showdevicetypes\' to list devices.'
  })
}

module.exports = InstallCommand
