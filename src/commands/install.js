const BaseCommand = require('../BaseCommand')

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
  ...BaseCommand.flags
}

module.exports = InstallCommand
