const simctl = require('simctl')

function fixSimCtlList (list) {
  // Xcode 9 `xcrun simctl list devicetypes` have obfuscated names for 2017 iPhones and Apple Watches.
  const deviceTypeNameMap = {
    'iPhone2017-A': 'iPhone 8',
    'iPhone2017-B': 'iPhone 8 Plus',
    'iPhone2017-C': 'iPhone X',
    'Watch2017 - 38mm': 'Apple Watch Series 3 - 38mm',
    'Watch2017 - 42mm': 'Apple Watch Series 3 - 42mm'
  }
  list.devicetypes = fixNameKey(list.devicetypes, deviceTypeNameMap)

  // `iPad Pro` in iOS 9.3 has mapped to `iPad Pro (9.7 inch)`
  // `Apple TV 1080p` has mapped to `Apple TV`
  const deviceNameMap = {
    'Apple TV 1080p': 'Apple TV',
    'iPad Pro': 'iPad Pro (9.7-inch)'
  }
  Object.keys(list.devices).forEach(function (key) {
    list.devices[key] = fixNameKey(list.devices[key], deviceNameMap)
  })

  return list
}

function getDeviceTypes (druntimes) {
  const options = { silent: true }
  let list = simctl.list(options).json
  list = fixSimCtlList(list)

  if (!druntimes) {
    druntimes = findRuntimesGroupByDeviceProperty(list, 'name', true, { lowerCase: true })
  }
  const name_id_map = {}

  list.devicetypes.forEach(function (device) {
    name_id_map[filterDeviceName(device.name).toLowerCase()] = device.identifier
  })

  list = []
  const remove = function (devicename, runtime) {
    // remove "iOS" prefix in runtime, remove prefix "com.apple.CoreSimulator.SimDeviceType." in id
    const deviceName = name_id_map[devicename].replace(/^com.apple.CoreSimulator.SimDeviceType./, '')
    const runtimeName = runtime.replace(/^iOS /, '')
    list.push(`${deviceName}, ${runtimeName}`)
  }

  const cur = function (devicename) {
    return function (runtime) {
      remove(devicename, runtime)
    }
  }

  for (const deviceName in druntimes) {
    const runtimes = druntimes[deviceName]
    const dname = filterDeviceName(deviceName).toLowerCase()

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
    const name = mapping[elem.name]
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

  const runtimes = {}
  const available_runtimes = {}

  list.runtimes.forEach(function (runtime) {
    // runtime.name should already be normalized, 'identifier' key has the namespaced name
    available_runtimes[runtime.name] = (runtime.availability === '(available)')
  })

  Object.keys(list.devices).forEach(function (deviceGroup) {
    list.devices[deviceGroup].forEach(function (device) {
      // deviceGroup has not been normalized, it can either be the namespaced name, or the
      // human readable name. We normalize it
      const normalizedRuntimeName = fixRuntimeName(deviceGroup)

      let devicePropertyValue = device[deviceProperty]

      if (options.lowerCase) {
        devicePropertyValue = devicePropertyValue.toLowerCase()
      }
      if (!runtimes[devicePropertyValue]) {
        runtimes[devicePropertyValue] = []
      }

      if (availableOnly) {
        if (available_runtimes[normalizedRuntimeName]) {
          runtimes[devicePropertyValue].push(normalizedRuntimeName)
        }
      } else {
        runtimes[devicePropertyValue].push(normalizedRuntimeName)
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

  const envMap = {}
  envVariables.forEach(function (variable) {
    const envPair = variable.split('=', 2)
    if (envPair.length === 2) {
      let key = envPair[0]
      const value = envPair[1]
      if (fixsymctl) {
        key = 'SIMCTL_CHILD_' + key
      }
      envMap[key] = value
    }
  })
  return envMap
}

// Injects specified environment variables to the process and then runs action
// returns environment variables back to original state after action completes
function withInjectedEnvironmentVariablesToProcess (process, envVariables, action) {
  const oldVariables = Object.assign({}, process.env)

  // Inject additional environment variables to process
  for (const key in envVariables) {
    const value = envVariables[key]
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
  const ret_obj = {
    name: null,
    id: null,
    runtime: null
  }

  const options = { silent: true }
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
    const dv = findFirstAvailableDevice(list)
    console.error(`--devicetypeid was not specified, using first available device: ${dv.name}`)
    return dv
  } else {
    devicetype = arr[0].trim()
    if (arr.length > 1) {
      ret_obj.runtime = arr[1].trim()
    }
  }

  // check whether devicetype has the "com.apple.CoreSimulator.SimDeviceType." prefix, if not, add it
  const prefix = 'com.apple.CoreSimulator.SimDeviceType.'
  if (devicetype.indexOf(prefix) !== 0) {
    devicetype = prefix + devicetype
  }

  // now find the devicename from the devicetype
  const devicename_found = list.devicetypes.some(function (deviceGroup) {
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
  const deviceid_found = Object.keys(list.devices).some(function (deviceGroup) {
    // deviceGroup has not been normalized, it can either be the namespaced name, or the
    // human readable name. We normalize it
    const normalizedRuntimeName = fixRuntimeName(deviceGroup)
    if (normalizedRuntimeName === ret_obj.runtime) {
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

function findAvailableRuntime (list, devicename) {
  const device_name = devicename.toLowerCase()

  const all_druntimes = findRuntimesGroupByDeviceProperty(list, 'name', true, { lowerCase: true })
  const druntime = all_druntimes[filterDeviceName(device_name)] || all_druntimes[device_name]
  const runtime_found = druntime && druntime.length > 0

  if (!runtime_found) {
    throw new Error(`No available runtimes could be found for "${devicename}".`)
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

  const available_runtimes = {}

  list.runtimes.forEach(function (runtime) {
    // runtime.name should already be normalized, 'identifier' key has the namespaced name
    available_runtimes[runtime.name] = (runtime.availability === '(available)')
  })

  Object.keys(list.devices).some(function (deviceGroup) {
    return list.devices[deviceGroup].some(function (device) {
      // deviceGroup has not been normalized, it can either be the namespaced name, or the
      // human readable name. We normalize it
      const normalizedRuntimeName = fixRuntimeName(deviceGroup)
      if (available_runtimes[normalizedRuntimeName]) {
        ret_obj = {
          name: device.name,
          id: device.udid,
          runtime: normalizedRuntimeName
        }
        return true
      }
      return false
    })
  })

  return ret_obj
}

function fixRuntimeName (runtimeName) {
  // looking for format 'com.apple.CoreSimulator.SimRuntime.iOS-12-0'
  const pattern = /^com\.apple\.CoreSimulator\.SimRuntime\.(([a-zA-Z0-9]+)-(\S+))$/i
  const match = pattern.exec(runtimeName)

  if (match) {
    const [, , os, version] = match
    // all or nothing -- os, version will always have a value for match
    return `${os} ${version.replace('-', '.')}`
  }

  return runtimeName
}

module.exports = {
  getDeviceTypes,
  parseEnvironmentVariables,
  withInjectedEnvironmentVariablesToProcess,
  getDeviceFromDeviceTypeId,
  __internal: {
    findRuntimesGroupByDeviceProperty,
    fixNameKey,
    fixRuntimeName,
    findAvailableRuntime,
    getDeviceFromDeviceTypeId
  }
}
