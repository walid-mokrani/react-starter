import pkg from '../../package.json'

const isDebug = !process.argv.includes('--release')

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
}

export default config
