const fs = require('fs')
const path = require('path')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const paths = require('../config/paths')

const PACKAGE_NAME = 'web-test'
const testSpecDir = path.resolve(paths.appPath, 'tests')

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx'
]

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig)

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false
  }

  try {
    require.resolve('react/jsx-runtime')
    return true
  } catch (e) {
    return false
  }
})()

module.exports = function createWebpackConfig(env, argv) {
  const envType = typeof env === 'string' ? env : env?.type
  const envTypeIsString = typeof envType === 'string'

  const isEnvProduction = envTypeIsString
    ? envType === 'production'
    : env?.production === true
  const isEnvTest = envTypeIsString
    ? envType === 'test'
    : !isEnvProduction && env?.test === true
  const isEnvDevelopment = envTypeIsString
    ? envType === 'development'
    : !isEnvProduction && !isEnvTest && env?.development === true
  const isKarmaTest =
    isEnvTest && (env?.testEnv === 'karma' || argv?.testEnv === 'karma')
  // const isNodeTest =
  //   isEnvTest &&
  //   (env?.testEnv === 'node' ||
  //     argv?.testEnv === 'node' ||
  //     env?.testEnv === 'jsdom' ||
  //     argv?.testEnv === 'jsdom')

  // Set useBabelLoaderCache to `false` when working on the build system itself,
  // otherwise you will find yourself fighting the cache.
  // Set useBabelLoaderCache to `true` when the build system is stable.
  const useBabelLoaderCache = true

  // Source maps are resource heavy and can cause out of memory issue for large source files.
  // TODO: if ((coverage === true && isKarmaTest) || process.env.GENERATE_SOURCEMAP !== 'false')
  const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false'

  const webpackConfig = {
    mode: isEnvProduction
      ? 'production'
      : (isEnvDevelopment || isKarmaTest) && 'development',
    bail: isEnvProduction,
    devtool: isEnvProduction
      ? shouldUseSourceMap
        ? 'source-map'
        : false
      : (isEnvDevelopment || isKarmaTest) && 'cheap-module-source-map',
    // entry: // See: https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/webpack.config.js#L180-L206
    output: {
      path: isEnvProduction ? paths.appBuild : undefined,
      pathinfo: isEnvDevelopment || isKarmaTest,
      filename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].js'
        : (isEnvDevelopment || isKarmaTest) && 'static/js/bundle.js',
      futureEmitAssets: true, // TODO: remove this when upgrading to webpack 5
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : (isEnvDevelopment || isKarmaTest) && 'static/js/[name].chunk.js',
      publicPath: paths.publicUrlOrPath,
      devtoolModuleFilenameTemplate: isEnvProduction
        ? (info) =>
            path
              .relative(paths.appSrc, info.absoluteResourcePath)
              .replace(/\\/g, '/')
        : (isEnvDevelopment || isKarmaTest) &&
          ((info) =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')),
      jsonpFunction: `webpackJsonp${PACKAGE_NAME}`,
      globalObject: 'this'
    },
    // optimization: {}, // https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/webpack.config.js#L242-L319
    resolve: {
      // https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/webpack.config.js#L325-L327
      modules: ['node_modules', paths.appNodeModules],
      extensions: moduleFileExtensions
        .map((ext) => `.${ext}`)
        .filter((ext) => useTypeScript || !ext.includes('ts'))
      // alias: {}, // https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/webpack.config.js#L337-L347
      // plugins: [] // https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/webpack.config.js#L348-L362
    },
    // resolveLoader: {
    //   // https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/webpack.config.js#L363-L369
    //   plugins: []
    // },
    module: {
      strictExportPresence: true,
      rules: [
        { parser: { requireEnsure: false } },
        {
          oneOf: [
            // Process application JS with Babel.
            // The preset includes JSX, Flow, TypeScript, and some ESnext features.
            {
              test: /\.(js|mjs|jsx|ts|tsx|cjs)$/,
              include: [
                paths.appSrc,
                // if `testSpecDir` is a descendant of `paths.appSrc`, then
                // comment out or remove the following line
                testSpecDir
              ],
              // exclude: /node_modules/, // TODO: REMOVE ME
              loader: require.resolve('babel-loader'),
              options: {
                customize: require.resolve('../babel/babel-webpack-overrides'),
                presets: [
                  [
                    require.resolve('../babel/babel.config.js'),
                    {
                      useESModules:
                        isEnvDevelopment || isKarmaTest || isEnvProduction,
                      runtime: hasJsxRuntime ? 'automatic' : 'classic'
                    }
                  ]
                ],
                plugins: [
                  // Non-script assets not (yet) needed in this demo
                  // https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/webpack.config.js#L441-L454
                  // [
                  //   require.resolve('babel-plugin-named-asset-import'),
                  //   {
                  //     loaderMap: {
                  //       svg: {
                  //         ReactComponent:
                  //           '@svgr/webpack?-svgo,+titleProp,+ref![path]'
                  //       }
                  //     }
                  //   }
                  // ]
                ].filter(Boolean),
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: useBabelLoaderCache,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                compact: isEnvProduction
              }
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve('../babel/babel.config.js'),
                    {
                      configFor: 'dependencies',
                      helpers: true
                    }
                  ]
                ],
                cacheDirectory: useBabelLoaderCache,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                // Babel sourcemaps are needed for debugging into node_modules
                // code.  Without the options below, debuggers like VSCode
                // show incorrect code and set breakpoints on the wrong lines.
                sourceMaps: shouldUseSourceMap,
                inputSourceMap: shouldUseSourceMap
              }
            }
          ]
        }
      ]
    },
    plugins: [
      (isEnvDevelopment || isKarmaTest) && new CaseSensitivePathsPlugin()
    ].filter(Boolean),
    node: {
      module: 'empty',
      dgram: 'empty',
      dns: 'mock',
      fs: 'empty',
      http2: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty'
    },
    performance: false
  }
  return webpackConfig
}
