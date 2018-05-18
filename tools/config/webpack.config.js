import path from 'path'
import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin'
import paths from './paths'
import babelConfig from './babel.config'
import getClientEnvironment, { isDebug, isVerbose, isAnalyze } from './env'

// Webpack uses `publicPath` to determine where the app is being served from.
// in development, we always serve from the root. This makes config easier.
// in production it requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = isDebug ? '/' : paths.servedPath

// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as <%= htmlWebpackPlugin.options.PUBLIC_URL %> in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// omit trailing slash as <%= htmlWebpackPlugin.options.PUBLIC_URL %>/xyz looks better than <%= htmlWebpackPlugin.options.PUBLIC_URL %>xyz.
const publicUrl = publicPath.slice(0, -1)

// get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl)

// files regexes
const reScript = /\.(js|jsx|mjs)$/
const reStyle = /\.css$/
const reImage = /\.(bmp|gif|jpg|jpeg|png|svg)$/

// set static asset name as we reference these options multiple times
const staticAssetName = isDebug
  ? '[path][name].[ext]?[hash:8]'
  : '[hash:8].[ext]'

// set shared css options as we reference these options multiple times
const commonCssOptions = {
  sourceMap: true,
  minimize: isDebug
    ? false
    : {
        // CSS Nano options http://cssnano.co/
        discardComments: { removeAll: true },
      },
}

