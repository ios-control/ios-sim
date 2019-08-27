const BaseCommand = require('../BaseCommand')
const { getDeviceFromDeviceTypeId } = require('../helpers')
const { flags } = require('@oclif/command')
const fs = require('fs')
const path = require('path')
const bplist = require('bplist-parser')
const simctl = require('simctl')

class InstallCommand extends BaseCommand {
  async run () {
    // lib.install(app_path, args.devicetypeid, args.log, args.exit)
    const { args, flags } = this.parse(InstallCommand)

    const info_plist_path = path.join(args.applicationPath, 'Info.plist')
    if (!fs.existsSync(info_plist_path)) {
      this.handleError(`${info_plist_path} file not found.`)
    }

    bplist.parseFile(info_plist_path, function (err, obj) {
      if (err) {
        throw err
      }

      // get the deviceid from --devicetypeid
      // --devicetypeid is a string in the form "devicetype, runtime_version" (optional: runtime_version)
      const device = getDeviceFromDeviceTypeId(flags.devicetypeid)

      // so now we have the deviceid, we can proceed
      simctl.extensions.start(device.id)
      simctl.install(device.id, args.applicationPath)

      simctl.extensions.log(device.id, flags.log)
      if (flags.log) {
        this.log(`logPath: ${path.resolve(flags.log)}`)
      }
      if (flags.exit) {
        process.exit(0)
      }
    })
  }
}

InstallCommand.args = [
  {
    name: 'applicationPath',
    required: true,
    description: 'the path to the application to launch'
  }
]

InstallCommand.description = 'Install the application at the specified path to the iOS Simulator without launching the app'

InstallCommand.flags = {
  ...BaseCommand.flags,
  devicetypeid: flags.string({
    char: 'd',
    description: 'The id of the device type that should be simulated (Xcode6+). Use \'showdevicetypes\' to list devices.'
  })
}

module.exports = InstallCommand
