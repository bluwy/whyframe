import fs from 'node:fs/promises'
import path from 'node:path'

// playground projects need to reference the `@whyframe/*` packages with direct version
// not the `workspace:*` version, so they can be used in stackblitz directly.
// pnpm likes to convert them to `workspace:*` when updating, this scripts reverts it,
// and can be helpful when releasing new packages.

// find all package versions in packages/
const packages = await fs.readdir('packages')
const versions = {}
for (const pkg of packages) {
  if (pkg.startsWith('.')) continue
  const pkgJson = await fs.readFile(
    path.join('packages', pkg, 'package.json'),
    'utf-8'
  )
  const pkgJsonObj = JSON.parse(pkgJson)
  versions[pkgJsonObj.name] = pkgJsonObj.version
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
