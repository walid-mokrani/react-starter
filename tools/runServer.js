import express from 'express'
import history from 'connect-history-api-fallback'
import run, { format } from './run'
import build from './build'
import listen from './lib/listen'
import { shouldBuild } from './config/env'

let server

/**
 * Launch the server
 */
async function runServer() {
  if (server) return server
  server = express()
  server.use(history())

  if (shouldBuild) await run(build)

  const timeStart = new Date()
  console.info(`[${format(timeStart)}] Launching server...`)

  // Run the server
  await listen(server)

  const timeEnd = new Date()
  const time = timeEnd.getTime() - timeStart.getTime()
  console.info(`[${format(timeEnd)}] Server launched after ${time} ms`)

  return server
}

export default runServer
