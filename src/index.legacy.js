const ShowDeviceTypesCommand = require('./commands/showdevicetypes')
const ShowSdksCommand = require('./commands/showsdks')
const InstallCommand = require('./commands/install')
const LaunchCommand = require('./commands/launch')
const StartCommand = require('./commands/start')

function deprecatedMessage (old, nnew) {
  console.warn(`ios-sim.${old} is deprecated, use ${nnew} instead.`)
}

module.exports = {

  getdevicetypes: () => { // legacy for backwards compatibility
    deprecatedMessage('getdevicetypes', 'ShowDeviceTypesCommand')
    return ShowDeviceTypesCommand.run([])
  },

  showdevicetypes: () => { // legacy for backwards compatibility
    deprecatedMessage('showdevicetypes', 'ShowDeviceTypesCommand')
    return new ShowDeviceTypesCommand().output()
  },

  showsdks: () => { // legacy for backwards compatibility
    deprecatedMessage('showsdks', 'ShowSdksCommand')
    return new ShowSdksCommand().output()
  },

  install: (app_path, devicetypeid, log, exit) => { // legacy for backwards compatibility
    deprecatedMessage('install', 'InstallCommand')
    const argv = [app_path, '--devicetypeid', devicetypeid]
    if (log) {
      argv.push(...['--log', log])
    }
    if (exit) {
      argv.push('--exit')
    }
    return InstallCommand.run(argv)
  },

  launch: (app_path, devicetypeid, log, exit, setenv, args) => { // legacy for backwards compatibility
    deprecatedMessage('launch', 'LaunchCommand')
    const argv = [app_path, '--devicetypeid', devicetypeid]
    if (log) {
      argv.push(...['--log', log])
    }
    if (exit) {
      argv.push('--exit')
    }
    if (setenv) {
      argv.push(...['--setenv', setenv])
    }
    if (args) {
      argv.push(...['--args', args])
    }

    return LaunchCommand.run(argv)
  },

  start: (devicetypeid) => { // legacy for backwards compatibility
    deprecatedMessage('start', 'StartCommand')
    const argv = ['--devicetypeid', devicetypeid]

    return StartCommand.run(argv)
  }
}
