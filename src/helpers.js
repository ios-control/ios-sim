const simctl = require('simctl')
const util = require('util')

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
    list.push(util.format('%s, %s', name_id_map[ devicename ].replace(/^com.apple.CoreSimulator.SimDeviceType./, ''), runtime.replace(/^iOS /, '')))
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

module.exports = {
  getDeviceTypes
}
