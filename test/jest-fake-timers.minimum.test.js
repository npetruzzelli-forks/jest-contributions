import 'core-js/stable'
import ModernFakeTimers from '@jest/fake-timers/build/modernFakeTimers'
import { ModuleMocker } from 'jest-mock'

Error.stackTraceLimit = 100

describe('ModernFakeTimers class', () => {
  let modernFakeTimerOptions = null
  let modernFakeTimers = null
  beforeEach(() => {
    const global = window
    modernFakeTimerOptions = {
      global,
      config: {
        rootDir: '',
        testMatch: []
      }
    }
  })
  afterEach(() => {
    modernFakeTimers.dispose() // clean timers
    modernFakeTimers = null
    modernFakeTimerOptions = null
  })
  describe('ModernFakeTimers instance', () => {
    let moduleMocker = new ModuleMocker(window)
    beforeEach(() => {
      modernFakeTimers = new ModernFakeTimers(modernFakeTimerOptions)
    })
    afterEach(() => {
      moduleMocker.resetAllMocks() // clean mocks
      moduleMocker.restoreAllMocks() // clean spys
    })
    afterAll(() => {
      moduleMocker = null
    })
    describe('.advanceTimersByTime(msToRun) Method', () => {
      it('should `console.warn` with the expected message when timers have not been mocked.', () => {
        // Mock console.warn to prevent the terminal from getting cluttered.
        const originalConsoleWarn = console.warn
        const consoleWarnMock = moduleMocker.fn()
        console.warn = consoleWarnMock

        expect(() => {
          modernFakeTimers.advanceTimersByTime(50)
        }).not.toThrow()
        expect(consoleWarnMock.mock.calls.length).toBe(1) // toHaveBeenCalledTimes(1)
        const expectedMatch = new RegExp(
          '^' +
            'A function to advance timers was called but the timers API is ' +
            'not mocked with fake timers\\. Call `jest\\.useFakeTimers\\(\\)` in ' +
            'this test or enable fake timers globally by setting `"timers": ' +
            '"fake"` in the configuration file' +
            '\\nStack Trace:\\n'
        )
        expect(consoleWarnMock.mock.calls[0][0]).toMatch(expectedMatch)
        consoleWarnMock.mockReset()

        // Restore console.warn
        console.warn = originalConsoleWarn
      })
    })
  })
})
