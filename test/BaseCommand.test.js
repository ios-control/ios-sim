const TheCommand = require('../src/BaseCommand')
const { Command } = require('@oclif/command')

test('exports', async () => {
  expect(typeof TheCommand).toEqual('function')
  expect(TheCommand.prototype).toBeInstanceOf(Command)
})

test('description', async () => {
  expect(TheCommand.description).not.toBeDefined()
})

test('aliases', async () => {
  expect(TheCommand.aliases).toEqual([])
})

test('flags', async () => {
  expect(Object.keys(TheCommand.flags)).toEqual(['debug', 'verbose', 'exit', 'log'])
})

test('args', async () => {
  expect(TheCommand.args).toBeUndefined()
})
