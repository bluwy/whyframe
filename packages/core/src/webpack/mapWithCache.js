import fs from 'node:fs'
import path from 'node:path'

export class MapWithCache extends Map {
  /**
   * @param {string | undefined} cacheFile
   */
  constructor(cacheFile) {
    let cache = undefined
    if (cacheFile) {
      try {
        const data = fs.readFileSync(cacheFile, 'utf-8')
        cache = JSON.parse(data)
      } catch {}
    }
    super(cache)
    this.cacheFile = cacheFile
  }

  // @ts-ignore
  set(key, value) {
    const result = super.set(key, value)
    if (this.cacheFile) {
      try {
        fs.mkdirSync(path.dirname(this.cacheFile), { recursive: true })
        fs.writeFileSync(
          this.cacheFile,
          JSON.stringify(Array.from(this.entries()))
        )
      } catch (e) {
        console.log('unable to write to', this.cacheFile, e)
      }
    }
    return result
  }
}
