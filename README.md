[![NPM](https://nodei.co/npm/ios-sim.png?compact=true)](https://nodei.co/npm/ios-sim/)
[![Build status](https://ci.appveyor.com/api/projects/status/xh7auct40k5oxwjg/branch/master?svg=true
)](https://ci.appveyor.com/project/shazron/ios-sim-bn5fo)
[![Build Status](https://travis-ci.org/ios-control/ios-sim.svg?branch=master)](https://travis-ci.org/ios-control/ios-sim)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/ios-control/ios-sim/master.svg?style=flat-square)](https://codecov.io/gh/ios-control/ios-sim/)

ios-sim
==========


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g ios-sim
$ ios-sim COMMAND
running command...
$ ios-sim (-v|--version|version)
ios-sim/9.0.0-dev darwin-x64 node-v8.15.0
$ ios-sim --help [COMMAND]
USAGE
  $ ios-sim COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ios-sim install APPLICATIONPATH`](#ios-sim-install-applicationpath)
* [`ios-sim launch APPLICATIONPATH`](#ios-sim-launch-applicationpath)
* [`ios-sim showdevicetypes`](#ios-sim-showdevicetypes)
* [`ios-sim showsdks`](#ios-sim-showsdks)
* [`ios-sim start`](#ios-sim-start)

## `ios-sim install APPLICATIONPATH`

Install the application at the specified path to the iOS Simulator without launching the app

```
USAGE
  $ ios-sim install APPLICATIONPATH

ARGUMENTS
  APPLICATIONPATH  the path to the application to launch

OPTIONS
  -d, --devicetypeid=devicetypeid  The id of the device type that should be simulated (Xcode6+). Use 'showdevicetypes'
                                   to list devices.

  -l, --log=log                    The path where log of the app running in the Simulator will be redirected to

  -v, --verbose                    Enable verbose output

  -x, --exit                       Exit after startup

  --debug=debug                    Debug level output
```

_See code: [src/commands/install.js](https://github.com/ios-control/ios-sim/blob/master/src/commands/install.js)_

## `ios-sim launch APPLICATIONPATH`

Launch the application at the specified path in the iOS Simulator

```
USAGE
  $ ios-sim launch APPLICATIONPATH

ARGUMENTS
  APPLICATIONPATH  the path to the application to launch

OPTIONS
  -a, --args=args                  arguments to pass in to the launched app

  -d, --devicetypeid=devicetypeid  The id of the device type that should be simulated (Xcode6+). Use 'showdevicetypes'
                                   to list devices.

  -l, --log=log                    The path where log of the app running in the Simulator will be redirected to

  -s, --setenv=setenv              environment variables to pass in as key value pairs

  -v, --verbose                    Enable verbose output

  -x, --exit                       Exit after startup

  --debug=debug                    Debug level output
```

_See code: [src/commands/launch.js](https://github.com/ios-control/ios-sim/blob/master/src/commands/launch.js)_

## `ios-sim showdevicetypes`

List the available device types

```
USAGE
  $ ios-sim showdevicetypes

OPTIONS
  -l, --log=log  The path where log of the app running in the Simulator will be redirected to
  -v, --verbose  Enable verbose output
  -x, --exit     Exit after startup
  --debug=debug  Debug level output
```

_See code: [src/commands/showdevicetypes.js](https://github.com/ios-control/ios-sim/blob/master/src/commands/showdevicetypes.js)_

## `ios-sim showsdks`

List the available iOS SDK versions

```
USAGE
  $ ios-sim showsdks

OPTIONS
  -l, --log=log  The path where log of the app running in the Simulator will be redirected to
  -v, --verbose  Enable verbose output
  -x, --exit     Exit after startup
  --debug=debug  Debug level output
```

_See code: [src/commands/showsdks.js](https://github.com/ios-control/ios-sim/blob/master/src/commands/showsdks.js)_

## `ios-sim start`

Launch the iOS Simulator without an app

```
USAGE
  $ ios-sim start

OPTIONS
  -d, --devicetypeid=devicetypeid  The id of the device type that should be simulated (Xcode6+). Use 'showdevicetypes'
                                   to list devices.

  -l, --log=log                    The path where log of the app running in the Simulator will be redirected to

  -v, --verbose                    Enable verbose output

  -x, --exit                       Exit after startup

  --debug=debug                    Debug level output
```

_See code: [src/commands/start.js](https://github.com/ios-control/ios-sim/blob/master/src/commands/start.js)_
<!-- commandsstop -->
