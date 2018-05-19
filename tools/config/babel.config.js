import pkg from '../../package.json'
import { isDebug } from './env'

// Babel configuration
// https://babeljs.io/docs/usage/api/
const config = {
  // https://github.com/babel/babel-loader#options
  cacheDirectory: isDebug,

  // https://babeljs.io/docs/usage/options/
  babelrc: false,
  presets: [
    // a Babel preset that can automatically determine the Babel plugins and polyfills
    // https://github.com/babel/babel-preset-env
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: pkg.browserslist,
          forceAllTransforms: !isDebug, // for UglifyJS
        },
        modules: false,
        useBuiltIns: false,
        debug: false,
      },
    ],
    // experimental ECMAScript proposals
    // https://babeljs.io/docs/plugins/#presets-stage-x-experimental-presets-
    ['@babel/preset-stage-2', { decoratorsLegacy: true }],
    // Flow
    // https://github.com/babel/babel/tree/master/packages/babel-preset-flow
    '@babel/preset-flow',
    // JSX
    // https://github.com/babel/babel/tree/master/packages/babel-preset-react
    ['@babel/preset-react', { development: isDebug }],
  ],
  plugins: [
    // Treat React JSX elements as value types and hoist them to the highest scope
    // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-constant-elements
    ...(isDebug ? [] : ['@babel/transform-react-constant-elements']),
    // Replaces the React.createElement function with one that is more optimized for production
    // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-inline-elements
    ...(isDebug ? [] : ['@babel/transform-react-inline-elements']),
    // Remove unnecessary React propTypes from the production build
    // https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types
    ...(isDebug ? [] : ['transform-react-remove-prop-types']),
  ],
}

export default config
