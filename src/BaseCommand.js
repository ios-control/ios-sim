const { Command, flags } = require('@oclif/command')
const debug = require('debug')

class BaseCommand extends Command {
  async init () {
    const { flags } = this.parse(this.constructor)

    // See https://www.npmjs.com/package/debug for usage in commands
    if (flags.verbose) {
      // verbose just sets the debug filter to everything (*)
      debug.enable('*')
    } else if (flags.debug) {
      debug.enable(flags.debug)
    }
  }

  handleError (msg, err) {
    const { flags } = this.parse(this.constructor)

    msg = msg || 'unknown error'
    if (err) {
      msg = `${msg}: ${err.message}`

      if (flags.verbose) {
        debug.log(err) // for stacktrace when verbose
      }
    }
    return this.error(msg)
  }
}

BaseCommand.flags = {
  debug: flags.string({
    description: 'Debug level output'
  }),
  verbose: flags.boolean({
    char: 'v',
    description: 'Enable verbose output'
  }),
  exit: flags.boolean({
    char: 'x',
    description: 'Exit after startup'
  }),
  log: flags.string({
    char: 'l',
    description: 'The path where log of the app running in the Simulator will be redirected to'
  })
}

module.exports = BaseCommand
