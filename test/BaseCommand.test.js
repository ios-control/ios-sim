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

describe('instance methods', () => {
  let command

  beforeEach(() => {
    command = new TheCommand([])
  })

  describe('init', () => {
    test('is a function', async () => {
      expect(command.init).toBeInstanceOf(Function)
    })

    test('verbose flag', async () => {
      const debug = require('debug')
      const spy = jest.spyOn(debug, 'enable').mockReturnValue()

      command.argv = ['--verbose']
      return command.init().then(() => {
        expect(spy).toHaveBeenCalledWith('*')
        spy.mockClear()
      })
    })

    test('debug flag', async () => {
      const debug = require('debug')
      const spy = jest.spyOn(debug, 'enable').mockReturnValue()

      command.argv = ['--debug', 'foo,bar']
      return command.init().then(() => {
        expect(spy).toHaveBeenCalledWith('foo,bar')
        spy.mockClear()
      })
    })

    test('init no flag', async () => {
      const debug = require('debug')
      const spy = jest.spyOn(debug, 'enable').mockReturnValue()

      command.argv = []
      return command.init().then(() => {
        expect(spy).not.toHaveBeenCalled()
        spy.mockClear()
      })
    })
  })

  describe('handleError', () => {
    test('is a function', async () => {
      expect(command.handleError).toBeInstanceOf(Function)
    })

    test('calls error, --verbose', () => {
      const debug = require('debug')
      const spy = jest.spyOn(debug, 'log').mockImplementation(() => {})

      command.error = jest.fn()
      command.argv = ['--verbose']
      command.handleError('msg', new Error('an error'))
      expect(command.error).toHaveBeenCalledWith('msg: an error')
      expect(spy).toHaveBeenCalled()

      spy.mockRestore()
    })

    test('calls error', () => {
      const debug = require('debug')
      const spy = jest.spyOn(debug, 'log').mockImplementation(() => {})

      command.error = jest.fn()
      command.argv = []
      command.handleError('msg', new Error('an error'))
      expect(command.error).toHaveBeenCalledWith('msg: an error')
      expect(spy).not.toHaveBeenCalled()

      spy.mockRestore()
    })

    test('optional error object', () => {
      command.error = jest.fn()
      command.handleError('msg')
      expect(command.error).toHaveBeenCalledWith('msg')
    })

    test('with no arguments', () => {
      command.error = jest.fn()
      command.handleError()
      expect(command.error).toHaveBeenCalledWith('unknown error')
    })
  })
})
