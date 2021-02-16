process.env.BABEL_ENV = 'test'
process.env.NODE_ENV = 'test'
process.env.PUBLIC_URL = ''

const paths = require('../config/paths')
const createWebpackConfig = require('../webpack/webpack.config')

module.exports = function configureKarma(config) {
  // Webpack Config

  const webpackArgv = {
    env: {
      type: 'test',
      testEnv: 'karma'
    }
  }
  const webpackConfig = createWebpackConfig(webpackArgv.env, webpackArgv)
  // Karma Config
  config.set({
    basePath: paths.appPath,
    browsers: [
      'Chrome',
      'Edge',
      'Firefox',

      // WINDOWS ONLY
      'IE'

      // macOS ONLY
      // 'Safari'

      // Consider using `karma-detect-browsers` for local development.
      // Consider other launchers for continuous integration testing.
    ],
    frameworks: ['jasmine'],

    plugins: [
      'karma-chrome-launcher',
      // 'karma-edge-launcher', // Does not want to work for me for some reason.
      '@chiragrupani/karma-chromium-edge-launcher',
      'karma-firefox-launcher',
      'karma-jasmine',
      'karma-jasmine-html-reporter',
      'karma-summary-reporter',
      'karma-sourcemap-loader',
      'karma-webpack',

      // WINDOWS ONLY
      'karma-ie-launcher'

      // macOS ONLY
      // 'karma-safari-launcher'
    ],

    files: [
      // 'test/**/*.test.js' // All test Suites
      // 'test/jest-fake-timers.all.test.js' // All tests for `jest-fake-timers`
      'test/jest-fake-timers.minimum.test.js' // Only the minimum necessary tests for `jest-fake-timers`
    ],

    mime: {
      /*
       * Resolves an issue where `ts` was presented as `video/mp2t` and
       * where `tsx` was presented as `text/plain` by the Karma server. In
       * the case of `video/mp2t`, the browser may refuse to execute the
       * script since the content type isn't considered executable.
       *
       * https://github.com/angular/angular-cli/issues/2125#issuecomment-247395088
       * https://www.iana.org/assignments/media-types/media-types.xhtml
       *
       * Currently, TypeScript does not have a registered MIME type, so we
       * can make use of a person mime type or present it as
       * `application/javascript`.
       */
      'application/prs.typescript': ['ts', 'tsx']
    },

    preprocessors: {
      'test/**/*.test.js': ['webpack', 'sourcemap']
    },
    reporters: ['progress', 'summary', 'kjhtml'],
    jasmineHtmlReporter: {
      // Disable terminal messages because it's already handled by another reporter.
      suppressAll: true, // Suppress all messages (overrides other suppress settings)
      suppressFailed: true // Suppress failed messages
    },
    summaryReporter: {},

    // Stripped down and modified version of react-scripts
    webpack: webpackConfig,
    webpackMiddleware: {
      // Prevent Webpack from cluttering the console output when tests are
      // being run through Karma.
      noInfo: true,
      stats: 'errors-only'
    }
  })
}
