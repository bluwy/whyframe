// Fork: https://github.com/sysgears/webpack-virtual-modules/blob/44bf5eab3b0746d8cf800a4a22f15210c6ebcb42/src/index.ts
// Changes:
// - strip types
// - apply https://github.com/sysgears/webpack-virtual-modules/pull/128

import path from 'node:path'
import { VirtualStats } from './virtualStats.js'

let inode = 45000000

// apply fix from https://github.com/sysgears/webpack-virtual-modules/pull/128
let FS_ACCURACY = 2000
function applyMtime(mtime) {
  if (FS_ACCURACY > 1 && mtime % 2 !== 0) FS_ACCURACY = 1
  else if (FS_ACCURACY > 10 && mtime % 20 !== 0) FS_ACCURACY = 10
  else if (FS_ACCURACY > 100 && mtime % 200 !== 0) FS_ACCURACY = 100
  else if (FS_ACCURACY > 1000 && mtime % 2000 !== 0) FS_ACCURACY = 1000
}

function checkActivation(instance) {
  if (!instance._compiler) {
    throw new Error(
      'You must use this plugin only after creating webpack instance!'
    )
  }
}

function getModulePath(filePath, compiler) {
  return path.isAbsolute(filePath)
    ? filePath
    : path.join(compiler.context, filePath)
}

function createWebpackData(result) {
  return (backendOrStorage) => {
    // In Webpack v5, this variable is a "Backend", and has the data stored in a field
    // _data. In V4, the `_` prefix isn't present.
    if (backendOrStorage._data) {
      const curLevelIdx = backendOrStorage._currentLevel
      const curLevel = backendOrStorage._levels[curLevelIdx]
      return {
        result,
        level: curLevel
      }
    }
    // Webpack 4
    return [null, result]
  }
}

function getData(storage, key) {
  // Webpack 5
  if (storage._data instanceof Map) {
    return storage._data.get(key)
  } else if (storage._data) {
    return storage.data[key]
  } else if (storage.data instanceof Map) {
    // Webpack v4
    return storage.data.get(key)
  } else {
    return storage.data[key]
  }
}

function setData(backendOrStorage, key, valueFactory) {
  const value = valueFactory(backendOrStorage)

  // Webpack v5
  if (backendOrStorage._data instanceof Map) {
    backendOrStorage._data.set(key, value)
  } else if (backendOrStorage._data) {
    backendOrStorage.data[key] = value
  } else if (backendOrStorage.data instanceof Map) {
    // Webpack 4
    backendOrStorage.data.set(key, value)
  } else {
    backendOrStorage.data[key] = value
  }
}

function getStatStorage(fileSystem) {
  if (fileSystem._statStorage) {
    // Webpack v4
    return fileSystem._statStorage
  } else if (fileSystem._statBackend) {
    // webpack v5
    return fileSystem._statBackend
  } else {
    // Unknown version?
    throw new Error("Couldn't find a stat storage")
  }
}

function getFileStorage(fileSystem) {
  if (fileSystem._readFileStorage) {
    // Webpack v4
    return fileSystem._readFileStorage
  } else if (fileSystem._readFileBackend) {
    // Webpack v5
    return fileSystem._readFileBackend
  } else {
    throw new Error("Couldn't find a readFileStorage")
  }
}

function getReadDirBackend(fileSystem) {
  if (fileSystem._readdirBackend) {
    return fileSystem._readdirBackend
  } else if (fileSystem._readdirStorage) {
    return fileSystem._readdirStorage
  } else {
    throw new Error("Couldn't find a readDirStorage from Webpack Internals")
  }
}

class VirtualModulesPlugin {
  /** @type {Record<string, string> | null} */
  _staticModules
  /** @type {import('webpack').Compiler | null} */
  _compiler = null
  /** @type {any} */
  _watcher = null

  /**
   * @param {Record<string, string>} [modules]
   */
  constructor(modules) {
    this._staticModules = modules || null
  }

  /**
   *
   * @param {string} filePath
   * @param {string} contents
   */
  writeModule(filePath, contents) {
    if (!this._compiler) {
      throw new Error(`Plugin has not been initialized`)
    }

    checkActivation(this)

    const len = contents ? contents.length : 0
    const time = Date.now()
    const date = new Date(time)

    const stats = new VirtualStats({
      dev: 8675309,
      nlink: 0,
      uid: 1000,
      gid: 1000,
      rdev: 0,
      blksize: 4096,
      ino: inode++,
      mode: 33188,
      size: len,
      blocks: Math.floor(len / 4096),
      atime: date,
      mtime: date,
      ctime: date,
      birthtime: date
    })
    const modulePath = getModulePath(filePath, this._compiler)

    if (process.env.WVM_DEBUG)
      // eslint-disable-next-line no-console
      console.log(
        this._compiler.name,
        'Write virtual module:',
        modulePath,
        contents
      )

    // When using the WatchIgnorePlugin (https://github.com/webpack/webpack/blob/52184b897f40c75560b3630e43ca642fcac7e2cf/lib/WatchIgnorePlugin.js),
    // the original watchFileSystem is stored in `wfs`. The following "unwraps" the ignoring
    // wrappers, giving us access to the "real" watchFileSystem.
    let finalWatchFileSystem = this._watcher && this._watcher.watchFileSystem

    while (finalWatchFileSystem && finalWatchFileSystem.wfs) {
      finalWatchFileSystem = finalWatchFileSystem.wfs
    }

    /** @type {any} */
    let finalInputFileSystem = this._compiler.inputFileSystem
    while (finalInputFileSystem && finalInputFileSystem._inputFileSystem) {
      finalInputFileSystem = finalInputFileSystem._inputFileSystem
    }

    finalInputFileSystem._writeVirtualFile(modulePath, stats, contents)
    if (
      finalWatchFileSystem &&
      (finalWatchFileSystem.watcher.fileWatchers.size ||
        finalWatchFileSystem.watcher.fileWatchers.length)
    ) {
      const fileWatchers =
        finalWatchFileSystem.watcher.fileWatchers instanceof Map
          ? Array.from(finalWatchFileSystem.watcher.fileWatchers.values())
          : finalWatchFileSystem.watcher.fileWatchers
      for (let fileWatcher of fileWatchers) {
        if ('watcher' in fileWatcher) {
          fileWatcher = fileWatcher.watcher
        }
        if (fileWatcher.path === modulePath) {
          if (process.env.DEBUG)
            // eslint-disable-next-line no-console
            console.log(
              this._compiler.name,
              'Emit file change:',
              modulePath,
              time
            )
          delete fileWatcher.directoryWatcher._cachedTimeInfoEntries
          fileWatcher.emit('change', time, null)
        }
      }
    }
  }

  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    this._compiler = compiler

