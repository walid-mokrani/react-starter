import path from 'path'
import chokidar from 'chokidar'
import { writeFile, copyFile, makeDir, copyDir, cleanDir } from './lib/fs'
import pkg from '../package.json'
import { format } from './run'
import paths from './config/paths'

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy() {
  await makeDir(paths.appBuild)
  await Promise.all([
    writeFile(
      `${paths.appBuild}/package.json`,
      JSON.stringify(
        {
          private: true,
          engines: pkg.engines,
          browserslist: pkg.browserslist,
          dependencies: pkg.dependencies,
        },
        null,
        2,
      ),
    ),
    copyFile(paths.licenseFile, `${paths.appBuild}/LICENSE.txt`),
    copyFile(paths.yarnLockFile, `${paths.appBuild}/yarn.lock`),
    copyDir(paths.appPublic, paths.appBuild, { ignore: `index.html` }),
  ])

  if (process.argv.includes('--watch')) {
    const watcher = chokidar.watch([`${paths.appPublic}/**/*`], {
      ignoreInitial: true,
    })

    watcher.on('all', async (event, filePath) => {
      const start = new Date()
      const src = path.relative(`${paths.appPath}/`, filePath)
      const dist = path.join(
        `${paths.appBuild}/`,
        src.startsWith('src') ? path.relative('src', src) : src,
      )
      switch (event) {
        case 'add':
        case 'change':
          await makeDir(path.dirname(dist))
          await copyFile(filePath, dist)
          break
        case 'unlink':
        case 'unlinkDir':
          cleanDir(dist, { nosort: true, dot: true })
          break
        default:
          return
      }
      const end = new Date()
      const time = end.getTime() - start.getTime()
      console.info(`[${format(end)}] ${event} '${dist}' after ${time} ms`)
    })
  }
}

export default copy
