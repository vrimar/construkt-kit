#!/usr/bin/env node
// Reliable local publish.
//
// Why pack-then-publish instead of `pnpm publish`: under pnpm 11, `pnpm publish`
// does not send the ~/.npmrc auth token and fails every publish with a misleading
// E404. Plain `npm publish` authenticates correctly. So we pack with pnpm (which
// resolves the `workspace:*` protocol into real versions) and upload the resulting
// tarball with npm.
//
// Publishes every non-private workspace package whose current version isn't yet on
// the registry, then creates an (unsigned, annotated) git tag per published package
// so `git push --follow-tags` ships them. Idempotent: re-running skips anything
// already on npm.

import { execFileSync, spawn } from 'node:child_process'
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

const ALREADY_PUBLISHED = /cannot publish over (the )?previously (published|staged) version/i

function npmPublish(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['publish', ...args], { stdio: ['inherit', 'inherit', 'pipe'] })
    let stderr = ''
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk)
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => resolve({ code, stderr }))
  })
}

// `pnpm run release --otp=123456` reaches this script; without it npm prompts.
// Under trusted publishing (CI) npm authenticates over OIDC and never asks.
const otpArgs = process.argv.slice(2).filter((arg) => arg.startsWith('--otp'))

// npm only mints provenance attestations from a supported CI environment.
const provenanceArgs = process.env.GITHUB_ACTIONS ? ['--provenance'] : []

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
  // stdin stays attached so npm can prompt for the 2FA one-time password.
  const { code, stderr } = await npmPublish([tarball, '--access', 'public', ...provenanceArgs, ...otpArgs])

  const tag = `${pkg.name}@${pkg.version}`
  // npm view lags a fresh publish by minutes, so a concurrent run can slip past the check above.
  const rejectedRepublish = code !== 0 && ALREADY_PUBLISHED.test(stderr)
  if (code !== 0 && !rejectedRepublish) {
    throw new Error(`npm publish ${tag} failed with exit code ${code}`)
  }
  if (rejectedRepublish) {
    console.log(`skip   ${tag} (registry rejected republish)`)
    skipped++
  }

  try {
    run('git', ['-c', 'tag.gpgsign=false', 'tag', '-a', tag, '-m', tag])
  } catch {
    console.log(`  (tag ${tag} already exists)`)
  }
  if (!rejectedRepublish) published.push(tag)
}

console.log('')
if (published.length === 0) {
  console.log(`Nothing to publish (${skipped} package(s) already on npm).`)
} else {
  console.log(`Published ${published.length} package(s):`)
  for (const t of published) console.log(`  ${t}`)
  console.log('\nNext: git push --follow-tags')
}
