// legacy export tests

const { ShowDeviceTypesCommand, ShowSdksCommand, InstallCommand, LaunchCommand, StartCommand } = require('../src/index')
const { getdevicetypes, showdevicetypes, showsdks, install, launch, start } = require('../src/index.legacy')

test('getdevicetypes function export', function () {
  const command = getdevicetypes
  const spy = jest.spyOn(ShowDeviceTypesCommand, 'run').mockReturnValue(['Device1'])
  const consoleSpy = jest.spyOn(console, 'warn')

  expect(command()).toEqual(['Device1'])
  expect(consoleSpy).toHaveBeenCalledWith('ios-sim.getdevicetypes is deprecated, use ShowDeviceTypesCommand instead.')
  expect(spy).toHaveBeenCalled()

  spy.mockClear()
  consoleSpy.mockClear()
})

test('showdevicetypes function export', function () {
  const command = showdevicetypes
  const spy = jest.spyOn(ShowDeviceTypesCommand.prototype, 'output').mockReturnValue('Device2\nDevice3')
  const consoleSpy = jest.spyOn(console, 'warn')

  expect(command()).toEqual('Device2\nDevice3')
  expect(consoleSpy).toHaveBeenCalledWith('ios-sim.showdevicetypes is deprecated, use ShowDeviceTypesCommand instead.')
  expect(spy).toHaveBeenCalled()

  spy.mockClear()
  consoleSpy.mockClear()
})

test('showsdks function export', function () {
  const command = showsdks
  const spy = jest.spyOn(ShowSdksCommand.prototype, 'output').mockReturnValue('Runtime1\nRuntime2')
  const consoleSpy = jest.spyOn(console, 'warn')

  expect(command()).toEqual('Runtime1\nRuntime2')
  expect(consoleSpy).toHaveBeenCalledWith('ios-sim.showsdks is deprecated, use ShowSdksCommand instead.')
  expect(spy).toHaveBeenCalled()

  spy.mockClear()
  consoleSpy.mockClear()
})

test('install function export', function () {
  const command = install
  const spy = jest.spyOn(InstallCommand, 'run').mockReturnValue()
  const consoleSpy = jest.spyOn(console, 'warn')

  // arguments: app_path, devicetypeid, log, exit

  expect(command('/my/app_path', 'abcdefg123', '/my/log_path', true)).toBeUndefined()
  expect(consoleSpy).toHaveBeenCalledWith('ios-sim.install is deprecated, use InstallCommand instead.')
  expect(spy).toHaveBeenCalledWith(['/my/app_path', '--devicetypeid', 'abcdefg123', '--log', '/my/log_path', '--exit'])

  expect(command('/my/app_path', 'abcdefg123')).toBeUndefined()
  expect(spy).toHaveBeenCalledWith(['/my/app_path', '--devicetypeid', 'abcdefg123'])

  expect(spy).toHaveBeenCalledTimes(2)

  spy.mockClear()
  consoleSpy.mockClear()
})

test('launch function export', function () {
  const command = launch
  const spy = jest.spyOn(LaunchCommand, 'run').mockReturnValue()
  const consoleSpy = jest.spyOn(console, 'warn')

  // arguments: app_path, devicetypeid, log, exit, setenv, args
  expect(command('/my/app_path', 'abcdefg123', '/my/log_path', true, 'env1,env2', 'arg1,arg2')).toBeUndefined()
  expect(consoleSpy).toHaveBeenCalledWith('ios-sim.launch is deprecated, use LaunchCommand instead.')
  expect(spy).toHaveBeenCalledWith(['/my/app_path', '--devicetypeid', 'abcdefg123', '--log', '/my/log_path', '--exit', '--setenv', 'env1,env2', '--args', 'arg1,arg2'])

  expect(command('/my/app_path', 'abcdefg123', '/my/log_path', true)).toBeUndefined()
  expect(spy).toHaveBeenCalledWith(['/my/app_path', '--devicetypeid', 'abcdefg123', '--log', '/my/log_path', '--exit'])

  expect(command('/my/app_path', 'abcdefg123', null, null, 'env1,env2', 'arg1,arg2')).toBeUndefined()
  expect(spy).toHaveBeenCalledWith(['/my/app_path', '--devicetypeid', 'abcdefg123', '--setenv', 'env1,env2', '--args', 'arg1,arg2'])

  expect(spy).toHaveBeenCalledTimes(3)

  spy.mockClear()
  consoleSpy.mockClear()
})

test('start function export', function () {
  const command = start
  const spy = jest.spyOn(StartCommand, 'run').mockReturnValue()
  const consoleSpy = jest.spyOn(console, 'warn')

  // arguments: devicetypeid
  expect(command('abcdefg123')).toBeUndefined()
  expect(spy).toHaveBeenCalledWith(['--devicetypeid', 'abcdefg123'])
  expect(consoleSpy).toHaveBeenCalledWith('ios-sim.start is deprecated, use StartCommand instead.')

  expect(spy).toHaveBeenCalledTimes(1)

  spy.mockClear()
  consoleSpy.mockClear()
})
