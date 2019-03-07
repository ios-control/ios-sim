const simctl = require('simctl')

function fixSimCtlList (list) {
  // Xcode 9 `xcrun simctl list devicetypes` have obfuscated names for 2017 iPhones and Apple Watches.
  let deviceTypeNameMap = {
    'iPhone2017-A': 'iPhone 8',
    'iPhone2017-B': 'iPhone 8 Plus',
    'iPhone2017-C': 'iPhone X',
    'Watch2017 - 38mm': 'Apple Watch Series 3 - 38mm',
    'Watch2017 - 42mm': 'Apple Watch Series 3 - 42mm'
  }
  list.devicetypes = fixNameKey(list.devicetypes, deviceTypeNameMap)

  // `iPad Pro` in iOS 9.3 has mapped to `iPad Pro (9.7 inch)`
  // `Apple TV 1080p` has mapped to `Apple TV`
  let deviceNameMap = {
    'Apple TV 1080p': 'Apple TV',
    'iPad Pro': 'iPad Pro (9.7-inch)'
  }
  Object.keys(list.devices).forEach(function (key) {
    list.devices[key] = fixNameKey(list.devices[key], deviceNameMap)
  })

  return list
}

function getDeviceTypes (args) {
  let options = { silent: true }
  let list = simctl.list(options).json
  list = fixSimCtlList(list)

  let druntimes = findRuntimesGroupByDeviceProperty(list, 'name', true, { lowerCase: true })
  let name_id_map = {}

  list.devicetypes.forEach(function (device) {
    name_id_map[ filterDeviceName(device.name).toLowerCase() ] = device.identifier
  })

  list = []
  let remove = function (devicename, runtime) {
    // remove "iOS" prefix in runtime, remove prefix "com.apple.CoreSimulator.SimDeviceType." in id
    const deviceName = name_id_map[ devicename ].replace(/^com.apple.CoreSimulator.SimDeviceType./, '')
    const runtimeName = runtime.replace(/^iOS /, '')
    list.push(`${deviceName}, ${runtimeName}`)
  }

  let cur = function (devicename) {
    return function (runtime) {
      remove(devicename, runtime)
    }
  }

  for (let deviceName in druntimes) {
    let runtimes = druntimes[ deviceName ]
    let dname = filterDeviceName(deviceName).toLowerCase()

    if (!(dname in name_id_map)) {
      continue
    }

    runtimes.forEach(cur(dname))
  }
  return list
}

function fixNameKey (array, mapping) {
  if (!array || !mapping) {
    return array
  }

  return array.map(function (elem) {
    let name = mapping[elem.name]
    if (name) {
      elem.name = name
    }
    return elem
  })
}

// replace hyphens in iPad Pro name which differ in 'Device Types' and 'Devices'
function filterDeviceName (deviceName) {
  // replace hyphens in iPad Pro name which differ in 'Device Types' and 'Devices'
  if (/^iPad Pro/i.test(deviceName)) {
    return deviceName.replace(/-/g, ' ').trim()
  }
  // replace ʀ in iPhone Xʀ
  if (deviceName.indexOf('ʀ') > -1) {
    return deviceName.replace('ʀ', 'R')
  }
  return deviceName
}

function findRuntimesGroupByDeviceProperty (list, deviceProperty, availableOnly, options = {}) {
  /*
        // Example result:
        {
            "iPhone 6" : [ "iOS 8.2", "iOS 8.3"],
            "iPhone 6 Plus" : [ "iOS 8.2", "iOS 8.3"]
        }
    */

  let runtimes = {}
  let available_runtimes = {}

  list.runtimes.forEach(function (runtime) {
    available_runtimes[ runtime.name ] = (runtime.availability === '(available)')
  })

  Object.keys(list.devices).forEach(function (deviceGroup) {
    list.devices[deviceGroup].forEach(function (device) {
      let devicePropertyValue = device[deviceProperty]

      if (options.lowerCase) {
        devicePropertyValue = devicePropertyValue.toLowerCase()
      }
      if (!runtimes[devicePropertyValue]) {
        runtimes[devicePropertyValue] = []
      }
      if (availableOnly) {
        if (available_runtimes[deviceGroup]) {
          runtimes[devicePropertyValue].push(deviceGroup)
        }
      } else {
        runtimes[devicePropertyValue].push(deviceGroup)
      }
    })
  })

  return runtimes
}

// Parses array of KEY=Value strings into map of strings
// If fixsymctl == true, updates variables for correct usage with simctl
function parseEnvironmentVariables (envVariables, fixsymctl) {
  envVariables = envVariables || []
  fixsymctl = typeof fixsymctl !== 'undefined' ? fixsymctl : true

  let envMap = {}
  envVariables.forEach(function (variable) {
    let envPair = variable.split('=', 2)
    if (envPair.length === 2) {
      let key = envPair[0]
      let value = envPair[1]
      if (fixsymctl) {
        key = 'SIMCTL_CHILD_' + key
      }
      envMap[ key ] = value
    }
  })
  return envMap
}

