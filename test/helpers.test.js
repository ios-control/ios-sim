jest.mock('simctl')
const simctl = require('simctl')

const { getDeviceTypes, parseEnvironmentVariables, withInjectedEnvironmentVariablesToProcess, __internal } = require('../src/helpers')

let json
beforeAll(() => {
  json = fixtureJson('simctl-list.json')
  simctl.list = jest.fn(() => {
    return {
      json
    }
  })
})

const originalEnv = Object.assign({}, process.env)
beforeEach(() => {
  // restore to original env
  process.env = originalEnv
})

describe('when parsing env variables', function () {
  test('should return empty map on null value', function () {
    expect(parseEnvironmentVariables(null)).toEqual({})
  })

  test('should return empty map on undefined value', function () {
    expect(parseEnvironmentVariables(undefined)).toEqual({})
  })

  describe('without simctl fix', function () {
    test('should return valid map for valid env variable', function () {
      expect(parseEnvironmentVariables(['KEY=VALUE'], false)).toEqual({ KEY: 'VALUE' })
    })
  })

  describe('with simctl fix', function () {
    test('should add SIMCTL_CHILD_ prefix to all keys', function () {
      expect(parseEnvironmentVariables(['KEY=VALUE', 'KEY2=VALUE2', 'KEY3'], true))
        .toEqual(
          {
            SIMCTL_CHILD_KEY: 'VALUE',
            SIMCTL_CHILD_KEY2: 'VALUE2'
          }
        )
    })
  })
})

describe('fixRuntimeName tests', () => {
  test('input gibberish', () => {
    const result = __internal.fixRuntimeName('23tgweg24gwdgw')
    expect(result).toEqual('23tgweg24gwdgw')
  })

  test('input com.apple.CoreSimulator.SimRuntime.iOS-12-0', () => {
    const result = __internal.fixRuntimeName('com.apple.CoreSimulator.SimRuntime.iOS-12-0')
    expect(result).toEqual('iOS 12.0')
  })

  test('input com.apple.CoreSimulator.SimRuntime.tvOS-12-1', () => {
    const result = __internal.fixRuntimeName('com.apple.CoreSimulator.SimRuntime.tvOS-12-1')
    expect(result).toEqual('tvOS 12.1')
  })

  test('input com.apple.CoreSimulator.SimRuntime.watchOS-5-1', () => {
    const result = __internal.fixRuntimeName('com.apple.CoreSimulator.SimRuntime.watchOS-5-1')
    expect(result).toEqual('watchOS 5.1')
  })

  test('input typo "comX" - comX.apple.CoreSimulator.SimRuntime.iOS-12-0', () => {
    const result = __internal.fixRuntimeName('comX.apple.CoreSimulator.SimRuntime.iOS-12-0')
    expect(result).toEqual('comX.apple.CoreSimulator.SimRuntime.iOS-12-0')
  })

  test('input typo "iOS 12 0" - com.apple.CoreSimulator.SimRuntime.iOS 12 0', () => {
    const result = __internal.fixRuntimeName('comX.apple.CoreSimulator.SimRuntime.iOS 12 0')
    expect(result).toEqual('comX.apple.CoreSimulator.SimRuntime.iOS 12 0')
  })
})

describe('findAvailableRuntime', () => {
  test('success', () => {
    const runtime = __internal.findAvailableRuntime(json, 'iPhone X')
    expect(runtime).toEqual('iOS 12.1')
  })

  test('failure', () => {
    try {
      __internal.findAvailableRuntime(json, 'iPhone XX')
    } catch (err) {
      expect(err.message).toMatch('No available runtimes could be found for "iPhone XX".')
    }
  })
})

describe('getDeviceFromDeviceTypeId', () => {
  test('unknown device', () => {
    try {
      __internal.getDeviceFromDeviceTypeId('unknown-device')
    } catch (err) {
      expect(err.message).toMatch('Device type "com.apple.CoreSimulator.SimDeviceType.unknown-device" could not be found.')
    }
  })

  test('no device', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockResolvedValue()

    const device = __internal.getDeviceFromDeviceTypeId()
    expect(device).toMatchObject({ id: '0CB7F7A1-A837-4809-8951-B724D6496462', name: 'Apple Watch Series 2 - 38mm', runtime: 'watchOS 5.1' })
    expect(consoleSpy).toHaveBeenCalledWith('--devicetypeid was not specified, using first available device: Apple Watch Series 2 - 38mm')
    consoleSpy.mockRestore()
  })

  test('known device, with runtime', () => {
    const device = __internal.getDeviceFromDeviceTypeId('iPhone-X, 12.1')
    expect(device).toMatchObject({ id: 'BAC3ADB2-66B2-41C0-AF0D-8D4D58E2E88A', name: 'iPhone X', runtime: 'iOS 12.1' })
  })

  test('known device, with runtime (has com.apple.CoreSimulator.SimRuntime prefix) ', () => {
    const device = __internal.getDeviceFromDeviceTypeId('iPhone-8, 11.3')
    expect(device).toMatchObject({ id: '85D9D9AE-2749-4169-A3DB-94FC9C8EC8F4', name: 'iPhone 8', runtime: 'iOS 11.3' })
  })

  test('known device, no runtime', () => {
    const device = __internal.getDeviceFromDeviceTypeId('com.apple.CoreSimulator.SimDeviceType.iPhone-X')
    expect(device).toMatchObject({ id: 'BAC3ADB2-66B2-41C0-AF0D-8D4D58E2E88A', name: 'iPhone X', runtime: 'iOS 12.1' })
  })

  test('known device, unknown runtime', () => {
    try {
      __internal.getDeviceFromDeviceTypeId('iPhone-X, 4.1')
    } catch (err) {
      expect(err.message).toMatch('Device id for device name "iPhone X" and runtime "iOS 4.1" could not be found, or is not available.')
    }
  })
})

test('withInjectedEnvironmentVariablesToProcess', () => {
  const action = jest.fn().mockImplementation(() => {
    expect(process.env.myenv1).toEqual('myvalue1')
  })
  const envVariables = {
    myenv1: 'myvalue1'
  }
  withInjectedEnvironmentVariablesToProcess(process, envVariables, action)
  expect(process.env.myenv1).toBeUndefined()
})

test('fixNameKey', () => { // coverage
  const arr = __internal.fixNameKey([])
  expect(arr).toEqual([])
})

test('findRuntimesGroupByDeviceProperty', () => { // coverage
  const runtimes = __internal.findRuntimesGroupByDeviceProperty(json, 'name', false)
  expect(Object.keys(runtimes).length).toEqual(41)
})

test('getdevicetypes', () => { // coverage
  const druntimes = {
    'iPhone XX': ['15.6']
  }

  const deviceTypes = getDeviceTypes(druntimes)
  expect(deviceTypes).toMatchObject([])
})
