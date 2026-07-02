#!/usr/bin/env node
// Reliable local publish.
//
// Why this exists instead of `changeset publish`: under pnpm 11, `pnpm publish`
// (which `changeset publish` shells out to) does not send the ~/.npmrc auth token
// and fails every publish with a misleading E404. Plain `npm publish` authenticates
// correctly. So we pack with pnpm (which resolves the `workspace:*` protocol into
// real versions) and upload the resulting tarball with npm.
//
// Publishes every non-private workspace package whose current version isn't yet on
// the registry, then creates an (unsigned, annotated) git tag per published package
// so `git push --follow-tags` ships them. Idempotent: re-running skips anything
// already on npm.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const ROOT = process.cwd()
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', ...opts })

function workspacePackageDirs() {
  const dirs = []
  for (const group of ['packages', 'apps']) {
    const base = join(ROOT, group)
    if (!existsSync(base)) continue
    for (const name of readdirSync(base)) {
      if (existsSync(join(base, name, 'package.json'))) dirs.push(join(base, name))
    }
  }
  return dirs
}

function isOnRegistry(name, version) {
  try {
    return run('npm', ['view', `${name}@${version}`, 'version'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() === version
  } catch {
    return false // 404 / no match => not published yet
  }
}

const tmp = mkdtempSync(join(tmpdir(), 'ck-publish-'))
const published = []
let skipped = 0

for (const dir of workspacePackageDirs()) {
  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
  if (!pkg.name || pkg.private) continue

  if (isOnRegistry(pkg.name, pkg.version)) {
    console.log(`skip   ${pkg.name}@${pkg.version} (already on npm)`)
    skipped++
    continue
  }

  console.log(`pack   ${pkg.name}@${pkg.version}`)
  run('pnpm', ['pack', '--pack-destination', tmp], { cwd: dir, stdio: ['ignore', 'pipe', 'inherit'] })
  const tarball = join(tmp, `${pkg.name.replace(/^@/, '').replace(/\//g, '-')}-${pkg.version}.tgz`)

  console.log(`publish ${pkg.name}@${pkg.version}`)
  run('npm', ['publish', tarball, '--access', 'public'], { stdio: ['ignore', 'inherit', 'inherit'] })

  const tag = `${pkg.name}@${pkg.version}`
  try {
    run('git', ['-c', 'tag.gpgsign=false', 'tag', '-a', tag, '-m', tag])
  } catch {
    console.log(`  (tag ${tag} already exists)`)
  }
  published.push(tag)
}

console.log('')
if (published.length === 0) {
  console.log(`Nothing to publish (${skipped} package(s) already on npm).`)
} else {
  console.log(`Published ${published.length} package(s):`)
  for (const t of published) console.log(`  ${t}`)
  console.log('\nNext: git push --follow-tags')
}
