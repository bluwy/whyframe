import fs from 'node:fs/promises'
import path from 'node:path'

// playground projects need to reference the `@whyframe/*` packages with direct version
// not the `workspace:*` version, so they can be used in stackblitz directly.
// pnpm likes to convert them to `workspace:*` when updating, this scripts reverts it,
// and can be helpful when releasing new packages.

// peer deps are also fixed to the base version so that it doesn't change between releases

// find all package versions in packages/
const packages = await fs.readdir('packages')
const versions = {}
for (const pkg of packages) {
  if (pkg.startsWith('.')) continue
  const pkgJsonPath = path.join('packages', pkg, 'package.json')
  const pkgJson = await fs.readFile(pkgJsonPath, 'utf-8')
  const pkgJsonObj = JSON.parse(pkgJson)
  versions[pkgJsonObj.name] = pkgJsonObj.version
}

// fix package peer deps
for (const pkg of packages) {
  if (pkg.startsWith('.')) continue
  const pkgJsonPath = path.join('packages', pkg, 'package.json')
  const pkgJson = await fs.readFile(pkgJsonPath, 'utf-8')
  const pkgJsonObj = JSON.parse(pkgJson)
  for (const dep in pkgJsonObj.peerDependencies) {
    if (versions[dep]) {
      // 1.2.3 -> 1.0.0
      // 0.1.2 -> 0.1.0
      // 0.0.1 -> 0.0.1
      const firstNonZeroIndex = versions[dep]
        .split('')
        .findIndex((c) => c !== '0')
      const baseVersionArray = []
      for (let i = 0; i < 3; i++) {
        baseVersionArray.push(
          i === firstNonZeroIndex ? versions[dep].split('.')[i] : '0'
        )
      }
      pkgJsonObj.peerDependencies[dep] = `^${baseVersionArray.join('.')}`
    }
  }
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJsonObj, null, 2) + '\n')
}

// find all playground projects, since the versions with ^
const playgrounds = await fs.readdir('playground')
for (const playground of playgrounds) {
  if (playground.startsWith('.')) continue
  const pkgJsonPath = path.join('playground', playground, 'package.json')
  const pkgJson = await fs.readFile(pkgJsonPath, 'utf-8')
  const pkgJsonObj = JSON.parse(pkgJson)
  for (const dep in pkgJsonObj.devDependencies) {
    if (versions[dep]) {
      pkgJsonObj.devDependencies[dep] = `^${versions[dep]}`
    }
  }
  await fs.writeFile(pkgJsonPath, JSON.stringify(pkgJsonObj, null, 2) + '\n')
}
