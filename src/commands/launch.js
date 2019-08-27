const BaseCommand = require('../BaseCommand')
const { parseEnvironmentVariables, withInjectedEnvironmentVariablesToProcess, getDeviceFromDeviceTypeId } = require('../helpers')
const { flags } = require('@oclif/command')
const path = require('path')
const fs = require('fs')
const bplist = require('bplist-parser')
const plist = require('plist')
const simctl = require('simctl')

class LaunchCommand extends BaseCommand {
  async run () {
    const { args, flags } = this.parse(LaunchCommand)

    const wait_for_debugger = false
    const info_plist_path = path.join(args.applicationPath, 'Info.plist')
    let app_identifier

    if (!fs.existsSync(info_plist_path)) {
      this.handleError(`${info_plist_path}  file not found.`)
    }

    bplist.parseFile(info_plist_path, function (err, obj) {
      if (err) {
        // try to see if a regular plist parser will work
        obj = plist.parse(fs.readFileSync(info_plist_path, 'utf8'))
        if (obj) {
          app_identifier = obj.CFBundleIdentifier
        } else {
          throw err
        }
      } else {
        app_identifier = obj[0].CFBundleIdentifier
      }

      const flagArgs = flags.args || []
      const setenv = flags.setenv || []

      const environmentVariables = parseEnvironmentVariables(setenv)

      withInjectedEnvironmentVariablesToProcess(process, environmentVariables, function () {
        // get the deviceid from --devicetypeid
        // --devicetypeid is a string in the form "devicetype, runtime_version" (optional: runtime_version)
        const device = getDeviceFromDeviceTypeId(flags.devicetypeid)

        // so now we have the deviceid, we can proceed
        simctl.extensions.start(device.id)
        simctl.install(device.id, args.applicationPath)
        simctl.launch(wait_for_debugger, device.id, app_identifier, flagArgs)
        simctl.extensions.log(device.id, flags.log)
        if (flags.log) {
          this.log(`logPath: ${path.resolve(flags.log)}`)
        }
        if (flags.exit) {
          process.exit(0)
        }
      })
    })
  }
}

LaunchCommand.args = [
  {
    name: 'applicationPath',
    required: true,
    description: 'the path to the application to launch'
  }
]

LaunchCommand.description = 'Launch the application at the specified path in the iOS Simulator'

LaunchCommand.flags = {
  ...BaseCommand.flags,
  devicetypeid: flags.string({
    char: 'd',
    description: 'The id of the device type that should be simulated (Xcode6+). Use \'showdevicetypes\' to list devices.'
  }),
  setenv: flags.string({
    multiple: true,
    char: 's',
    description: 'environment variables to pass in as key value pairs'
  }),
  args: flags.string({
    multiple: true,
    char: 'a',
    description: 'arguments to pass in to the launched app'
  })
}

module.exports = LaunchCommand
