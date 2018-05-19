import browserSync from 'browser-sync'
import getPort from 'get-port'
import paths from '../config/paths'
import { isDebug, isSilent } from '../config/env'

/**
 * Launch the Express server with Browsersync
 */
async function listen(server) {
  const PROTOCOL = process.env.HTTPS === 'true' ? 'https' : 'http'
  const HOST = process.env.HOST || 'localhost'
  const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000
  // Use the DEFAULT_PORT otherwise find an available one
  const PORT = await getPort({ port: DEFAULT_PORT })

  await new Promise((resolve, reject) => {
    // Start the server
    server.listen(PORT, HOST, err => {
      if (err) reject(err)

      console.info(`Server launched at ${PROTOCOL}://${HOST}:${PORT}`)

      resolve()
    })
  })

  // Launch the server with Browsersync and HMR
  await new Promise((resolve, reject) =>
    browserSync.create().init(
      {
        // https://www.browsersync.io/docs/options
        server: paths.appBuild,
        port: PORT + 1,
        ui: { port: PORT + 2 },
        middleware: [server],
        open: !isSilent,
        ...(isDebug ? {} : { notify: false }),
      },
      (error, bs) => (error ? reject(error) : resolve(bs)),
    ),
  )
}

export default listen
