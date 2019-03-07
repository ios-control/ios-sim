const BaseCommand = require('../BaseCommand')

class StartCommand extends BaseCommand {
  async run () {
    console.log('test')
  }
}

StartCommand.description = 'Launch iOS Simulator without an app'

StartCommand.flags = {
  ...BaseCommand.flags
}

module.exports = StartCommand
