const BaseCommand = require('../BaseCommand')
const simctl = require('simctl')

class ShowSdksCommand extends BaseCommand {
  async run () {
    let options = { silent: true, runtimes: true }
    let list = simctl.list(options).json

    let output = 'Simulator SDK Roots:\n'
    list.runtimes.forEach(function (runtime) {
      if (runtime.availability === '(available)') {
        output += `"${runtime.name}" (${runtime.buildversion})\n`
        output += '\t(unknown)\n'
      }
    })

    this.log(output)
    return list.runtimes
  }
}

ShowSdksCommand.description = 'List the available iOS SDK versions'

ShowSdksCommand.flags = {
  ...BaseCommand.flags
}

module.exports = ShowSdksCommand
