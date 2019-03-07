const BaseCommand = require('../BaseCommand')

class LaunchCommand extends BaseCommand {
  async run () {
    console.log('test')
  }
}

LaunchCommand.args = [
  {
    name: 'applicationPath',
    required: true,
    description: 'the path to the application to launch'
  }
]

LaunchCommand.description = 'Launch the application at the specified path on the iOS Simulator'

LaunchCommand.flags = {
  ...BaseCommand.flags
}

module.exports = LaunchCommand
