import 'core-js/stable'
import LegacyFakeTimers from '@jest/fake-timers/build/legacyFakeTimers'
import ModernFakeTimers from '@jest/fake-timers/build/modernFakeTimers'
import { ModuleMocker } from 'jest-mock'

describe('LegacyFakeTimers class', () => {
  let moduleMocker = null
  let legacyFakeTimerOptions = null
  let legacyFakeTimers = null
  beforeEach(() => {
    const global = window
    moduleMocker = new ModuleMocker(global)
    legacyFakeTimerOptions = {
      global,
      moduleMocker,
      timerConfig: {
        idToRef: (id) => id,
        refToId: (ref) => ref
      },
      config: {
        rootDir: '',
        testMatch: []
      }
    }
  })
  afterEach(() => {
    legacyFakeTimers.dispose() // clean timers
    legacyFakeTimers = null
    legacyFakeTimerOptions = null
    moduleMocker.resetAllMocks() // clean mocks
    moduleMocker.restoreAllMocks() // clean spys
    moduleMocker = null
  })
  it('should construct without throwing', () => {
    expect(() => {
      legacyFakeTimers = new LegacyFakeTimers(legacyFakeTimerOptions)
    }).not.toThrow()
  })
  describe('LegacyFakeTimers instance', () => {
    beforeEach(() => {
      legacyFakeTimers = new LegacyFakeTimers(legacyFakeTimerOptions)
    })
    it("`useFakeTimers` method throws, confirming that legacy timers can't be used.", () => {
      expect(() => {
        legacyFakeTimers.useFakeTimers()
      }).toThrow()
    })
  })
})

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
  it('should construct and `dispose()` without throwing', () => {
    expect(() => {
      modernFakeTimers = new ModernFakeTimers(modernFakeTimerOptions)
    }).not.toThrow()
    expect(() => {
      // make sure the clean up method does not throw before the first call to
      // `afterEach`.
      modernFakeTimers.dispose()
    }).not.toThrow()
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
    describe('.useFakeTimers() Method', () => {
      it('method should not throw', () => {
        expect(() => {
          modernFakeTimers.useFakeTimers()
        }).not.toThrow()
      })
    })
    describe('.useRealTimers() Method', () => {
      it('method should not throw when called before `useFakeTimers()`', () => {
        expect(() => {
          modernFakeTimers.useRealTimers()
        }).not.toThrow()
      })
      it('method should not throw', () => {
        expect(() => {
          modernFakeTimers.useFakeTimers()
          modernFakeTimers.useRealTimers()
        }).not.toThrow()
      })
    })
    describe('.advanceTimersByTime(msToRun) Method', () => {
      it('method should not throw', () => {
        const msToRun = 50
        let timeDone = false
        modernFakeTimers.useFakeTimers()
        setTimeout(() => {
          timeDone = true
        }, msToRun)
        // TODO: test `setInterval`
        expect(timeDone).toBe(false)
        expect(() => {
          modernFakeTimers.advanceTimersByTime(msToRun)
        }).not.toThrow()
        expect(timeDone).toBe(true)
      })
      it('alias `runTimersToTime(msToRun)` method should throw.', () => {
        const msToRun = 50
        let timeDone = false
        modernFakeTimers.useFakeTimers()
        setTimeout(() => {
          timeDone = true
        }, msToRun)
        expect(timeDone).toBe(false)
        expect(() => {
          // `runTimersToTime(msToRun)` is an alias on the jest object, it is
          // not a part of the ModernFakeTimers class.
          modernFakeTimers.runTimersToTime(msToRun)
        }).toThrow()
        expect(timeDone).toBe(false)
      })
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
    describe('.advanceTimersToNextTimer(steps) Method', () => {
      it('method should not throw when called without `steps`', () => {
        const msToRun1 = 50
        const msToRun2 = 100
        let timeDone1 = false
        let timeDone2 = false
        modernFakeTimers.useFakeTimers()
        setTimeout(() => {
          timeDone1 = true
        }, msToRun1)
        setTimeout(() => {
          timeDone2 = true
        }, msToRun2)
        // TODO: test `setInterval`
        expect(timeDone1).toBe(false)
        expect(timeDone2).toBe(false)
        expect(() => {
          modernFakeTimers.advanceTimersToNextTimer()
        }).not.toThrow()
        expect(timeDone1).toBe(true)
        expect(timeDone2).toBe(false)
        expect(() => {
          modernFakeTimers.advanceTimersToNextTimer()
        }).not.toThrow()
        expect(timeDone2).toBe(true)
      })
      it('method should not throw', () => {
        const steps = 2
        const msToRun1 = 50
        const msToRun2 = 100
        const msToRun3 = 150
        let timeDone1 = false
        let timeDone2 = false
        let timeDone3 = false
        modernFakeTimers.useFakeTimers()
        setTimeout(() => {
          timeDone1 = true
        }, msToRun1)
        setTimeout(() => {
          timeDone2 = true
        }, msToRun2)
        setTimeout(() => {
          timeDone3 = true
        }, msToRun3)
        // TODO: test `setInterval`
        expect(timeDone1).toBe(false)
        expect(timeDone2).toBe(false)
        expect(timeDone3).toBe(false)
        expect(() => {
          modernFakeTimers.advanceTimersToNextTimer(steps)
        }).not.toThrow()
        expect(timeDone1).toBe(true)
        expect(timeDone2).toBe(true)
        expect(timeDone3).toBe(false)
      })
    })
    describe('.clearAllTimers() Method', () => {
      it('method should not throw', () => {
        const msToRun = 50
        let timeDone = false
        modernFakeTimers.useFakeTimers()
        setTimeout(() => {
          timeDone = true
        }, msToRun)
        // TODO: test `setInterval`
        expect(timeDone).toBe(false)
        expect(() => {
          modernFakeTimers.clearAllTimers()
        }).not.toThrow()
        modernFakeTimers.advanceTimersByTime(msToRun)
        expect(timeDone).toBe(false)
      })
    })
    // describe('.dispose() Method', () => {
    //   // handled by the test "ModernFakeTimers class => should construct without throwing"
    // })
    describe('.getRealSystemTime() Method', () => {
      it('method should not throw', () => {
        modernFakeTimers.useFakeTimers()
        expect(() => {
          modernFakeTimers.getRealSystemTime()
        }).not.toThrow()
      })
    })
    describe('.getTimerCount() Method', () => {
      it('method should not throw', () => {
        let timerCount
        modernFakeTimers.useFakeTimers()
        setTimeout(() => {}, 0)
        setTimeout(() => {}, 50)
        setInterval(() => {
          throw new Error('setInterval is running when it should not be.')
        }, 0)
        expect(() => {
          timerCount = modernFakeTimers.getTimerCount()
        }).not.toThrow()
        expect(timerCount).toBe(3)
      })
    })
    describe('.reset() Method', () => {
      it('method should not throw', () => {
        modernFakeTimers.useFakeTimers()
        expect(() => {
          modernFakeTimers.reset()
        }).not.toThrow()
      })
    })
    describe('.runAllTicks() Method', () => {
      it('method should not throw', () => {
        modernFakeTimers.useFakeTimers()
        function noOperations() {}
        setTimeout(noOperations, 0)
        setTimeout(noOperations, 50)
        expect(() => {
          modernFakeTimers.runAllTicks()
        }).not.toThrow()
      })
    })
    describe('.runAllTimers() Method', () => {
      it('method should not throw', () => {
        let counter = 0
        modernFakeTimers.useFakeTimers()
        function increment() {
          counter++
        }
        setTimeout(increment, 0)
        setTimeout(increment, 50)
        expect(() => {
          modernFakeTimers.runAllTimers()
        }).not.toThrow()
        expect(counter).toBe(2)
      })
    })
    describe('.runOnlyPendingTimers() Method', () => {
      it('method should not throw', () => {
        let counter = 0
        modernFakeTimers.useFakeTimers()
        setTimeout(() => {
          counter++
          setTimeout(() => {
            counter += 2
          }, 0)
        }, 0)
        expect(() => {
          modernFakeTimers.runOnlyPendingTimers()
        }).not.toThrow()
        expect(counter).toBe(1)
        expect(() => {
          modernFakeTimers.runOnlyPendingTimers()
        }).not.toThrow()
        expect(counter).toBe(3)
      })
    })
    describe('.setSystemTime(now) Method', () => {
      it('method should not throw', () => {
        modernFakeTimers.useFakeTimers()
        expect(() => {
          modernFakeTimers.setSystemTime(0)
        }).not.toThrow()
        // January 1, 1970 at 12:00 AM UTC
        expect(new Date().toISOString()).toBe('1970-01-01T00:00:00.000Z')
        expect(() => {
          modernFakeTimers.setSystemTime(
            new Date(Date.UTC(2000, 11, 31, 12, 0, 0, 0))
          )
        }).not.toThrow()
        // December 31, 2000 at 12:00 PM UTC
        expect(new Date().toISOString()).toBe('2000-12-31T12:00:00.000Z')
      })
    })
  })
})
