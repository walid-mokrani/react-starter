import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware'
import run, { format } from './run'
import clean from './clean'
import webpackConfig from './config/webpack.config'
import listen from './lib/listen'

// https://webpack.js.org/configuration/watch/#watchoptions
const watchOptions = {
  // Watching may not work with NFS and machines in VirtualBox
  // Uncomment next line if it is your case (use true or interval in milliseconds)
  // poll: true,
  // Decrease CPU or memory usage in some file systems
  // ignored: /node_modules/,
}

function createCompilationPromise(compiler, config) {
  const name = 'client'

  return new Promise((resolve, reject) => {
    let timeStart = new Date()
    compiler.hooks.compile.tap(name, () => {
      timeStart = new Date()
      console.info(`[${format(timeStart)}] Compiling...`)
    })

    compiler.hooks.done.tap(name, stats => {
      console.info(stats.toString(config.stats))
      const timeEnd = new Date()
      const time = timeEnd.getTime() - timeStart.getTime()
      if (stats.hasErrors()) {
        console.info(`[${format(timeEnd)}] Failed to compile after ${time} ms`)
        reject(new Error('Compilation failed!'))
      } else {
        console.info(
          `[${format(timeEnd)}] Finished compilation after ${time} ms`,
        )
        resolve(stats)
      }
    })
  })
}

let server

async function start() {
  if (server) return server
  server = express()
  server.use(errorOverlayMiddleware())

  // Configure client-side hot module replacement
  webpackConfig.entry = ['./tools/lib/webpackHotDevClient']
    .concat(webpackConfig.entry)
    .sort((a, b) => b.includes('polyfill') - a.includes('polyfill'))
  webpackConfig.output.filename = webpackConfig.output.filename.replace(
    'chunkhash',
    'hash',
  )
  webpackConfig.output.chunkFilename = webpackConfig.output.chunkFilename.replace(
    'chunkhash',
    'hash',
  )
  webpackConfig.module.rules = webpackConfig.module.rules.filter(
    x => x.loader !== 'null-loader',
  )
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())

  await run(clean)

  const compiler = webpack(webpackConfig)
  const compilationPromise = createCompilationPromise(compiler, webpackConfig)

  // https://github.com/webpack/webpack-dev-middleware
  server.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      logLevel: 'silent',
      watchOptions,
    }),
  )

  // https://github.com/glenjamin/webpack-hot-middleware
  server.use(webpackHotMiddleware(compiler, { log: false }))

  // Wait until the bundles are ready
  await compilationPromise
  const timeStart = new Date()
  console.info(`[${format(timeStart)}] Launching server...`)

  // Run the server
  await listen(server)

  const timeEnd = new Date()
  const time = timeEnd.getTime() - timeStart.getTime()
  console.info(`[${format(timeEnd)}] Server launched after ${time} ms`)

  return server
}

export default start
