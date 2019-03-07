const { parseEnvironmentVariables } = require('../src/helpers')

describe('when parsing env variables', function () {
  test('should return empty map on null value', function () {
    expect(parseEnvironmentVariables(null)).toEqual({})
  })

  test('should return empty map on undefined value', function () {
    expect(parseEnvironmentVariables(undefined)).toEqual({})
  })

  describe('without simctl fix', function () {
    it('should return valid map for valid env variable', function () {
      expect(parseEnvironmentVariables(['KEY=VALUE'], false)).toEqual({ 'KEY': 'VALUE' })
    })
  })

  describe('with simctl fix', function () {
    it('should add SIMCTL_CHILD_ prefix to all keys', function () {
      expect(parseEnvironmentVariables(['KEY=VALUE', 'KEY2=VALUE2'], true))
        .toEqual(
          {
            'SIMCTL_CHILD_KEY': 'VALUE',
            'SIMCTL_CHILD_KEY2': 'VALUE2'
          }
        )
    })
  })
})
