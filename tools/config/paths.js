const path = require('path')

const rootDir = path.resolve(__dirname, '../..')

const paths = {
  /**
   * @see {@link https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/paths.js#L15-L18}
   * @see {@link https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/paths.js#L32}
   * @see {@link https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/paths.js#L65}
   */
  appBuild: path.resolve(rootDir, 'build'),

  /**
   * @see {@link https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/paths.js#L76}
   */
  appNodeModules: path.resolve(rootDir, 'node_modules'),

  /**
   * @see {@link https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/paths.js#L64}
   */
  appPath: rootDir,

  /**
   * @see {@link https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/paths.js#L70}
   */
  appSrc: path.resolve(rootDir, 'src'),

  /**
   * @see {@link https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/paths.js#L71}
   */
  appTsConfig: path.resolve(rootDir, 'tools/typescript/tsconfig.json'),
  /**
   * @see {@link https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-scripts/config/paths.js#L13-L30}
   * @see {@link https://github.com/facebook/create-react-app/blob/v4.0.2/packages/react-dev-utils/getPublicUrlOrPath.js#L14-L65}
   */
  publicUrlOrPath: process.env.PUBLIC_URL
}

module.exports = paths