    const afterEnvironmentHook = () => {
      /** @type {any} */
      let finalInputFileSystem = compiler.inputFileSystem
      while (finalInputFileSystem && finalInputFileSystem._inputFileSystem) {
        finalInputFileSystem = finalInputFileSystem._inputFileSystem
      }

      if (!finalInputFileSystem._writeVirtualFile) {
        const originalPurge = finalInputFileSystem.purge

        finalInputFileSystem.purge = () => {
          originalPurge.apply(finalInputFileSystem, [])
          if (finalInputFileSystem._virtualFiles) {
            Object.keys(finalInputFileSystem._virtualFiles).forEach((file) => {
              const data = finalInputFileSystem._virtualFiles[file]
              finalInputFileSystem._writeVirtualFile(
                file,
                data.stats,
                data.contents
              )
            })
          }
        }

        finalInputFileSystem._writeVirtualFile = (file, stats, contents) => {
          const statStorage = getStatStorage(finalInputFileSystem)
          const fileStorage = getFileStorage(finalInputFileSystem)
          const readDirStorage = getReadDirBackend(finalInputFileSystem)
          finalInputFileSystem._virtualFiles =
            finalInputFileSystem._virtualFiles || {}
          finalInputFileSystem._virtualFiles[file] = {
            stats: stats,
            contents: contents
          }
          setData(statStorage, file, createWebpackData(stats))
          setData(fileStorage, file, createWebpackData(contents))
          const segments = file.split(/[\\/]/)
          let count = segments.length - 1
          const minCount = segments[0] ? 1 : 0
          while (count > minCount) {
            const dir = segments.slice(0, count).join(path.sep) || path.sep
            try {
              finalInputFileSystem.readdirSync(dir)
            } catch (e) {
              const time = Date.now()
              const dirStats = new VirtualStats({
                dev: 8675309,
                nlink: 0,
                uid: 1000,
                gid: 1000,
                rdev: 0,
                blksize: 4096,
                ino: inode++,
                mode: 16877,
                size: stats.size,
                blocks: Math.floor(stats.size / 4096),
                atime: time,
                mtime: time,
                ctime: time,
                birthtime: time
              })

              setData(readDirStorage, dir, createWebpackData([]))
              setData(statStorage, dir, createWebpackData(dirStats))
            }
            let dirData = getData(getReadDirBackend(finalInputFileSystem), dir)
            // Webpack v4 returns an array, webpack v5 returns an object
            dirData = dirData[1] || dirData.result
            const filename = segments[count]
            if (dirData.indexOf(filename) < 0) {
              const files = dirData.concat([filename]).sort()
              setData(
                getReadDirBackend(finalInputFileSystem),
                dir,
                createWebpackData(files)
              )
            } else {
              break
            }
            count--
          }
        }
      }
    }
    const afterResolversHook = () => {
      if (this._staticModules) {
        for (const [filePath, contents] of Object.entries(
          this._staticModules
        )) {
          this.writeModule(filePath, contents)
        }
        this._staticModules = null
      }
    }

    const watchRunHook = (watcher, callback) => {
      this._watcher = watcher.compiler || watcher
      // @ts-ignore
      const virtualFiles = compiler.inputFileSystem._virtualFiles
      /** @type {any} */
      const fts = compiler.fileTimestamps
      if (virtualFiles && fts && typeof fts.set === 'function') {
        Object.keys(virtualFiles).forEach((file) => {
          // apply fix from https://github.com/sysgears/webpack-virtual-modules/pull/128
          const mtime = +virtualFiles[file].stats.mtime
          if (mtime) applyMtime(mtime)
          // webpack 5.58.2
          fts.set(file, {
            accuracy: 0,
            safeTime: mtime ? mtime + FS_ACCURACY : Infinity,
            timestamp: mtime
          })
        })
      }
      callback()
    }

    if (compiler.hooks) {
      compiler.hooks.afterEnvironment.tap(
        'VirtualModulesPlugin',
        afterEnvironmentHook
      )
      compiler.hooks.afterResolvers.tap(
        'VirtualModulesPlugin',
        afterResolversHook
      )
      compiler.hooks.watchRun.tapAsync('VirtualModulesPlugin', watchRunHook)
    } else {
      // @ts-ignore
      compiler.plugin('after-environment', afterEnvironmentHook)
      // @ts-ignore
      compiler.plugin('after-resolvers', afterResolversHook)
      // @ts-ignore
      compiler.plugin('watch-run', watchRunHook)
    }
  }
}

export default VirtualModulesPlugin
