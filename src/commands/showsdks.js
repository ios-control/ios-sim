const BaseCommand = require('../BaseCommand')
const simctl = require('simctl')

class ShowSdksCommand extends BaseCommand {
  async run () {
    const options = { silent: true, runtimes: true }
    const list = simctl.list(options).json

    this.log(await this.output(list.runtimes))
    return list.runtimes
  }

  async output (runtimes) {
    if (!runtimes) {
      const options = { silent: true, runtimes: true }
      const list = simctl.list(options).json
      runtimes = list.runtimes
    }

    let output = 'Simulator SDK Roots:\n'
    runtimes.forEach(function (runtime) {
      if (runtime.availability === '(available)') {
        output += `"${runtime.name}" (${runtime.buildversion})\n`
        output += '\t(unknown)\n'
      }
    })

    return output
  }
}

ShowSdksCommand.description = 'List the available iOS SDK versions'

ShowSdksCommand.flags = {
  ...BaseCommand.flags
}

module.exports = ShowSdksCommand
