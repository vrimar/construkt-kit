#!/usr/bin/env node
// Publishes every non-private workspace package whose current version isn't yet on
// the registry, dependencies first, and creates an (unsigned, annotated) git tag for
// every package version that lacks one so `git push --follow-tags` ships them.
// Idempotent: re-running skips anything already on npm and only adds missing tags.

import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: 'utf8', ...opts })

const otpArgs = process.argv.slice(2).filter((arg) => arg.startsWith('--otp'))

// Provenance can only be attested from a supported CI environment.
const provenanceArgs = process.env.GITHUB_ACTIONS ? ['--provenance'] : []

const publish = spawnSync(
  'pnpm',
  ['publish', '--recursive', '--access', 'public', '--no-git-checks', ...provenanceArgs, ...otpArgs],
  { stdio: 'inherit' },
)
if (publish.status !== 0) {
  console.error('\nPublish failed, so nothing was tagged. Re-run once fixed.')
  process.exit(publish.status ?? 1)
}

const tagged = []
const untagged = []

function tagExists(tag) {
  try {
    run('git', ['rev-parse', '--quiet', '--verify', `refs/tags/${tag}`], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Tags the version-bump commit, since HEAD may have moved on since that version was published.
function releaseCommit(dir, version) {
  const manifest = join(dir, 'package.json')
  return run('git', ['log', '-1', '--format=%H', '-S', `"version": "${version}"`, '--', manifest]).trim() || 'HEAD'
}

function tagRelease(tag, commit) {
  if (tagExists(tag)) return
  try {
    run('git', ['-c', 'tag.gpgsign=false', 'tag', '-a', tag, '-m', tag, commit], { stdio: ['ignore', 'pipe', 'pipe'] })
    console.log(`tag    ${tag}`)
    tagged.push(tag)
  } catch (error) {
    console.error(`tag    ${tag} failed: ${error.stderr?.trim() || error.message}`)
    untagged.push(tag)
  }
}

const projects = JSON.parse(
  run('pnpm', ['ls', '--recursive', '--depth', '-1', '--json'], { stdio: ['ignore', 'pipe', 'inherit'] }),
)
for (const { name, version, path, private: isPrivate } of projects) {
  if (isPrivate || !name || !version) continue
  tagRelease(`${name}@${version}`, releaseCommit(path, version))
}

if (tagged.length > 0) console.log('\nNext: git push --follow-tags')
if (untagged.length > 0) {
  console.error(`\nCould not tag ${untagged.join(', ')}; re-run to retry.`)
  process.exitCode = 1
}
