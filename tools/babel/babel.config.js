const path = require('path')
const packageName = 'web-test'

function validateBoolOption(name, value, defaultValue) {
  if (typeof value === 'undefined') {
    value = defaultValue
  }
  if (typeof value !== 'boolean') {
    const invalidValueTypeMessage = `${packageName}: '${name}' option must be a boolean.`
    throw new Error(invalidValueTypeMessage)
  }
  return value
}

module.exports = function createBabelConfig(api, opts) {
  if (!opts) {
    opts = {}
  }

  const env = process.env.BABEL_ENV || process.env.NODE_ENV
  const isEnvDevelopment = env === 'development'
  const isEnvProduction = env === 'production'
  const isEnvTest = env === 'test'
  // const configIsForApp = opts.configFor === 'app' || opts.configFor == null
  const configIsForDependencies = opts.configFor === 'dependencies'

  const shouldUseESModules = validateBoolOption(
    'useESModules',
    opts.useESModules,
    isEnvDevelopment || isEnvProduction
  )
  // const isFlowEnabled = validateBoolOption('flow', opts.flow, true)
  // const isReactEnabled = validateBoolOption('react', opts.react, true)
  const isTypeScriptEnabled = validateBoolOption(
    'typescript',
    opts.typescript,
    true
  )
  const areHelpersEnabled = validateBoolOption('helpers', opts.helpers, true)
  const shouldUseAbsoluteRuntime = validateBoolOption(
    'absoluteRuntime',
    opts.absoluteRuntime,
    true
  )

  let absoluteRuntimePath // = undefined
  if (shouldUseAbsoluteRuntime) {
    absoluteRuntimePath = path.dirname(
      require.resolve('@babel/runtime/package.json')
    )
  }

  if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
    const environment = JSON.stringify(env)
    const invalidEnvironmentMessage = `Using \`${packageName}\` requires that you specify \`NODE_ENV\` or \`BABEL_ENV\` environment variables. Valid values are "development", "test", and "production". Instead, received: ${environment}.`
    throw new Error(invalidEnvironmentMessage)
  }

  const babelConfig = {
    // PLUGIN AND PRESET OPTIONS
    presets: [
      // -----------------------------------------------------------------------
      // When using Karma, the test environment is a browser, just like
      // development and production. We especially don't want to disable
      // browserslist by supplying a `targets` option to @babel/preset-env
      //
      // A browserslist entry can include "current node" under an environment
      // named "test" to simulate `options.targets.node = "current"` if it
      // wanted to support both node and browser testing.
      //
      // There could be 2 test environments: "test-node" and "test-web", but
      // that is beyond the scope of this demonstration.
      [
        // Latest stable ECMAScript features
        require('@babel/preset-env').default,
        {
          // Allow importing core-js in entrypoint and use browserlist to select
          // polyfills
          useBuiltIns: 'entry',
          // Set the corejs version we are using to avoid warnings in console
          // Modified to set minor version per core-js reccomendation.
          corejs: '3.8',
          // Exclude transforms that make all code slower
          exclude: ['transform-typeof-symbol']
        }
      ]
    ].filter(Boolean),
    plugins: [
      // -----------------------------------------------------------------------
      // Disabled as it's handled automatically by preset-env, and `selectiveLoose` isn't
      // yet merged into babel: https://github.com/babel/babel/pull/9486
      // Related: https://github.com/facebook/create-react-app/pull/8215
      // [
      //   require('@babel/plugin-transform-destructuring').default,
      //   {
      //     // Use loose mode for performance:
      //     // https://github.com/facebook/create-react-app/issues/5602
      //     loose: false,
      //     selectiveLoose: [
      //       'useState',
      //       'useEffect',
      //       'useContext',
      //       'useReducer',
      //       'useCallback',
      //       'useMemo',
      //       'useRef',
      //       'useImperativeHandle',
      //       'useLayoutEffect',
      //       'useDebugValue',
      //     ],
      //   },
      // ],

      // -----------------------------------------------------------------------
      // Polyfills the runtime needed for async/await, generators, and friends
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime
      [
        require('@babel/plugin-transform-runtime').default,
        {
          corejs: false,
          helpers: areHelpersEnabled,
          // By default, babel assumes babel/runtime version 7.0.0-beta.0,
          // explicitly resolving to match the provided helper functions.
          // https://github.com/babel/babel/issues/10261
          version: require('@babel/runtime/package.json').version,
          regenerator: true,
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
          // We should turn this on once the lowest version of Node LTS
          // supports ES Modules.
          useESModules: configIsForDependencies
            ? isEnvDevelopment || isEnvProduction
            : shouldUseESModules,
          // Undocumented option that lets us encapsulate our runtime, ensuring
          // the correct version is used
          // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
          absoluteRuntime: absoluteRuntimePath
        }
      ]
    ].filter(Boolean),
    overrides: [].filter(Boolean)
  }
  if (configIsForDependencies) {
    babelConfig.sourceType = 'unambiguous'
  } else {
    // if (opts?.configFor === 'app')
    if (!Array.isArray(babelConfig.presets)) {
      babelConfig.presets = []
    }
    const appOnlyPresets = [
      // -----------------------------------------------------------------------
      // This demo does not (yet) need to account for React.
      // isReactEnabled && [
      //   require('@babel/preset-react').default,
      //   {
      //     // Adds component stack to warning messages
      //     // Adds __self attribute to JSX which React will use for some warnings
      //     development: isEnvDevelopment || isEnvTest,
      //     // Will use the native built-in instead of trying to polyfill
      //     // behavior for any plugins that require one.
      //     useBuiltIns: true
      //   }
      // ],
      // -----------------------------------------------------------------------
      isTypeScriptEnabled && [require('@babel/preset-typescript').default]
    ].filter(Boolean)
    appOnlyPresets.forEach((appOnlyPreset) => {
      babelConfig.presets.push(appOnlyPreset)
    })

    if (!Array.isArray(babelConfig.plugins)) {
      babelConfig.plugins = []
    }
    const appOnlyPlugins = [
      // -----------------------------------------------------------------------
      // This demo does not (yet) need to account for Flow.
      // // Strip flow types before any other transform, emulating the behavior
      // // order as-if the browser supported all of the succeeding features
      // // https://github.com/facebook/create-react-app/pull/5182
      // // We will conditionally enable this plugin below in overrides as it clashes with
      // // @babel/plugin-proposal-decorators when using TypeScript.
      // // https://github.com/facebook/create-react-app/issues/5741
      // isFlowEnabled && [
      //   require('@babel/plugin-transform-flow-strip-types').default,
      //   false
      // ],

      // -----------------------------------------------------------------------
      // Experimental macros support. Will be documented after it's had some time
      // in the wild.
      require('babel-plugin-macros'),

      // -----------------------------------------------------------------------
      // Turn on legacy decorators for TypeScript files
      isTypeScriptEnabled && [
        require('@babel/plugin-proposal-decorators').default,
        false
      ],

      // -----------------------------------------------------------------------
      // class { handleClick = () => { } }
      // Enable loose mode to use assignment instead of defineProperty
      // See discussion in https://github.com/facebook/create-react-app/issues/4263
      [
        require('@babel/plugin-proposal-class-properties').default,
        {
          loose: true
        }
      ],

      // -----------------------------------------------------------------------
      // Adds Numeric Separators
      require('@babel/plugin-proposal-numeric-separator').default,

      // -----------------------------------------------------------------------
      // This demo does not (yet) need to account for React.
      // isReactEnabled &&
      //   isEnvProduction && [
      //     // Remove PropTypes from production build
      //     require('babel-plugin-transform-react-remove-prop-types').default,
      //     {
      //       removeImport: true
      //     }
      //   ],
      // -----------------------------------------------------------------------
      // Optional chaining and nullish coalescing are supported in @babel/preset-env,
      // but not yet supported in webpack due to support missing from acorn.
      // These can be removed once webpack has support.
      // See https://github.com/facebook/create-react-app/issues/8445#issuecomment-588512250
      require('@babel/plugin-proposal-optional-chaining').default,
      require('@babel/plugin-proposal-nullish-coalescing-operator').default
    ].filter(Boolean)
    appOnlyPlugins.forEach((appOnlyPlugin) => {
      babelConfig.plugins.push(appOnlyPlugin)
    })

    if (!Array.isArray(babelConfig.overrides)) {
      babelConfig.overrides = []
    }
    const appOnlyOverrides = [
      // -----------------------------------------------------------------------
      // This demo does not (yet) need to account for Flow.
      // isFlowEnabled && {
      //   exclude: /\.tsx?$/,
      //   plugins: [require('@babel/plugin-transform-flow-strip-types').default]
      // },
      // -----------------------------------------------------------------------
      isTypeScriptEnabled && {
        test: /\.tsx?$/,
        plugins: [
          [
            require('@babel/plugin-proposal-decorators').default,
            { legacy: true }
          ]
        ]
      }
    ].filter(Boolean)
    appOnlyOverrides.forEach((appOnlyOverride) => {
      babelConfig.overrides.push(appOnlyOverride)
    })
  }
  return babelConfig
}