const config = {
  // use built-in optimizations accordingly
  // https://webpack.js.org/concepts/mode/
  mode: isDebug ? 'development' : 'production',

  // https://webpack.js.org/configuration/resolve/
  resolve: {
    // allow absolute paths in imports, e.g. import Button from 'components/Button'
    // keep in sync with .flowconfig and .eslintrc
    modules: ['node_modules', 'src'],
  },

  // don't attempt to continue if there are any errors.
  // https://webpack.js.org/configuration/other-options/#bail
  bail: !isDebug,

  // cache the generated webpack modules and chunks to improve build speed
  // https://webpack.js.org/configuration/other-options/#cache
  cache: isDebug,

  // specify what bundle information gets displayed
  // https://webpack.js.org/configuration/stats/
  stats: {
    cached: isVerbose,
    cachedAssets: isVerbose,
    chunks: isVerbose,
    chunkModules: isVerbose,
    colors: true,
    hash: isVerbose,
    modules: isVerbose,
    reasons: isDebug,
    timings: true,
    version: isVerbose,
  },

  // choose a developer tool to enhance debugging
  // https://webpack.js.org/configuration/devtool/#devtool
  devtool: isDebug ? 'cheap-module-inline-source-map' : 'source-map',

  // some libraries import Node modules but don't use them in the browser.
  // tell Webpack to provide empty mocks for them so importing them works.
  // https://webpack.js.org/configuration/node/#node
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },

  // turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  // https://webpack.js.org/configuration/performance/#performance-hints
  performance: {
    hints: isDebug ? false : 'warning',
  },

  optimization: {
    // move modules that occur in multiple entry chunks to a new entry chunk (the commons chunk).
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
    },
    // minimize js and css
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },

  // https://webpack.js.org/configuration/entry-context/#entry
  entry: [
    // we ship a few polyfills by default
    '@babel/polyfill',
    // app code folder
    paths.appIndexJs,
  ],

  // https://webpack.js.org/configuration/output/
  output: {
    path: paths.appBuild,
    publicPath,
    pathinfo: isVerbose,
    filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
    chunkFilename: isDebug
      ? '[name].chunk.js'
      : '[name].[chunkhash:8].chunk.js',
    // point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },

  module: {
    // make missing exports an error instead of warning
    strictExportPresence: true,

    rules: [
      // rules for JS / JSX
      {
        test: reScript,
        include: paths.appSrc,
        loader: 'babel-loader',
        options: babelConfig,
      },

      // rules for style sheets
      // process external/third-party styles
      {
        test: reStyle,
        rules: [
          {
            loader: isDebug ? 'style-loader' : MiniCssExtractPlugin.loader,
          },
          // process external/third-party styles
          {
            exclude: paths.appSrc,
            loader: 'css-loader',
            options: commonCssOptions,
          },
          // process internal/project styles (from src folder)
          {
            include: paths.appSrc,
            loader: 'css-loader',
            options: {
              // CSS Loader https://github.com/webpack/css-loader
              importLoaders: 1,
              localIdentName: isDebug
                ? '[name]-[local]-[hash:base64:5]'
                : '[hash:base64:5]',
              ...commonCssOptions,
            },
          },
          // apply PostCSS plugins including autoprefixer
          {
            loader: 'postcss-loader',
            options: {
              path: `${paths.tools}/config/postcss.config.js`,
            },
          },
        ],
      },

      // rules for images
      {
        test: reImage,
        oneOf: [
          // inline lightweight images into CSS
          {
            issuer: reStyle,
            oneOf: [
              // inline lightweight SVGs as UTF-8 encoded DataUrl string
              {
                test: /\.svg$/,
                loader: 'svg-url-loader',
                options: {
                  name: staticAssetName,
                  limit: 4096, // 4kb
                },
              },

              // inline lightweight images as Base64 encoded DataUrl string
              {
                loader: 'url-loader',
                options: {
                  name: staticAssetName,
                  limit: 4096, // 4kb
                },
              },
            ],
          },

          // or return public URL to image resource
          {
            loader: 'file-loader',
            options: {
              name: staticAssetName,
            },
          },
        ],
      },

      // return public URL for all assets unless explicitly excluded
      // DO NOT FORGET to update `exclude` list when you adding a new loader
      {
        exclude: [reScript, reStyle, reImage, /\.json$/, /\.html$/],
        loader: 'file-loader',
        options: {
          name: staticAssetName,
        },
      },
    ],
  },

  plugins: [
    // https://github.com/webpack-contrib/mini-css-extract-plugin
    new MiniCssExtractPlugin({
      // options similar to the same options in webpackOptions.output
      // both options are optional
      filename: isDebug ? '[name].css' : '[name].[chunkhash:8].css',
      chunkFilename: isDebug
        ? '[name].chunk.css'
        : '[name].[chunkhash:8].chunk.css',
    }),

    // generates an `index.html` file with the <script> injected.
    // https://github.com/jantimon/html-webpack-plugin
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      // makes some environment variables available in index.html.
      // the public URL is available as <%= htmlWebpackPlugin.options.PUBLIC_URL %> in index.html, e.g.:
      // <link rel="shortcut icon" href="<%= htmlWebpackPlugin.options.PUBLIC_URL %>/favicon.ico">
      // in production, it will be an empty string unless you specify "homepage"
      // in `package.json`, in which case it will be the pathname of that URL.
      ...env.raw,
      minify: isDebug
        ? {}
        : {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          },
    }),

    // makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),

    // Webpack Bundle Analyzer
    // https://github.com/th0r/webpack-bundle-analyzer
    ...(isAnalyze ? [new BundleAnalyzerPlugin()] : []),

    // production only plugins
    ...(isDebug
      ? []
      : [
          // generate a manifest file which contains a mapping of all asset filenames
          // to their corresponding output file so that tools can pick it up without
          // having to parse `index.html`.
          new ManifestPlugin({
            fileName: 'asset-manifest.json',
          }),

          // generate a service worker script that will precache, and keep up to date,
          // the HTML & assets that are part of the Webpack build.
          new SWPrecacheWebpackPlugin({
            // by default, a cache-busting query parameter is appended to requests
            // used to populate the caches, to ensure the responses are fresh.
            // if a URL is already hashed by Webpack, then there is no concern
            // about it being stale, and the cache-busting can be skipped.
            dontCacheBustUrlsMatching: /\.\w{8}\./,
            filename: 'service-worker.js',
            logger(message) {
              if (message.indexOf('Total precache size is') === 0) {
                // This message occurs for every build and is a bit too noisy.
                return
              }
              if (message.indexOf('Skipping static resource') === 0) {
                // this message obscures real errors so we ignore it.
                // https://github.com/facebookincubator/create-react-app/issues/2612
                return
              }
              console.info(message)
            },
            minify: true,
            // for unknown URLs, fallback to the index page
            navigateFallback: `${publicUrl}/index.html`,
            // ignores URLs starting from /__ (useful for Firebase):
            // https://github.com/facebookincubator/create-react-app/issues/2237#issuecomment-302693219
            navigateFallbackWhitelist: [/^(?!\/__).*/],
            // don't precache sourcemaps (they're large) and build asset manifest:
            staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
          }),
        ]),
  ],
}

export default config
