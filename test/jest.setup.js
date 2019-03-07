const { stdout } = require('stdout-stderr')
const fs = require.requireActual('fs')

jest.setTimeout(30000)
jest.useFakeTimers()

// trap console log
beforeEach(() => { stdout.start() })
afterEach(() => { stdout.stop() })

// helper for fixtures
global.fixtureFile = (output) => {
  return fs.readFileSync(`./test/fixtures/${output}`).toString()
}

// helper for fixtures
global.fixtureJson = (output) => {
  return JSON.parse(global.fixtureFile(output))
}