// Injects specified environt variables to the process and then runs action
// returns environment variables back to original state after action completes
function withInjectedEnvironmentVariablesToProcess (process, envVariables, action) {
  let oldVariables = Object.assign({}, process.env)

  // Inject additional environment variables to process
  for (let key in envVariables) {
    let value = envVariables[key]
    process.env[key] = value
  }

  action()

  // restore old envs
  process.env = oldVariables
}

function getDeviceFromDeviceTypeId (devicetypeid) {
  /*
        // Example result:
        {
            name : 'iPhone 6',
            id : 'A1193D97-F5EE-468D-9DBA-786F403766E6',
            runtime : 'iOS 8.3'
        }
    */

  // the object to return
  let ret_obj = {
    name: null,
    id: null,
    runtime: null
  }

  let options = { 'silent': true }
  let list = simctl.list(options).json
  list = fixSimCtlList(list)

  let arr = []
  if (devicetypeid) {
    arr = devicetypeid.split(',')
  }

  // get the devicetype from --devicetypeid
  // --devicetypeid is a string in the form "devicetype, runtime_version" (optional: runtime_version)
  let devicetype = null
  if (arr.length < 1) {
    let dv = findFirstAvailableDevice(list)
    console.error(`--devicetypeid was not specified, using first available device: ${dv.name}`)
    return dv
  } else {
    devicetype = arr[0].trim()
    if (arr.length > 1) {
      ret_obj.runtime = arr[1].trim()
    }
  }

  // check whether devicetype has the "com.apple.CoreSimulator.SimDeviceType." prefix, if not, add it
  let prefix = 'com.apple.CoreSimulator.SimDeviceType.'
  if (devicetype.indexOf(prefix) !== 0) {
    devicetype = prefix + devicetype
  }

  // now find the devicename from the devicetype
  let devicename_found = list.devicetypes.some(function (deviceGroup) {
    if (deviceGroup.identifier === devicetype) {
      ret_obj.name = deviceGroup.name
      return true
    }

    return false
  })

  // device name not found, exit
  if (!devicename_found) {
    throw new Error(`Device type "${devicetype}" could not be found.`)
  }

  // if runtime_version was not specified, we use a default. Use first available that has the device
  if (!ret_obj.runtime) {
    ret_obj.runtime = findAvailableRuntime(list, ret_obj.name)
  }

  // prepend iOS to runtime version, if necessary
  if (ret_obj.runtime.indexOf('OS') === -1) {
    ret_obj.runtime = `iOS ${ret_obj.runtime}`
  }

  // now find the deviceid (by runtime and devicename)
  let deviceid_found = Object.keys(list.devices).some(function (deviceGroup) {
    // found the runtime, now find the actual device matching devicename
    if (deviceGroup === ret_obj.runtime) {
      return list.devices[deviceGroup].some(function (device) {
        if (filterDeviceName(device.name).toLowerCase() === filterDeviceName(ret_obj.name).toLowerCase()) {
          ret_obj.id = device.udid
          return true
        }
        return false
      })
    }
    return false
  })

  if (!deviceid_found) {
    throw new Error(
      `Device id for device name "${ret_obj.name}" and runtime "${ret_obj.runtime}" could not be found, or is not available.`
    )
  }

  return ret_obj
}

function findAvailableRuntime (list, device_name) {
  device_name = device_name.toLowerCase()

  let all_druntimes = findRuntimesGroupByDeviceProperty(list, 'name', true, { lowerCase: true })
  let druntime = all_druntimes[ filterDeviceName(device_name) ] || all_druntimes[ device_name ]
  let runtime_found = druntime && druntime.length > 0

  if (!runtime_found) {
    throw new Error(`No available runtimes could be found for "${device_name}".`)
  }

  // return most modern runtime
  return druntime.sort().pop()
}

function findFirstAvailableDevice (list) {
  /*
        // Example result:
        {
            name : 'iPhone 6',
            id : 'A1193D97-F5EE-468D-9DBA-786F403766E6',
            runtime : 'iOS 8.3'
        }
    */

  // the object to return
  let ret_obj = {
    name: null,
    id: null,
    runtime: null
  }

  let available_runtimes = {}

  list.runtimes.forEach(function (runtime) {
    available_runtimes[ runtime.name ] = (runtime.availability === '(available)')
  })

  Object.keys(list.devices).some(function (deviceGroup) {
    return list.devices[deviceGroup].some(function (device) {
      if (available_runtimes[deviceGroup]) {
        ret_obj = {
          name: device.name,
          id: device.udid,
          runtime: deviceGroup
        }
        return true
      }
      return false
    })
  })

  return ret_obj
}

module.exports = {
  getDeviceTypes,
  parseEnvironmentVariables,
  withInjectedEnvironmentVariablesToProcess,
  getDeviceFromDeviceTypeId
}
